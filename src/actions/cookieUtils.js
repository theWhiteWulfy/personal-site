import { serialize, parse } from "cookie";

const TOKEN_NAME = "accesstoken";
const MAX_AGE = 60 * 60 * 24; // 8 hours

export function setCookie(name, value) {
  var exdate = new Date().getTime() + 1000 * 60 * 60 * 24 * 7 * 52;
  var date_cookie = new Date(exdate).toUTCString();
  let expires = "; expires=" + date_cookie;
  document.cookie =
    name + "=" + (value || "") + expires + "; path=/ ; sameSite=lax";
}

export function eraseCookie(name) {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}
export function parseCookies(req) {
  // For API Routes we don't need to parse the cookies.
  if (req.cookies) return req.cookies;

  // For pages we do need to parse the cookies.
  const cookie = req.headers?.cookie;
  return parse(cookie || "");
}

export function getTokenCookie(req) {
  const cookies = parseCookies(req);
  return cookies[TOKEN_NAME];
}

export function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
