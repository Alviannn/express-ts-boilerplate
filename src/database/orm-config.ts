import config from '../configs/config';

import { MikroORM } from '@mikro-orm/core';

import type { PostgreSqlDriver } from '@mikro-orm/postgresql';

export let orm: MikroORM<PostgreSqlDriver>;

export async function initOrm() {
    orm = await MikroORM.init<PostgreSqlDriver>({
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

        type: 'postgresql',
    });

    await orm.getSchemaGenerator().updateSchema();
}