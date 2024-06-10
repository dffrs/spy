type ExtractType<T, K> = K extends keyof T[keyof T] ? T[keyof T][K] : never;
type ExcludeFunction<T> = Exclude<T, (...args: any[]) => unknown>;
type PickFunctionNames<T> = { [P in keyof T]: T[P] extends (...args: any[]) => unknown ? P : never }[keyof T];

type Constructor<T = {}> = new (...args: any[]) => T;
type ObservableMixin<T> = Constructor<{
  observe<V extends keyof T[keyof T] | "all">(
    prop: V extends "all" ? V : ExtractType<T, V> extends (...args: any[]) => unknown ? never : V,
    effect: V extends "all"
      ? (data: ExcludeFunction<T[keyof T][keyof T[keyof T]]>, oldData: ExcludeFunction<T[keyof T][keyof T[keyof T]]>) => void
      : (data: ExcludeFunction<ExtractType<T, V>>, oldData: ExcludeFunction<ExtractType<T, V>>) => void
  ): void;
  beforeCalling(method: PickFunctionNames<T[keyof T]>, effect: () => void): void;
  afterCalling(method: PickFunctionNames<T[keyof T]>, effect: () => void): void;
}>;

/**
 * The function `interceptor` creates a Proxy object to intercept and handle property access and
 * function calls with observers and listeners.
 *
 * @param {T} instance - The `instance` parameter in the `interceptor` function is the object that you
 * want to intercept and add functionality to. It will be wrapped in a Proxy object to intercept
 * property access and modifications.
 *
 * @param observers - The `observers` parameter in the `interceptor` function is a `Map` that stores
 * property keys as keys and arrays of functions as values. These functions are the observers that will
 * be triggered when a specific property is set on the proxied object.
 *
 * @param listeners - The `listeners` parameter in the `interceptor` function is a `Map` that stores
 * property keys as keys and arrays of functions as values. These functions are the listeners that will
 * be triggered when a specific property is accessed as a function.
 *
 * @returns The `interceptor` function returns a Proxy object that wraps the provided instance object.
 * This Proxy object intercepts property access and property assignment operations on the instance
 * object, allowing for custom behavior to be executed before or after these operations.
 */
function interceptor<T extends object>(
  instance: T,
  observers: Map<PropertyKey, ((...args: any[]) => void)[]>,
  listeners: Map<PropertyKey, ["before" | "after", (...args: any[]) => void][]> = new Map()
) {
  return new Proxy<T>(instance, {
    set(obj, property, value) {
      const oldValue = obj[property as keyof typeof obj];
      obj[property as keyof typeof obj] = value;

      // update on specific prop
      if (observers.has(property)) observers.get(property)?.forEach((effect) => effect(value, oldValue));

      // update on "all"
      if (observers.has("all")) observers.get("all")?.forEach((effect) => effect(value, oldValue));

      return true;
    },

    get(target, _propKey) {
      const propKey = _propKey as keyof typeof target;

      const isFuncSpiedOn = listeners.has(propKey);

      // Calling functions
      if (typeof target[propKey as keyof typeof target] === "function" && isFuncSpiedOn) {
        return new Proxy((target as any)[propKey], {
          apply(...args) {
            const beforeEffects: Array<Function> = [];
            const afterEffects: Array<Function> = [];

            listeners
              .get(propKey)
              ?.forEach(([when, effect]) => (when === "after" ? afterEffects.push(effect) : beforeEffects.push(effect)));

            beforeEffects.forEach((eff) => eff());

            const result = Reflect.apply(...args);

            afterEffects.forEach((eff) => eff());

            return result;
          },
        });
      }

      return Reflect.get(target, propKey);
    },
  });
}

/**
 * The function ObservableMixin is a TypeScript mixin that adds observable behavior to a class by
 * allowing observers to listen to changes in properties.
 *
 * @param {TBase} Base - The `ObservableMixin` function takes a base constructor class `Base` as a
 * parameter. This base class is used to extend the functionality of the class that will be returned by
 * the `ObservableMixin` function. The returned class will have observable capabilities, allowing
 * observers to listen for changes to specific properties and
 *
 * @returns The `ObservableMixin` function returns a class that extends the base class provided as an
 * argument. This extended class includes functionality for observing changes to properties and
 * notifying observers when changes occur. It also provides methods for adding observers and setting up
 * specific effects to be triggered when certain properties change.
 */
export function Spy<TBase extends Constructor>(Base: TBase): ObservableMixin<TBase> & TBase {
  return class extends Base {
    private effects: Map<PropertyKey, ((...args: any[]) => void)[]> = new Map();
    private listeners: Map<PropertyKey, ["before" | "after", (...args: any[]) => void][]> = new Map();

    constructor(...rest: any[]) {
      super(...rest);
      return interceptor<typeof this>(this, this.effects, this.listeners);
    }

    /**
     * The `listenTo` function adds a listener for a specific effect before or after it
     * is executed.
     *
     * @param effectName - The `effectName` parameter is the name of a function that will be picked
     * from the functions available in the `TBase` object.
     *
     * @param {"before" | "after"} when - The `when` parameter specifies whether the `effect` function
     * should be executed before or after the specified `effectName` function. It can have two possible
     * values: "before" or "after".
     *
     * @param effect - The `effect` parameter is a function that will be executed before or after calling the
     * specified method.
     */
    private listenTo(effectName: PickFunctionNames<TBase[keyof TBase]>, when: "before" | "after", effect: () => void) {
      if (!this.listeners.has(effectName)) this.listeners.set(effectName, []);

      this.listeners.get(effectName)?.push([when, effect]);
    }

    /**
     * The `observe` function in TypeScript allows for observing changes to a specific property and
     * executing a corresponding effect function.
     * @param {T} prop - The `prop` parameter is a key of the `TBase` object, which is a generic type.
     * @param effect - The `effect` parameter is a function that will be executed after `prop` has been modified.
     */
    observe<V extends keyof TBase[keyof TBase] | "all">(
      prop: V extends "all" ? V : ExtractType<TBase, V> extends (...args: any[]) => unknown ? never : V,
      effect: V extends "all"
        ? (
            data: ExcludeFunction<TBase[keyof TBase][keyof TBase[keyof TBase]]>,
            oldData: ExcludeFunction<TBase[keyof TBase][keyof TBase[keyof TBase]]>
          ) => void
        : (data: ExcludeFunction<ExtractType<TBase, V>>, oldData: ExcludeFunction<ExtractType<TBase, V>>) => void
    ) {
      if (!this.effects.has(prop)) {
        this.effects.set(prop, []);
      }
      this.effects.get(prop)?.push(effect);
    }

    /**
     * The `beforeCalling` function listens to a method before it is called and triggers
     * a specified effect.
     * @param method - Method to listen to.
     * @param effect - The `effect` parameter is a function that will be executed before calling the
     * specified method.
     */
    beforeCalling(method: PickFunctionNames<TBase[keyof TBase]>, effect: () => void) {
      this.listenTo(method, "before", effect);
    }

    /**
     * The `afterCalling` function listens to a specified method and triggers an effect
     * after the method is called.
     * @param method - Method to listen to.
     * @param effect - The `effect` parameter is a function that will be executed after the specified
     * method is called.
     */
    afterCalling(method: PickFunctionNames<TBase[keyof TBase]>, effect: () => void) {
      this.listenTo(method, "after", effect);
    }
  };
}
