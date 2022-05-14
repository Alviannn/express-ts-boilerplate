/***************************************************************************
 *                                WARNING                                  *
 ***************************************************************************
 ***                                                                     ***
 *  This file shouldn't be modified unless you know what you're doing.     *
 *  It contains the logic for `Route` and `Controller` decorator to work.  *
 ***                                                                     ***
 ***************************************************************************/

import fs from 'fs';
import path from 'node:path';

import { Router } from 'express';
import { routingMap } from '../decorators/express.decorator';
import { ANSI } from '../utils/ansi.util';

import type { Request, Response, NextFunction } from 'express';
import type {
    AsyncHandlerWrapper,
    ControllerDataType,
    ReqHandlerDataType,
    HandlerFunction,
    RouterHandlerType
} from '../typings/router';

/**
 * Wraps a request handler or middleware handler inside a {@link Promise}.
 *
 * The error handler in express doesn't support asynchronous flow.
 * So, to somehow make the error handling work, wrapping it with
 * {@link Promise} might make up for it.
 *
 * Why? Because there's {@link Promise.catch} which means we can use it
 * to "catch" the error, and then pass it to `next` function.
 */
function handlerWrapAsync(handler: HandlerFunction): AsyncHandlerWrapper {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handler(req, res, next);
        } catch (err) {
            next(err);
        }
    };
}

function mapRequestHandlers(
    router: Router,
    controller: ControllerDataType,
    reqHandler: ReqHandlerDataType) {

    const {
        path: handlerPath,
        middlewares,
        handlerName,
        method
    } = reqHandler;

    const handlerFunc = controller.targetObj[handlerName] as HandlerFunction;
    const handlerList = [...middlewares, handlerFunc]
        .map((handler) => handlerWrapAsync(handler));

    // allow the express router to accept string as its methods
    // based on HTTP request methods.
    const routerObject = router as unknown as RouterHandlerType;
    const routerMethodName = method.toLowerCase();

    routerObject[routerMethodName](handlerPath, ...handlerList);

    const msg = `{color}${method} \t${controller.path}${handlerPath}{reset}`
        .replace('{color}', ANSI.GREEN)
        .replace('{reset}', ANSI.RESET);

    console.log(msg);
}

function mapRoutes(globalRouter: Router) {
    const { controllers, handlers } = routingMap;

    for (const [className, controller] of Object.entries(controllers)) {
        const currentRouter = Router();
        const reqHandlerList = handlers[className];

        // skip empty controllers
        if (!reqHandlerList) {
            continue;
        }

        if (controller.middlewares.length) {
            currentRouter.use(...controller.middlewares);
        }

        console.log();

        for (const reqHandler of reqHandlerList) {
            mapRequestHandlers(currentRouter, controller, reqHandler);
        }

        globalRouter.use(controller.path, currentRouter);
    }
}

/**
 * Imports all routes from `controllers/` directory.
 *
 * In TS, it's a bit tricky to import dynamically,
 * therefore it's an async function.
 */
async function importRoutes(filePath: string) {
    const isDir = fs.lstatSync(filePath).isDirectory();
    if (isDir) {
        const files = fs.readdirSync(filePath);
        const promises: Promise<unknown>[] = [];

        for (const file of files) {
            const fullPath = path.join(filePath, file);
            promises.push(importRoutes(fullPath));
        }

        await Promise.all(promises);
    } else if (filePath.includes('.controller.')) {
        await import(path.resolve(filePath));
    }
}

/**
 * Creates the global router for the entire Express app.
 *
 * To bind all of the routes easily from the `controllers/` directory,
 * we can make use of the {@link Router} to achieve that.
 */
export async function createGlobalRouter(): Promise<Router> {
    const controllersDir = path.join(__dirname, '..', 'controllers/');
    await importRoutes(controllersDir);

    const router = Router();
    mapRoutes(router);

    return router;
}