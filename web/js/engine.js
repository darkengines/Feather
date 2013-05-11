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
	    availableChannels: new Array(),
	    initialized: function(data) {
		engine.users = data.users;
		engine.friends = data.friends;
		engine.friendRequests = data.friendRequests;
		engine.requestedFriends = data.requestedFriends;
		engine.channelInvitations = data.channelInvitations;
		engine.channels = data.channels;
		engine.availableChannels = data.availableChannels
		$.each(engine.friends, function(index, userId) {
		    engine.bindUser(engine.users[userId]);
		});
		$.each(engine.requestedFriends, function(index, request) {
		    engine.bindRequestedFriend(request);
		});
		$.each(engine.friendRequests, function(index, request) {
		    engine.bindFriendRequest(request);
		});
		$.each(engine.availableChannels, function(index, channelId) {
		    engine.bindChannel(engine.channels[channelId]);
		});
		$.each(engine.channelInvitations, function(index, invitation) {
		    engine.bindChannelInvitation(invitation);
		});
		safeCall(engine.oninitialized);
	    },
	    webSocket: new JWebSocket('ws://192.168.0.2:8080/nexus/websocket?uuid='+uuid, {
		interval: 5000,
		open: function() {
		    engine.webSocket.send('INIT', null, function(data) {
			engine.initialized(data);
		    });
		    safeCall(engine.onconnected);
		},
		events: {
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
			    author = {
				displayName: 'Me'
			    };
			    recipient = engine.users[chatMessage.recipientId];
			    chatMessage.echo = true;
			    target = recipient;
			} else {
			    author = engine.users[chatMessage.authorId];
			    recipient = {
				displayName: 'Me'
			    };
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
			    userId: request.user.id
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
			engine.requestedFriends[request.id] = {
			    id: request.id, 
			    userId: request.user.id
			};
			engine.bindRequestedFriend(engine.requestedFriends[request.id]);
			safeCall(engine.onrequestedfriend, engine.requestedFriends[request.id]);
		    },
		    ACCEPTED_FRIEND_REQUEST: function(id) {
			var request = engine.requestedFriends[id];
			delete engine.requestedFriends[id];
			safeCall(request.onaccepted);
			var user = engine.users[request.userId];
			engine.friends[user.id] = user.id;
			engine.bindUser(engine.users[user.id]);
			safeCall(engine.onnewfriend, user);
		    },
		    FRIEND_REQUEST_ACCEPTED: function(id) {
			var request = engine.friendRequests[id];
			delete engine.friendRequests[id];
			safeCall(request.onaccepted);
			var user = engine.users[request.userId];
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
			engine.availableChannels[channelData.id] = channelData.id;
			safeCall(engine.onnewchannel, engine.channels[channelData.id]);
		    },
		    OFFER: function(offer) {
			var user = engine.users[offer.caller];
			safeCall(user.onoffer, offer);
			user.pendingOffer = offer;
		    //user.answer(offer);
		    },
		    ANSWER: function(answer) {
			var user = engine.users[answer.callee];
			var peer = user.peers[answer.token];
			var uniqueId = answer.uniqueId;
			user.uniqueId = uniqueId;
			user.hasUniqueId = true;
			$.each(user.localIceCandidates, function(index, item) {
			    engine.onIceCandidate(item.candidate, item.user, item.key, uniqueId);
			});
			peer.setRemoteDescription(new RTCSessionDescription(answer.description));
			safeCall(user.onanswer, answer);
		    },
		    ICE_CANDIDATE: function(iceCandidate) {
			var user = engine.users[iceCandidate.author];
			var peer = user.peers[iceCandidate.token];
			if (peer == null) {
			    user.iceCandidates.push(new RTCIceCandidate(iceCandidate.iceCandidate));
			} else {
			    peer.addIceCandidate(new RTCIceCandidate(iceCandidate.iceCandidate));
			}
		    },
		    CHANNEL_INVITATION_SENT: function(repport) {
			var invitation = repport.invitation;
			var user = repport.user;
			engine.channels[invitation.channelId].invitations[invitation.id] = invitation.id;
			engine.channelInvitations[invitation.id] = invitation;
			if (!user.id in engine.users) {
			    engine.users[user.id] = user;
			}
			safeCall(engine.onchannelinvitationsent, invitation);
		    },
		    CHANNEL_INVITATION: function(data) {
			var invitation = {
			    id: data.id,
			    channelId: data.channel.id
			}
			var channel = data.channel;
			var users = data.users;
			
			$.each(users, function(index, user) {
			    if (!user.id in engine.users) {
				engine.users[user.id] = user;
			    }
			});
			
			engine.channels[channel.id] = channel;
			engine.channelInvitations[invitation.id] = invitation;
			
			engine.bindChannelInvitation(engine.channelInvitations[invitation.id]);
			safeCall(engine.onchannelinvitation, invitation);
		    },
		    CHANNEL_INVITATION_ACCEPTED: function(invitationId) {
			var invitation = engine.channelInvitations[invitationId];
			var channel = engine.channels[invitation.channelId];
			delete engine.channelInvitations[invitationId];
			invitation.accepted();
			engine.bindChannel(channel);
			safeCall(engine.onnewchannel, channel);
		    },
		    ACCEPTED_CHANNEL_INVITATION: function(invitationId) {
			var invitation = engine.channelInvitations[invitationId];
			var channel = engine.channels[invitation.channelId];
			delete engine.channelInvitations[invitationId];
			delete channel.invitations[invitationId];
			safeCall(channel.onnewparticipant, engine.users[invitation.userId]);
		    },
		    CHANNEL_CHAT_MESSAGE: function(chatMessage) {
			var author = null;
			var target = engine.channels[chatMessage.channelId];
			chatMessage.echo = false;
			if (chatMessage.authorId == engine.id) {
			    author = {
				displayName: 'Me'
			    };
			    chatMessage.echo = true;
			} else {
			    author = engine.users[chatMessage.authorId];
			}
			chatMessage.author = author;
			target.pendingChatMessages.push(chatMessage);
			safeCall(target.onChatMessage);
		    }
		}
	    }),
	    updateUser: function(user) {
		if (user.id in engine.users) {
		    engine.users[user.id].online = user.online;
		    safeCall(engine.users[user.id].onstatechanged);
		    if (!user.online && user.peers != null && user.peers.length) {
			engine.users[user.id].hangUp(function() {
			    
			    });
			engine.users[user.id].onHangUp()
		    }
		}
	    },
	    search: function(words) {
		engine.webSocket.send('SEARCH', words);
	    },
	    bindUser: function(user) {
		user.peers = new Array();
		user.inputPeerId = null;
		user.ouputPeerId = null;
		user.pendingChatMessages = new Array();
		user.iceCandidates = new Array();
		user.chatMessages = new Array();
		user.localIceCandidates = new Array();
		user.sendChatMessage = function(chatMessage) {
		    engine.webSocket.send('CHAT_MESSAGE', chatMessage);
		};
		user.sendChannelInvitation = function(channelId) {
		    engine.webSocket.send('CHANNEL_INVITATION', {
			channelId: channelId,
			userId: user.id
		    });
		};
		user.call = function(callback) {
		    if (user.ouputStreamId == null) {
			var key = new Date().getTime();
			user.outputPeerId = key;
			user.peers[key] = engine.createPeerConnection();
			var peer = user.peers[key];
			peer.onicecandidate = function(e) {
			    if (user.hasUniqueId) {
				engine.onIceCandidate(e, user, key, user.uniqueId);
			    } else {
				user.localIceCandidates.push({
				    candidate:e,
				    user:user,
				    key:key
				});
			    }
			};
			peer.onaddstream = function(e) {
			    user.stream = e.stream;
			    user.receivingLocalStream = true;
			};
			peer.onremovestream = user.streamRemoved;
			engine.doGetUserMedia(function(stream) {
			    engine.localStream = stream;
			    peer.addStream(engine.localStream);
			    user.receivingLocalStream = true;
			    safeCall(user.onlocalstream);
			    var constraints = {
				"optional": [],
				"mandatory": {
				    "MozDontOfferDataChannel": true
				}
			    };
			    // temporary measure to remove Moz* constraints in Chrome
			    if (webrtcDetectedBrowser === "chrome") {
				for (prop in constraints.mandatory) {
				    if (prop.indexOf("Moz") != -1) {
					delete constraints.mandatory[prop];
				    }
				}
			    }
			    constraints = mergeConstraints(constraints, sdpConstraints);
			    peer.createOffer(function(description) {
				engine.onGotLocalDescription(description, user, 'OFFER', key);
				callback();
			    }, null, constraints) ;
			});
		    }
		};
		user.answer = function(offer) {
		    if (user.inputStreamId == null) {
			var key = offer.token;
			user.inputPeerId = key;
			user.peers[key] = engine.createPeerConnection();
			var peer = user.peers[key];
			peer.onicecandidate = peer.onicecandidate = function(e) {
			    engine.onIceCandidate(e, user, key, offer.uniqueId);
			};
			peer.onaddstream = function(e) {
			    user.stream = e.stream;
			    safeCall(user.onstream, e.stream);
			}
			peer.onstatechange = function() {
			    if (peer.iceState == 'disconnected') {
				if (user.stream != null) {
				    safeCall(user.streamremoved);
				    user.stream = null;
				}
				peer.close();
				delete user.peers[key];
			    }
			}
			peer.onremovestream = function() {
			    safeCall(user.streamremoved)
			};
			peer.setRemoteDescription(new RTCSessionDescription(offer.description));
			while (user.iceCandidates.length) {
			    peer.addIceCandidate(user.iceCandidates.pop());
			}
			var constraints = {
			    "optional": [],
			    "mandatory": {
				"MozDontOfferDataChannel": true
			    }
			};
			// temporary measure to remove Moz* constraints in Chrome
			if (webrtcDetectedBrowser === "chrome") {
			    for (prop in constraints.mandatory) {
				if (prop.indexOf("Moz") != -1) {
				    delete constraints.mandatory[prop];
				}
			    }
			}
			constraints = mergeConstraints(constraints, sdpConstraints);
			peer.createAnswer(function(description) {
			    engine.onGotLocalDescription(description, user, 'ANSWER', key, offer.uniqueId);				    
			}, null, constraints);
		    }
		};
		user.hangUp = function(callback) {
		    if (user.outputPeerId in user.peers && user.receivingLocalStream) {
			var peer = user.peers[user.outputPeerId];
			peer.removeStream(engine.localStream);
			peer.close();
			peer = null;
			delete user.peers[user.outputPeerId];
			user.receivingLocalStream = false;
			safeCall(user.localstreamremoved());
			callback();
		    }
		}
		user.onHangUp = function() {
		    if (user.stream != null) {
			safeCall(user.streamremoved());
			user.stream = null;
		    }
		    if (user.inputPeerId in user.peers) {
			var peer = user.peers[user.inputPeerId];
			peer.close();
			delete user.peers[user.inputPeerId];
		    }
		}
	    },
	    createPeerConnection: function() {
		var pc_config = {
		    "iceServers": [{
			"url": "stun:stun.l.google.com:19302"
		    }]
		};
		var pc_constraints = {
		    "optional": [{
			"DtlsSrtpKeyAgreement": true
		    }]
		};
		// Force the use of a number IP STUN server for Firefox.
		if (webrtcDetectedBrowser == "firefox") {
		    pc_config = {
			"iceServers": [{
			    "url": "stun:23.21.150.121"
			}]
		    };
		}
		try {
		    var pc = new RTCPeerConnection(pc_config, pc_constraints);
		} catch (e) {
		    return;
		}
		return pc;
	    },
	    onIceCandidate: function(e, user, key, uniqueId) {
		var peer = user.peers[key];
		if (e.candidate) {
		    engine.webSocket.send('ICE_CANDIDATE', {
			recipient: user.id,
			iceCandidate: e.candidate,
			token: key,
			uniqueId: uniqueId
		    });
		} else {
		    user.emptyIceCandidateCount++;
		    if (user.emptyIceCandidateCount > 16) {
			user.stream = null;
			peer.close();
			peer = null;
			user.onHangUp();
			user.emptyIceCandidateCount = 0;	
		    }
		}
	    },
	    onGotLocalDescription: function(description, user, type, key, uniqueId) {
		var caller, callee;
		var peer = user.peers[key];
		switch (type) {
		    case ('OFFER'): {
			caller = $.cookie('id');
			callee = user.id;
			break;
		    }
		    case ('ANSWER'): {
			caller = user.id;
			callee = $.cookie('id');
			break;
		    }
		    default: {
			throw new Exception(type+' not supported');
		    }
		}
		description.sdp = preferOpus(description.sdp);
		peer.setLocalDescription(description);
		var data = {
		    caller: caller,
		    callee: callee,
		    description: description,
		    token: key
		};
		if (uniqueId) {
		    data.uniqueId= uniqueId;
		}
		engine.webSocket.send(type,data);
	    },
	    doGetUserMedia: function(successCallback) {
		if (engine.localStream != null) {
		    successCallback(engine.localStream);
		} else {
		    // Call into getUserMedia via the polyfill (adapter.js).
		    var constraints = {
			"mandatory": {},
			"optional": []
		    };
		    getUserMedia({
			'audio': true,
			'video': constraints
		    }, function(stream) {
			successCallback(stream);
		    },
		    function(e) {
			var truc = '';
			var i = 0;
			$.each(e, function (index, value) {
			    if (i > 0) {
				truc+='\n';
			    }
			    truc += '['+index+']='+value;
			    i++;
			});
			alert('GET USER MEDIA FAILURE:\n'+truc);
		    });
		}
	    },
	    bindRequestedFriend: function(user) {
		engine.requestedUsers.push(user);
	    },
	    bindFriendRequest: function(request) {
		engine.friendRequests[request.id].accept = function() {
		    engine.webSocket.send('ACCEPT_FRIEND_REQUEST', request.id);
		}
		engine.friendRequests[request.id].reject = function() {
		    engine.webSocket.send('REJECT_FRIEND_REQUEST', request.id);
		}
	    },
	    createChannel: function(name) {
		engine.webSocket.send('CREATE_CHANNEL', name);
	    },
	    bindChannel: function(channel) {
		channel.pendingChatMessages =new Array();
		channel.streams = new Array();
		channel.chatMessages = new Array();
		channel.online = true;
		channel.sendChatMessage = function(message) {
		    engine.webSocket.send('CHANNEL_CHAT_MESSAGE', message);
		}
	    },
	    bindChannelInvitation: function(invitation) {
		invitation.accept = function() {
		    engine.webSocket.send('ACCEPT_CHANNEL_INVITATION', invitation.id);
		};
		invitation.reject = function() {
		    engine.webSocket.send('REJECT_CHANNEL_INVITATION', invitation.id);
		};
	    }
	}
	return engine;
    };
    //////////////////////////////////
    // UGLY STUFF
    //////////////////////////////////
    function preferOpus(sdp) {
	var sdpLines = sdp.split('\r\n');
	// Search for m line.
	for (var i = 0; i < sdpLines.length; i++) {
	    if (sdpLines[i].search('m=audio') !== -1) {
		var mLineIndex = i;
		break;
	    }
	}
	if (mLineIndex === null) return sdp;
	// If Opus is available, set it as the default in m line.
	for (var i = 0; i < sdpLines.length; i++) {
	    if (sdpLines[i].search('opus/48000') !== -1) {
		var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
		if (opusPayload) sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
		break;
	    }
	}
	// Remove CN in m line and sdp.
	sdpLines = removeCN(sdpLines, mLineIndex);
	sdp = sdpLines.join('\r\n');
	return sdp;
    }

    function extractSdp(sdpLine, pattern) {
	var result = sdpLine.match(pattern);
	return (result && result.length == 2) ? result[1] : null;
    }
    // Set the selected codec to the first in m line.
    function setDefaultCodec(mLine, payload) {
	var elements = mLine.split(' ');
	var newLine = new Array();
	var index = 0;
	for (var i = 0; i < elements.length; i++) {
	    if (index === 3) // Format of media starts from the fourth.
		newLine[index++] = payload; // Put target payload to the first.
	    if (elements[i] !== payload) newLine[index++] = elements[i];
	}
	return newLine.join(' ');
    }
    // Strip CN from sdp before CN constraints is ready.
    function removeCN(sdpLines, mLineIndex) {
	var mLineElements = sdpLines[mLineIndex].split(' ');
	// Scan from end for the convenience of removing an item.
	for (var i = sdpLines.length - 1; i >= 0; i--) {
	    var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
	    if (payload) {
		var cnPos = mLineElements.indexOf(payload);
		if (cnPos !== -1) {
		    // Remove CN payload from m line.
		    mLineElements.splice(cnPos, 1);
		}
		// Remove CN line in sdp
		sdpLines.splice(i, 1);
	    }
	}
	sdpLines[mLineIndex] = mLineElements.join(' ');
	return sdpLines;
    }
    function mergeConstraints(cons1, cons2) {
	var merged = cons1;
	for (var name in cons2.mandatory) {
	    merged.mandatory[name] = cons2.mandatory[name];
	}
	merged.optional.concat(cons2.optional);
	return merged;
    }
    var sdpConstraints = {
	'mandatory': {
	    'OfferToReceiveAudio': true,
	    'OfferToReceiveVideo': true
	}
    };
    var mediaConstraints = {
	"mandatory": {},
	"optional": []
    };
    var mediaConfig = {
	'audio': true,
	'video': mediaConstraints
    };
})();