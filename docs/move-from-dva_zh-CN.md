# 从 dva 迁移

## 1. 新建模型

将 effect 移入模型类中，可定义 async 函数，函数内如果需要使修改立即生效，可调用 `this.applyChange()`

```ts
export class FooModel extends BaseStore {
  data: { xxx: number };

  bar() {
    this.data.xxx = 1;

    this.applyChange(); // render 1

    this.data.xxx = 2;
    this.data.xxx = 3;
  } // render 3
}
```

## 2. 切换 connect

将 `import { connect } from 'odux';` 切换为 `import { connect } from 'odux';`。

odux 的 connect 兼容 react-redux/dva 的 connect。（类组件）

\*同一组件内混合使用注意：

- 目前 connect 传递的 dispatch 不会过 dva 的 promise、saga 中间件，promise dispatch 不可用

## 3. 添加注入

- 将 connect 中相关的 pick 删除
- 添加模型 @inject

```ts
@connect((state) => ({
  --- foo: state.foo,
}))
export class FooComponent extends React.PureComponent {
  @inject()
  fooModel: FooModel;

  @inject({ getter: ioc => ioc.get(FooModel).data })
  fooModel: { xxx: number };

  render() {
    --- const { foo } = this.props;
    +++ const foo = this.fooModel;
  }
}
```
