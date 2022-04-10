import { User } from '../database/entities/user.entity';
import { Errors } from '../utils/api.util';

class UserService {

    async get(id: number, filter: boolean) {
        const user = await User.findOneBy({ id });
        if (!user) {
            throw Errors.NO_SESSION;
        }

        if (filter) {
            return user.filter();
        }

        return user;
    }

}

export const userService = new UserService();