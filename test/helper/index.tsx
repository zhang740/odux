import test from 'ava';
import { IocContext } from 'power-di';
import * as React from 'react';
import * as render from 'react-test-renderer';
import { BaseStore } from '../../lib';
import { getHelper } from '../base';

test('react component connect.', (t) => {
  const { registerStore, component, bindProperty } = getHelper();

  @registerStore()
  class AStore extends BaseStore {
    @bindProperty('test', () => ({ str: 'TEST_DATA' }))
    testData: { str: string };
  }

  interface PropsType { }
  interface StateType { }

  const TestComponent = component(
    (ioc, ownProps: PropsType) => ({
      injectData: ioc.get<AStore>(AStore).testData,
    }),
    (MapperType, ioc) => {
      type MixPropsType = PropsType & typeof MapperType;
      class RealTestComponent extends React.PureComponent<MixPropsType, StateType> {
        componentWillMount() {
          t.true(this.props.injectData.str === 'TEST_DATA');
        }

        render(): any {
          return null;
        }
      }
      return RealTestComponent;
    });

  render.create(
    <TestComponent />
  );
});

test('react component connect connectData.', (t) => {
  const { registerStore, connect, bindProperty, connectData } = getHelper();

  @registerStore()
  class AStore extends BaseStore {
    @bindProperty('test', () => ({ str: 'TEST_DATA' }))
    testData: { str: string };
  }

  @connect()
  class TestComponent extends React.Component<{}, {}> {
    @connectData(undefined, (ioc) => ioc.get<AStore>(AStore).testData)
    injectData: { str: string };

    @connectData()
    withDefault: AStore;

    componentWillMount() {
      t.true(this.injectData.str === 'TEST_DATA');
      t.true(this.withDefault.testData.str === 'TEST_DATA');
    }

    render(): any {
      return null;
    }
  }

  render.create(
    <TestComponent />
  );
});

test('react component connect props merge.', (t) => {
  const { registerStore, connect, bindProperty, connectData } = getHelper();

  @registerStore()
  class AStore extends BaseStore {
    @bindProperty('test', () => ({ str: 'TEST_DATA' }))
    testData: { str: string };
  }

  @connect((ioc, props) => ({ test2: '333' }))
  class TestComponent extends React.Component<{
    test: string,
    test2?: string
  }, {}> {
    @connectData(undefined, (ioc) => ioc.get<AStore>(AStore).testData)
    injectData: { str: string };

    @connectData()
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
    <TestComponent test="123123" />
  );
});
