/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable } from '@nestjs/common';

import { NullableType } from 'utils/types/nullable.type';
import { Session } from 'database/repositories/core/sessions/domain/session';
import { User } from 'database/repositories/core/users/domain/user';
import { InjectModel } from '@nestjs/mongoose';
import { SessionSchemaClass } from '../../database/repositories/core';
import { PrimaryConnection } from '../../database/connections';
import { Model } from 'mongoose';

@Injectable()
export class SessionService {
  // constructor(private readonly sessionRepository: SessionRepository) {}

  constructor(
    @InjectModel(SessionSchemaClass.name, PrimaryConnection)
    private readonly sessionModel: Model<SessionSchemaClass>
  ) {}

  findById(id: Session['_id']): Promise<NullableType<Session>> {
    // @ts-ignore
    return this.sessionRepository.findById(id);
  }

  create(data: Omit<Session, '_id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Session> {
    return this.sessionModel.create(data);
  }

  update(
    id: Session['_id'],
    payload: Partial<Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>
  ): Promise<Session | null> {
    // @ts-ignore
    return this.sessionRepository.update(id, payload);
  }

  deleteById(id: Session['_id']): Promise<void> {
    // @ts-ignore
    return this.sessionRepository.deleteById(id);
  }

  deleteByUserId(conditions: { userId: User['_id'] }): Promise<void> {
    // @ts-ignore
    return this.sessionRepository.deleteByUserId(conditions);
  }

  deleteByUserIdWithExclude(conditions: { userId: User['_id']; excludeSessionId: Session['_id'] }): Promise<void> {
    // @ts-ignore
    return this.sessionRepository.deleteByUserIdWithExclude(conditions);
  }
}
