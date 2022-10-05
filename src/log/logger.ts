// create an http logger middleware

import * as http from 'http';

export let logger = {
  requestLogger: (
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: () => void
  ): void => {
    let msg = `${new Date().toISOString()}: ${
      req.headers['user-agent']
    } - HTTP/${req.httpVersion}: ${req.method} - ${req.url} - ${
      res.statusCode
    } - ${res.statusMessage}`;
    logger.logWithColor(msg, logger.getColorForStatusCode(res.statusCode));

    // audit logs using next function - queue to the next service
    next();
  },

  errorLogger: (err: Error, next: () => void): void => {
    logger.logWithColor(
      `${new Date().toISOString()}: ERROR OCCURED WITH TRACE: `,
      'warn'
    );
    logger.logWithColor(err.stack as string, 'error');

    // audit logs using next function - queue to the next service
    next();
  },

  logWithColor: (message: string, color: string): void => {
    let colors: Record<string, string> = {
      warn: '\x1b[33m',
      error: '\x1b[31m',
      info: '\x1b[32m',
      debug: '\x1b[34m',
    };
    console.log(colors[color] + message + '\x1b[0m');
  },

  getColorForStatusCode: (statusCode: number): string => {
    let color = 'info';
    if (statusCode >= 500) {
      color = 'error';
    }
    if (statusCode >= 400) {
      color = 'warn';
    }
    if (statusCode >= 300) {
      color = 'debug';
    }
    return color;
  },
};
