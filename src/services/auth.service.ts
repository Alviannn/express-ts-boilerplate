import bcrypt from 'bcrypt';

import { StatusCodes } from 'http-status-codes';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { User } from '../database/entities/user.entity';
import { ResponseError } from '../utils/api.util';
import { generateToken, hashPassword } from '../utils/auth.util';
import { LoginType, RegisterType } from '../validations/user.validation';

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

        return {
            accessToken: await generateToken(foundUser, 'ACCESS'),
            refreshToken: await generateToken(foundUser, 'REFRESH')
        };
    }

    async register(rawUser: RegisterType) {
        const user = User.create({ ...rawUser });

        const foundUser = await User.findOneBy({ email: user.email });
        if (foundUser) {
            throw new ResponseError(
                'This email is already registered',
                StatusCodes.BAD_REQUEST);
        }

        user.password = await hashPassword(user.password);
        await User.save(user);
    }

    async logout(refreshToken: string) {
        const foundToken = await RefreshToken.findOneBy({
            token: refreshToken
        });

        await foundToken?.remove();
    }

}

export const authService = new AuthService();