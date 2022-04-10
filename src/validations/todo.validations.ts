import joi from 'joi';

export type NewTodoType = {
    content: string
}

export type UpdateTodoType = {
    content?: string,
    isDone?: boolean
}

export type TodoIdType = {
    todoId: number
}

export const newTodoSchema = joi.object<NewTodoType>({
    content: joi.string()
        .min(5)
        .max(512)
        .required()
});

export const updateTodoSchema = joi.object<UpdateTodoType>({
    content: joi.string()
        .min(5)
        .max(512),
    isDone: joi.boolean()
});

export const todoIdSchema = joi.object<TodoIdType>({
    todoId: joi.number()
        .min(0)
        .required()
});