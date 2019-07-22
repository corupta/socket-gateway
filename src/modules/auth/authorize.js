import Secret from "./secret";

const authorize = (serviceName, serviceFunction) => {
  const realSecret = Secret.get(serviceName);
  return (body = {}) => {
    const {secret = '', ...rest } = body;
    if (secret === realSecret) {
      return serviceFunction(rest);
    } else {
      console.warn(secret, realSecret);
      throw new Error("Authentication failed ! Please provide valid secret !")
    }
  }
};

export default authorize;
