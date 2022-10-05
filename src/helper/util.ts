import { ParsedUrlQuery } from 'querystring';
import * as urlparse from 'url';
import * as http from 'http';
import { error } from '../types';

export function generateAvailablePort(): number {
  let port = 3333;
  // check if port is available
  const server = http.createServer();
  server.listen(port);
  server.on('error', (err: error) => {
    if (err.code === 'EADDRINUSE') {
      port++;
      server.listen(port);
    }
  });
  return port;
}

export function parseURL(url: string): {
  path: string;
  query: Record<string, string> | ParsedUrlQuery;
} {
  const parsedUrl = urlparse.parse(url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path?.replace(/^\/+|\/+$/g, '');
  return {
    path: trimmedPath || '/',
    query: parsedUrl.query,
  };
}

export function readBody(req: http.IncomingMessage): Promise<{
  body: Record<string, any>;
  raw: any;
}> {
  return new Promise((resolve, reject) => {
    let data = '';
    let body = {};
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        body = JSON.parse(data);
      } catch (error) {}
      resolve({
        body,
        raw: data,
      });
    });
  });
}

export function parsePathVariables(
  path: string,
  route: string
): Record<string, string> {
  let pathVariables = path.split('/');
  let routeVariables = route.split('/');
  let pathVariablesObject: Record<string, string> = {};
  if (routeVariables.length === pathVariables.length) {
    for (let i = 0; i < routeVariables.length; i++) {
      if (routeVariables[i].startsWith(':')) {
        pathVariablesObject[routeVariables[i].slice(1)] = pathVariables[i];
      }
    }
  }
  return pathVariablesObject;
}
