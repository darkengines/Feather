(function(){
    Chat = function($root) {
	var chat = {
	    root: $root,
	    input: $('.Input', $root),
	    textContent: $('.TextContent'),
	    localMedias: $('.LocalMedias'),
	    remoteMedias: $('.RemoteMedias'),
	    notifications: $('.Notifications'),
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
	    }
	};
	chat.input.keyup(function(e) {
	    if (e.keyCode == 13) {
		chat.onSend(chat.input.text());
		chat.input.text('');
	    }
        });
	return chat;
    }
})();