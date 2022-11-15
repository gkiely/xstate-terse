import { machine } from './main';

it('Generates a machine with defaults', () => {
  const fn = () => Math.random() * 10 > 5;
  const requestMachine = machine({
    id: 'request',
    context: {
      hello: 'world',
    },
    states: ['idle', 'loading', 'error'],
    events: [
      {
        type: 'route',
      },
      {
        type: 'reset',
      },
    ],
  });

  requestMachine.matches('idle').on('route').target('loading');
  requestMachine.matches('idle').target('loading', fn).target('error');
  requestMachine.matches('error').on('reset').target('idle');

  expect(requestMachine.getSnapshot()).toEqual({
    id: 'request',
    initial: 'idle',
    preserveActionOrder: true,
    predictableActionArguments: true,
    context: {
      hello: 'world',
    },
    states: {
      idle: {
        always: [
          {
            target: 'loading',
            cond: fn,
          },
          {
            target: 'error',
          },
        ],
        on: {
          route: {
            target: 'loading',
          },
        },
      },
      loading: {},
      error: {
        on: {
          reset: {
            target: 'idle',
          },
        },
      },
    },
  });

  // const testMachine = createMachine(requestMachine);
  // expect(testMachine.transition(testMachine.initialState, { type: 'route'}))
});
