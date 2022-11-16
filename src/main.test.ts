import { machine } from './main';

it('supports actions', () => {
  const testMachine = machine({
    id: 'test',
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
  testMachine.matches('idle').on('route');

  expect(testMachine.getSnapshot()).toEqual({
    id: 'test',
    initial: 'idle',
    preserveActionOrder: true,
    predictableActionArguments: true,
    states: {
      error: {},
      idle: {},
      loading: {},
    },
  });
});

it.todo('allows passing a second value as on', () => {});

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
      {
        type: 'error',
      },
    ],
  });

  requestMachine.matches('idle').on('route').target('loading');
  requestMachine.matches('idle').target('loading', fn).target('error', fn);
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
            cond: fn,
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
});
