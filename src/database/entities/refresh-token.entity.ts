import { DateTime } from 'luxon';
import { BaseEntity, Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'refresh_tokens' })
export class RefreshToken extends BaseEntity<RefreshToken, 'token'> {

    @PrimaryKey({ autoincrement: false })
    token!: string;

    @Property({ columnType: 'timestamp', defaultRaw: 'now()' })
    createdAt!: DateTime;

}