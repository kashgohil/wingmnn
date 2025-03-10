
export function http({ baseUrl = ''}: { baseUrl: string }) {
  // private
  const _baseUrl: string = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`;
  let _requestInterceptor = (request: Request) => request ;
  let _responseInterceptor = (response: Response) => response;

  // Helper function to parse response headers
  function _parseHeaders(headerStr: string): Headers {
    const headers = new Headers();
    const headerPairs = headerStr.trim().split('\r\n');

    headerPairs.forEach(headerPair => {
      const index = headerPair.indexOf(': ');
      if (index > 0) {
        const key = headerPair.substring(0, index);
        const val = headerPair.substring(index + 2);
        headers.append(key, val);
      }
    });

    return headers;
  }

  function _url(url: string): string {
    const updatedBaseUrl = url.endsWith('/') ? _baseUrl.slice(0, _baseUrl.length - 1) : _baseUrl;
    const updatedUrl = url.startsWith('/') ? url.slice(1) : url;
    return `${updatedBaseUrl}/${updatedUrl}`;
  }

  async function _fetch(url: string, options: RequestInit): Promise<Response> {
    const request = _requestInterceptor(new Request(_url(url), options));
    return fetch(request).then(_responseInterceptor);
  }

  async function _xmlHttpRequest(url: string, options: RequestInit & {timeout?: number}): Promise<Response> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Set up the request
      const method = options.method || 'GET';
      xhr.open(method, _url(url), true);

      // Add headers
      if (options.headers) {
        const headers = options.headers as Record<string, string>;
        Object.keys(headers).forEach(key => {
          xhr.setRequestHeader(key, headers[key]);
        });
      }

      // Handle response
      xhr.onload = () => {
        const response = new Response(xhr.response, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: _parseHeaders(xhr.getAllResponseHeaders())
        });

        resolve(_responseInterceptor(response));
      };

      // Handle errors
      xhr.onerror = () => {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = () => {
        reject(new TypeError('Network request timed out'));
      };

      xhr.onabort = () => {
        reject(new DOMException('Request aborted', 'AbortError'));
      };

      if (options.timeout) {
        xhr.timeout = options.timeout;
      }

      // Send the request with body if provided
      if (options.body) {
        xhr.send(options.body as TSAny);
      } else {
        xhr.send();
      }
    });
  }

  async function _request(url: string, options: RequestInit): Promise<Response> {
    // @ts-expect-error fetch can be undefined for older browsers
    if (window.fetch) {
      return _fetch(url, options)
    } else {
      return _xmlHttpRequest(url, options)
    }
  }

  // public
  function requestInterceptor(interceptor: (request: Request) => Request): void {
    _requestInterceptor = interceptor;
  }

  function responseInterceptor(interceptor: (response: Response) => Response): void {
    _responseInterceptor = interceptor;
  }

  function get(url: string, options: RequestInit = {}): Promise<Response> {
    return _request(url, { ...options, method: "GET" });
  }

  function post(url: string, body: TSAny, options: RequestInit = {}): Promise<Response> {
    return _request(url, { ...options, method: "POST", body: JSON.stringify(body) });
  }

  function put(url: string, body: TSAny, options: RequestInit = {}): Promise<Response> {
    return _request(url, { ...options, method: "PUT", body: JSON.stringify(body) });
  }

  function patch(url: string, body: TSAny, options: RequestInit = {}): Promise<Response> {
    return _request(url, { ...options, method: "PATCH", body: JSON.stringify(body) });
  }

  function del(url: string, options: RequestInit = {}): Promise<Response> {
    return _request(url, { ...options, method: "DELETE" });
  }

  function head(url: string, options: RequestInit = {}): Promise<Response> {
    return _request(url, { ...options, method: "HEAD" });
  }

  function options(url: string, options: RequestInit = {}): Promise<Response> {
    return _request(url, { ...options, method: "OPTIONS" });
  }

  function trace(url: string, options: RequestInit = {}): Promise<Response> {
    return _request(url, { ...options, method: "TRACE" });
  }

  return {
    requestInterceptor,
    responseInterceptor,

    get,
    post,
    put,
    patch,
    del,
    head,
    options,
    trace
  };
}
