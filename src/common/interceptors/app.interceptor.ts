import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, url } = request;
    const userAgent = request.get('user-agent') || '';

    // this.logger.log(`START: ${method} ${url} - ${userAgent} ${ip}`);
    this.logger.log(`ON: ${method} | ${url} | ${ip}`);

    response.on('close', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      // this.logger.log(`CLOSE: ${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip}`);
      this.logger.log(`CLOSE: ${method} ${url} = ${statusCode} | ${ip}`);
    });

    next();
  }
}
