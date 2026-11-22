import * as migration_20261115_192706 from './20261115_192706';
import * as migration_20261122_183920 from './20261122_183920';

export const migrations = [
  {
    up: migration_20261115_192706.up,
    down: migration_20261115_192706.down,
    name: '20261115_192706',
  },
  {
    up: migration_20261122_183920.up,
    down: migration_20261122_183920.down,
    name: '20261122_183920'
  },
];
