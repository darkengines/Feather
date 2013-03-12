function JSONWebSocket(url, args) {
	
    this.webSocket = new WebSocket(url);
    this.keepAliveInterval = args.keepAliveInterval;
    this.events = args.events;
    this.open = args.open;
    this.close = args.close;
    
	
    this.webSocket.onopen = this.open;
    this.webSocket.onclose = this.close;
	
	this.keepAliveDeamon = setInterval(this.keepAlive, this.keepAliveInterval);
    this.webSocket.onmessage = this.processMessage;
	
    $(window).unload(function () {
		clearInterval(ws.daemon);
		ws.close();
		ws = null;
    });
	
    if(typeof JSONWebSocket.initialized == "undefined") { 
	JSONWebSocket.prototype.send = function(type, data) { 
	    var json = {
		type: type
	    };
	    if (typeof data != 'undefined' && data != null) {
		json.data = data
	    }
	    this.webSocket.send(JSON.stringify(json));
	};
	JSONWebSocket.prototype.keepAlive = function() { 
	    this.send('KEEP_ALIVE');
	};
	JSONWebSocket.prototype.processMessage = function(event) { 
	    var json = JSON.parse(event.data);
	    this.events[json.type](json.data);
	};
	JSONWebSocket.initialized = true; 
    }    
} 