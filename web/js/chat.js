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
	    remoteMedias: new Array(),
	    localMedias: new Array(),
	    
	    setOnline: function(b) {
		if (b) {
		    $root.addClass('Online');
		} else {
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
	    if (e.keyCode == 13) {
		chat.onSend(chat.inputTextContent.text());
		chat.inputTextContent.text('');
	    }
	});
	chat.sendButton.click(function() {
	    chat.onSend(chat.inputTextContent.text());
	    chat.inputTextContent.text('');
	});
	chat.callButton.click(function() {
	    chat.onstream();
	});
	chat.input.scroll(function() {
	    chat.sendButton.css('top', 2 + chat.input.scrollTop());
	});
	return chat;
    }
})();