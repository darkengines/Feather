var remoteMedia = null;
var remoteStream = null;
var pc1 = null;
var pc2 = null;
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
(function () {
    $(document).ready(function () {
        var uuid = $.cookie('uuid');
        var callRequests = new Array();
        var localStream = null;
        var $socket = $.websocket('ws://www.darkengines.net:8080/conference/websocket?uuid=' + uuid, {
            interval: 5000,
            open: function () {
                $socket.send('GET_ONLINE_USERS');
            },
            close: function () {

            },
            events: {
                GET_ONLINE_USERS: function (e) {
                    var userList = e;
                    var length = userList.length;
                    while (length--) {
                        var user = userList[length];
                        var $item = $('<li data-user-id="' + user.id + '"><b>' + user.displayName + '</b></li>');
                        $item.click(function () {
                            var $this = $(this);
                            $socket.send('CALL_REQUEST', {
                                calleeId: user.id
                            });
                        });
                        $('ul.UserList').append($item);
                    }
                },
                OFFLINE_USER: function (e) {
                    $('ul.UserList li[data-user-id="' + e.id + '"]').remove();
                },
                ONLINE_USER: function (e) {
                    var $item = $('<li data-user-id="' + e.id + '"><b>' + e.displayName + '</b></li>');
                    $item.click(function () {
                        var $this = $(this);
                        $socket.send('CALL_REQUEST', {
                            calleeId: e.id
                        });
                    });
                    $('ul.UserList').append($('<li data-user-id="' + e.id + '"><b>' + e.displayName + '<b></li>'));
                },
                CHAT_MESSAGE: function (e) {
                    $('div.Chat div.Messages').append($('<p><b>' + e.author.displayName + '</b>: ' + e.content + '</p>'));
                },
                CALL_REQUEST: function (e) {
                    var caller = e.caller;
                    var callee = e.callee;
                    if (caller.id == $.cookie('id')) {
                        callRequests.push(e);
                    } else {
                        var answer = confirm('Answer to ' + caller.displayName + ' ?');
                        if (answer) {
                            var pc1 = createPeerConnection();
                            pc1.onicecandidate = function (event) {
                                if (event.candidate) {
                                    $socket.send('ICE_CANDIDATE', {
                                        uuid: e.uuid,
                                        userId: caller.id,
                                        iceCandidate: event.candidate
                                    })
                                }
                            };
                            pc1.onaddstream = function (event) {
				$('video.RemoteMedia').show();
                                remoteMedia = $('video.RemoteMedia').get(0);
                                remoteStream = event.stream;
				attachMediaStream(remoteMedia, remoteStream);
                                remoteMedia.play();
                            };
                            getUserMedia(mediaConfig, function (stream) {
                                pc1.addStream(stream);
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
                                pc1.createOffer(function (localDescription) {
                                    e.peer = pc1;
				    localDescription.sdp = preferOpus(localDescription.sdp);
                                    pc1.setLocalDescription(localDescription);
                                    callRequests.push(e);
                                    $socket.send('CALL_RESPONSE', {
                                        callerId: caller.id,
                                        calleeId: callee.id,
                                        uuid: e.uuid,
                                        localDescription: localDescription
                                    });
                                }, null, constraints);
                            }, userMediaError);
                        } else {
                            $socket.send('CALL_RESPONSE', {
                                response: false
                            });
                        }
                    }
                },
                CALL_RESPONSE: function (e) {
                    var size = callRequests.length;
                    var found = 0;
                    while (!found && size--) {
                        found = callRequests[size].uuid == e.uuid;
                    }
                    if (found) {
                        if (callRequests[size].caller.id == $.cookie('id')) {
                            var pc2 = createPeerConnection();
                            callRequests[size].peer = pc2;
                           
                            var sessionDescription = new RTCSessionDescription(e.localDescription);
			    pc2.setRemoteDescription(sessionDescription);
                            pc2.onaddstream = function (event) {
				$('video.RemoteMedia').show();
                                remoteMedia = $('video.RemoteMedia').get(0);
                                remoteStream = event.stream;
                                attachMediaStream(remoteMedia, remoteStream);
                                remoteMedia.play();
                            };
			     pc2.onicecandidate = function (event) {
                                if (event.candidate) {
                                    $socket.send('ICE_CANDIDATE', {
                                        uuid: e.uuid,
                                        userId: callRequests[size].callee.id,
                                        iceCandidate: event.candidate
                                    });
                                }
                            };
                            getUserMedia(mediaConfig, function (stream) {
                                pc2.addStream(stream);
                                pc2.createAnswer(function (localDescription) {
				    e.peer = pc2;
				    localDescription.sdp = preferOpus(localDescription.sdp);
				    pc2.setLocalDescription(localDescription);
                                    
                                       $socket.send('CALL_RESPONSE', {
                                        callerId: e.calleeId,
                                        calleeId: e.callerId,
                                        uuid: e.uuid,
                                        localDescription: localDescription
                                    });
                                }, null, sdpConstraints);
                            }, userMediaError);

                        } else {
                            var pc = callRequests[size].peer;
                            var sessionDescription = new RTCSessionDescription(e.localDescription);
                            pc.setRemoteDescription(sessionDescription);
                            callRequests[size].peer = pc;
                        }
                    }
                },
                ICE_CANDIDATE: function (e) {
                    var size = callRequests.length;
                    var found = 0;
                    while (!found && size--) {
                        found = callRequests[size].uuid == e.uuid;
                    }
                    if (found) {
                        callRequests[size].peer.addIceCandidate(new RTCIceCandidate(e.iceCandidate));
                    }
                }
            }
        });
        $('div.Chat').each(function () {
            var $container = $(this);
            var $input = $('input.ChatInput[type=text]', $container);
            $input.keyup(function (e) {
                var content = $input.val();
                if (content != '' && e.keyCode == 13) {
                    $socket.send('CHAT_MESSAGE', {
                        content: content
                    });
                    $input.val('');
                }
            });
        });
    });
})(jQuery);

function userMediaError(error) {

}

function mergeConstraints(cons1, cons2) {
    var merged = cons1;
    for (var name in cons2.mandatory) {
        merged.mandatory[name] = cons2.mandatory[name];
    }
    merged.optional.concat(cons2.optional);
    return merged;
}

function createPeerConnection() {
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
}

function onGotLocalDescription(localDescription) {
    var userInfo = {
        uuid: $.cookie('uuid'),
        sessionDescription: localDescription
    };
    socket.send(JSON.stringify(userInfo));
}

function initialize() {
    console.log('initializing...');
    console.log('initializing media');

    var mediaConfig = {
        'video': true,
        'audio': true
    };
    navigator.webkitGetUserMedia(mediaConfig, onUserMediaSuccess);

}

var localStream = null;

function onUserMediaSuccess(stream) {
    console.log('getUserMedia success');
}

function onGotRemoteDescription(remoteDescription) {
    pc1.setRemoteDescription(remoteDescription);
    pc2.setLocalDescription(remoteDescription);
}

function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }
}

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