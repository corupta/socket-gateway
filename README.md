# Socket Gateway

A node.js implementation of a simple API Gateway using websockets and socket.io


### Usage

Add a .env file such as
```dotenv
BASE_URL=https://my-url.com/api/
SECRET=thatsmysecret
```

It will route all websocket/socket.io connections to 
`base_url/socket/service-name` to `/base_url/service-name/socket/event-name` 
similar to how Amazon API Gateway handles WebSocket connections.

To emit a message to a socket user one can send an http POST request to this server via the related service (service-name in above url)



### Important

The project is not finished, and is heavily missing its documentation. 
