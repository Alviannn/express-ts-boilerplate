import { StatusCodes } from 'http-status-codes';
import { DateTime } from 'luxon';
import { Todo } from '../database/entities/todo.entity';
import { ResponseError } from '../utils/api.util';

const TodoNotFoundError = new ResponseError(
    'Cannot find todo',
    StatusCodes.NOT_FOUND);

class TodoService {

    async add(content: string) {
        const todo = Todo.create({ content });
        await todo.save();

        return todo.id;
    }

    async update(id: number, content?: string, isDone?: boolean) {
        const todo = await Todo.findOneBy({ id });

        if (!todo) {
            throw TodoNotFoundError;
        }

        todo.content = content ?? todo.content;
        todo.isDone = isDone ?? todo.isDone;
        todo.updatedAt = DateTime.utc();

        await todo.save();
    }

    async delete(id: number) {
        const todo = await Todo.findOneBy({ id });

        if (!todo) {
            throw TodoNotFoundError;
        }

        await todo.remove();
    }

    async get(id: number) {
        const todo = await Todo.findOneBy({ id });

        if (!todo) {
            throw TodoNotFoundError;
        }

        return todo;
    }

}

export const todoService = new TodoService();