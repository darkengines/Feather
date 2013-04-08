(function($) {
    $('document').ready(function() {
	var $listFriends = $('#listFriends');
	var $chatOutput = $('#chatOutput');
	var $txtChat = $('#txtChat');
	var $btnChat = $('#btnChat');
	
	var engine = new Engine($.cookie('id'), $.cookie('uuid'));
	var selectedUser = null;
	var remoteMedias= {};
	var localMedias= {};
	
	engine.oninitialized=function() {
	    $.each(engine.friends, function(index, friendId) {
		processFriend(engine.users[friendId]);
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
	function sendChatMessage() {
	    if (selectedUser != null && selectedUser.online) {
		var message = $txtChat.text();
		selectedUser.sendChatMessage({
		    recipientId: selectedUser.id,
		    content: message
		});
		$txtChat.empty();
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
	    }
	    friend.onlocalstream = function() {
		addLocalStream(engine.localStream);
	    }
	    var $friend = $('<li class="User">'+friend.displayName+'<div class="Controls"></div></li>');
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
		$('.Talk', friend.label).remove();
		if (friend.receivingLocalStream) {
		    addLocalStream(engine.localStream);
		}
		if (friend.stream != null) {
		    addRemoteStream(friend.stream);
		}
		$('.Selected', $listFriends).removeClass('Selected');
		friend.label.addClass('Selected');
	    });
	    friend.streamremoved = function() {
		removeRemoteStream(friend.stream);
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
	    $txtChat.empty();
	}
	
	function addRemoteStream(stream) {
	    var $video = $('<video></video>');
	    remoteMedias[stream.id] = $video;
	    $chatOutput.append($video);
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
	    $video = null
	}
	function addLocalStream(stream) {
	    var $video = $('<video></video>');
	    localMedias[stream.id] = $video;
	    $chatOutput.append($video);
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
		    var $message = $('<p></p>').text(author.displayName+': '+message);
		    $chatOutput.append($message);
		});
		while (author.pendingChatMessages.length) {
		    author.chatMessages.push(author.pendingChatMessages.pop());
		}
		$('.Talk', selectedUser.label).remove();
	    } else {
		$('.Controls', author.label).append($('<div class="Talk"></div>'));
	    }
	}
	function loadChatMessages(author) {
	    while (author.pendingChatMessages.length) {
	        author.chatMessages.push(author.pendingChatMessages.pop());
	    }
	    $.each(author.chatMessages, function(index, message) {
		var $message = $('<p></p>').text(author.displayName+': '+message);
		$chatOutput.append($message);
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
    });
})(jQuery);