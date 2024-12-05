import { User } from 'database/repositories/core/users/domain/user';
import { Session } from 'database/repositories/core/sessions/domain/session';

export type JwtPayloadType = Pick<User, '_id'> & {
  sessionId: Session['_id'];
  iat: number;
  exp: number;
};
