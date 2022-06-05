import config from '../configs/config';

import type { PostgreSqlDriver } from '@mikro-orm/postgresql';
import type { Configuration, IDatabaseDriver, Options } from '@mikro-orm/core';

type ORMConfigType<T extends IDatabaseDriver = PostgreSqlDriver> =
    Options<T> | Configuration<T>;

const ormConfig: ORMConfigType = {
    host: config.db.host,
    port: config.db.port,
    dbName: config.db.database,
    user: config.db.username,
    password: config.db.password,

    entitiesTs: ['src/database/entities/**/*.entity.ts'],
    entities: ['build/database/entities/**/*.entity.js'],

    migrations: {
        pathTs: 'src/database/migrations/*.migration.ts',
        path: 'build/database/migrations/*.migration.js'
    },

    type: 'postgresql'
};

export default ormConfig;