import test from 'ava';
import { OduxConfig } from '../lib';

test('odux config default value.', t => {
  const config = new OduxConfig();
  t.true(config.dispatchDelay === 0);
  t.true(!config.isDebug);
  t.true(!config.transaction);
});
