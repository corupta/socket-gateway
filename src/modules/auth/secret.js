const crypto = require("crypto");

const get = (name) => {
  const hmac = crypto.Hmac('sha256', process.env.SECRET);
  hmac.update(name);
  return hmac.digest("hex");
};

const validate = (name, secret) => {
  try {
    const otherSecret = get(name);
    return secret === otherSecret;
  } catch (e) {
    console.warn("err in validation", e);
    return false;
  }
};

export default { get, validate }
export { get, validate }
