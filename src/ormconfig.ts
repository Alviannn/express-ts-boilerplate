import 'reflect-metadata';
import config from './configs/config';

import { DataSource } from 'typeorm';

type ORMPathType = 'entities' | 'migrations' | 'subscribers';

/**
 * Provides the path to the specific ORM directories
 */
function pathToLoadORM(type: ORMPathType) {
    const startDir = (config.development ? 'src' : 'dist');
    const lastExtension = (config.development ? 'ts' : 'js');

    let middleExtension: string;
    switch (type) {
        case 'entities':
            middleExtension = 'entity';
            break;
        case 'migrations':
            middleExtension = 'migration';
            break;
        case 'subscribers':
            middleExtension = 'subscriber';
            break;
    }

    return `${startDir}/${type}/**/*.${middleExtension}.${lastExtension}`;
}

export const appDataSource = new DataSource({
    type: 'postgres',
    host: config.db.host,
    port: config.db.port,
    username: config.db.username,
    password: config.db.password,
    database: config.db.database,
    // This'll automatically modify the tables as soon as the server starts
    // therefore, it's very bad for production
    synchronize: config.development,
    entities: [pathToLoadORM('entities')],
    migrations: [pathToLoadORM('migrations')],
    subscribers: [pathToLoadORM('subscribers')]
});