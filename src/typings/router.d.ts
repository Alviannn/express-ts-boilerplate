/***************************************************************************
 *                                WARNING                                  *
 ***************************************************************************
 ***                                                                     ***
 *  This file shouldn't be modified unless you know what you're doing.     *
 *  It contains the logic for `Route` and `Controller` decorator to work.  *
 ***                                                                     ***
 ***************************************************************************/

import type {
    Request,
    Response,
    NextFunction,
    // ignore to allow linking on documentation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Router
} from 'express';

export type RequestMethods = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';

/**
 * The best practice is not to use {@link Function} as your type.
 * But I have to, somehow, make a type that accepts it for the request handlers
 * and router method functions.
 */
export type HandlerFunction =
    (req: Request, res: Response, next: NextFunction)
        => unknown | Promise<unknown>;

/**
 * @see {@link import('../routes').handlerWrapAsync}
 */
export type AsyncHandlerWrapper =
    (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

// ---------------------------------------------------- //

/**
 * Replicates the function to register a router
 * such as from {@link Router.get}.
 *
 * @see {@link RouterHandlerType}
 */
export type RouterFunction =
    (path: string, ...handlers: AsyncHandlerWrapper[]) => void;

/**
 * In a {@link Router}, there are function to register a request handler
 * such as {@link Router.get} and {@link Router.post}.
 *
 * But it's hard to execute it manually with (for example) `router.get`
 * and {@link RequestMethods}. Therefore, I'm forcing the module to accept
 * string run the function based on {@link RequestMethods}.
 */
export type RouterHandlerType = Record<string, RouterFunction>

// ---------------------------------------------------- //

/**
 * Stores the information from `Route` decorator.
 */
export interface RouteDataType {
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
export interface ControllerDataType {
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

export interface RouterMap {
    routes: Record<string, RouteDataType>;
    controllers: Record<string, ControllerDataType[]>;
}

export interface RouterOptions {
    /**
     * The API major version, changing this for example to `2`
     * means that the API endpoint have a new big/major changes.
     * The major version is the same from {@link https://semver.org/}.
     *
     * Here's an example, on the v1 endpoint, let's say you we're using
     * the wrong route name and we want to fix it. Since many people uses
     * your API, you can't just delete or change the old endpoint.
     *
     * Therefore, you need to make a new API in v2 and suggests your users
     * to use it slowly by giving more time. Once everyone has moved to
     * v2 or at least ready, you can remove finally remove v1 route.
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
     * Let's say the path is `example`,
     * then the endpoint will be: `/v1/example`
     */
    path: string;
    /**
     * The middlewares for this route.
     *
     * It will be applied to all existing controllers
     * within this route.
     *
     * @default []
     */
    middlewares?: HandlerFunction[];
}