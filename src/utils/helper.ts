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

/**
 * This helper function will return first key with value
 * @param obj - Object
 * @param value - value to find
 * @returns {string | undefined}
 */
const getObjectKeyFromValue = (obj: { [key: string]: any }, value: any) => {
  const objKeysArr = Object.keys(obj);
  if (!objKeysArr.length) {
    return;
  }
  return objKeysArr.find(objKey => obj[objKey] === value);
};

export { getDate, getRemoveCookieHeaderValue, getObjectKeyFromValue };
