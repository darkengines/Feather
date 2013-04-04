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
	    foundUsers: {},
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
			engine.foundUsers = {};
			$.each(friends, function(index, friend) {
			    var user = new User(friend);
			    user.makeFriend = function() {
				engine.webSocket.send('MAKE_FRIEND', user.id);
			    };
			    engine.foundUsers[user.id]=user;
			});
			safeCall(engine.onsearchresult, engine.foundUsers);
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
			    author = engine.users[chatMessage.authorId];
			    recipient = new User(id, '', 'Me');
			    target = author;
			}
			chatMessage.author = author;
			chatMessage.recipient = recipient;
			target.pendingChatMessages.push(chatMessage);
			safeCall(target.onChatMessage);
		    },
		    FRIEND_REQUEST: function(request) {
			engine.users[request.user.id] = request.user;
			engine.friendRequests[request.id] = {
                            id: request.id,
                            user: request.user.id
                        }
                        engine.bindFriendRequest(engine.friendRequests[request.id]);
			safeCall(engine.onfriendrequest, engine.friendRequests[request.id]);
		    },
		    FRIEND_REQUESTED: function(request) {
			if (request.user.id in engine.users) {
			    engine.updateUser(request.user);
			} else {
			    engine.users[request.user.id] = request.user;
			}
			engine.requestedFriends[request.id] = {id: request.id, user: request.user.id};
			engine.bindRequestedFriend(engine.requestedFriends[request.id]);
			safeCall(engine.onrequestedfriend, engine.requestedFriends[request.id]);
		    },
		    ACCEPTED_FRIEND_REQUEST: function(id) {
			var request = engine.requestedFriends[id];
			delete engine.requestedFriends[id];
			safeCall(request.deleted);
			var user = engine.users[request.user];
			engine.friends[user.id] = user.id;
			engine.bindUser(engine.users[user.id]);
			safeCall(engine.onnewfriend, user);
		    },
		    FRIEND_REQUEST_ACCEPTED: function(id) {
			var request = engine.friendRequests[id];
			delete engine.friendRequests[id];
			safeCall(request.deleted);
			var user = engine.users[request.user];
			engine.friends[user.id] = user.id;
			engine.bindUser(engine.users[user.id]);
			safeCall(engine.onnewfriend, user);
		    },
		    FRIEND_REQUEST_REJECTED: function(id) {
			var request = engine.friendRequests[id];
			delete engine.friendRequests[id];
			safeCall(request.deleted);
		    },
		    REJECTED_FRIEND_REQUEST: function(id) {
			var request = engine.requestedFriends[id];
			delete engine.requestedFriends[id];
			safeCall(request.deleted);
		    },
		    CHANNEL_CREATED: function(channelData) {
			engine.channels[channelData.id] = channelData;
			engine.bindChannel(engine.channels[channelData.id]);
			safeCall(engine.onnewchannel, engine.channels[channelData.id]);
		    }
		}
	    }),
	    updateUser: function(user) {
		if (user.id in engine.users) {
		    engine.users[user.id].online = user.online;
		    safeCall(engine.users[user.id].onstatechanged);
		}
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
		request.accept = function() {
		    engine.webSocket.send('ACCEPT_FRIEND_REQUEST', request.id);
		}
		request.reject = function() {
		    engine.webSocket.send('REJECT_FRIEND_REQUEST', request.id);
		}
	    },
	    createChannel: function(name) {
		engine.webSocket.send('CREATE_CHANNEL', name);
	    },
	    bindChannel: function(channel) {
		channel.sendChatMessage = function(message) {
		    engine.webSocket.send('CHANNEL_CHAT_MESSAGE', {channel_id: channel.id, content: message});
		}
	    }
	}
	return engine;
    };
})();