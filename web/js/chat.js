(function(){
    Chat = function($root) {
	var chat = {
	    root: $root,
	    input: $('.Input', $root),
	    textContent: $('.TextContent'),
	    localMedias: $('.LocalMedias'),
	    remoteMedias: $('.RemoteMedias'),
	    notifications: $('.Notifications'),
	    callButton: $('.Camera'),
	    streaming: false,
	    
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
		chat.input.empty();
		chat.textContent.empty();
	    },
	    addRemoteStream: function(stream) {
		var $video = $('<video></video>');
		chat.remoteMedias.append($video);
		var video = $video.get(0);
		attachMediaStream(video, stream);
		video.play();
	    },
	    removeRemoteStream: function() {
		var $video = $('video', chat.remoteMedias);
		var video = $video.get(0);
		video.pause();
		video.src = null;
		$video.remove();
		video = null;
		$video = null
	    },
	    addLocalStream: function(stream) {
		var $video = $('<video></video>');
		chat.localMedias.append($video);
		var video = $video.get(0);
		attachMediaStream(video, stream);
		video.play();
	    },
	    removeLocalStream: function() {
		var $video = $('video', chat.localMedias);
		var video = $video.get(0);
		video.pause();
		video.src = null;
		$video.remove();
		video = null;
		$video = null
	    }
	};
	chat.input.keyup(function(e) {
	    if (e.keyCode == 13) {
		chat.onSend(chat.input.text());
		chat.input.text('');
	    }
        });
	chat.callButton.click(function() {
	    chat.onstream();
	}); 
	return chat;
    }
})();