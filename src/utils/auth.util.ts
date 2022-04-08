import jwt from 'jsonwebtoken';
import config from '../configs/config';

import { Request } from 'express';
import { User } from '../entities/user.entity';
import bcrypt from 'bcrypt';

// ------------------------------------------------------------------------ //

export type TokenType = 'ACCESS' | 'REFRESH';

export type UserPayload = {
    id: number,
    email: string
}

// ------------------------------------------------------------------------ //

/**
 * TODO: Use proper storage
 */
export const REFRESH_TOKEN_LIST: string[] = [];

// ------------------------------------------------------------------------ //

export async function hashPassword(password: string) {
    return bcrypt.hash(password, config.hashRounds);
}

export function generateToken(user: User | UserPayload, tokenType: TokenType) {
    let tokenSecret: string;
    const signOption: jwt.SignOptions = { notBefore: config.jwt.notBefore };
    const payload: UserPayload = { id: user.id, email: user.email };

    if (tokenType === 'ACCESS') {
        tokenSecret = config.jwt.accessSecret;
        signOption.expiresIn = config.jwt.accessExpire;
    } else {
        tokenSecret = config.jwt.refreshSecret;
        signOption.expiresIn = config.jwt.refreshExpire;
    }

    const token = jwt.sign(payload, tokenSecret, signOption);
    if (tokenType === 'REFRESH') {
        REFRESH_TOKEN_LIST.push(token);
    }

    return token;
}

/**
 * Extracts the user's JWT (in the header).
 * This is used to make the `logout` controller cleaner.
 *
 * It won't be an `undefined` if the `authenticate` middleware
 * is already used for the controller.
 */
export function getTokenFromHeader(req: Request) {
    const rawToken = req.header('authorization');
    const prefix = 'Bearer ';

    if (!rawToken || !rawToken.startsWith(prefix)) {
        return;
    }

    const token = rawToken.replace(prefix, '');
    return token;
}

/**
 * Extracts the user's payload from the JWT (in the header).
 *
 * With this, we don't need to validate the token manually
 * (even after using `authenticate` middleware) and instead can focus
 * with the payload content.
 *
 * It won't be an `undefined` if the `authenticate` middleware
 * is already used for the controller.
 *
 * @throws If the {@link tokenType} incorrect {@link TokenType}
 */
export function getPayloadFromHeader(
    req: Request, tokenType: TokenType = 'ACCESS') {

    const token = getTokenFromHeader(req);
    if (!token) {
        return;
    }

    let secret: string;
    switch (tokenType) {
        case 'ACCESS':
            secret = config.jwt.accessSecret;
            break;
        case 'REFRESH':
            secret = config.jwt.refreshSecret;
            break;
        default:
            throw Error('Token type is not defined');
    }

    if (tokenType === 'REFRESH' && !REFRESH_TOKEN_LIST.includes(token)) {
        return;
    }

    try {
        return jwt.verify(token, secret) as UserPayload;
    } catch (err) {
        // token is invalid, so returning `undefined`
    }
}