(function($){
    $('document').ready(function() {	
	var $chat = $('.Chat');
	var $friends = $('div.Friends');
	var $friendRequests = $('div.FriendRequests');
	var $searchInput = $('.SearchInput');
	var $searchOutput = $('.SearchOutput');
	var selectedUser = null;
	var $channelForm = $('form.Channel');
	var $channelButton = $('submit', $channelForm);
	var $channelInput = $('.ChannelInput', $channelForm);
	var $remoteMedias = $('.RemoteMedias');
	var $localMedias = $('.LocalMedias');
	var $callButton = $('.Camera');
	
	var chat = new Chat($chat);
	chat.onSend = function(message) {
	    if (selectedUser != null) {
		var chatMessage = {
		    recipientId: selectedUser.id,
		    content: message
		};
		selectedUser.sendChatMessage(chatMessage);
	    }
	}
	chat.onstream = function() {
	    if (selectedUser != null) {
		if (selectedUser.receivingLocalStream) {
		    selectedUser.hangUp(function() {
			chat.removeLocalStream(engine.localStream);
			chat.setStreaming(false);
		    });
		} else {
		    selectedUser.call(function() {
			chat.setStreaming(true);
		    });
		}
	    }
	}
	var engine = new Engine($.cookie('id'), $.cookie('uuid'));
	function processFriend(friend) {
	    friend.onstatechanged = function() {
		if (friend.online) {
		    friend.label.removeClass('Offline').addClass('Online');
		} else {
		    friend.label.removeClass('Online').addClass('Offline');
		}
	    }
	    friend.onChatMessage = function() {
		if (selectedUser != null && selectedUser.id == friend.id) {
		    chat.loadMessages(friend.pendingChatMessages);
		    while (friend.pendingChatMessages.length) {
			friend.chatMessages.push(friend.pendingChatMessages.pop());
		    }
		} else {
		    alert('CACAAAAA ! t\'a un message !! CACA il faut cliquer sur l\'user d\'abord !! (CACA DANS LA BOUCHE)');
		}
	    }
	    friend.onstream = function() {
		chat.addRemoteStream(friend.stream);
	    }
	    friend.onlocalstream = function() {
		chat.addLocalStream(engine.localStream);
	    }
	    var $friend = $('<div class="User">'+friend.displayName+'</div>');
	    if (friend.online) {
		$friend.addClass('Online');
	    } else {
		$friend.addClass('Offline');
	    }
	    $friend.click(function() {
		selectedUser = friend;
		chat.clear();
		while (friend.pendingChatMessages.length > 0) {
		    friend.chatMessages.push(friend.pendingChatMessages.pop());
		}	    
		chat.loadMessages(friend.chatMessages);
		chat.setOnline(friend.online);
		if (friend.receivingLocalStream) {
		    chat.addLocalStream(engine.localStream);
		}
		if (friend.stream != null) {
		    chat.addRemoteStream(friend.stream);
		}
	    });
	    friend.streamremoved = function() {
		chat.removeRemoteStream(friend.stream);
	    }
	    friend.label = $friend;
	    $friends.append($friend);
	}
	engine.onnewfriend = function(user) {
	    processFriend(user);
	}
	$searchInput.bind('keyup blur', function() {
	    var value = $searchInput.val();
	    if (value.length > 2) {
		$searchOutput.empty();
		engine.search(value);
	    }
	});
	$channelButton.click(function() {
	    engine.createChannel($channelInput.val());
	    return false;
	});
	engine.oninitialized=function() {
	    $.each(engine.friends, function(index, friendId) {
		processFriend(engine.users[friendId]);
	    });
	};
	engine.onsearchresult = function(users) {
	    $.each(users, function(index, user) {
		var $friend = $('<div class="User">'+user.displayName+'</div>');
		if (user.online) {
		    $friend.addClass('Online');
		} else {
		    $friend.addClass('Offline');
		}
		if (!user.isFriend) {
		    var $add=$('<a class="Add"></a>');
		    $add.click(function() {
			user.makeFriend(user.id); 
		    });
		    $friend.append($add);
		    user.label = $friend;
		}
		$searchOutput.append($friend);
	    });
	};
	engine.onrequestedfriend = function(request) {
	    bindRequestedFriend(request);
	}
	engine.onfriendrequest = function(request) {
	    bindFriendRequest(request);
	};
	
	engine.onnewchannel = function(channel) {
	    bindChannel(channel);
	};
	
	var bindChannel = function(channel) {
	    
	};
	
	var bindFriendRequest = function(request) {
	    request.deleted = function() {
		request.label.remove();
	    }
	    var user = engine.users[request.user];
	    var $accept = $('<div class="AcceptFriendRequest"></div>');
	    $accept.click(function() {
		request.accept();
	    });
	    var $reject = $('<div class="RejectFriendRequest"></div>');
	    $reject.click(function() {
		request.reject();
	    });
	    var $request = $('<div class="User FriendRequest">'+user.displayName+'</div>');
	    if (user.online) {
		$request.addClass('Online');
	    } else {
		$request.addClass('Offline');
	    }
	    $request.append($reject).append($accept);
	    request.onrejected = function() {
		request.label.remove();
	    }
	    request.label = $request;
	    $friendRequests.append($request);
	};
	var bindRequestedFriend = function(request) {
	    $('.Add', engine.foundUsers[request.user].label).remove();
	};
	$('.Form.Join').not('.Inline').each(function() {
	    var $container = $(this);
	    var $form = $('form',$container);
	    $.form($container, {
		validate: function() {
		    var data = $form.serialize();
		    $.ajax({
			url: $form.attr('action'),
			data: data,
			success: function(result) {
			    if (result.code) {
                            
			    } else {
				$.ajax({
				    url: 'http://www.darkengines.net:8080/nexus/login',
				    data: data,
				    success: function(data) {
					if (data.code) {
                                        
					} else {
					    $.cookie('id', data.content.userId);
					    $.cookie('uuid', data.content.uuid);
					    window.location.href = 'test';
					}
				    }
				});
			    }
			}
		    });
		},
		classes: new Array('Accept', 'Error'),
		fields: {
		    email: {
			validate: function(text, callback) {
			    var emailRegExp = new RegExp('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-zA-Z]{2,4}$');
			    if (emailRegExp.test(text)) {
				$.ajax({
				    url: '../nexus/email_available',
				    data: {
					email: text
				    },
				    success: function(data) {
					if (data.code) {
					    callback(false, 'Error', data.content['email']);
					} else {
					    callback(true, 'Accept', 'Correct !');
					}
				    }
				});
			    } else {
				callback(false, 'Error', 'Invalid !');
			    }	
			}
		    },
		    password: {
			validate:function(text, callback) {
			    if (text.length < 4) {
				callback(false, 'Error', 'Invalid !');
			    } else {
				callback(true, 'Accept', 'Correct !');
			    }
			}
		    },
		    display_name: {
			validate:function(text, callback) {
			    var displayNameRegExp = new RegExp('^[A-Za-z0-9 _.-]*$');
			    if (text.length > 3 && text.length < 32 && displayNameRegExp.test(text)) {
				callback(true, 'Accept', 'Correct !');
			    } else {
				callback(false, 'Error', 'Invalid !');
			    }
			}
		    }
		}
	    });
	});
	$('.Hiddable').each(function () {
	    var $container = $(this);
	    var $h3 =  $container.prev();
	    $h3.click(function() {
		$container.toggle('blind'); 
	    });
	});
	$('.Form.Login').not('.Inline').each(function() {
	    var $container = $(this);
	    var $form = $('form',$container);
	    $.form($container, {
		validate: function() {
		    var data = $form.serialize();
		    $.ajax({
			url: 'http://www.darkengines.net:8080/nexus/login',
			data: data,
			success: function(data) {
			    if (data.code) {
                                        
			    } else {
				$.cookie('id', data.content.userId);
				$.cookie('uuid', data.content.uuid);
				window.location.href = 'test';
			    }
			}
		    });
		},
		classes: new Array('Accept', 'Error'),
		fields: {
		    email: {
			validate: function(text, callback) {
			    var emailRegExp = new RegExp('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-zA-Z]{2,4}$');
			    if (emailRegExp.test(text)) {
				callback(true, 'Accept', 'Correct !');
			    } else {
				callback(false, 'Error', 'Invalid !');
			    }	
			}
		    },
		    password: {
			validate:function(text, callback) {
			    if (text.length < 4) {
				callback(false, 'Error', 'Invalid !');
			    } else {
				callback(true, 'Accept', 'Correct !');
			    }
			}
		    }
		}
	    });
	});
	$('.Form.Login.Inline').each(function() {
	    var $container = $(this);
	    var $form = $('form', $container);
	    var result;
	    $('submit', $container).click(function() {
		$.ajax({
		    url: 'www.darkengines.net:8080/nexus/login',
		    data: $form.serialize(),
		    asynch: false,
		    success: function(response) {
			if (response.code) {
			    result = true;
			} else {
			    $.cookie('id', response.content.userId);
			    $.cookie('uuid', response.content.uuid);
			    window.location.href = 'test';
			    result = false;
			}
		    }
		});
		return result;
	    });
	});
	$('.Form').each(function() {
	    var $container = $(this);
	    $('.Field', $container).each(function() {
		var $field = $(this);
		var $input = $('input[type=text], input[type=password]', $field);
		var $label = $('label', $field);
		if ($input.val() != '') $label.hide();
		$input.bind("blur keyup", function() {
		    if ($input.val() == '') {
			$label.show();
		    } else {
			$label.hide();
		    }
		});
		$input.bind("keydown", function() {
		    $label.hide();
		});
	    });
	});
	$('.Table').tabs();
    });
})(jQuery);