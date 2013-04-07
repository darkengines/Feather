(function(){
    Chat = function($root) {
	var chat = {
	    root: $root,
	    textContent: $('.Output .TextContent'),
	    inputTextContent: $('.Input .TextContent'),
	    input: $('.Input'),
	    sendButton: $('.Input .Send'),
	    localMediasContainer: $('.LocalMedias'),
	    remoteMediasContainer: $('.RemoteMedias'),
	    notifications: $('.Notifications'),
	    callButton: $('.Camera'),
	    streaming: false,
	    remoteMedias: {},
	    localMedias: {},
	    online: false,
	    
	    setOnline: function(b) {
		chat.online = b;
		if (b) {
		    chat.inputTextContent.attr('contenteditable', 'true');
		    $root.removeClass('Offline');
		} else {
		    chat.inputTextContent.attr('contenteditable', 'false');
		    $root.addClass('Offline');
		}
	    },
	    
	    setStreaming: function(b) {
		chat.streaming = b;
		if (b) {
		    chat.callButton.removeClass('Off').addClass('On');
		} else {
		    chat.callButton.removeClass('On').addClass('Off');
		}
	    },
	    
	    loadMessages: function(messages) {
		$.each(messages, function(index, message) {
		    var $message = $('<p class="ChatMessage"></p>');
		    $message.text(message.author.displayName+': '+message.content);
		    chat.textContent.append($message) ;
		});
	    },
	    clear: function() {
		chat.inputTextContent.empty();
		chat.textContent.empty();
		$.each(chat.remoteMedias, function(index, $video) {
		   var video = $video.get(0) ;
		   video.pause();
		   video.src=null;
		   video.source=null;
		   $video.remove();
		   delete chat.remoteMedias[index];
		});
		$.each(chat.localMedias, function(index, $video) {
		   var video = $video.get(0) ;
		   video.pause();
		   video.src=null;
		   video.source=null;
		   $video.remove();
		   delete chat.localMedias[index];
		});
	    },
	    addRemoteStream: function(stream) {
		var $video = $('<video></video>');
		chat.remoteMedias[stream.id] = $video;
		chat.remoteMediasContainer.append($video);
		var video = $video.get(0);
		attachMediaStream(video, stream);
		stream.label = $video;
		video.play();
	    },
	    removeRemoteStream: function(stream) {
		var $video = chat.remoteMedias[stream.id];
		var video = $video.get(0);
		video.pause();
		video.src = null;
		$video.remove();
		video = null;
		$video = null
	    },
	    addLocalStream: function(stream) {
		var $video = $('<video></video>');
		chat.localMedias[stream.id] = $video;
		chat.localMediasContainer.append($video);
		var video = $video.get(0);
		attachMediaStream(video, stream);
		video.play();
	    },
	    removeLocalStream: function(stream) {
		var $video = chat.localMedias[stream.id];
		var video = $video.get(0);
		video.pause();
		video.src = null;
		$video.remove();
		video = null;
		$video = null
	    }
	};
	chat.inputTextContent.keyup(function(e) {
	    if (chat.online) {
		if (e.keyCode == 13) {
		    chat.onSend(chat.inputTextContent.text());
		    chat.inputTextContent.text('');
		}	
	    }
	    return false;
	});
	chat.sendButton.click(function() {
	    if (chat.online) {
		chat.onSend(chat.inputTextContent.text());
		chat.inputTextContent.text('');
	    }
	    return false;
	});
	chat.callButton.click(function() {
	    if (chat.online) {
		chat.onstream();
	    }
	});
	chat.input.scroll(function() {
	    chat.sendButton.css('top', 2 + chat.input.scrollTop());
	});
	return chat;
    }
})();