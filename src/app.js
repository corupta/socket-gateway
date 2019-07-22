import Koa from "koa";
import Logger from "koa-logger";
import Cors from "@koa/cors";
import BodyParser from "koa-bodyparser";
import Helmet from "koa-helmet";
import respond from "koa-respond";
import Websockify from "koa-websocket";
import { Socket } from "./modules";
import gateway from "./gateway";

const { WSConnection } = Socket;

const app = /*/ new Koa(); /*/ Websockify(new Koa()); /* */

app.proxy = true; // since cloud flare proxy is enabled

app.use(async(ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.warn('IMPORTANT ERROR: UNHANDLED ERROR ALMOST CRASHED SERVER (PREVENTED BY IGNORING)', error);
  }
});
/* **********
app.use(async(ctx, next) => {
  const now = Date.now();
  await next();
  console.log(`time elapsed: ${Date.now() - now}ms`);
});
*/

// app.use(KoaEasyWebsocket());

app.use(Helmet());


if (process.env.NODE_ENV === 'development' || true) {
  // console.log('using logger :) -- development environment');
  app.use(Logger());
}

app.use(Cors());


app.use(BodyParser({
  enableTypes: ['json', 'form'],
  jsonLimit: '5mb',
  strict: true,
  onerror(err, ctx) {
    console.log('body parse error', err);
  }
}));

app.use(async(ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.warn('some err', err);
    ctx.status = err.status || 500;
    ctx.body = {
      status: ctx.status,
      error: Math.floor(ctx.status / 100) === 5 ? err.message || 'Internal Server Error' : err.message,
      data: err.data || {}
    };
    // todo ???uncomment below line on production to hide server errors
  }
});

app.use(respond());

app.ws.use(async (ctx, next) => {
  const wsConnection = new WSConnection(ctx.websocket);
  if (ctx.path !== "/socket.io/") {
    gateway.addConnection(wsConnection, ctx.path);
  }
  return next();
});

app.use(async (ctx, next) => {
  if (ctx.method === 'POST') {
    ctx.body = gateway.postFromHandler(ctx.path, ctx.body);
  } else {
    ctx.status = 405;
    ctx.body = "Method Not Allowed!";
  }
});

module.exports = app;
