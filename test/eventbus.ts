import test from 'ava';
import { EventBus, BaseEvent } from '../lib';

test('add/remove EventListener.', (t) => {
  class TestEvent extends BaseEvent {
  }
  class Test2Event extends BaseEvent {
  }

  let count = 0;
  const eventBus = new EventBus();

  const handler = () => { count++; };

  eventBus.emit(new TestEvent);
  t.true(count === 0);

  eventBus.removeEventListener(TestEvent, handler);

  eventBus.addEventListener(TestEvent, handler);
  eventBus.emit(new TestEvent);
  t.true(count === 1);

  eventBus.emit(new Test2Event);
  t.true(count === 1);

  const handler2 = () => { count++; };

  eventBus.addEventListener(TestEvent, handler2);
  eventBus.emit(new TestEvent);
  t.true(count === 3);


  eventBus.removeEventListener(TestEvent, handler);
  eventBus.emit(new TestEvent);
  t.true(count === 4);


  eventBus.removeEventListener(TestEvent, handler);
  eventBus.emit(new TestEvent);
  t.true(count === 5);
});

test('error.', (t) => {
  const handler = () => { };
  const eventBus = new EventBus();
  t.throws(() => eventBus.addEventListener(123 as any, handler));
  t.throws(() => eventBus.removeEventListener(123 as any, handler));
  t.throws(() => eventBus.emit(123 as any));

  t.throws(() => eventBus.addEventListener('' as any, handler));
  t.throws(() => eventBus.removeEventListener('' as any, handler));
  t.throws(() => eventBus.emit('' as any));
});
