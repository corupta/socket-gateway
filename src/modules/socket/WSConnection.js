class WSConnection {

  constructor(websocket) {
    this._websocket = websocket;
  }

  onDisconnect = (callback) => {
    this._websocket.on('close', callback);
  };

  /**
   * message should be of type: JSON.stringify({
   *   eventType: string,
   *   ...rest
   * })
   * @param callback: (event, payload) => any
   */
  onMessage = (callback) => {
    this._websocket.on('message', (message) => {
      let data;
      try {
        data = JSON.parse(message);
      } catch(e) {
        this.emit("error", {
          error: `Message must be valid json!`
        });
      }
      if (data) {
        const { eventType, ...payload} = data;
        callback(eventType, payload);
      }
    })
  };

  emit = (eventType, data) => {
    if (data.toJSON) {
      data = data.toJSON();
    }
    this._websocket.send(JSON.stringify({
      ...data,
      eventType
    }));
  }
}

export default WSConnection;
