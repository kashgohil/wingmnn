import { CONSTANTS } from "@auth/constants";
import { Context } from "hono";
import { deleteCookie } from "hono/cookie";

export function clearAuthCookies(c: Context) {
  deleteCookie(c, CONSTANTS.AUTHENTICATED);
  deleteCookie(c, CONSTANTS.ACCESS_TOKEN_COOKIE);
  deleteCookie(c, CONSTANTS.REFRESH_TOKEN_COOKIE);
}
