var safeCall = function(f) {
    if (f) {
	f.apply(f, [].splice.call(arguments,1));
    }
};
(function() {
    Engine = function(id, uuid) {
	var engine = {
	    id: id,
	    uuid: uuid,
	    users: new Array(),
	    webSocket: new JWebSocket('ws://127.0.0.1:8080/nexus/websocket?uuid='+uuid, {
		interval: 5000,
		open: function() {
		    safeCall(engine.onconnected)
		},
		events: {
		    GET_FRIENDS: function(friends) {
			$.each(friends, function(index, friend) {
			    engine.bindUser(friend);
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
			    users.push(user);
			});
			safeCall(engine.onsearchresult, users);
		    },
		    FRIEND_REQUEST: function(user) {
			user.makeFriend = function() {
			    engine.webSocket.send('MAKE_FRIEND', user.id);
			}
			user.rejectFriend = function() {
			    engine.webSocket.send('REJECT_FRIEND_REQUEST', user.id);
			}
			safeCall(engine.onfriendrequest, user);
		    },
		    STATE_CHANGED: function(user) {
                        u = JSLINQ(engine.users).First(function(u) {return u.id == user.id});
			if (u != null) {
			    u.online = user.online;
			    safeCall(engine.onstatechanged, u);
			} else {
			    var friend = engine.bindUser(user);
			    safeCall(engine.onnewfriend, friend);
			}
		    },
		    CHAT_MESSAGE: function(chatMessage) {
			var author = null;
			var recipient = null;
			var target = null;
			chatMessage.echo = false;
			if (chatMessage.authorId == engine.id) {
			    author = new User(id, '', 'Me');
			    recipient = JSLINQ(engine.users).First(function(u) {
				return u.id == chatMessage.recipientId;
			    });
			    chatMessage.echo = true;
			    target = recipient;
			} else {
			    author = JSLINQ(engine.users).First(function(u) {
				return u.id == chatMessage.authorId;
			    });
			    recipient = new User(id, '', 'Me');
			    target = author;
			}
			chatMessage.author = author;
			chatMessage.recipient = recipient;
			target.pendingChatMessages.push(chatMessage);
			safeCall(target.onChatMessage);
		    }
		}
	    }),
	    getFriends: function() {
		engine.webSocket.send('GET_FRIENDS');
	    },
	    search: function(words) {
		engine.webSocket.send('SEARCH', words);
	    },
	    bindUser: function(user) {
		var u = new User(user);
		engine.users.push(u);
		u.sendChatMessage = function(chatMessage) {
		    engine.webSocket.send('CHAT_MESSAGE', chatMessage);
		}
		return u;
	    }
	}
	return engine;
    };
})();