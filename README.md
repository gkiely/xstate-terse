# xstate-terse
> State machines with less characters


The goal of this library is to reduce the amount of vertical space required to write state machines using Xstate.

Using a chained syntax allows this library to achieve that goal as well as some other additional benefits:

- Great typescript support and type hinting
- Sane defaults
- Easier debugging


Example:
```ts
import { createMachine, machine } from 'xstate-terse';

const requestMachine = machine({
  id: 'request',
  context: {
    hello: 'world',
  },
  states: ['idle', 'loading', 'error'],
  events: [{ type: 'route' }],
} as const);

requestMachine
  .matches('idle')
  .on('route')
  .target('loading')
  .action(() => console.log('loading'))

requestMachine
  .matches('idle')
  .target('loading', () => Math.random() * 10 > 5)
  .target('error');

export default createMachine(requestMachine);
```

Is equivalent to:
```ts
import { createMachine } from 'xstate';

export default createMachine({
  id: 'request',
  initial: 'idle',
  preserveActionOrder: true,
  predictableActionArguments: true,
  context: {
    hello: 'world',
  },
  schema: {
    context: {} as { hello: 'world' },
    events: {} as { type: 'route' }
  },
  states: {
    idle: {
      always: [
        {
          target: 'loading',
          cond: () => Math.random() * 10 > 5,
        },
        {
          target: 'error',
        },
      ],
      on: {
        route: {
          target: 'loading',
          actions: [
            () => console.log('loading')
          ],
        },
      },
    },
    loading: {},
    error: {},
  },
});
```
