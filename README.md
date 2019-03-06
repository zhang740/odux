# Odux

English | [简体中文](./README_zh-CN.md)

[![CI](https://img.shields.io/travis/zhang740/odux.svg?style=flat-square)](https://travis-ci.org/zhang740/odux)
[![Coverage](https://img.shields.io/coveralls/zhang740/odux.svg?style=flat-square)](https://coveralls.io/github/zhang740/odux)
[![Version](https://img.shields.io/npm/v/odux.svg?style=flat-square)](https://www.npmjs.com/package/odux)
[![License](https://img.shields.io/npm/l/odux.svg?style=flat-square)](https://github.com/zhang740/odux/blob/master/LICENSE)

A friendly and easy-to-use front-end state management library. (need TypeScript)

---

## Feature

- **Out of box**, Low learning costs and less concept
- **Type friendly**, Describe the data model using OO, intuitive
- **Easy to integrate**, Can be seamlessly integrated into the other Redux-based state management system, or run independently from Redux

## Install

```shell
npm i odux --save
```

## Quick Start

### First

TypeScript config:

```json
// tsconfig.json
{
  "compilerOptions": {
    ...
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Store/Model

```ts
class AStore extends BaseStore {
  testData = {
    str: 'Hello World!',
    count: 0,
  };

  add() {
    this.testData.count++;
  }
}
```

### Component

```tsx
@connect()
class App extends PureComponent {
  @inject()
  aStore: AStore;

  onClick = () => {
    this.aStore.add();
  };

  render() {
    const { testData } = this.aStore;
    return (
      <div>
        <p>{testData.str}</p>
        <p>count: {testData.count}</p>
        <button onClick={this.onClick}>Add</button>
      </div>
    );
  }
}
```

## Demo

- [Hello World, counter](https://stackblitz.com/edit/odux-basic?file=index.tsx)

## Integration with other redux-base

### dva

```ts
const odux = createOduxForDva();
const app = dva({
  extraEnhancers: [odux.extraEnhancers],
  onReducer: odux.onReducer,
  // onReducer: reducer => otherReducer(odux.onReducer(reducer)),
});
```

### createOduxEnhancer

## Thanks

[immer](https://github.com/mweststrate/immer)
