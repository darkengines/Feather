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
		    engine.webSocket.send('INIT');
		    safeCall(engine.onconnected);
		},
		events: {
		    INIT: function(data) {
			engine.users = data.users;
			engine.friends = data.friends;
			engine.friendRequests = data.friendRequests;
			engine.requestedFriends = data.requestedFriends;
			engine.channelInvitations = data.channelInvitations;
			engine.channels = data.channels;
			$.each(engine.friends, function(index, userId) {
			    engine.bindUser(engine.users[userId]);
			});
			safeCall(engine.oninitialized);
		    },
		    STATE_CHANGED: function(user) {
			engine.updateUser(user);
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
		    FRIEND_REQUEST: function(request) {
			engine.users[request.user.id] = request.user;
			engine.friendRequests[request.id] = {
                            id: request.id,
                            user: request.user.id
                        }
                        engine.bindFriendRequest(engine.friendRequests[request.id]);
			safeCall(engine.onfriendrequest, engine.users[request.user.id]);
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
		    CHAT_MESSAGE: function(chatMessage) {
			var author = null;
			var recipient = null;
			var target = null;
			chatMessage.echo = false;
			if (chatMessage.authorId == engine.id) {
			    author = new User(id, '', 'Me');
			    recipient = engine.users[chatMessage.recipientId];
			    chatMessage.echo = true;
			    target = recipient;
			} else {
			    author = [chatMessage.authorId];
			    recipient = new User(id, '', 'Me');
			    target = author;
			}
			chatMessage.author = author;
			chatMessage.recipient = recipient;
			target.pendingChatMessages.push(chatMessage);
			safeCall(target.onChatMessage);
		    },
		    FRIEND_REQUESTED: function(user) {
			engine.bindRequestedFriend(user);
			safeCall(engine.ongotrequestedfriend, u);
		    }
		}
	    }),
	    updateUser: function(user) {
		if (user.id in engine.users) {
		    engine.users[user.id].online = user.online;
		    safeCall(engine.users[user.id].onstatechanged);
		}
	    },
	    getFriends: function() {
		engine.webSocket.send('GET_FRIENDS');
	    },
	    search: function(words) {
		engine.webSocket.send('SEARCH', words);
	    },
	    bindUser: function(user) {
		user.pendingChatMessages = new Array();
		user.chatMessages = new Array();
		user.sendChatMessage = function(chatMessage) {
		    engine.webSocket.send('CHAT_MESSAGE', chatMessage);
		}
	    },
	    bindRequestedFriend: function(request) {
		var u = new User(request);
		engine.requestedUsers.push(u);
	    },
	    bindFriendRequest: function(request) {
		var user = engine.users[request.user];
		user.makeFriend = function() {
		    engine.webSocket.send('MAKE_FRIEND', user.id);
		}
		user.rejectFriend = function() {
		    engine.webSocket.send('REJECT_FRIEND_REQUEST', user.id);
		}
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