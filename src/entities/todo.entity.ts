import { DateTime } from 'luxon';
import {
    BaseEntity, Entity,
    Column, PrimaryGeneratedColumn, ValueTransformer,
} from 'typeorm';

const dateTransformer: ValueTransformer = {
    from: (value: Date) => DateTime.fromJSDate(value),
    to: (value: DateTime) => value.toJSDate()
};

@Entity('todos')
export class Todo extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 512 })
    content!: string;

    @Column({
        name: 'created_at',
        type: 'timestamp',
        default: DateTime.now(),
        transformer: dateTransformer
    })
    createdAt!: DateTime;

    @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
    updatedAt?: DateTime;

    @Column({ name: 'is_done', default: false })
    isDone!: boolean;

}