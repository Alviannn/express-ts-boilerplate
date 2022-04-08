/***************************************************************************
 *                                WARNING                                  *
 ***************************************************************************
 ***                                                                     ***
 *  This file shouldn't be modified unless you know what you're doing.     *
 *  It contains the logic for `Route` and `Controller` decorator to work.  *
 ***                                                                     ***
 ***************************************************************************/

import {
    HandlerFunction, RequestMethods,
    RouterMap, RouterOptions
} from '../typings/router';

/**
 * Stores all {@link Route}s and {@link Controller}s
 *
 * Later on, this will be used for registering as routers.
 */
export const routerMap: RouterMap = {
    routes: {},
    controllers: {}
};

/**
 * A route decorator that is used to mark a `class` as the route
 * for the {@link Controller}s within it.
 *
 * To simplify our work in the backend, I made this to remove steps
 * to adding controllers and routes to the global router. With this,
 * all you need to think is the `controllers` directory and it's content.
 *
 * Once registered, let's say our path is `example`, therefore:
 * `http://localhost:3000/v1/example`
 *
 * @param options The route configuration
 */
export function Route(options: RouterOptions): ClassDecorator {
    return (target) => {
        const { path, version, middlewares } = options;

        // route path shouldn't have '/' as the starting or ending
        // because express.js can't interpret it and will not work.
        if (path.startsWith('/') || path.endsWith('/')) {
            throw Error("Router path cannot have '/' as a prefix or suffix!");
        }

        // instantiate the object, so we can use the 'controllers' later on
        const targetObj = new target.prototype.constructor();

        routerMap.routes[target.name] = {
            path: `/v${version ?? 1}/${path}`,
            middlewares: middlewares ?? [],
            targetObj
        };
    };
}

/**
 * A controller decorator that is used to mark a method (function in a class)
 * as a controller for the router, meaning this is connected to {@link Route}.
 *
 * Creating separate directory for `routes` and `controllers` is a good thing,
 * but I feel like we can decrease the steps to register a route.
 *
 * @param method Request method it's accepting.
 * @param path Controller path will be combined with {@link Route}.
 *             Let's say the route is `products` and this path is `/add`,
 *             therefore: `http://localhost:3000/v1/products/add`.
 * @param middlewares Middlewares for this specific controller.
 */
export function Controller(
    method: RequestMethods,
    path: string,
    ...middlewares: HandlerFunction[]): MethodDecorator {

    return (target, key, { value: func }) => {
        if (!func || typeof key !== 'string') {
            return;
        }

        // Only '/' should be allowed for GET ALL or just GET kind of thing.
        // ex: `/v1/todos/` is usually interpreted as 'get all todo'
        //
        // What about when it's not just 1 character?
        // A controller route should at least have '/' as it's prefix,
        // because it can't be empty anyways.
        //
        // As a suffix, this is can cause inconsistencies.
        // ex: `/add`, then `/:id/`, then `/update`.
        if (path.length > 1) {
            if (!path.startsWith('/')) {
                throw Error("Controller must have '/' as prefix!");
            } else if (path.endsWith('/')) {
                throw Error(
                    'Due to inconsistencies, ' +
                    "controller cannot have '/' as suffix!");
            }
        }

        const funcName = key as string;
        const routerClassName = target.constructor.name;

        if (!(routerClassName in routerMap.controllers)) {
            routerMap.controllers[routerClassName] = [] as never;
        }

        routerMap.controllers[routerClassName].push({
            path, method,
            handlerName: funcName,
            middlewares
        });
    };
}