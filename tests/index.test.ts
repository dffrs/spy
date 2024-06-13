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

    // create a varible to store value that comes from spyMethod
    let oldValueRecordedInsideSpyMethod: number = -1; // initial value - does not matter
    let newValueRecordedInsideSpyMethod: number = -1; // initial value - does not matter

    // create a spy method to increment numberOfCalls
    const spyMethod = (newValue: number, oldValue: number) => {
      numberOfCalls++;
      oldValueRecordedInsideSpyMethod = oldValue;
      newValueRecordedInsideSpyMethod = newValue;
    };

    // obsverve first attr
    spy.observe("attr1", spyMethod);

    // change attr1
    spy.attr1 = 99;
    expect(numberOfCalls).toBe(1);
    expect(spy.attr1).toBe(newValueForAttr1);
    expect(oldValueRecordedInsideSpyMethod).toBe(initialAttr1);
    expect(newValueRecordedInsideSpyMethod).toBe(newValueForAttr1);
  });
});
