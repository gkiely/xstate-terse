import { machine } from './main';

it('generates a sane default machine', () => {
  // First define your context, states and events
  const requestMachine = machine({
    id: 'request',
    context: {
      hello: 'world',
    },
    states: ['idle', 'loading', 'error'],
    events: [{ type: 'route' }],
  } as const);

  // Then define your transitions and side effects
  const fn = () => Math.random() * 10 > 5;
  requestMachine.matches('idle').on('route').target('loading');
  requestMachine.matches('idle').target('loading', fn).target('error');

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
      error: {},
    },
  });
});
