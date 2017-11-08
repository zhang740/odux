import test from 'ava';
import { OduxConfig } from '../lib';

test('odux config default value.', (t) => {
  const config = new OduxConfig;
  t.true(config.autoTracking);
  t.true(config.dispatchDelay === 0);
  t.true(!config._isDebug);
  t.true(config.prefix === undefined);
  t.true(!config.transaction);
});
