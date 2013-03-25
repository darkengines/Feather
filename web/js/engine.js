var safeCall = function(f) {
    f.apply(f, [].splice.call(arguments,1));
};
(function() {
    Engine = function(id, uuid) {
	var engine = {
	    users: new Array(),
	    webSocket: new JWebSocket('ws://127.0.0.1:8080/nexus/websocket?uuid='+uuid, {
		interval: 5000,
		open: function() {
		    safeCall(engine.onconnected)
		    },
		events: {
		    GET_FRIENDS: function(friends) {
			$.each(friends, function(index, friend) {
			    var user = new User(friend);
			    engine.users.push(friend);
			});
			safeCall(engine.ongetfriends, engine.users);
		    },
		    SEARCH: function(friends) {
			var users = new Array();
			$.each(friends, function(index, friend) {
			    var user = new User(friend);
			    user.makeFriend = function() {
				engine.webSocket.send('MAKE_FRIEND', user.id);
			    };
			    users.push(friend);
			});
			safeCall(engine.onsearchresult, users);
		    },
                    FRIEND_REQUEST: function(user) {
                        safeCall(engine.onfriendrequest, user);
                    },
		    STATE_CHANGED: function(user) {
			
		    }
		}
	    }),
	    getFriends: function() {
		engine.webSocket.send('GET_FRIENDS');
	    },
	    search: function(words) {
		engine.webSocket.send('SEARCH', words);
	    }
	}
	return engine;
    };
})();