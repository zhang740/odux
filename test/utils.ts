import test from 'ava';
import { guard } from '../dist/utils';

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