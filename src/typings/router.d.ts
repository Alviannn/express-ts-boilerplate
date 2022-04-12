/***************************************************************************
 *                                WARNING                                  *
 ***************************************************************************
 ***                                                                     ***
 *  This file shouldn't be modified unless you know what you're doing.     *
 *  It contains the logic for `Route` and `Controller` decorator to work.  *
 ***                                                                     ***
 ***************************************************************************/

/* eslint-disable no-unused-vars */

import type { Request, Response, NextFunction } from 'express';

declare type RequestMethods = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';

/**
 * The best practice is not to use {@link Function} as your type.
 * But I have to, somehow, make a type that accepts it for the request handlers
 * and router method functions.
 */
declare type HandlerFunction =
    (req: Request, res: Response, next: NextFunction)
        => unknown | Promise<unknown>;

/**
 * @see {@link import('../routes').handlerWrapAsync}
 */
declare type AsyncHandlerWrapper =
    (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * @see {@link HandlerFunction}
 */
declare type RouterFunction =
    (path: string, ...handlers: AsyncHandlerWrapper[]) => void;

// ---------------------------------------------------- //

/**
 * In a {@link Router}, there are function to register a request handler
 * such as {@link Router.get} and {@link Router.post}.
 *
 * But it's hard to execute it manually with (for example) `router.get`
 * and {@link RequestMethods}. Therefore, I'm forcing the module
 * to accept string (like keys in object)
 * and run the function based on {@link RequestMethods}.
 */
declare type RouterHandlerType = Record<string, RouterFunction>

// ---------------------------------------------------- //

/**
 * Stores the information from `Route` decorator.
 */
declare interface RouteDataType {
    path: string;
    middlewares: HandlerFunction[];
    /**
     * The class that holds the `Route` is stored here
     * so we can grab the functions (the `Controller`) within it.
     */
    targetObj: Record<string, HandlerFunction>;
}

/**
 * Stores the information from `Controller` decorator.
 */
declare interface ControllerDataType {
    path: string;
    method: RequestMethods;
    /**
     * The method name for the `Controller` is stored
     * so grab the method from the class with `Route` decorator.
     *
     * This is connected with the {@link RouteDataType.targetObj}
     */
    handlerName: string;
    middlewares: HandlerFunction[];
}

// ---------------------------------------------------- //

declare interface RouterMap {
    routes: Record<string, RouteDataType>;
    controllers: Record<string, ControllerDataType[]>;
}

declare interface RouterOptions {
    /**
     * The API major version, changing this for example to `2`
     * means that the API endpoint have a new big/major changes.
     * The major version is the same from {@link https://semver.org/}.
     *
     * Here's an example, on the v1 endpoint, let's say we don't know
     * it should be plural but then later change it to a plural version.
     * Since many people uses your API, you can't delete the old endpoint.
     * You need to make a new API in v2 and suggests your users to use it.
     * Once everyone has moved to the v2 or at least ready, you can remove v1.
     *
     * From:
     * ```txt
     * POST /v1/todo/add
     * ```
     *
     * To:
     * ```txt
     * POST /v2/todos/add
     * ```
     *
     * @default 1
     */
    version?: number;
    /**
     * The route should accept a request from a "path".
     *
     * Let's say the value is `example`, then the endpoint starts with:
     * `/v1/example`
     */
    path: string;
    /**
     * The middlewares for this route.
     *
     * This middlewares will be applied to all existing controllers
     * within this route.
     *
     * @default []
     */
    middlewares?: HandlerFunction[];
}