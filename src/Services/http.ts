import { apiBase } from '../AppSettings';

export interface HttpRequest<TRequest> {
  path: string;
  method?: string;
  body?: TRequest;
  token?: string;
}

export interface HttpResponse<TResponse> {
  ok: boolean;
  code?: number;
  body?: TResponse;
}

export async function http<TResponse, TRequest = undefined>(
  req: HttpRequest<TRequest>,
  failFunction:
    | ((request: Request, response: Response) => void)
    | undefined = undefined,
  successFunction: ((response: TResponse) => void) | undefined = undefined,
): Promise<HttpResponse<TResponse>> {
  const request = new Request(`${apiBase}${req.path}`, {
    method: req.method || 'get',
    headers: {
      'Content-Type': 'application/json',
    },
    body: req.body ? JSON.stringify(req.body) : undefined,
  });
  if (req.token) {
    request.headers.set('authorization', `bearer ${req.token}`);
  }
  const response = await fetch(request);
  const json = await response.text();
  let body;
  if (json) {
    body = JSON.parse(json);
  } else {
    body = '';
  }
  if (response.ok) {
    if (successFunction) {
      successFunction(body);
    }
    return { ok: response.ok, code: response.status, body };
  }
  if (failFunction) {
    failFunction(request, response);
  }
  logError(request, body);
  return { ok: response.ok, code: response.status, body };
}

function logError(request: Request, body: any) {
  console.error(`Error requesting ${request.method} ${request.url}`, body);
}
