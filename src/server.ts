import app from './app';
import errorHandling from './middlewares/error-handler.middleware';
import logger from './utils/logger.util';

import { createExpressRouter } from './internals/routes';
import { MikroORM } from '@mikro-orm/core';

import type { PostgreSqlDriver } from '@mikro-orm/postgresql';

const port = process.env.PORT ?? 5000;
let orm: MikroORM<PostgreSqlDriver>;

app.listen(port, async () => {
    orm = await MikroORM.init<PostgreSqlDriver>();
    await orm.getSchemaGenerator().updateSchema();

    const expressRouter = await createExpressRouter();

    app.use('/', expressRouter);
    app.use(errorHandling);

    console.log();
    logger.info(`Server is hosted at http://localhost:${port}/`);
});

export { orm };