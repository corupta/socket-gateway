import socketIO from "socket.io";
import { Socket } from "./modules";
import gateway from "./gateway";

const { IOConnection } = Socket;

const createSocketConnection = (server) => {
  const socketServer = socketIO(server, { origins: "*:*"});
  const io = socketServer.of(/^.*$/);
  io.on("connection", (iosocket) => {
    const path = iosocket.nsp.name;
    const ioConnection = new IOConnection(iosocket);
    gateway.addConnection(ioConnection, path);
  });
};

module.exports = createSocketConnection;


