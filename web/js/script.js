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
	var $listUserRequests = $('#listUserRequests');
	var $txtSearch = $('#txtSearch');
	var $btnSearch = $('#btnSearch');
	
	var engine = new Engine($.cookie('id'), $.cookie('uuid'));
	var selectedUser = null;
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
	    if (selectedUser != null)  {
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
	engine.onsearchresult = function(users) {
	    processFoundUsers(users);
	}
	engine.onrequestedfriend = function (request) {
	    var user = engine.users[request.user];
	    if (user.id in engine.foundUsers) {
		engine.foundUsers[user.id].label.remove();
	    }
	    processRequestedUser(request);
	}
	engine.onfriendrequest = function (request) {
	    processUserRequest(request);
	}
	engine.onnewfriend = function(user) {
	    processFriend(user);
	}
	function search() {
	    engine.search($txtSearch.val());
	}
	function sendChatMessage() {
	    if (selectedUser != null && selectedUser.online) {
		var message = $txtChat.text();
		selectedUser.sendChatMessage({
		    recipientId: selectedUser.id,
		    content: message
		});
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
	    var $video = $('<video></video>');
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
	    var $video = $('<video></video>');
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
	    $chatOutputWrapper.animate({ scrollTop: $chatOutputWrapper.get(0).scrollHeight}, 256);
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
	    var user = engine.users[request.user];
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
    });
})(jQuery);