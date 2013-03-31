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
	    foundUsers: new Array(),
	    requestedUsers: new Array(),
	    friendRequests: new Array(),
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
			engine.foundUsers.length = 0;
			$.each(friends, function(index, friend) {
			    var user = new User(friend);
			    user.makeFriend = function() {
				engine.webSocket.send('MAKE_FRIEND', user.id);
			    };
			    engine.foundUsers.push(user);
			});
			safeCall(engine.onsearchresult, engine.foundUsers);
		    },
		    FRIEND_REQUEST: function(user) {
			engine.bindFriendRequest(user);
			safeCall(engine.onfriendrequest, user);
		    },
		    REJECT_FRIEND_REQUEST: function(user) {
			var index = null;
			var request =null;
			$.each(engine.friendRequests, function(i, u) {
			    if (u.id == user.id) {
				index = i;
				request = u;
				return false;
			    } 
			});
			if (index != null) {
			    engine.friendRequests = engine.friendRequests.slice(0, index-1).concat(engine.friendRequests.slice(index + 1));
			    safeCall(request.onrejected);
			}
		    },
		    STATE_CHANGED: function(user) {
			u = JSLINQ(engine.users).First(function(u) {
			    return u.id == user.id
			});
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
		    },
		    GET_FRIEND_REQUESTS: function(users) {
			$.each(users, function(index, user) {
			    engine.bindFriendRequest(user);
			});
			safeCall(engine.ongotfriendrequests, engine.friendRequests);
		    },
		    GET_REQUESTED_FRIENDS: function(users) {
			$.each(users, function(index, user) {
			    engine.bindRequestedFriend(user);
			});
			safeCall(engine.ongotrequestedfriends, engine.requestedUsers);
		    },
		    FRIEND_REQUESTED: function(user) {
			engine.bindRequestedFriend(user);
			safeCall(engine.ongotrequestedfriend, u);
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
	    },
	    bindRequestedFriend: function(request) {
		var u = new User(request);
			    engine.requestedUsers.push(u);
	    },
	    bindFriendRequest: function(request) {
		var u = new User(request);
		u.makeFriend = function() {
		    engine.webSocket.send('MAKE_FRIEND', u.id);
		}
		u.rejectFriend = function() {
		    engine.webSocket.send('REJECT_FRIEND_REQUEST', u.id);
		}
		engine.friendRequests.push(u);
	    },
	    getFriendRequests: function() {
		engine.webSocket.send('GET_FRIEND_REQUESTS');
	    },
	    getRequestedFriends: function() {
		engine.webSocket.send('GET_REQUESTED_FRIENDS');
	    },
	    createChannel: function(name) {
		engine.webSocket.send('CREATE_CHANNEL', name);
	    }
	}
	return engine;
    };
})();