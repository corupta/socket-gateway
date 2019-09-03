import socketIO from "socket.io";
import { Socket } from "./modules";
import gateway from "./gateway";

const { IOConnection } = Socket;

const createSocketConnection = (server, opts = {}) => {
  const socketServer = socketIO.listen(server, { origins: "*:*", ...opts});
  const io = socketServer.of(/^.*$/);
  io.on("connection", (iosocket) => {
    let path = iosocket.nsp.name;
    while(path.startsWith('/socket')) {
      path = path.substr('/socket'.length);
    }
    const ioConnection = new IOConnection(iosocket);
    gateway.addConnection(ioConnection, path);
  });
  return socketServer;
};

module.exports = createSocketConnection;


