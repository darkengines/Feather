(function($) {
    $('document').ready(function() {
	var $listFriends = $('#listFriends');
	var $chatOutput = $('#chatOutput');
	var $mediaOutput = $('#mediaOutput');
	var $chatOutputWrapper = $('#chatOutputWrapper');
	var $mediaInput = $('#mediaInput');
	var $txtChat = $('#txtChat');
	var $btnChat = $('#btnChat');
	var $btnCamera = $('#btnCamera');
	var $listFoundUsers = $('#listFoundUsers');
	var $listRequestedUsers = $('#listRequestedUsers');
	var $listChannels = $('#listChannels');
	var $listChannelParticipants = $('#listChannelParticipants');
	var $listUserRequests = $('#listUserRequests');
	var $listChannelNotParticipants = $('#listChannelNotParticipants');
	var $listChannelInvitations = $('#listChannelInvitations');
	var $txtSearch = $('#txtSearch');
	var $btnSearch = $('#btnSearch');
	var $txtCreateChannel = $('#txtCreateChannel');
	var $btnCreateChannel = $('#btnCreateChannel');
	var $chatNotifications = $('#chatNotifications');
	
	var engine = new Engine($.cookie('id'), $.cookie('uuid'));
	var selectedUser = null;
	var selectedChannel = null;
	var channelMode = false;
	var remoteMedias= {};
	var localMedias= {};
	
	engine.oninitialized=function() {
	    $.each(engine.friends, function(index, friendId) {
		processFriend(engine.users[friendId]);
	    });
	    $.each(engine.requestedFriends, function(index, request) {
		processRequestedUser(request);
	    });
	    $.each(engine.friendRequests, function(index, request) {
		processFriendRequest(request);
	    });
	    $.each(engine.availableChannels, function(index, channelId) {
		processChannel(engine.channels[channelId]);
	    });
	    $.each(engine.channelInvitations, function(index, invitation) {
		processChannelInvitation(invitation);
	    });
	};
	
	$btnChat.click(function() {
	    sendChatMessage();
	});
	$txtChat.keydown(function(e) {
	    if (e.keyCode == 13) {
		sendChatMessage();
	    }
	});
	$btnCamera.click(function() {
	    if (channelMode) {
		if (selectedUser !=null) {
		    selectedUser.call();
		}
		return;
	    }
	    if (!selectedUser != null)  {
		if (!selectedUser.receivingLocalStream) {
		    selectedUser.call(function() {
			
			});
		} else {
		    selectedUser.hangUp(function() {
			
			});
		}
	    }
	});
	$txtSearch.keydown(function(e) {
	    if (e.keyCode == 13) {
		search();
	    }
	});
	$btnSearch.click(function() {
	    search();
	});
	$btnCreateChannel.click(function() {
	    createChannel();
	});
	$txtCreateChannel.keydown(function(e) {
	    if (e.keyCode == 13) {
		createChannel();
	    }
	});
	engine.onsearchresult = function(users) {
	    processFoundUsers(users);
	};
	engine.onrequestedfriend = function (request) {
	    var user = engine.users[request.userId];
	    if (user.id in engine.foundUsers) {
		engine.foundUsers[user.id].label.remove();
	    }
	    processRequestedUser(request);
	};
	engine.onfriendrequest = function (request) {
	    processUserRequest(request);
	};
	engine.onnewfriend = function(user) {
	    processFriend(user);
	};
	engine.onnewchannel = function(channel) {
	    processChannel(channel);
	};
	engine.onchannelinvitation = function(invitation) {
	    processChannelInvitation(invitation);
	};
	engine.onchannelinvitationsent = function(invitation) {
	    if (selectedChannel != null && selectedChannel.id == invitation.channelId) {
		fillChannelNotParticipantList(engine.channels[invitation.channelId]);
	    }
	};
	function createChannel() {
	    engine.createChannel($txtCreateChannel.val());
	}
	function search() {
	    engine.search($txtSearch.val());
	}
	function sendChatMessage() {
	    if (selectedUser != null && selectedUser.online) {
		var message = $txtChat.text();
		if (channelMode) {
		    selectedUser.sendChatMessage({
			channelId: selectedUser.id,
			content: message
		    });
		} else {
		    selectedUser.sendChatMessage({
			recipientId: selectedUser.id,
			content: message
		    });
		}
		$txtChat.text('');
		$txtChat.focus();
		
	    }
	}
	function processFriend(friend) {
	    friend.onstatechanged = function() {
		if (friend.online) {
		    friend.label.removeClass('Offline').addClass('Online');
		} else {
		    friend.label.removeClass('Online').addClass('Offline');
		}
	    }
	    friend.onChatMessage = function() {
		processChatMessages(friend);
	    }
	    friend.oncall = function() {
		var $offerForm = $('<div>Accept ?</div>');
		var $yes = $('<div>yes</div>');
		var $no = $('<div>no</div>');
		$yes.click(function() {
		    friend.offer();
		});
		$no.click(function() {
		    
		});
		$offerForm.append($yes).append($no);
		$chatNotifications.append($offerForm);
	    };
	    friend.onstream = function() {
		addRemoteStream(friend.stream);
		friend.label.addClass('Streaming');
	    }
	    friend.onlocalstream = function() {
		addLocalStream(engine.localStream);
		$btnCamera.addClass('On');
	    }
	    var $friend = $('<li class="User">'+friend.displayName+'<div class="Icon UserState"></div><div class="Icon CameraState"></div><div class="Icon TalkState"></div></li>');
	    if (friend.online) {
		$friend.addClass('Online');
	    } else {
		$friend.addClass('Offline');
	    }
	    $friend.click(function() {
		channelMode = false;
		selectedUser = friend;
		clearChatOutput();
		while (friend.pendingChatMessages.length > 0) {
		    friend.chatMessages.push(friend.pendingChatMessages.pop());
		}	    
		loadChatMessages(friend);
		$friend.removeClass('Talking');
		$('.Talk', friend.label).remove();
		if (friend.receivingLocalStream) {
		    addLocalStream(engine.localStream);
		    $btnCamera.addClass('On');
		} else {
		    $btnCamera.removeClass('On');
		}
		if (friend.stream != null) {
		    addRemoteStream(friend.stream);
		}
		$('.Selected', $listFriends).removeClass('Selected');
		friend.label.addClass('Selected');
	    });
	    friend.streamremoved = function() {
		removeRemoteStream(friend.stream);
		friend.label.removeClass('Streaming');
	    }
	    friend.localstreamremoved = function() {
		removeLocalStream(engine.localStream);
		$btnCamera.removeClass('On');
	    }
	    friend.label = $friend;
	    $listFriends.append($friend);
	}
	
	function clearChatOutput() {
	    
	    $.each(remoteMedias, function(index, $video) {
		var video = $video.get(0) ;
		video.pause();
		video.src=null;
		video.source=null;
		$video.remove();
		delete remoteMedias[index];
	    });
	    $.each(localMedias, function(index, $video) {
		var video = $video.get(0) ;
		video.pause();
		video.src=null;
		video.source=null;
		$video.remove();
		delete localMedias[index];
	    });
	    $chatOutput.empty();
	    $txtChat.text('');
	}
	
	function addRemoteStream(stream) {
	    var $video = $('<video controls ></video>');
	    remoteMedias[stream.id] = $video;
	    $mediaInput.append($video);
	    var video = $video.get(0);
	    attachMediaStream(video, stream);
	    stream.label = $video;
	    video.play();
	}
	function removeRemoteStream(stream) {
	    var $video = remoteMedias[stream.id];
	    var video = $video.get(0);
	    video.pause();
	    video.src = null;
	    $video.remove();
	    video = null;
	    $video = null;
	}
	function addLocalStream(stream) {
	    var $video = $('<video controls ></video>');
	    localMedias[stream.id] = $video;
	    $mediaOutput.append($video);
	    var video = $video.get(0);
	    attachMediaStream(video, stream);
	    video.play();
	}
	function removeLocalStream(stream) {
	    var $video = localMedias[stream.id];
	    var video = $video.get(0);
	    video.pause();
	    video.src = null;
	    $video.remove();
	    video = null;
	    $video = null
	}
	function processChatMessages(author) {
	    if (!channelMode) {
		if (selectedUser != null && selectedUser.id == author.id) {
		    $.each(author.pendingChatMessages, function(index, message) {
			displayChatMessage(message)
		    });
		    while (author.pendingChatMessages.length) {
			author.chatMessages.push(author.pendingChatMessages.pop());
		    }
		    $('.Talk', selectedUser.label).remove();
		} else {
		    if (author.label.not('.Talking')) {
			author.label.addClass('Talking');
		    }
		}
	    } else {
		if (selectedUser != null && selectedUser.id == author.id) {
		    $.each(author.pendingChatMessages, function(index, message) {
			displayChatMessage(message)
		    });
		    while (author.pendingChatMessages.length) {
			author.chatMessages.push(author.pendingChatMessages.pop());
		    }
		    $('.Talk', selectedUser.label).remove();
		} else {
		    if (author.label.not('.Talking')) {
			author.label.addClass('Talking');
		    }
		}
	    }
	}
	function loadChatMessages(author) {
	    while (author.pendingChatMessages.length) {
		author.chatMessages.push(author.pendingChatMessages.pop());
	    }
	    $.each(author.chatMessages, function(index, message) {
		displayChatMessage(message)
	    });
	}
	function displayChatMessage(chatMessage) {
	    var $message = $('<p></p>').text(chatMessage.author.displayName+': '+chatMessage.content);
	    $chatOutput.append($message);
	    $chatOutputWrapper.animate({
		scrollTop: $chatOutputWrapper.get(0).scrollHeight
	    }, 256);
	}
	function processFoundUsers(users) {
	    $listFoundUsers.empty();
	    $.each(users, function(index, user) {
		var $user = $('<li class="User">'+user.displayName+'</li>');
		$user.click(function() {
		    user.makeFriend(); 
		});
		user.label = $user;
		$listFoundUsers.append($user);
	    });
	}
	function processRequestedUser(request) {
	    var user = engine.users[request.userId];
	    var $user = $('<li class="User">'+user.displayName+'</li>');
	    request.label = $user;
	    request.onaccepted = function() {
		request.label.remove();
	    };
	    $listRequestedUsers.append($user);
	}
	function processFriendRequest(request) {
	    var user = engine.users[request.userId];
	    var $user = $('<li class="User">'+user.displayName+'</li>');
	    $user.click(function() {
		request.accept();
	    });
	    request.label = $user;
	    request.onaccepted = function() {
		request.label.remove();
	    };
	    $listUserRequests.append($user);
	}
	function processChannel(channel) {
	    var $channel = $('<li class="User">'+channel.name+'</li>');
	    $channel.click(function() {
		selectedChannel = channel;
		fillChannelParticipantList(channel);
		fillChannelNotParticipantList(channel);
	    });
	    channel.onnewparticipant = function(user) {
		if (selectedChannel!=null && selectedChannel.id == channel.id) {
		    fillChannelParticipantList(channel);
		    fillChannelNotParticipantList(channel);
		}
	    };
	    $listChannels.append($channel);
	    var $channelUser = $('<li class="User">'+channel.name+'</li>');
	    channel.onChatMessage = function() {
		processChatMessages(channel);
	    };
            channel.onstream = function(userId) {
		addRemoteStream(channel.streams[userId]);
	    };
            channel.onlocalstream = function() {
		addLocalStream(engine.localStream);
		$btnCamera.addClass('On');
            };
            channel.oncall = function(userId) {
		var $offerForm = $('<div>Accept ?</div>');
		var $yes = $('<div>yes</div>');
		var $no = $('<div>no</div>');
		$yes.click(function() {
		    channel.offer(userId);
		});
		$no.click(function() {
		    
		});
		$offerForm.append($yes).append($no);
		$chatNotifications.append($offerForm);
	    };
	    $channelUser.click(function() {
		channelMode = true;
		selectedUser = channel;
		clearChatOutput();
		while (channel.pendingChatMessages.length > 0) {
		    channel.chatMessages.push(channel.pendingChatMessages.pop());
		}	    
		loadChatMessages(channel);
		$channelUser.removeClass('Talking');
		$('.Talk', channel.label).remove();
		if (channel.receivingLocalStream) {
		    addLocalStream(engine.localStream);
		    $btnCamera.addClass('On');
		} else {
		    $btnCamera.removeClass('On');
		}
		if (channel.streams.length) {
		    $.each(channel.streams, function(index, stream) {
			addRemoteStream(channel.stream); 
		    });
		}
		$('.Selected', $listFriends).removeClass('Selected');
		channel.label.addClass('Selected');
	    });
	    channel.label = $channelUser;
	    $listFriends.append($channelUser);
	}
	function processChannelInvitation(invitation) {
	    var channel = engine.channels[invitation.channelId];
	    var $invitation = $('<li class="User">'+channel.name+'</li>');
	    $invitation.click(function() {
		invitation.accept();
	    });
	    invitation.accepted = function() {
		$invitation.remove();
	    };
	    invitation.label = $invitation;
	    $listChannelInvitations.append($invitation);
	    
	}
	function fillChannelParticipantList(channel) {
	    $listChannelParticipants.empty();
	    $.each(channel.participants, function(index, userId) {
		var user = engine.users[userId];
		var item = $('<li class="User">'+user.displayName+'</li>');
		$listChannelParticipants.append(item);
	    });
	}
	function fillChannelNotParticipantList(channel) {
	    $listChannelNotParticipants.empty();
	    var userIds = {};
	    var invitedUsers = {};
	    $.each(channel.invitations, function(index, invitation) {
		invitation = engine.channelInvitations[invitation];
		invitedUsers[invitation.userId] = invitation.userId;
	    });
	    $.each(engine.friends, function(index, id) {
		if (!(id in channel.participants) && !(id in invitedUsers)) {
		    userIds[id] = id;
		}
	    });
	    $.each(userIds, function(index, userId) {
		var user = engine.users[userId];
		var $item = $('<li class="User">'+user.displayName+'</li>');
		$item.click(function() {
		    user.sendChannelInvitation(channel.id);
		})
		$listChannelNotParticipants.append($item);
	    });
	}
	$('div.Container').each(function() {
	    var $container = $(this);
	    $('div.Content.Middle', $container).each(function() {
		var $container = $(this);
		$('div.Controls ul li.Control', $container).click(function() {
		    var $this = $(this);
		    if ($this.not('.Selected')) {
			var id = $this.attr('data-table');
			var $table = $('.Table.Selected');
			$table.removeClass('Selected');
			$table = $('#'+id);
			$table.addClass('Selected');
			$('div.Controls ul li.Control.Selected', $container).removeClass('Selected');
			$this.addClass('Selected');
		    }
		});
	    });			
	});
	$('input[type=text], input[type=password]').each(function() {
	    var $txt = $(this);
	    var $label = $txt.prev();
	   
	    if ($label.is('label')) {
		if ($txt.val().length) {
		    $label.hide();
		} else {
		    $label.show();
		}
		$txt.bind('keyup blur', function() {
		    if ($txt.val().length) {
			$label.hide();
		    } else {
			$label.show();
		    }
		});
	    }
	});
    });
})(jQuery);