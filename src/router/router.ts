import * as http from 'http';
import { parsePathVariables } from '../helper/util';

let methods = ['get', 'post', 'put', 'delete', 'patch'];

let routesTable: Record<
  string,
  Record<string, (req: http.IncomingMessage, res: http.ServerResponse) => void>
> = {};

export function getRouteFunction(
  path: string,
  method: string
):
  | {
      fn: (req: http.IncomingMessage, res: http.ServerResponse) => void;
      route: string;
    }
  | undefined {
  // remove preceding and trailing slashes
  path = path.replace(/^\/+|\/+$/g, '');
  if (
    routesTable[path || '/'] &&
    routesTable[path || '/'][method.toLowerCase()]
  ) {
    return {
      fn: routesTable[path || '/'][method.toLowerCase()],
      route: path,
    };
  }

  // handle path variables
  let pathVariables = path.split('/');
  for (let route in routesTable) {
    let routeVariables = route.split('/');
    if (
      routeVariables.length === pathVariables.length &&
      method.toLowerCase() in routesTable[route]
    ) {
      let match = true;
      for (let i = 0; i < routeVariables.length; i++) {
        if (
          !routeVariables[i].startsWith(':') &&
          routeVariables[i] !== pathVariables[i]
        ) {
          match = false;
          break;
        }
      }
      if (match) {
        return {
          fn: routesTable[route][method.toLowerCase()],
          route,
        };
      }
    }
  }

  return undefined;
}

export function getRoute(
  path: string
): Record<
  string,
  (req: http.IncomingMessage, res: http.ServerResponse) => void
> {
  // remove preceding and trailing slashes
  path = path.replace(/^\/+|\/+$/g, '');
  if (routesTable[path || '/']) {
    return routesTable[path || '/'];
  }

  // handle path variables
  let pathVariables = path.split('/');
  for (let route in routesTable) {
    let routeVariables = route.split('/');
    if (routeVariables.length === pathVariables.length) {
      let match = true;
      for (let i = 0; i < routeVariables.length; i++) {
        if (
          !routeVariables[i].startsWith(':') &&
          routeVariables[i] !== pathVariables[i]
        ) {
          match = false;
          break;
        }
      }
      if (match) {
        return routesTable[route];
      }
    }
  }
  return routesTable['']; // return empty route
}

export function handleRouting(
  req: http.IncomingMessage,
  res: http.ServerResponse
): void {
  let router = getRouteFunction(req.path, req.method as string);
  if (router) {
    req.params = parsePathVariables(req.path, router.route);
    router.fn(req, res);
  } else if (getRoute(req.path)) {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.write(
      JSON.stringify({
        message: `Method ${req.method} not allowed for path /${req.path}`,
      })
    );
    res.end();
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.write(
      JSON.stringify({
        message: `Path /${req.path} not found`,
      })
    );
    res.end();
  }
}

export function registerRoute(
  path: string,
  method: string,
  routeFunction: (req: http.IncomingMessage, res: http.ServerResponse) => void
): void {
  // remove preceding and trailing slashes
  path = path.replace(/^\/+|\/+$/g, '');
  // add path to routes table
  if (!routesTable[path || '/']) {
    routesTable[path || '/'] = {};
  }
  routesTable[path || '/'][method.toLowerCase()] = routeFunction;
}

export default {
  get: (
    path: string,
    callback: (req: http.IncomingMessage, res: http.ServerResponse) => void
  ): void => {
    registerRoute(path, methods[0], callback);
  },
  post: (
    path: string,
    callback: (req: http.IncomingMessage, res: http.ServerResponse) => void
  ): void => {
    registerRoute(path, methods[1], callback);
  },
  put: (
    path: string,
    callback: (req: http.IncomingMessage, res: http.ServerResponse) => void
  ): void => {
    registerRoute(path, methods[2], callback);
  },
  delete: (
    path: string,
    callback: (req: http.IncomingMessage, res: http.ServerResponse) => void
  ): void => {
    registerRoute(path, methods[3], callback);
  },
};
