import * as migration_20260425_154423_initialset from './20260425_154423_initialset';

export const migrations = [
  {
    up: migration_20260425_154423_initialset.up,
    down: migration_20260425_154423_initialset.down,
    name: '20260425_154423_initialset'
  },
];
