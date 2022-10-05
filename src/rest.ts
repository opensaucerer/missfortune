import * as http from 'http';

function overloadResponse(res: http.ServerResponse): http.ServerResponse {
  res.status = function (statusCode: number): {
    json: (data: any) => void;
  } {
    return {
      json: function (data: any): void {
        res.writeHead(statusCode || 200, {
          'Content-Type': 'application/json',
        });
        res.write(JSON.stringify(data));
        res.end();
      },
    };
  };
  return res;
}

export { overloadResponse };
