import { Gateway } from "./modules";

const gateway = new Gateway({
  baseUrl: process.env.BASE_URL
});

export default gateway;
