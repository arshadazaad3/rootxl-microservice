import { Session } from 'database/repositories/core/sessions/domain/session';

export type JwtRefreshPayloadType = {
  sessionId: Session['_id'];
  hash: Session['hash'];
  iat: number;
  exp: number;
};
