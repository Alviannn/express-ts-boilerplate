import { validate } from '../middlewares/validate.middleware';
import { Request, Response } from 'express';
import { Controller, Route } from '../decorators/express.decorator';
import { Todo } from '../database/entities/todo.entity';
import { sendResponse } from '../utils/api.util';
import { StatusCodes } from 'http-status-codes';
import { todoService } from '../services/todo.service';
import {
    newTodoSchema,
    updateTodoSchema,
    todoIdSchema
} from '../validations/todo.validation';

import type {
    NewTodoType,
    UpdateTodoType,
    TodoIdType
} from '../validations/todo.validation';

@Route({ path: 'todos' })
export class TodosRoute {

    @Controller('POST', '/add', validate(newTodoSchema))
    async add(req: Request, res: Response) {
        const { content } = req.body as NewTodoType;
        const todoId = await todoService.add(content);

        return sendResponse(res, {
            message: 'Successfully added new todo',
            statusCode: StatusCodes.CREATED,
            data: { todoId }
        });
    }

    @Controller(
        'PATCH', '/update/:todoId',
        validate(updateTodoSchema),
        validate(todoIdSchema, 'PARAMS')
    )
    async update(req: Request, res: Response) {
        const { content, isDone } = req.body as UpdateTodoType;
        const { todoId } = req.params as unknown as TodoIdType;

        await todoService.update(todoId, content, isDone);

        return sendResponse(res, { message: 'Successfully updated todo' });
    }

    @Controller('DELETE', '/delete/:todoId', validate(todoIdSchema, 'PARAMS'))
    async delete(req: Request, res: Response) {
        const { todoId } = req.params as unknown as TodoIdType;
        await todoService.delete(todoId);

        return sendResponse(res, { message: 'Successfully deleted a todo' });
    }

    @Controller('GET', '/:todoId', validate(todoIdSchema, 'PARAMS'))
    async getById(req: Request, res: Response) {
        const { todoId } = req.params as unknown as TodoIdType;
        const todo = await todoService.get(todoId);

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