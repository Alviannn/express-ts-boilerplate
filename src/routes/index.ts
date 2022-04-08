/***************************************************************************
 *                                WARNING                                  *
 ***************************************************************************
 ***                                                                     ***
 *  This file shouldn't be modified unless you know what you're doing.     *
 *  It contains the logic for `Route` and `Controller` decorator to work.  *
 ***                                                                     ***
 ***************************************************************************/

import { Router, Request, Response, NextFunction } from 'express';
import { routerMap } from '../decorators/express.decorator';
import { ANSI } from '../utils/ansi.util';
import {
    AsyncHandlerWrapper,
    ControllerDataType,
    HandlerFunction,
    RouteDataType,
    RouterHandlerType
} from '../typings/router';

import fs from 'fs';
import nodePath from 'node:path';

/**
 * Wraps the {@link HandlerFunction} inside a {@link Promise}.
 *
 * The error handler in js doesn't support asynchronous flow.
 * So, to somehow make the error handling work, wrapping it with {@link Promise}
 * might make up for it.
 *
 * Why? Because it has {@link Promise.catch} which obviously means
 * we can use it to "catch" the error then pass it to `next`.
 */
function handlerWrapAsync(handler: HandlerFunction): AsyncHandlerWrapper {
    return (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(handler(req, res, next)).catch((err) => next(err));
}

function registerController(
    router: RouterHandlerType,
    routerData: RouteDataType,
    controllerData: ControllerDataType) {

    const { path, middlewares, handlerName, method } = controllerData;
    const REQUEST_METHODS = ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'];

    // Invalid methods shouldn't be accepted
    if (!REQUEST_METHODS.includes(method)) {
        return;
    }

    const mainHandler = routerData.targetObj[handlerName] as HandlerFunction;
    const handlerList = [...middlewares, mainHandler]
        .map((handler) => handlerWrapAsync(handler));

    const methodName = method.toLowerCase();
    router[methodName](path, ...handlerList);

    const msg = `{color}${method} \t${routerData.path}${path}{reset}`
        .replace('{color}', ANSI.GREEN)
        .replace('{reset}', ANSI.RESET);

    console.log(msg);
}

function registerRouters(globalRouter: Router) {
    const { routes, controllers } = routerMap;

    for (const [className, parent] of Object.entries(routes)) {
        const currentRouter = Router();
        const controllerList = controllers[className];

        if (parent.middlewares.length) {
            currentRouter.use(...parent.middlewares);
        }

        // To make the 'registering-route' output look pretty,
        // we're just going to add a line to the output
        // before it shows the actual output.
        if (controllerList) {
            console.log();
        }

        for (const controller of controllerList) {
            // The `registerController` function only accepts the router
            // with the type of `RouterHandlerType`.
            registerController(
                currentRouter as unknown as RouterHandlerType,
                parent,
                controller
            );
        }

        globalRouter.use(parent.path, currentRouter);
    }
}

/**
 * Imports all routes from `controllers/` directory.
 *
 * In TS, it's a bit tricky to import dynamically,
 * therefore it's an async function.
 */
async function importRoutes(path: string) {
    const isDir = fs.lstatSync(path).isDirectory();
    if (isDir) {
        const files = fs.readdirSync(path);
        const promises: Promise<unknown>[] = [];

        for (const file of files) {
            const fullPath = nodePath.join(path, file);
            promises.push(importRoutes(fullPath));
        }

        await Promise.all(promises);
    } else if (path.includes('.controller.')) {
        // Importing based on the complete path won't work,
        // using the `resolve` function will make it like
        // how you used to import a local module.
        await import(nodePath.resolve(path));
    }
}

/**
 * Creates the global router for the entire Express app.
 *
 * To bind all of the routes easily from the `controllers/` directory,
 * we can make use of the {@link Router} to achieve that.
 */
export async function createGlobalRouter(): Promise<Router> {
    const controllersDir = nodePath.join(__dirname, '..', 'controllers/');
    await importRoutes(controllersDir);

    const router = Router();
    registerRouters(router);

    return router;
}