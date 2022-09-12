import { createCookie } from "@vs-org/cookie";

const getDate = (daysAfter: number) => {
  if (daysAfter) {
    return new Date(Date.now() + daysAfter * 24 * 60 * 60 * 1000);
  }
  return new Date();
};

const getRemoveCookieHeaderValue = (cookieName: string) =>
  createCookie({
    name: cookieName,
    value: "",
    "Max-Age": 0
  });

export { getDate, getRemoveCookieHeaderValue };
