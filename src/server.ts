import app from './app';
import errorHandling from './middlewares/error-handler.middleware';
import logger from './utils/logger.util';

import { createExpressRouter } from './internals/routes';
import { initOrm } from './database/orm-config';

const port = process.env.PORT ?? 5000;

app.listen(port, async () => {
    await initOrm();

    const expressRouter = await createExpressRouter();

    app.use('/', expressRouter);
    app.use(errorHandling);

    console.log();
    logger.info(`Server is hosted at http://localhost:${port}/`);
});