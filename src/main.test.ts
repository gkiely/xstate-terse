import { machineOld } from './main';

type Target<State extends string> = {
  target: (state: State, fn?: () => void) => Target<State>;
};

type Machine<Context extends object, State extends string, Event extends { type: string }> = {
  context?: Context;
  states: State[];
  events: Event[];
  matches: (state: State) => Target<State> & {
    on: (event: Event['type']) => Target<State>;
  };
};

const machine = <
  Context extends object,
  State extends string,
  Event extends { type: EventType },
  EventType extends string = string,
  Result extends Machine<Context, State, Event> = Machine<Context, State, Event>
>(
  o: Omit<Result, 'matches'>
) => {
  const result = {
    context: o.context,
  };

  return result as Result as { matches: Result['matches'] };
};

const loadingMachine = machine({
  context: {
    hello: 'world',
  },
  states: ['idle', 'loading', 'error'],
  events: [
    {
      type: 'route',
    },
  ],
});

const fn = () => Math.random() * 10 > 5;
loadingMachine.matches('idle').on('route').target('loading');
loadingMachine.matches('idle').on('route').target('loading', fn).target('error');

it('generates a sane default machine', () => {
  const requestMachine = machineOld({
    id: 'request',
    context: {
      hello: 'world',
    },
    states: ['idle', 'loading', 'error'],
    events: [{ type: 'route' }],
  });

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
