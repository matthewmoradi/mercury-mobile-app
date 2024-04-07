let addr = "ws://192.168.31.26:6002";
const socket = new WebSocket(addr);

function socket_init() {
	socket.onopen = function (e) {
		console.log("[open] Connection established");
	};
	socket.onmessage = function (event) {
		// console.log(`[message] Data received from server: ${event.data}`);
		message = JSON.parse(event.data);
		if (message.answer) {
			get_remote_desc(message.answer);
		} else if (message.offer) {
			got_offer(message.offer);
		} else if (message.ice_candidate) {
			add_ice_remote(JSON.parse(message.ice_candidate));
		}
	};
	socket.onclose = function (event) {
		if (event.wasClean) {
			console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
		} else {
			// e.g. server process killed or network down
			// event.code is usually 1006 in this case
			console.log('[close] Connection died');
		}
	};
	socket.onerror = function (error) {
		console.log(`[error]`);
	};
}
socket_send = function (data) {
	if (typeof data == "object")
		data = JSON.stringify(data);
	// console.log("Sending message: " + data);
	socket.send(data);
}