# Odux

[English](./README.md) | 简体中文

[![CI](https://img.shields.io/travis/zhang740/odux.svg?style=flat-square)](https://travis-ci.org/zhang740/odux)
[![Coverage](https://img.shields.io/coveralls/zhang740/odux.svg?style=flat-square)](https://coveralls.io/github/zhang740/odux)
[![Version](https://img.shields.io/npm/v/odux.svg?style=flat-square)](https://www.npmjs.com/package/odux)
[![License](https://img.shields.io/npm/l/odux.svg?style=flat-square)](https://github.com/zhang740/odux/blob/master/LICENSE)

一个类型友好易用的前端状态管理库。（需要 TypeScript）

---

## 特点

- **开箱即用**，极低的学习成本，没有过多概念
- **类型友好**，使用 OO 描述数据模型，直观
- **便于集成**，可无缝融入其余基于 Redux 的状态管理系统内，亦可脱离 Redux 独立运行

## 安装

```shell
npm i odux --save
```

## 快速上手

### 前置

TypeScript 配置需求：

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

### 模型定义

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

### 组件使用

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

## 示例

- [Hello World, 计数器](https://stackblitz.com/edit/odux-basic?file=index.tsx)

## 集成其他 redux-base

### dva

```ts
const app = dva({
  extraEnhancers: [createOduxEnhancer()],
});
```

### createOduxEnhancer

## Thanks

[immer](https://github.com/mweststrate/immer)
