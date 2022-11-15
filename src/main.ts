// type JSONValue = string | number | boolean | null | { [x: string]: JSONValue } | Array<JSONValue>;
// type JSONObject = Record<string, JSONValue>;
type JSValue = string | number | boolean | null | undefined | { [x: string]: JSValue } | Array<JSValue>;
type JSObject = Record<string, JSValue>;

// import { MachineConfig } from 'xstate';
// type Result = MachineConfig<Options['context'], Record<string, unknown>, { type: '' }>;

export const assertType = <T>(_: unknown): asserts _ is T => {};

type Options = {
  context: JSObject;
  id: string;
  states: readonly string[];
  events: readonly { type: string; payload?: JSObject | undefined }[];
};

export const machineOld = <
  O extends Options,
  Context extends Options['context'],
  States extends O['states'][number],
  Events extends O['events'][number]['type']
>(
  options: O
) => {
  const { context, id, states: stateKeys } = options;
  type StateNodeEvent = Record<
    Events,
    {
      target: States;
      actions?: () => {};
    }
  >;
  type StateNode = Record<
    States,
    {
      on: StateNodeEvent;
      always: {
        target: States;
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
  }, {} as StateNode);

  const snapshot = {
    id,
    initial: stateKeys.at(0),
    preserveActionOrder: true,
    predictableActionArguments: true,
    context,
    states,
  };

  const methods = {
    getSnapshot: () => snapshot,
    matches: (state: States) => {
      return {
        target: (nextState: States, cond?: (c?: Context) => boolean) => {
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
        on: (event: Events) => {
          return {
            target: (target: States) => {
              const stateNode = snapshot.states[state];
              stateNode.on = {
                [event]: {
                  target,
                },
              } as StateNodeEvent;
            },
          };
        },
      };
    },
  };

  return methods;
  /// TODO add satisfies type Result
};
