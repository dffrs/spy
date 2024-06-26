import { Spy } from "../src/index";

class DummyClass {
  public attr1: number;
  public attr2: string;

  constructor(attr1: number, attr2: string) {
    this.attr2 = attr2;
    this.attr1 = attr1;
  }

  public publicMethod1(cb: () => any) {
    cb();
  }
}

// Create a spy instance
const SpyOnDummy = Spy(DummyClass);

describe("Spy tests", () => {
  it("observe first attr", () => {
    // create initial values
    const initialAttr1 = 10;
    const initialAttr2 = "Name";

    // Create an instance of spy  dummyClass
    const spy = new SpyOnDummy(initialAttr1, initialAttr2);

    // create variable to store number of calls
    let numberOfCalls = 0;
    // change attr1 to this new value
    const newValueForAttr1 = 99;

    // create a variable to store value that comes from spyMethod
    let oldValueRecordedInsideSpyMethod: number = -1; // initial value - does not matter
    let newValueRecordedInsideSpyMethod: number = -1; // initial value - does not matter

    // create a spy method to increment numberOfCalls
    const spyMethod = (newValue: number, oldValue: number) => {
      numberOfCalls++;
      oldValueRecordedInsideSpyMethod = oldValue;
      newValueRecordedInsideSpyMethod = newValue;
    };

    // observe first attr
    spy.observe("attr1", spyMethod);

    // change attr1
    spy.attr1 = 99;
    expect(numberOfCalls).toBe(1);
    expect(spy.attr1).toBe(newValueForAttr1);
    expect(oldValueRecordedInsideSpyMethod).toBe(initialAttr1);
    expect(newValueRecordedInsideSpyMethod).toBe(newValueForAttr1);
  });

  it("observe how changing one attr does NOT change the others", () => {
    // create initial values
    const initialAttr1 = 10;
    const initialAttr2 = "Name";

    // Create an instance of spy  dummyClass
    const spy = new SpyOnDummy(initialAttr1, initialAttr2);

    // create variable to store number of calls
    let numberOfCalls = 0;
    // change attr2 to this new value
    const newValueForAttr2 = "This was changed";

    // create a variable to store value that comes from spyMethod
    let oldValueRecordedInsideSpyMethod: string = ""; // initial value - does not matter
    let newValueRecordedInsideSpyMethod: string = ""; // initial value - does not matter

    // create a spy method to increment numberOfCalls
    const spyMethod = (newValue: string, oldValue: string) => {
      numberOfCalls++;
      oldValueRecordedInsideSpyMethod = oldValue;
      newValueRecordedInsideSpyMethod = newValue;
    };

    // observe first attr2
    spy.observe("attr2", spyMethod);

    // change attr2
    spy.attr2 = "This was changed";

    expect(numberOfCalls).toBe(1);
    expect(spy.attr2).toBe(newValueForAttr2);
    expect(oldValueRecordedInsideSpyMethod).toBe(initialAttr2);
    expect(newValueRecordedInsideSpyMethod).toBe(newValueForAttr2);

    expect(spy.attr1).toBe(10); // This should still have it's original value
  });

  it("observe all attributes from class", () => {
    // create initial values
    const initialAttr1 = 10;
    const initialAttr2 = "Name";

    // Create an instance of spy  dummyClass
    const spy = new SpyOnDummy(initialAttr1, initialAttr2);

    // store number of calls done
    let numberOfCalls: number = 0;

    // store old value new value pares
    let registerCallParams: (string | number)[] = [];

    // create  a method to spy on observe calls
    const spyMethod = (...args: (string | number)[]) => {
      numberOfCalls++;
      registerCallParams.push(...args);
    };

    // setup observe call
    spy.observe("all", spyMethod);

    // change values
    spy.attr1 = 99;
    spy.attr2 = "This has been changed to a new string value";

    expect(numberOfCalls).toBe(2);
    expect(registerCallParams).toStrictEqual([
      99,
      10,
      "This has been changed to a new string value",
      "Name",
    ]);
  });

  it("observe that changing attr via function still registers", () => {
    const initialAttr1 = 10;
    const initialAttr2 = "Name";

    // Create an instance of spy  dummyClass
    const spy = new SpyOnDummy(initialAttr1, initialAttr2);

    // store number of calls done
    let numberOfCalls: number = 0;

    const spyMethod = () => {
      numberOfCalls++;
    };

    spy.observe("attr1", spyMethod);

    const methodThatChangesAttr = (_spy: typeof spy) => {
      _spy.attr1 = 99;
    };

    methodThatChangesAttr(spy);
    expect(numberOfCalls).toBe(1);
  });

  it("call beforeCalling on instance's method", () => {
    const initialAttr1 = 10;
    const initialAttr2 = "Name";

    // Create an instance of spy  dummyClass
    const spy = new SpyOnDummy(initialAttr1, initialAttr2);

    // store number of calls done
    let numberOfCalls: number = 0;

    let hasCallbackBeenCalled = false;

    const callBack = () => {
      hasCallbackBeenCalled = true;
    };

    const spyMethod = () => {
      numberOfCalls++;
      expect(hasCallbackBeenCalled).toBe(false);
    };

    spy.beforeCalling("publicMethod1", spyMethod);

    spy.publicMethod1(callBack);

    expect(numberOfCalls).toBe(1);
    expect(hasCallbackBeenCalled).toBe(true);
  });

  it("call afterCalling on instance's method", () => {
    const initialAttr1 = 10;
    const initialAttr2 = "Name";

    // Create an instance of spy  dummyClass
    const spy = new SpyOnDummy(initialAttr1, initialAttr2);

    // store number of calls done
    let numberOfCalls: number = 0;

    let hasCallbackBeenCalled = false;

    const callBack = () => {
      hasCallbackBeenCalled = true;
    };

    const spyMethod = () => {
      numberOfCalls++;
      expect(hasCallbackBeenCalled).toBe(true);
    };

    spy.afterCalling("publicMethod1", spyMethod);

    spy.publicMethod1(callBack);

    expect(numberOfCalls).toBe(1);
    expect(hasCallbackBeenCalled).toBe(true);
  });

  it("call afterCalling and beforeCalling on an instance's method", () => {
    const initialAttr1 = 10;
    const initialAttr2 = "Name";

    // Create an instance of spy  dummyClass
    const spy = new SpyOnDummy(initialAttr1, initialAttr2);

    // store number of calls done
    let numberOfCalls: number = 0;

    let hasCallbackBeenCalledForBeforeCalling = false;
    let hasCallbackBeenCalledForAfterCalling = false;

    const callback = () => {
      hasCallbackBeenCalledForBeforeCalling = true;
      hasCallbackBeenCalledForAfterCalling = true;
    };

    const spyMethodForBeforeCalling = () => {
      numberOfCalls++;
      expect(hasCallbackBeenCalledForAfterCalling).toBe(false);
      expect(hasCallbackBeenCalledForBeforeCalling).toBe(false);
    };

    const spyMethodForAfterCalling = () => {
      numberOfCalls++;
      expect(hasCallbackBeenCalledForAfterCalling).toBe(true);
      expect(hasCallbackBeenCalledForBeforeCalling).toBe(true);
    };

    spy.beforeCalling("publicMethod1", spyMethodForBeforeCalling);
    spy.afterCalling("publicMethod1", spyMethodForAfterCalling);

    spy.publicMethod1(callback);

    expect(numberOfCalls).toBe(2);
    expect(hasCallbackBeenCalledForBeforeCalling).toBe(true);
    expect(hasCallbackBeenCalledForAfterCalling).toBe(true);
  });

  it("remove last effect on observed attribute", () => {
    const initialAttr1 = 10;
    const initialAttr2 = "Name";

    // Create an instance of spy  dummyClass
    const spy = new SpyOnDummy(initialAttr1, initialAttr2);

    // store number of calls done
    let numberOfCalls: number = 0;

    const spyMethod = () => {
      numberOfCalls++;
    };

    spy.observe("attr1", spyMethod);

    spy.attr1 = 99;

    expect(spy.attr1).toBe(99);
    expect(numberOfCalls).toBe(1);

    spy.removeLast("attr1");

    spy.attr1 = 69; // nice

    expect(spy.attr1).toBe(69);
    expect(numberOfCalls).toBe(1);
  });

  it("remove last effect on all observed attribute", () => {
    const initialAttr1 = 10;
    const initialAttr2 = "Name";

    // Create an instance of spy  dummyClass
    const spy = new SpyOnDummy(initialAttr1, initialAttr2);

    // store number of calls done
    let numberOfCalls: number = 0;

    const spyMethod = () => {
      numberOfCalls++;
    };

    spy.observe("all", spyMethod);

    spy.attr1 = 99;

    expect(spy.attr1).toBe(99);
    expect(numberOfCalls).toBe(1);

    spy.removeLast("all");

    spy.attr1 = 69; // nice

    expect(spy.attr1).toBe(69);
    expect(numberOfCalls).toBe(1);
  });

  it("remove specific effect on observed attribute", () => {
    const initialAttr1 = 10;
    const initialAttr2 = "Name";

    // Create an instance of spy  dummyClass
    const spy = new SpyOnDummy(initialAttr1, initialAttr2);

    // store number of calls done
    let numberOfCalls: number = 0;

    const spyMethod = () => {
      numberOfCalls++;
    };

    const spyMethod_2 = () => {
      throw Error("This method should have been removed");
    };

    spy.observe("attr1", spyMethod);

    spy.attr1 = 99;

    expect(spy.attr1).toBe(99);
    expect(numberOfCalls).toBe(1);

    spy.observe("attr1", spyMethod_2);
    spy.remove("attr1", spyMethod_2);

    spy.attr1 = 69; // nice

    expect(spy.attr1).toBe(69);
    expect(numberOfCalls).toBe(2);
  });

  it("remove specific effect on all observed attribute", () => {
    const initialAttr1 = 10;
    const initialAttr2 = "Name";

    // Create an instance of spy  dummyClass
    const spy = new SpyOnDummy(initialAttr1, initialAttr2);

    // store number of calls done
    let numberOfCalls: number = 0;

    const spyMethod = () => {
      numberOfCalls++;
    };

    const spyMethod_2 = () => {
      throw Error("This method should have been removed");
    };

    spy.observe("all", spyMethod);

    spy.attr1 = 99;

    expect(spy.attr1).toBe(99);
    expect(numberOfCalls).toBe(1);

    spy.observe("all", spyMethod_2);
    spy.remove("all", spyMethod_2);

    spy.attr1 = 69; // nice

    expect(spy.attr1).toBe(69);
    expect(numberOfCalls).toBe(2);
  });
});
