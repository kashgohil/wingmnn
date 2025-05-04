interface HttpServiceConfig {
  baseUrl: string;
  requestInterceptor?: (request: Request) => Request;
  responseInterceptor?: <T>(response: Response) => Promise<T>;
}

export function httpService(config: HttpServiceConfig) {
  // private
  const {
    baseUrl,
    requestInterceptor = (request: Request) => request,
    responseInterceptor = <T>(response: Response) =>
      response.json() as Promise<T>,
  } = config;
  const _baseUrl: string = baseUrl.startsWith("/") ? baseUrl : `/${baseUrl}`;

  // Helper function to parse response headers
  function _parseHeaders(headerStr: string): Headers {
    const headers = new Headers();
    const headerPairs = headerStr.trim().split("\r\n");

    headerPairs.forEach((headerPair) => {
      const index = headerPair.indexOf(": ");
      if (index > 0) {
        const key = headerPair.substring(0, index);
        const val = headerPair.substring(index + 2);
        headers.append(key, val);
      }
    });

    return headers;
  }

  function _url(url: string): string {
    const updatedBaseUrl = _baseUrl.endsWith("/")
      ? _baseUrl.slice(0, _baseUrl.length - 1)
      : _baseUrl;
    const updatedUrl = url.startsWith("/") ? url.slice(1) : url;
    return `${updatedBaseUrl}/${updatedUrl}`;
  }

  async function _fetch<T>(url: string, options: RequestInit): Promise<T> {
    const request = requestInterceptor(new Request(_url(url), options));
    const response = await fetch(request);
    return responseInterceptor<T>(response);
  }

  async function _xmlHttpRequest<T>(
    url: string,
    options: RequestInit & { timeout?: number },
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      const request = requestInterceptor(new Request(_url(url), options));

      // Set up the request
      const method = request.method || "GET";
      xhr.open(method, _url(url), true);

      // Add headers
      if (request.headers) {
        const headers = request.headers;
        Object.keys(headers).forEach((key) => {
          xhr.setRequestHeader(key, headers.get(key)!);
        });
      }

      // Handle response
      xhr.onload = () => {
        const response = new Response(xhr.response, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: _parseHeaders(xhr.getAllResponseHeaders()),
        });

        responseInterceptor<T>(response).then(resolve).catch(reject);
      };

      // Handle errors
      xhr.onerror = () => {
        reject(new TypeError("Network request failed"));
      };

      xhr.ontimeout = () => {
        reject(new TypeError("Network request timed out"));
      };

      xhr.onabort = () => {
        reject(new DOMException("Request aborted", "AbortError"));
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

  async function _request<T>(url: string, options: RequestInit): Promise<T> {
    // @ts-expect-error fetch can be undefined for older browsers
    if (window.fetch) {
      return _fetch<T>(url, options);
    } else {
      return _xmlHttpRequest<T>(url, options);
    }
  }

  // public
  function get<T>(url: string, options: RequestInit = {}): Promise<T> {
    return _request<T>(url, { ...options, method: "GET" });
  }

  function post<T>(
    url: string,
    body: TSAny,
    options: RequestInit = {},
  ): Promise<T> {
    return _request<T>(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  function put<T>(
    url: string,
    body: TSAny,
    options: RequestInit = {},
  ): Promise<T> {
    return _request<T>(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  function patch<T>(
    url: string,
    body: TSAny,
    options: RequestInit = {},
  ): Promise<T> {
    return _request<T>(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  function del<T>(url: string, options: RequestInit = {}): Promise<T> {
    return _request<T>(url, { ...options, method: "DELETE" });
  }

  function head<T>(url: string, options: RequestInit = {}): Promise<T> {
    return _request<T>(url, { ...options, method: "HEAD" });
  }

  function options<T>(url: string, options: RequestInit = {}): Promise<T> {
    return _request<T>(url, { ...options, method: "OPTIONS" });
  }

  function trace<T>(url: string, options: RequestInit = {}): Promise<T> {
    return _request<T>(url, { ...options, method: "TRACE" });
  }

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    head,
    options,
    trace,
  };
}
