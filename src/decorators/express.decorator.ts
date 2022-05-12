/***************************************************************************
 *                                WARNING                                  *
 ***************************************************************************
 ***                                                                     ***
 *  This file shouldn't be modified unless you know what you're doing.     *
 *  It contains the logic for controllers and handlers decorator to work.  *
 ***                                                                     ***
 ***************************************************************************/

import type {
    HandlerFunction, RequestMethods,
    RoutingMap, ControllerOptions
} from '../typings/router';

/**
 * Stores informations about all routing decorators.
 *
 * Later on, this will be used to register to express routers.
 */
export const routingMap: RoutingMap = {
    controllers: {},
    handlers: {}
};

/**
 * A controller decorator that is used to mark a `class` as
 * the whole controller which contains all {@link ReqHandler}s.
 *
 * To simplify our work in the backend, I made this to remove the steps
 * to mapping controllers and registering routes to express router. With this,
 * all you need to think is the files within `controllers` and it's content.
 *
 * Once registered, let's say our path is `example`, then it'll become:
 * `http://localhost:3000/v1/example`
 *
 * @param options The controller configuration
 */
export function Controller(options: ControllerOptions): ClassDecorator {
    return (target) => {
        const { path, version, middlewares } = options;

        // request path cannot start or end with '/'
        // because express.js can't interpret it.
        if (path.startsWith('/') || path.endsWith('/')) {
            throw Error("Controller path cannot start or end with'/'!");
        }

        // instantiate the object, so we can use the
        // methods or request handlers within the class.
        const targetObj = new target.prototype.constructor();
        const { controllers } = routingMap;

        controllers[target.name] = {
            path: `/v${version ?? 1}/${path}`,
            middlewares: middlewares ?? [],
            targetObj
        };
    };
}

/**
 * A request handler decorator that is used to mark a method as a handler
 * for a controller.
 *
 * In my opinion, mapping controllers (request handlers) to it's respective
 * routes isn't a bad thing. But I feel like we can remove those steps and
 * focus only to the controllers and it's handlers.
 *
 * @param method The request method it's accepting.
 * @param path The request path for the handler, it will be
 *             concatenated with the path from {@link Controller}.
 *             Let's say the controller `products` and the handler is `/add`,
 *             then it'll become: `http://localhost:3000/v1/products/add`.
 * @param middlewares Middlewares for this specific handler.
 */
export function ReqHandler(
    method: RequestMethods,
    path: string,
    ...middlewares: HandlerFunction[]): MethodDecorator {

    return (target, key, { value: func }) => {
        if (!func || typeof key !== 'string') {
            return;
        }

        // If it's only '/', then it should be allowed.
        // ex: `/v1/todos/` is usually interpreted as 'get all todo'
        //
        // What about when it's not just 1 character?
        // A request path for handler should at least have '/' as it's prefix
        // to help on the concatination.
        //
        // As a suffix, this can cause inconsistencies, so it's not allowed.
        // ex: `/add`, then `/:id/`, then `/update`.
        if (path.length > 1) {
            if (!path.startsWith('/')) {
                throw Error("Request handler must start with '/'!");
            } else if (path.endsWith('/')) {
                throw Error(
                    'Due to inconsistencies, ' +
                    "request handler cannot end with '/'!");
            }
        }

        const funcName = key as string;
        const controllerClassName = target.constructor.name;
        const { handlers } = routingMap;

        if (!(controllerClassName in handlers)) {
            handlers[controllerClassName] = [] as never;
        }

        const handlerStore = handlers[controllerClassName];
        handlerStore.push({
            path,
            method,
            handlerName: funcName,
            middlewares
        });
    };
}