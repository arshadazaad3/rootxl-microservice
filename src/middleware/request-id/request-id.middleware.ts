import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { v4 } from 'uuid';

import { IRequestApp } from '../../common/request/interfaces/request.interface';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: IRequestApp, res: Response, next: NextFunction): void {
    const uuid: string = v4();
    req.headers['x-request-id'] = uuid;
    req.id = uuid;
    next();
  }
}
