import DotEnv from "dotenv";
import http from 'http';
import url from 'url';

DotEnv.config();

const app = require("./app");

const port = process.env.PORT || 4000;

const server = http.createServer(app.callback());

app.ws.listen({ noServer: true });

server.on('upgrade', function upgrade(request, socket, head) {
  const pathname = url.parse(request.url).pathname;

  if (!pathname.startsWith('/socket.io')) {
    app.ws.server.handleUpgrade(request, socket, head, function done(ws) {
      app.ws.server.emit('connection', ws, request);
    });
  }
});

const socket = require('./socket')(server);

server.listen(port, () =>
  console.log(`Socket Gateway server started on ${port}`));
