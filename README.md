# SPY

This library provides a TypeScript mixin that adds observable behavior to a class, allowing observers to listen for changes in properties and trigger effects before or after method calls. The library uses TypeScript's type system to ensure type safety and flexibility.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Creating an Observable Class](#creating-an-observable-class)
  - [Observing Property Changes](#observing-property-changes)
  - [Listening to Method Calls](#listening-to-method-calls)
  - [Removing Observers and Listeners](#removing-observers-and-listeners)
- [API Reference](#api-reference)
  - [observe](#observe)
  - [beforeCalling](#beforecalling)
  - [afterCalling](#aftercalling)
  - [removeLast](#removelast)
  - [remove](#remove)

## Installation

You can install the library using npm:

```sh
npm install spy
```

## Usage

### Creating an Observable Class.

To create an observable class, use the Spy mixin function:

```typescript
import { Spy } from "spy";

class MyClass {
  myProperty: string = "initial value";

  myMethod() {
    console.log("myMethod called");
  }
}

const ObservableMyClass = Spy(MyClass);
const instance = new ObservableMyClass();
```

### Observing Property Changes

You can observe changes to specific properties or all properties:

```typescript
instance.observe("myProperty", (newValue, oldValue) => {
  console.log(`myProperty changed from ${oldValue} to ${newValue}`);
});

instance.observe("all", (newValue, oldValue) => {
  console.log(`A property changed from ${oldValue} to ${newValue}`);
});
```

### Listening to Method Calls

You can add effects to be executed before or after specific method calls:

```typescript
instance.beforeCalling("myMethod", () => {
  console.log("Before myMethod");
});

instance.afterCalling("myMethod", () => {
  console.log("After myMethod");
});
```

### Removing Observers and Listeners

You can remove the last added observer for a specific property or all properties:

```typescript
instance.removeLast("myProperty");
instance.removeLast("all");
```

You can also remove a specific observer or listener:

```typescript
instance.remove("myProperty", observerFunction);
instance.remove("all", observerFunction);
```

## API Reference

### observe

The observe method adds an observer for a specific property or all properties.

```typescript
observe<V extends keyof T | "all">(
  prop: V,
  effect: V extends "all"
    ? (data: ExcludeFunction<T[keyof T]>, oldData: ExcludeFunction<T[keyof T]>) => void
    : (data: ExcludeFunction<ExtractType<T, V>>, oldData: ExcludeFunction<ExtractType<T, V>>) => void
): void;
```

### beforeCalling

The beforeCalling method adds an effect to be executed before a specific method is called.

```typescript
beforeCalling(
  method: PickFunctionNames<T>,
  effect: () => void
): void;
```

### afterCalling

The afterCalling method adds an effect to be executed after a specific method is called.

```typescript
afterCalling(
  method: PickFunctionNames<T>,
  effect: () => void
): void;
```

### removeLast

The removeLast method removes the last added observer for a specific property or all properties.

```typescript
removeLast<V extends keyof T | "all">(
  prop: V
): boolean;
```

### remove

The remove method removes a specific observer for a property or all properties.

```typescript
remove<V extends keyof T | "all">(
  prop: V,
  effect: (...args: any[]) => unknown,
  comparator?: (
    registeredMethod: (...args: any[]) => unknown,
    toRemoveMethod: (...args: any[]) => unknown
  ) => boolean
): boolean;
```
