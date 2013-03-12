/*
 * jQuery Web Sockets Plugin v0.0.1
 * http://code.google.com/p/jquery-websocket/
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright (c) 2010 by shootaroo (Shotaro Tsubouchi).
 */
(function($){
    $.extend({
	websocket: function(url, s) {
	    var ws = new WebSocket(url);
	    ws.interval = s.interval;
	    ws.keepAlive = function() {
		ws.send('KEEP_ALIVE');
	    };
	    ws.events = s.events;
	    ws.onopen = s.open;
	    ws.onclose = s.close;
	    ws.onmessage = function(e) {
		var json = JSON.parse(e.data);
		ws.events[json.type](json.data);
	    }
	    ws._send = ws.send;
	    ws.send = function(type, data) {
		var json = null;
		if (typeof data == 'undefined' || data == null) {
		    json = {
			type: type
		    }; 
		} else {
		    json = {
			type: type, 
			data: data
		    };
		}
		return this._send(JSON.stringify(json));
	    }
	    $(window).unload(function(){
		clearInterval(ws.daemon);
		ws.close();
		ws = null;
	    });
	    ws.daemon = setInterval(ws.keepAlive, ws.interval);
	    return ws;
	}
    });
})(jQuery);
