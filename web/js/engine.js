(function() {
    Engine = function(id, uuid) {
	var engine = {
	    webSocket: new WebSocket('ws://127.0.0.1:8080/nexus/websocket?uuid='+uuid, {
	};
	return engine;
    };
})();