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

test('react component connect bindData.', (t) => {
  const { registerStore, connect, bindProperty, bindData } = getHelper();

  @registerStore()
  class AStore extends BaseStore {
    @bindProperty('test', () => ({ str: 'TEST_DATA' }))
    testData: { str: string };
  }

  @connect()
  class TestComponent extends React.Component<{}, {}> {
    @bindData((ioc) => ioc.get<AStore>(AStore).testData)
    injectData: { str: string };

    componentWillMount() {
      console.log(this.props);
      t.true(this.injectData.str === 'TEST_DATA');
    }

    render(): any {
      return null;
    }
  }

  render.create(
    <TestComponent />
  );
});
