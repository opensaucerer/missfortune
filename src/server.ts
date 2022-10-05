import * as http from 'http';
import * as log from './log';
import * as rest from './rest';
import * as config from './config';
config.loadEnv();
import * as router from './router/router';
import * as helper from './helper';

// server setup
const server = http.createServer(
  async (req: http.IncomingMessage, res: http.ServerResponse) => {
    // parse url
    req.path = helper.parseURL(req.url as string).path;
    req.query = helper.parseURL(req.url as string).query;

    // parse req body
    let data = await helper.readBody(req);
    req.body = data.body;
    req.raw = data.raw;

    // overload res object
    res = rest.overloadResponse(res);

    // handle routing
    router.handleRouting(req, res);
  }
);

let port = config.vars.port;
server.listen(port, () => {
  console.log(`The server is listening on http://localhost:${port}`);
});

// intercept the request and log it
server.on('request', (req: http.IncomingMessage, res: http.ServerResponse) => {
  // listen for response to be finished
  res.on('finish', () => {
    log.logger.requestLogger(req, res, () => {});
  });
});

// listen on error to server
server.on(
  'error',
  (err: Error, req: http.IncomingMessage, res: http.ServerResponse) => {
    // intercept the error and log it
    log.logger.errorLogger(err, () => {});
  }
);

// setup graceful shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received.');
  console.log('Closing http server.');
  server.close(() => {
    console.log('Http server closed.');
  });
});

process.on('SIGINT', () => {
  console.info('SIGINT signal received.');
  console.log('Closing http server.');
  server.close(() => {
    console.log('Http server closed.');
  });
});
