import urlModule from "url";
import path from "path";
import request from "request";
import Auth from "../auth";

const { URL } = urlModule;

class GatewayHandler {

  constructor(base_url, handler_path) {
    this._handler_url = new URL(
      path.join(handler_path, "socket/"),
      base_url
    );
    this._gatewayToken = Auth.Secret.get(handler_path);
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
      headers: {
        'gateway-token': this._gatewayToken,
        'connection-id': gatewaySocket.uuid
      },
      json: payload
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

  emitFromHandler = (headers, payload) => {
    if (headers['gateway-token'] !== this._gatewayToken) {
      const err = new Error("Gateway Token is wrong or missing, make sure to provide valid gateway-token header.");
      err.status = 401;
      throw err;
    }
    const event = headers['event'];
    let recipients = headers['recipients']
      .split(',')
      .map((uuid) => uuid.trim());
    if (recipients.length === 1 && recipients[0] === 'all') {
        this.broadcast(event, payload);
        return {
          sent: this._socketList.size
        };
    } else {
      recipients.forEach((uuid) => {
        this.emitToUUID(uuid, event, payload)
      });
      return {
        sent: recipients.length
      };
    }
  }
}

export default GatewayHandler;
