import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import responseTime from 'response-time';

@Injectable()
export class ResponseTimeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    responseTime()(req, res, next);
  }
}
