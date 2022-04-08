import validate from '../middlewares/validate.middleware';

import { Request, Response } from 'express';
import { Controller, Route } from '../decorators/express.decorator';
import { Todo } from '../entities/todo.entity';
import { sendResponse, ResponseError } from '../utils/api.util';
import { StatusCodes } from 'http-status-codes';
import {
    newTodoSchema,
    updateTodoSchema,
    todoIdSchema,

    NewTodoType,
    UpdateTodoType,
    TodoIdType
} from '../validations/todo.validations';

const TodoNotFoundError = new ResponseError(
    'Cannot find todo',
    StatusCodes.NOT_FOUND);

@Route({ path: 'todos' })
export class TodosRoute {

    @Controller('POST', '/add', validate(newTodoSchema))
    async add(req: Request, res: Response) {
        const { content } = req.body as NewTodoType;

        const todo = Todo.create({ content });
        await todo.save();

        return sendResponse(res, {
            message: 'Successfully added new todo',
            statusCode: StatusCodes.CREATED,
            data: {
                todoId: todo.id
            }
        });
    }

    @Controller(
        'PATCH', '/update/:todoId',
        validate(updateTodoSchema),
        validate(todoIdSchema, true)
    )
    async update(req: Request, res: Response) {
        const { content, isDone } = req.body as UpdateTodoType;
        const { todoId } = req.params as unknown as TodoIdType;
        const todo = await Todo.findOneBy({ id: todoId });

        if (!todo) {
            throw TodoNotFoundError;
        }

        todo.content = content ?? todo.content;
        todo.isDone = isDone ?? todo.isDone;

        await todo.save();
        return sendResponse(res, { message: 'Successfully updated todo' });
    }

    @Controller('DELETE', '/delete/:todoId', validate(todoIdSchema, true))
    async delete(req: Request, res: Response) {
        const { todoId } = req.params as unknown as TodoIdType;
        const todo = await Todo.findOneBy({ id: todoId });

        if (!todo) {
            throw TodoNotFoundError;
        }

        await todo.remove();
        return sendResponse(res, { message: 'Successfully deleted a todo' });
    }

    @Controller('GET', '/:todoId', validate(todoIdSchema, true))
    async getById(req: Request, res: Response) {
        const { todoId } = req.params as unknown as TodoIdType;
        const todo = await Todo.findOneBy({ id: todoId });

        if (!todo) {
            throw TodoNotFoundError;
        }

        return sendResponse(res, {
            message: 'Successfully found todo',
            data: { todo }
        });
    }

    @Controller('GET', '/')
    async getAll(_: Request, res: Response) {
        const todos = await Todo.find();

        return sendResponse(res, {
            message: 'Successfully found todos',
            data: { todos }
        });
    }

}