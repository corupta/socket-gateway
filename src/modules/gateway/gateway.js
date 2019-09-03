import urlModule from "url";
import request from "request";

import GatewaySocket from "./gatewaySocket";
import GatewayHandler from "./gatewayHandler";

const { URL } = urlModule;

class Gateway {
  constructor({ baseUrl }) {
    this._baseUrl = new URL(baseUrl);
    this._handlerList = new Map();
  }

  prepareHandler = (handlerPath) => {
    if (!this._handlerList.get(handlerPath)) {
      this._handlerList.set(
        handlerPath,
        new GatewayHandler(this._baseUrl, handlerPath)
      );
    }
  };

  addConnection = (socketConnection, connectionPath) => {
    const gatewaySocket = new GatewaySocket(socketConnection, connectionPath);
    this.prepareHandler(gatewaySocket.path);
    this._handlerList
      .get(gatewaySocket.path)
      .addConnection(gatewaySocket);
  };

  removeConnection = (gatewaySocket) => {
    this._handlerList
      .get(gatewaySocket.path)
      .removeConnection(gatewaySocket);
  };

  postFromHandler = (path, headers, data) => {
    this.prepareHandler(path);
    return this._handlerList
      .get(path)
      .emitFromHandler(headers, data);
  }
}

export default Gateway;
