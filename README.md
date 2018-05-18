# Odux

[![CI](https://img.shields.io/travis/zhang740/odux.svg?style=flat-square)](https://travis-ci.org/zhang740/odux)
[![Coverage](https://img.shields.io/coveralls/zhang740/odux.svg?style=flat-square)](https://coveralls.io/github/zhang740/odux)
[![Version](https://img.shields.io/npm/v/odux.svg?style=flat-square)](https://www.npmjs.com/package/odux)
[![License](https://img.shields.io/npm/l/odux.svg?style=flat-square)](https://github.com/zhang740/odux/blob/master/LICENSE)

An attempt to observable redux.

[prove of concept]

### Model define
```ts
@registerStore()
export class UserModel extends BaseStore<{
  /** 昵称 */
  nick: string;
  /** 头像Url */
  avatar: string;
  /** 系统角色 */
  role: UserRoleType;
  /** 是否为开发者 */
  developer: boolean;
  }> {
  storeAliasName = 'user';
}

// or

@registerStore()
export class UserModel extends BaseStore {
  storeAliasName = 'user';

  /** 昵称 */
  @bindProperty('nickname', () => 'defaultValue')
  nick: string;
  /** 头像Url */
  @bindProperty()
  avatar: string;
  /** 系统角色 */
  @bindProperty()
  role: UserRoleType;
  /** 是否为开发者 */
  @bindProperty()
  developer: boolean;
}
```

### Component
```tsx
@connect() // or connect((ioc, props) => ({ user: ioc.get<UserModel>(UserModel) }))
export default class extends React.PureComponent<PropsType, StateType> {

  @connectData()
  user: UserModel;

  render() {
    const { avatar, nick } = this.user;

    return (
      <div>
        {nick}
      </div>
    );
  }
}

// also use helper.component for type helper.
export default helper.component(
  (ioc, ownProps: PropsType) => ({
    user: ioc.get<UserModel>(UserModel),
  }),
  (MapperType, ioc) => {
    type MixPropsType = PropsType & typeof MapperType;
    class ComponentName extends React.PureComponent<MixPropsType, StateType> {
      render() {
        return (
          <div>
            {this.props.user.nick}
          </div>
        );
      }
    }
    return ComponentName;
  }
);
```

## Install
```shell
npm i odux --save
```

## Example

TODOList Example:

[https://github.com/zhang740/odux-example](https://github.com/zhang740/odux-example)

Used with dva Example:

[https://github.com/zhang740/odux-dva-mix-example](https://github.com/zhang740/odux-dva-mix-example)

Used with eggjs Example:

[https://github.com/zhang740/odux-egg-example](https://github.com/zhang740/odux-egg-example)
