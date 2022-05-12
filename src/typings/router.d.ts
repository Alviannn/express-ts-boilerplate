/***************************************************************************
 *                                WARNING                                  *
 ***************************************************************************
 ***                                                                     ***
 *  This file shouldn't be modified unless you know what you're doing.     *
 *  It contains the logic for controllers and handlers decorator to work.  *
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
 * Inside {@link Router}, there are functions to register a request handler
 * such as {@link Router.get} and {@link Router.post}.
 *
 * But it's tricky to execute the function with {@link RequestMethods}.
 * Therefore, I'm forcing the module to accept a string to run the function
 * based on {@link RequestMethods}.
 */
export type RouterHandlerType = Record<string, RouterFunction>

// ---------------------------------------------------- //

/**
 * Stores the information from `Controller` decorator.
 */
export interface ControllerDataType {
    path: string;
    middlewares: HandlerFunction[];
    /**
     * The class that holds the `Route` is stored here
     * so we can grab the functions (the `Controller`) within it.
     */
    targetObj: Record<string, HandlerFunction>;
}

/**
 * Stores the information from `ReqHandler` decorator.
 */
export interface ReqHandlerDataType {
    path: string;
    method: RequestMethods;
    /**
     * The method name for the specific `ReqHandler`,
     * which is used for executing the request handler upon being called.
     *
     * This is connected with the {@link RouteDataType.targetObj}
     */
    handlerName: string;
    middlewares: HandlerFunction[];
}

export interface RoutingMap {
    controllers: Record<string, ControllerDataType>;
    handlers: Record<string, ReqHandlerDataType[]>;
}

// ---------------------------------------------------- //

export interface ControllerOptions {
    /**
     * The API major version, changing this for example to `2`
     * means that the API endpoint have a new big/major changes.
     * The major version is the same from {@link https://semver.org/}.
     *
     * Here's an example, on the v1 endpoint, let's say you have a popular API
     * but you wrote a bad endpoint path and you want to fix it.
     * Since many people uses your API, you can't just modify it.
     *
     * Therefore, you need to make a new API in v2 and suggests your users
     * to use it slowly by giving more time. Once everyone has moved to
     * v2 or at least ready, you can then remove v1 route or maybe keep it,
     * it's up to you.
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
     * The request path that the controller accepts.
     *
     * Let's say the path value is `example`, then it will become: `/v1/example`
     */
    path: string;
    /**
     * The middlewares for this route.
     * It will be applied to all handlers within this route.
     *
     * @default []
     */
    middlewares?: HandlerFunction[];
}