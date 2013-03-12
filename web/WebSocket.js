function JSONWebSocket(url, args) {
	this.webSocket = new WebSocket(url);
	this.keepAliveInterval = args.keepAliveInterval;
	this.events = args.events;
	this.open = args.open;
	this.close = args.close;
	this.keepAliveDeamon = setInterval(this.keepAlive, this.keepAliveInterval);
	
	$(window).unload(function () {
		clearInterval(ws.daemon);
		ws.close();
		ws = null;
	});
	
	if(typeof WebSocket.initialized == "undefined") { 
		WebSocket.prototype.send = function(type, data) { 
			var json = {type: type};
			if (typeof data != 'undefined' && data != null) {
				json.data = data
            }
			this.webSocket.send(JSON.stringify(json));
		};
		WebSocket.prototype.keepAlive = function() { 
			this.send('KEEP_ALIVE');
		}; 
		WebSocket.initialized = true; 
	} 
} 