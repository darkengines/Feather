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
(function($){
    
    $.extend({
	user: function(id, displayName) {
	    var user = {
		id: id,
		displayName: displayName,
		pendingOffer: null,
		pendingChatMessages: new Array(),
		iceCandidates: new Array(),
		emptyIceCandidateCount: 0,
		peer: null,
		receivingLocalStream: false,
		stream: null,
                online: false,
                reverseFriendship: false,
		
		reset : function() {
		    user.pendingOffer = null;
		    user.emptyIceCandidateCount = null;
		    if (user.peer != null) {
			user.peer.close();
			user.peer = null;
		    }
		    user.receivingLocalStream = false;
		    user.stream = null;
		},
		
		call: function() {
		    alert("NOT SUPPORTED");
		},
		answer: function() {
		    alert("NOT SUPPORTED");
		},
		offer: function() {
		    alert("NOT SUPPORTED");
		},
		sendChatMessage: function(message) {
		    alert("NOT SUPPORTED");
		},
		chatMessage: function(pendingChatMessages) {
		    alert("NOT SUPPORTED");
		},
		streamAdded: function(stream) {
		    alert('NOT SUPPORTED');
		},
		streamRemoved: function(stream) {
		    alert('NOT SUPPORTED');
		},
		onHangUp: function() {
		    alert('NOT SUPPORTED');
		},
		answered: function() {
		    alert('NOT SUPPORTED');
		},
		hangUp: function() {
		    alert('NOT SUPPORTED');
		},
		stateChanged: function() {
		    alert('NOT SUPPORTED');
		},
		offline: null
	    }
	    return user;
	}
    });
    
    $.extend({
	engine: function() {
	    var engine = {
		_onlineUsers: new Array(),
		onlineUsers: null,
		onlineUser: null,
		offlineUser: null,
		localStream:null,
		sendingLocalStream: function(stream) {
		    alert('NOT SUPPORTED');
		},
		isNewUser: function(user) {
		   var id = user.id;
		   var found = false;
		   $.each(engine._onlineUsers, function(i, u) {
		      found = (u.id == id) ? u : false;
		      return !found;
		   });
		   return found;
		},
		websocket: $.websocket('ws://192.168.0.3:8080/nexus/websocket?uuid='+$.cookie('uuid'), {
		    interval: 5000,
		    open: function () {
			engine.websocket.send('GET_FRIENDS');
		    },
		    close: function () {
						
		    },
		    events: {
			GET_FRIENDS: function(users) {
			    $(users).each(function(index, user) {
				engine.bindUser(user);
			    });
			    engine.onlineUsers(engine._onlineUsers);
			},
			ONLINE_FRIEND: function(user) {
			    var localUser = isNewUser(user);
			    if (localUser) {
				localUser.online = user.online;
				engine.stateChanged(localUser);
			    } else {
				localUser = engine.bindUser(user);
				engine.onlineUser(localUser);
			    }
			    
			},
			OFFLINE_FRIEND: function(user) {
			    var indices = new Array();
			    $(engine._onlineUsers).each(function(index, localUser) {
				if (user.id == localUser.id) {
				    indices.push(index);
				}
			    });
			    $(indices).each(function(index, toRemoveIndex) {
				var toRemoveUser = engine._onlineUsers[toRemoveIndex];
				engine._onlineUsers.splice(toRemoveIndex , 1);
				if (toRemoveUser.stream != null) {
				    toRemoveUser.stream = null;
				}
				toRemoveUser.reset();
				toRemoveUser.onHangUp();
				toRemoveUser.offline();
			    });
			},
			CHAT_MESSAGE: function(chatMessage) {
			    if ($.cookie('id') == chatMessage.author.id) {
				$(engine._onlineUsers).each(function(index, user) {
				    if (user.id == chatMessage.recipient.id) {
					user.pendingChatMessages.push(chatMessage);
					user.chatMessage(user.pendingChatMessages);
					return false;
				    }
				});
			    } else {
				$(engine._onlineUsers).each(function(index, user) {
				    if (user.id == chatMessage.author.id) {
					user.pendingChatMessages.push(chatMessage);
					user.chatMessage(user.pendingChatMessages);
					return false;
				    }
				});
			    }
			},
			OFFER: function(offer) {
			    $(engine._onlineUsers).each(function(index, user) {
				if (user.id == offer.caller.id) {
				    user.pendingOffer = offer;
				    user.offer();
				    return false;
				}
			    });
			},
			ANSWER: function(answer) {
			    $(engine._onlineUsers).each(function(index, user) {
				if (user.id == answer.callee.id && user.peer != null) {
				    user.peer.setRemoteDescription(new RTCSessionDescription(answer.description));
				    user.answered();
				    return false;
				}
			    });
			},
			ICE_CANDIDATE: function(iceCandidate) {
			    $(engine._onlineUsers).each(function(index, user) {
				if (user.id == iceCandidate.author.id) {
				    if (user.peer == null) {
					user.iceCandidates.push(new RTCIceCandidate(iceCandidate.iceCandidate));
				    } else {
					user.peer.addIceCandidate(new RTCIceCandidate(iceCandidate.iceCandidate))
				    }
				    return false;
				}
			    });
			},
			HANGUP: function(hangUp) {
			    $(engine._onlineUsers).each(function(index, user) {
				if (user.id == hangUp.author.id) {
				    if (user.peer != null) {
					user.stream = null;
					user.peer.close();
					user.peer = null;
				    }
				    return false;
				}
			    });
			},
			SEARCH: function(results) {
			    engine.searchResult(results);
			}
		    }
		}),
		searchResult: function() {
		    alert('NOT SUPPORTED');
		},
		searchUserByEmail: function(raw) {
		    engine.websocket.send('SEARCH', raw);
		},
		makeFriend: function(target) {
		    engine.websocket.send('MAKE_FRIEND', target);
		},
		bindUser: function(user) {
		    var localUser = $.user(user.id, user.displayName);
		    localUser.online = user.online;
		    engine._onlineUsers.push(localUser);
		    localUser.sendChatMessage = function(message) {
			engine.websocket.send('CHAT_MESSAGE', {
			    recipient: {
				id: localUser.id					    
			    },
			    content: message
			})
		    };
		    localUser.call = function(params) {
			localUser.peer = engine.createPeerConnection();
			localUser.peer.onicecandidate = function(e) {
			    engine.onIceCandidate(e, localUser);
			};
			localUser.peer.onaddstream = function(e) {
			    localUser.stream = e.stream;
			    localUser.streamAdded(e.stream);
			    localUser.receivingLocalStream = true;
			};
			localUser.peer.onremovestream = localUser.streamRemoved;
			engine.doGetUserMedia(function(stream) {
			    engine.localStream = stream;
			    localUser.peer.addStream(engine.localStream);
			    localUser.receivingLocalStream = true;
			    engine.sendingLocalStream();
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
			    localUser.peer.createOffer(function(description) {
				engine.onGotLocalDescription(description, localUser, 'OFFER');
			    }, null, constraints) ;
			});
		    };
		    localUser.answer = function() {
			if (localUser.pendingOffer != null) {
			    localUser.peer = engine.createPeerConnection();
			    localUser.peer.onicecandidate = localUser.peer.onicecandidate = function(e) {
				engine.onIceCandidate(e, localUser);
			    };
			    localUser.peer.onaddstream = function(e) {
				localUser.stream = e.stream;
				localUser.streamAdded(e.stream);
				localUser.receivingLocalStream = true;
			    }
			    localUser.peer.onremovestream = localUser.streamRemoved;
			    localUser.peer.setRemoteDescription(new RTCSessionDescription(localUser.pendingOffer.description));
			    while (localUser.iceCandidates.length) {
				localUser.peer.addIceCandidate(localUser.iceCandidates.pop());
			    }
			    engine.doGetUserMedia(function(stream) {
				engine.localStream = stream;
				localUser.receivingLocalStream = true;
				engine.sendingLocalStream(stream);
				localUser.peer.addStream(engine.localStream);
				engine.sendingLocalStream();
				localUser.peer.createAnswer(function(description) {
				    engine.onGotLocalDescription(description, localUser, 'ANSWER');				    
				})
			    });
			    localUser.pendingOffer = null;
			}
		    };
		    localUser.hangUp = function() {
			if (localUser.peer != null) {
			    localUser.peer.removeStream(engine.localStream);
			    localUser.stream = null;
			    localUser.peer.close();
			    localUser.peer = null;
			}
		    }
		    return localUser;
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
			var pc = new RTCPeerConnection(null, pc_constraints);
		    } catch (e) {
			return;
		    }
		    return pc;
		},
		onIceCandidate: function(e, user) {
		    if (e.candidate) {
			engine.websocket.send('ICE_CANDIDATE', {
			    recipient: {
				id: user.id
			    },
			    iceCandidate: e.candidate
			})
		    } else {
			user.emptyIceCandidateCount++;
			if (user.emptyIceCandidateCount > 16) {
			    user.stream = null;
			    user.peer.close;
			    user.peer = null;
			    user.onHangUp();
			    user.emptyIceCandidateCount = 0;	
			}
		    }
		},
		onGotLocalDescription: function(description, user, type) {
		    var caller, callee;
		    switch (type) {
			case ('OFFER'): {
			    caller = {
				id: $.cookie('id')
			    }
			    callee = {
				id: user.id
			    }
			    break;
			}
			case ('ANSWER'): {
			    caller = {
				id: user.id
			    }
			    callee = {
				id: $.cookie('id')
			    }
			    break;
			}
			default: {
			    throw new Exception(type+' not supported');
			}
		    }
		    description.sdp = preferOpus(description.sdp);
		    user.peer.setLocalDescription(description);
		    engine.websocket.send(type, {
			caller: caller,
			callee: callee,
			description: description
		    });
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
			function() {
			    alert('GET USER MEDIA FAILURE')
			});
		    }
		}
	    }
	    return engine;
	}
	    
    });
    
    
    //////////////////////////////////
    // STUPID STUFF
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
})(jQuery);
