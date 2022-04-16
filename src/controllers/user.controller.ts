import authenticate from '../middlewares/authenticate.middleware';

import { Request, Response } from 'express';
import { Controller, Route } from '../decorators/express.decorator';
import { sendResponse } from '../utils/api.util';
import { userService } from '../services/user.service';
import { authService } from '../services/auth.service';

@Route({ path: 'users' })
export class UserRoute {

    @Controller('GET', '/profile', authenticate())
    async profile(req: Request, res: Response) {
        const payload = await authService.getPayloadFromHeader(req);
        const user = await userService.get(payload!.id);

        return sendResponse(res, {
            message: 'Successfully found user data',
            data: { user }
        });
    }

}