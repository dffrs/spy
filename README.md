# SPY

SPY is a typescript class that let's observe changes done to another's class attributes. It is based on observable/observed pattern.

## Installation

```bash
npm install @dffrs/spy
```

## Example

```typescript
class DummyClass {
  public attr1: number;
  public attr2: string;

  constructor(attr1: number, attr2: string) {
    this.attr2 = attr2;
    this.attr1 = attr1;
  }

  public publicMethod1() {
    // whatever this method does...
  }

  // Other class methods...
}

// Create a spy instance
const SpyOnDummy = Spy(DummyClass);

// Then, someplace else...
const spy = SpyOnDummy(10, "Test");

spy.observe("attr1", () => {
  console.log("I will be called whenever attr1 is modified");
});
```
