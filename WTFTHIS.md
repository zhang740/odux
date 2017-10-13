# 这是啥？

# 面向对象与函数式融合的数据管理

## React的核心思想

React的核心思想用最简单的方式概况就是：
```javascript
(props, state) => render() { return DOM }
```
通过数据生成DOM，组件最简单的形式就是函数。

在这个思想下，与之匹配的数据管理方式就是Redux，函数式的数据管理框架。

## Redux

Redux不是一个简单的函数，他的核心是一个状态机，action为事件，reducer为状态转移条件及状态转移函数的结合，state为状态。

### 优点
函数式的设计与React契合的很好，xxx

### 缺点
把一个连贯的逻辑拆的太碎，导致概念分散。
1. 动作流程
从Action的角度，正常的命令式的逻辑是：1. request等动作逻辑，2. 处理数据，操作数据，3. 反馈到界面（主动修改/双向绑定）。
而Redux的方式：1. 意图Action（action，Redux的这个概念其实不是完整的动作，只能算是动作的意图，类似Android的Intent的概念），2. 对意图的处理（middleware），3. 对处理结果的处理（reducer），生成新的state，4. 反馈到界面（connect）。
2. 概念划分
从概念上来说，redux的方式把一个操作逻辑分割到了action、middleware、reducer这一系列的不同分层中，导致业务概念分散，而且state又是树结构存储，不同节点通过reducer进行更新，这棵树的具体形状需要开发者脑补，整棵树存在在我们深深的脑海里，具体在哪？store.getState？我们知道state是存在的，在我们需要的时候（connect）他会被传过来的，在树的规模比较小的时候处理起来很容易，但是当规模大起来就不容易了。
3. 类型不友好
由于action必须是一个plainObject，所以在经过dispatch后，action的类型只能通过type或者自定义的属性字段来判断，而dispatch的两端又不是同一分层，对action的判断只能通过人脑进行，虽然理想是很好的，可以彻底解耦，action与middleware、reducer是多对多关系，但是关系定义就较为繁琐，而为了使type全局唯一，或者引用静态变量或者依靠约定，总体比较麻烦。

为了应对这些问题也出现了不少方案，比如redux-saga、dva等。

## redux-saga
本质上是把redux的状态机当成了消息总线，使用函数式思想外加generator等特性搞了一套消息系统。这套方案很好的解决了上述第1点问题，很好的规范了对意图（action）的解析处理问题。

## dva
dva首先是一个数据框架，他把redux-saga、redux-router等常用的库整合到了一起，然后通过命名空间把state分割，同时在一个文件中包含state、action、reducer等部分，将这些概念集中在一起，免去了各种文件切换的烦恼，主要解决的是上述的第2点。

### 优点
把成熟的方案融合在一起，上手容易。

### 缺点
model和action是一一对应，action无法跨model访问state，reducer沦为修改时才会使用的方法，数据存储结构层次比较深时还是会有所不便（需要保证修改的部分是新对象）

## Mobx
抛开函数式，使用setter、getter监听数据变化，使用反应概念，当组件依赖的数据变化时，直接触发组件更新（forceUpdate）。但问题是这种方式绕过了React的一些生命周期，组件无法感知变化的数据字段。

### 优点
直接。

### 缺点

## So...
这个库是怎么做的？