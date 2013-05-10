(function(){
    JWebSocket = function(url, s){
        var ws = new window.WebSocket(url);
        ws.interval = s.interval;
        ws.keepAlive = function() {
            ws.send('KEEP_ALIVE');
        };
        ws.transactions = new Array();
        ws.events = s.events;
        ws.onopen = s.open;
        ws.onclose = s.close;
        ws.onmessage = function(e) {
            var json = JSON.parse(e.data);
            if (typeof(json.transaction) != 'undefined' && json.transaction != null && json.transaction in ws.transactions) {
                ws.transactions[json.transaction](json.data);
            }
            if (json.type in ws.events) {
                ws.events[json.type](json.data);
            }
        }
        ws._send = ws.send;
        ws.send = function(type, data, onAnswer) {
            if (!onAnswer && typeof(data) == 'function') {
                onAnswer = data;
                data = 0;
            }
            var json = {
                type: type
            };
	    if (onAnswer) {
                var date = new Date().getTime();
                ws.transactions[date] = onAnswer;
		json.transaction = date;
            }
            if (data) {
                json.data = data;
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
    };
})();
