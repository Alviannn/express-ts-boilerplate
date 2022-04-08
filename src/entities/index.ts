import { DateTime } from 'luxon';
import { ValueTransformer } from 'typeorm';

export const dateTransformer: ValueTransformer = {
    from: (value: Date) => DateTime.fromJSDate(value),
    to: (value: DateTime) => value.toJSDate()
};