import test from 'ava';
import { guard, compare } from '../lib/utils';

test('guard', (t) => {
  const data = guard(() => {
    throw new Error;
  }, 1, (err) => {
    t.pass();
  });
  t.true(data === 1);

  const data2 = guard<number>(() => {
    throw new Error;
  }, 1, (err) => {
    return 2;
  });
  t.true(data2 === 2);
});

test('compare', (t) => {
  compare(
    {
      a: {
        b: {},
        c: () => { }
      },
      d: () => { }
    },
    {
      a: {},
      d: () => { }
    }, '');
  t.pass();
});
