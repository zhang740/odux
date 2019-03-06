import test from 'ava';
import * as React from 'react';
import * as render from 'react-test-renderer';
import { BaseStore, inject, createOduxAIO, Odux, connect } from '../../lib';
import { IocContext } from 'power-di';
import { IocProvider } from 'power-di/react';
import { getGlobalType } from 'power-di/utils';

test.beforeEach('init ioc', t => {
  IocContext.DefaultInstance.clear();
});

test('react component connect.', t => {
  IocContext.DefaultInstance.replace(Odux, createOduxAIO());

  class AStore extends BaseStore {
    testData: { str: string };
  }

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

  render.create(<TestComponent />);
});

test('react component connect props merge.', t => {
  const iocContext = new IocContext({ autoRegister: true });
  iocContext.replace(Odux, createOduxAIO({ iocContext }));

  class AStore extends BaseStore {
    testData: { str: string } = { str: 'TEST_DATA' };
  }

  @connect(() => ({ test2: '333' }))
  class TestComponent extends React.Component<{ test: string; test2?: string }, {}> {
    @inject({ getter: ioc => ioc.get(AStore).testData })
    injectData: { str: string };

    @inject()
    withDefault: AStore;

    componentWillMount() {
      t.true(this.injectData.str === 'TEST_DATA');
      t.true(this.withDefault.testData.str === 'TEST_DATA');
      t.true(this.props.test === '123123');
      t.true(this.props.test2 === '333');
    }

    render(): any {
      return null;
    }
  }

  render.create(
    <IocProvider context={iocContext}>
      <TestComponent test="123123" />
    </IocProvider>
  );
});

test('data change.', t => {
  return new Promise(resolve => {
    IocContext.DefaultInstance.replace(Odux, createOduxAIO());

    class AStore extends BaseStore {
      testData: { str: string };
    }

    @connect()
    class TestComponent extends React.PureComponent {
      @inject()
      aStore: AStore;

      componentWillMount() {
        setImmediate(() => {
          this.aStore.changeData(() => {
            this.aStore.testData = { str: '3333' };
          });
        });
      }

      componentWillReceiveProps() {
        t.true(this.aStore.testData.str === '3333');
        resolve();
      }

      render(): any {
        return null;
      }
    }

    render.create(<TestComponent />);
  });
});

test('mapper.', t => {
  const odux = createOduxAIO({ dispatchDelay: -1 });
  IocContext.DefaultInstance.replace(Odux, odux);

  class AStore extends BaseStore {
    testData: { str: string };
  }

  const aStore = new AStore(odux);
  aStore.testData = { str: '111' };

  @connect((s, p, ioc) => {
    t.deepEqual(s, {
      [getGlobalType(AStore)]: {
        testData: {
          str: '111',
        },
      },
    });
    t.deepEqual(p, { test: '333' });
    t.true(ioc.get(Odux) === odux);
  })
  class TestComponent extends React.PureComponent<{ test: string }> {
    @inject()
    aStore: AStore;

    render(): any {
      return null;
    }
  }

  render.create(<TestComponent test="333" />);
});

test('applyChange.', t => {
  const odux = createOduxAIO({ dispatchDelay: -1 });
  IocContext.DefaultInstance.replace(Odux, odux);

  class AStore extends BaseStore {
    testData = { a: 1 };

    change() {
      this.testData.a = 2;
      this.applyChange();
      this.testData.a = 3;
      this.testData.a = 4;
      this.applyChange();
      this.testData.a = 5;
    }
  }

  const results = [1, 2, 4, 5];

  @connect()
  class TestComponent extends React.PureComponent {
    @inject()
    aStore: AStore;

    componentDidMount() {
      this.aStore.change();
    }

    render(): any {
      t.true(this.aStore.testData.a === results.shift());
      return null;
    }
  }

  render.create(<TestComponent />);
});

test('type error.', t => {
  const odux = createOduxAIO({ dispatchDelay: -1 });
  IocContext.DefaultInstance.replace(Odux, odux);

  @connect()
  class TestComponent extends React.PureComponent {
    @inject()
    aStore: number;

    render(): any {
      return null;
    }
  }
  t.throws(() => render.create(<TestComponent />));

  class AStore {}
  @connect()
  class Test2Component extends React.PureComponent {
    @inject()
    aStore: AStore;

    render(): any {
      return null;
    }
  }
  t.throws(() => render.create(<Test2Component />));
});

test('class extend.', t => {
  const odux = createOduxAIO({ dispatchDelay: -1 });
  IocContext.DefaultInstance.replace(Odux, odux);

  class AStore extends BaseStore {
    data = { a: 1 };
  }

  class BaseComponent extends React.PureComponent {
    @inject()
    aStore: AStore;

    func() {
      return this.aStore.data.a;
    }
  }

  @connect()
  class TestComponent extends BaseComponent {
    render(): any {
      t.true(this.func() === 1);
      return null;
    }
  }
  render.create(<TestComponent />);
});

test('class extend, can\'t connect base class.', t => {
  const odux = createOduxAIO({ dispatchDelay: -1 });
  IocContext.DefaultInstance.replace(Odux, odux);

  class AStore extends BaseStore {
    data = { a: 1 };
  }

  @connect()
  class BaseComponent extends React.PureComponent {
    @inject()
    aStore: AStore;

    func() {
      return this.aStore.data.a;
    }
  }

  class TestComponent extends BaseComponent {
    render(): any {
      t.true(this.func() === 1);
      return null;
    }
  }
  t.throws(() => render.create(<TestComponent />));
});
