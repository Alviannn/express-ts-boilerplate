import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../configs/config';

import { StatusCodes } from 'http-status-codes';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { User } from '../database/entities/user.entity';
import { ResponseError } from '../utils/api.util';

import type { UserPayload, TokenType } from '../typings/auth';
import type { Request } from 'express';
import type { LoginType, RegisterType } from '../validations/user.validation';

class AuthService {

    async login({ email, password }: LoginType) {
        const foundUser = await User.findOneBy({ email });
        if (!foundUser) {
            throw new ResponseError(
                'Account is not registered!',
                StatusCodes.BAD_REQUEST);
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            foundUser.password);

        if (!isPasswordValid) {
            throw new ResponseError(
                'Incorrect password',
                StatusCodes.BAD_REQUEST);
        }

        const accessToken = await this.generateToken(foundUser, 'ACCESS');
        const refreshToken = await this.generateToken(foundUser, 'REFRESH');

        return { accessToken, refreshToken };
    }

    async register(rawUser: RegisterType) {
        const user = User.create({ ...rawUser });

        const foundUser = await User.findOneBy({ email: user.email });
        if (foundUser) {
            throw new ResponseError(
                'This email is already registered',
                StatusCodes.BAD_REQUEST);
        }

        user.password = await this.hashPassword(user.password);
        await User.save(user);
    }

    async logout(refreshToken: string) {
        const foundToken = await RefreshToken.findOneBy({
            token: refreshToken
        });

        await foundToken?.remove();
    }

    async hashPassword(password: string) {
        return bcrypt.hash(password, config.hashRounds);
    }

    async generateToken(
        user: User | UserPayload, tokenType: TokenType) {

        let tokenSecret: string;
        const signOption: jwt.SignOptions = { notBefore: config.jwt.notBefore };
        const payload: UserPayload = { id: user.id };

        if (tokenType === 'ACCESS') {
            tokenSecret = config.jwt.accessSecret;
            signOption.expiresIn = config.jwt.accessExpire;
        } else {
            tokenSecret = config.jwt.refreshSecret;
            signOption.expiresIn = config.jwt.refreshExpire;
        }

        const token = jwt.sign(payload, tokenSecret, signOption);
        if (tokenType === 'REFRESH') {
            const newToken = RefreshToken.create({ token });
            await newToken.save();
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
    getTokenFromHeader(req: Request) {
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
    async getPayloadFromHeader(
        req: Request, tokenType: TokenType = 'ACCESS') {

        const token = this.getTokenFromHeader(req);
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

        if (tokenType === 'REFRESH' && !RefreshToken.findOneBy({ token })) {
            return;
        }

        try {
            return jwt.verify(token, secret) as UserPayload;
        } catch (err) {
            // token is invalid, so returning `undefined` instead
        }
    }

}

export const authService = new AuthService();