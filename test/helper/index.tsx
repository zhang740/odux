import test from 'ava';
import * as React from 'react';
import * as render from 'react-test-renderer';
import { BaseStore, inject, createOduxAIO, IStoreAdapter } from '../../lib';
import { connect } from '../../lib/react-odux';
import { IocContext } from 'power-di';
import { IocProvider } from 'power-di/react';

test.beforeEach('init ioc', t => {
  IocContext.DefaultInstance.clear();
});

test('react component connect.', t => {
  IocContext.DefaultInstance.replace(IStoreAdapter, createOduxAIO());

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
  iocContext.replace(IStoreAdapter, createOduxAIO({ iocContext }));

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
