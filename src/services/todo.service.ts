import { StatusCodes } from 'http-status-codes';
import { DateTime } from 'luxon';
import { ResponseError } from '../utils/api.util';
import { Todo } from '../database/entities/todo.entity';
import { User } from '../database/entities/user.entity';
import { orm } from '../server';

const TodoNotFoundError = new ResponseError(
    'Cannot find todo',
    StatusCodes.NOT_FOUND);

class TodoService {

    private readonly em = orm.em.fork();
    private readonly todoRepo = this.em.getRepository(Todo);
    private readonly userRepo = this.em.getRepository(User);

    async add(userId: number, content: string) {
        const user = await this.userRepo.findOneOrFail(userId);
        const todo = new Todo();

        this.todoRepo.assign(todo, { content, user });
        await this.todoRepo.persistAndFlush(todo);

        return todo.id;
    }

    async update(
        userId: number, todoId: number,
        content?: string, isDone?: boolean) {

        const todo = await this.todoRepo.findOne(
            {
                id: todoId,
                user: { id: userId }
            },
            { populate: true }
        );

        if (!todo) {
            throw TodoNotFoundError;
        }

        todo.content = content ?? todo.content;
        todo.isDone = isDone ?? todo.isDone;
        todo.updatedAt = DateTime.utc();

        await this.todoRepo.persistAndFlush(todo);
    }

    async delete(userId: number, todoId: number) {
        const todo = await this.todoRepo.findOne(
            {
                id: todoId,
                user: { id: userId }
            },
            { populate: true }
        );

        if (!todo) {
            throw TodoNotFoundError;
        }

        await this.todoRepo.removeAndFlush(todo);
    }

    async get(userId: number, todoId: number) {
        const todo = await this.todoRepo.findOne(
            {
                id: todoId,
                user: { id: userId }
            },
            { populate: true }
        );


        if (!todo) {
            throw TodoNotFoundError;
        }

        return todo;
    }

    async getAll(userId: number) {
        const todoList = await this.todoRepo.find(
            { user: { id: userId } },
            { populate: true }
        );

        return todoList;
    }

}

export const todoService = new TodoService();