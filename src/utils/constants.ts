import random from "@vs-org/random";
import randomConstants from "@vs-org/random/lib/utils/constants";

const GENERAL = {
  cookieName: "vs-sess",
  sessionExpiry: 30 * 24 * 60 * 60,
  setCookieHeader: "Set-Cookie",
  randomCharSet: `${randomConstants.LOWERCASE_ALPHABETE}${randomConstants.UPPERCASE_ALPHABET}${randomConstants.NUMBERS}/_.`,
  sessionDocument: (() => {
    return { key: "", expiry: new Date(), sessionContext: {} };
  })()
};

const DEFAULTS = {
  ...GENERAL,
  sessionId: (() => {
    return random({
      length: 32,
      charset: GENERAL.randomCharSet
    });
  })()
};

export { DEFAULTS };
