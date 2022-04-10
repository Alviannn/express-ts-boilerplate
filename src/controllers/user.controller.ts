import authenticate from '../middlewares/authenticate.middleware';

import { Request, Response } from 'express';
import { Controller, Route } from '../decorators/express.decorator';
import { sendResponse } from '../utils/api.util';
import { getPayloadFromHeader } from '../utils/auth.util';
import { userService } from '../services/user.service';

@Route({ path: 'users' })
export class UserRoute {

    @Controller('GET', '/profile', authenticate())
    async profile(req: Request, res: Response) {
        const payload = await getPayloadFromHeader(req);
        const filteredUser = await userService.get(payload!.id, true);

        return sendResponse(res, {
            message: 'Successfully found user data',
            data: {
                user: filteredUser
            }
        });
    }

}