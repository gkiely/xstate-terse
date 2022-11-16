// type JSONValue = string | number | boolean | null | { [x: string]: JSONValue } | Array<JSONValue>;
// type JSONObject = Record<string, JSONValue>;
// type JSValue = string | number | boolean | null | undefined | { [x: string]: JSValue } | Array<JSValue>;
// type JSObject = Record<string, JSValue>;
// export const assertType = <T>(_: unknown): asserts _ is T => {};

type Machine<Context extends object, State extends string, Event extends { type: string }> = {
  id?: string;
  context?: Context;
  states: State[];
  events: Event[];
  initial?: State;
};

export const machine = <
  Context extends object,
  State extends string,
  Event extends { type: EventType },
  EventType extends string = string,
  OnEvent = Record<
    EventType,
    {
      target: State;
      actions?: () => {};
    }
  >
>(
  options: Machine<Context, State, Event>
) => {
  const { context, id, initial, states: stateKeys } = options;

  type StateNodes = Record<
    State,
    {
      on: OnEvent;
      always: {
        target: State;
        actions?: () => {};
        cond?: (c?: Context) => boolean;
      }[];
    }
  >;

  const states = stateKeys.reduce((prev, curr) => {
    return {
      ...prev,
      [curr]: {},
    };
  }, {} as StateNodes);

  const snapshot = {
    id,
    context,
    preserveActionOrder: true,
    predictableActionArguments: true,
    states,
    initial: initial ?? stateKeys.at(0),
  };

  const methods = {
    getSnapshot: () => snapshot,
    matches: (state: State) => {
      return {
        target: (nextState: State, cond?: (c?: Context) => boolean) => {
          const stateNode = snapshot.states[state];
          if (!stateNode.always) {
            stateNode.always = [];
          }
          stateNode.always.push({
            target: nextState,
            ...(cond && { cond }),
          });
          return methods.matches(state);
        },
        on: (event: Event['type']) => {
          return {
            target: (target: State) => {
              const stateNode = snapshot.states[state];
              stateNode.on = {
                [event]: {
                  target,
                },
              } as OnEvent;
              return methods.matches(state);
            },
          };
        },
      };
    },
  };

  return methods;
};
