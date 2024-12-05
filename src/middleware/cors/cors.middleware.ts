import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import { ConfigService } from '@nestjs/config';

@Injectable()
/**
 * Middleware to handle Cross-Origin Resource Sharing (CORS) settings dynamically
 * based on environment and configuration.
 */
export class CorsMiddleware implements NestMiddleware {
  /**
   * Injects the `ConfigService` to retrieve configuration values for CORS.
   *
   * @param configService - NestJS ConfigService used to access environment-specific configuration values
   */
  constructor(private readonly configService: ConfigService) {}

  /**
   * Method that sets up and applies CORS middleware.
   *
   * @param req - The incoming HTTP request object
   * @param res - The outgoing HTTP response object
   * @param next - The next middleware function in the request-response cycle
   */
  use(req: Request, res: Response, next: NextFunction): void {
    // Retrieve the environment (e.g., 'production', 'development') from configuration
    const env = this.configService.get<string>('app.env', { infer: true });

    // Set allowed origins based on environment (in production, use configured value; otherwise, allow all origins)
    const allowOrigin =
      env === 'production'
        ? this.configService.get<string | boolean | string[]>('middleware.cors.allowOrigin', { infer: true })
        : '*';

    // Retrieve allowed HTTP methods for CORS from configuration
    const allowMethod = this.configService.get<string[]>('middleware.cors.allowMethod', { infer: true });

    // Retrieve allowed headers for CORS from configuration
    const allowHeader = this.configService.get<string[]>('middleware.cors.allowHeader', { infer: true });

    // Configure the CORS options dynamically using the retrieved configuration values
    const corsOptions: CorsOptions = {
      origin: allowOrigin, // Define the allowed origins for CORS
      methods: allowMethod, // Define the allowed HTTP methods for CORS
      allowedHeaders: allowHeader, // Define the allowed headers for CORS
      preflightContinue: false, // Disable preflight requests continuation
      credentials: true, // Allow credentials (cookies, authorization headers) for CORS
      optionsSuccessStatus: HttpStatus.NO_CONTENT // Return HTTP 204 status for successful CORS preflight requests
    };

    // Apply the CORS middleware with the configured options
    cors(corsOptions)(req, res, next);
  }
}
