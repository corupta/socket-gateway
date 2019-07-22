class IOConnection {

  constructor(iosocket) {
    this._iosocket = iosocket;
  }

  onDisconnect = (callback) => {
    this._iosocket.on('disconnect', () => {
      this._iosocket.removeAllListeners();
      callback();
    });
  };

  /**
   * @param callback: (event, payload) => any
   */
  onMessage = (callback) => {
    this._iosocket.use((packet, next) => {
      const [eventType, payload] = packet;
      if (typeof payload !== 'object') {
        this.emit("error", {
          error: `Message must be valid json!`
        });
      } else {
        callback(eventType, payload);
      }
      return next();
    });
  };

  emit = (eventType, data) => {
    if (data.toJSON) {
      data = data.toJSON();
    }
    this._iosocket.emit(eventType, data);
  }
}

export default IOConnection;
