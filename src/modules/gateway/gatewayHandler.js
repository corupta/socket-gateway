import urlModule from "url";
import path from "path";
import request from "request";
import Auth from "../auth";

const { URL } = urlModule;

class GatewayHandler {

  constructor(base_url, _path) {
    this._handler_url = new URL(
      path.join(_path, "socket/"),
      base_url
    );
    this._gatewayToken = Auth.Secret.get(this._handler_url.href); // includes full path (https)
    this._socketList = new Map();
  }

  addConnection = (gatewaySocket) => {
    this._socketList.set(gatewaySocket.uuid, gatewaySocket);
    gatewaySocket.prepare(this);
  };

  removeConnection = (gatewaySocket) => {
    this._socketList.delete(gatewaySocket.uuid);
    this.clientToHandler(gatewaySocket, 'disconnect', {});
  };

  clientToHandler = (gatewaySocket, event, payload) => {
    // console.log("sending to handler", event, payload);
    const requestUrl = new URL(event, this._handler_url);
    request.post(requestUrl, {
      json: {
        gatewayToken: this._gatewayToken,
        connectionId: gatewaySocket.uuid,
        payload
      }
    }, (error, response, body) => {
      // console.log("handler response", event, response.statusCode, error, body);
      if (!error && response.statusCode < 300 && response.statusCode >= 200) {
        gatewaySocket.emit(event, body);
      } else {
        error = error | `Status ${response.statusCode}`;
        gatewaySocket.emit('error', { error });
      }
    });
  };

  emitToUUID = (uuid, event, payload) => {
    return this._socketList.get(uuid).emit(event, payload);
  };

  broadcast = (event, payload) => {
    return this._socketList.forEach((uuid, gatewaySocket) => {
      gatewaySocket.emit(event, payload);
    });
  };

  emitFromHandler = ({ event, gatewayToken, recipients, payload}) => {
    if (data.gatewayToken !== this._gatewayToken) {
      const err = new Error("Gateway Token is wrong or missing, make sure to provide valid gatewayToken.");
      err.status = 401;
      throw err;
    }
    if (recipients === 'all') {
        this.broadcast(event, payload);
        return {
          sent: this._socketList.size
        };
    } else if (Array.isArray(recipients)) {
      recipients.forEach((uuid) => {
        this.emitToUUID(uuid, event, payload)
      });
      return {
        sent: recipients.length
      };
    } else {
      this.emitToUUID(recipients, event, payload);
      return {
        sent: 1
      };
    }
  }
}

export default GatewayHandler;
