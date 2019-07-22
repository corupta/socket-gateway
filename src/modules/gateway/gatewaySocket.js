import uuidv4 from "uuid/v4";
import path from "path";

class GatewaySocket {

  constructor(socketConnection, connectionPath) {
    this._socketConnection = socketConnection;
    this.uuid = uuidv4();
    this.path = path.join(connectionPath, "/");
    this._gatewayHandler = null;
  }

  emit = (event, payload) => {
    this._socketConnection.emit(event, payload);
  };

  prepare = (gatewayHandler) => {
    this._gatewayHandler = gatewayHandler;
    this._socketConnection.onMessage(
      (event, payload) =>
        gatewayHandler.clientToHandler(this, event, payload)
    );
    this._socketConnection.onDisconnect(
      () => gatewayHandler.removeConnection(this)
    );
    gatewayHandler.clientToHandler(this, 'connect', {});
  };
}

export default GatewaySocket;
