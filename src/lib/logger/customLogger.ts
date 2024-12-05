import * as winston from 'winston';

export default class CustomLogger {
  myFormat: winston.Logform.Format | null = null;
  createLoggerConfig: winston.LoggerOptions | null = null;

  constructor() {
    /**
     * Custom log format tailored to our application's requirements
     */
    this.myFormat = winston.format.printf(({ level = 'info', message, timestamp, req, err, ...metadata }: any) => {
      if (!req) {
        req = { headers: {} };
      }
      let colors: any = null;

      const { context } = metadata;
      let updatedLevel = level;

      if (level.length > 5) {
        try {
          const extractedColors = this.extractColorAndLevel(level);
          if (extractedColors) {
            const { leftColor, level: extractedLevel, rightColor } = extractedColors;
            updatedLevel = `${leftColor}${extractedLevel.toUpperCase()}${rightColor}`;
            if (leftColor && rightColor) {
              colors = { leftColor, rightColor };
            }
          }
        } catch (e) {
          console.warn(e);
        }
      } else {
        try {
          const colorCode = this.getNestJsLogColor(level);
          updatedLevel = `${colorCode}${level.toUpperCase()}${colorCode}`;
          colors = { leftColor: colorCode, rightColor: colorCode };
        } catch (e) {
          console.warn(e);
        }
      }

      let msg = `${timestamp ? `${timestamp} ` : ''}[${updatedLevel}] [${context}] : ${message} `;

      if (colors) {
        const YELLOW = '\u001b[33m'; // ANSI yellow color
        const RESET = '\u001b[0m'; // Reset color

        // Add yellow color to the context
        const coloredContext = context ? `${YELLOW}${context}${RESET}` : 'APP';

        const { leftColor, rightColor } = colors;
        msg = `${timestamp ? `${timestamp} ` : ''}${updatedLevel} [${coloredContext}] : ${leftColor}${message}${rightColor} `;
      }

      const json: any = {
        timestamp,
        level,
        ...metadata,
        message,
        error: {}
      };

      if (err) {
        json.error = err.stack || err;
      }

      return msg;
    });

    // Include timestamp only if not in production
    const formats = [
      winston.format.colorize(),
      winston.format.splat(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ];

    if (process.env.NODE_ENV !== 'production') {
      formats.push(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        })
      );
    }

    formats.push(this.myFormat);

    this.createLoggerConfig = {
      level: 'debug', // Set the default logging level to debug
      format: winston.format.combine(...formats),
      transports: [new winston.transports.Console({ level: 'debug' })]
    };
  }

  extractColorAndLevel(input: string) {
    const regex = /^(\u001b\[\d+m)(\w+)(\u001b\[\d+m)$/;
    const match = input.match(regex);

    if (match) {
      const [, leftColor, level, rightColor] = match;
      return { leftColor, level, rightColor };
    }

    return null;
  }

  getNestJsLogColor(level: string): string {
    let colorCode: string;

    switch (level.toLowerCase()) {
      case 'log':
      case 'info':
        colorCode = '\u001b[32m'; // Green
        break;
      case 'warn':
        colorCode = '\u001b[33m'; // Yellow
        break;
      case 'error':
        colorCode = '\u001b[31m'; // Red
        break;
      case 'debug':
        colorCode = '\u001b[34m'; // Blue
        break;
      case 'verbose':
        colorCode = '\u001b[35m'; // Magenta
        break;
      default:
        colorCode = '\u001b[37m'; // Default (White)
        break;
    }

    return colorCode;
  }
}
