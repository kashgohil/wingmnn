import { uuid } from "@wingmnn/utils";

export const Cookie = (function () {
  function get(name: string) {
    return document.cookie.split(";").reduce((acc, item) => {
      const [key, value] = item.split("=");
      return key.trim() === name ? decodeURIComponent(value) : acc;
    }, "");
  }

  function remove(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  function set(
    name: string,
    value: string,
    options: { expires?: Date; path?: string } = {
      expires: undefined,
      path: "/",
    },
  ) {
    let cookie = `${name}=${encodeURIComponent(value)}`;
    if (options.expires) {
      cookie += `; expires=${options.expires.toUTCString()}`;
    }
    if (options.path) {
      cookie += `; path=${options.path}`;
    }
    document.cookie = cookie;
  }

  function setCSRFCookie() {
    Cookie.set("csrf_token", uuid(), {
      expires: undefined,
      path: "/",
    });
  }

  return { get, remove, set, setCSRFCookie };
})();
