# Odux

[![CI](https://img.shields.io/travis/zhang740/odux.svg?style=flat-square)](https://travis-ci.org/zhang740/odux)
[![Coverage](https://img.shields.io/coveralls/zhang740/odux.svg?style=flat-square)](https://coveralls.io/github/zhang740/odux)
[![Version](https://img.shields.io/npm/v/odux.svg?style=flat-square)](https://www.npmjs.com/package/odux)
[![License](https://img.shields.io/npm/l/odux.svg?style=flat-square)](https://github.com/zhang740/odux/blob/master/LICENSE)

An attempt to observable redux.

## Quickview

### Model define

```ts
class AStore extends BaseStore {
  testData: { str: string };
}
```

### Component

```tsx
@connect()
class TestComponent extends React.PureComponent {
  @inject()
  aStore: AStore;

  componentWillMount() {
    t.true(this.aStore instanceof AStore);
  }

  render(): any {
    return null;
  }
}
```

## Integration with other redux-base

### dva

```ts
const app = dva({
  ...
  extraEnhancers: [createOduxEnhancer()],
});
```

### createOduxEnhancer

### combineReducer

## Install

```shell
npm i odux --save
```
