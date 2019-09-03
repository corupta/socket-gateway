import urlModule from "url";
import path from "path";
import request from "request";
import Auth from "../auth";

const { URL } = urlModule;

class GatewayHandler {

  constructor(base_url, handler_path) {
    this._handler_url = new URL(
      path.join(base_url.pathname, handler_path, "socket/"),
      base_url
    );
    this._gatewayToken = Auth.Secret.get(handler_path);
    this._socketList = new Map();
  }

  addConnection = (gatewaySocket) => {
    this._socketList.set(gatewaySocket.uuid, gatewaySocket);
    gatewaySocket.prepare(this);
    this.clientToHandler(gatewaySocket, 'connect', {});
  };

  removeConnection = (gatewaySocket) => {
    this._socketList.delete(gatewaySocket.uuid);
    this.clientToHandler(gatewaySocket, 'disconnect', {});
  };

  clientToHandler = (gatewaySocket, event, payload) => {
    /*
    console.log('hey', event, payload);
    if (event !== 'connect') {
      gatewaySocket.emit(event, {status: 200, message: 'OK, received'});
    }
    return;
     */
    const requestUrl = new URL(event, this._handler_url);
    request.post(requestUrl, {
      headers: {
        'gateway-token': this._gatewayToken,
        'connection-id': gatewaySocket.uuid
      },
      json: payload
    }, (error, response, body) => {
      console.log("handler response", event, response, error, body);
      if (!error && response.statusCode < 300 && response.statusCode >= 200) {
        if (body) {
          gatewaySocket.emit(event, body);
        }
      } else {
        error = error || (typeof body === 'object' ? body.error : body);
        gatewaySocket.emit('error', { status: response ? response.statusCode : 500, error });
      }
    });
  };

  emitToUUID = (uuid, event, payload) => {
    return this._socketList.get(uuid).emit(event, payload);
  };

  broadcast = (event, payload) => {
    return this._socketList.forEach((gatewaySocket, uuid) => {
      gatewaySocket.emit(event, payload);
    });
  };

  emitFromHandler = (headers, payload) => {
    console.log('new emit from handler', headers.event, payload);
    if (headers['gateway-token'] !== this._gatewayToken) {
      const err = new Error("Gateway Token is wrong or missing, make sure to provide valid gateway-token header.");
      err.status = 401;
      throw err;
    }
    if (!headers['event']) {
      const err = new Error("Event is missing, make sure to provide event header.");
      err.status = 401;
      throw err;
    }
    const event = headers['event'];
    if (!headers['recipients']) {
      const err = new Error("Recipients is missing, make sure to provide recipients header.");
      err.status = 401;
      throw err;
    }
    const recipients = headers['recipients']
      .split(',')
      .map((uuid) => uuid.trim());
    if (recipients.length === 1 && recipients[0] === 'all') {
      this.broadcast(event, payload);
      return {
        sent: this._socketList.size
      };
    } else {
      const unknownRecipients = [];
      recipients.forEach((uuid) => {
        const gatewaySocket = this._socketList.get(uuid);
        if (gatewaySocket) {
          this.emitToUUID(uuid, event, payload)
        } else {
          unknownRecipients.push(uuid);
        }
      });
      return {
        sent: recipients.length - unknownRecipients.length,
        unknownRecipients
      };
    }
  }
}

export default GatewayHandler;
