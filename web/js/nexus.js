(function($) {
    $(document).ready(function() {
	
	var ChatMessageNotificationHtmlTemplate = '<div class="ChatMessageNotification"></div>';
	
	var $chatOutput = $('div.Chat div.Output');
	var $chatCallNotification = $('div.Chat div.Output div.Notification .CallNotification');
	var $chatMessageNotification = $('div.Chat div.Output div.Notification .MessageNotification');
	var $chatOutputText = $('div.Chat div.Output .TextContent');
	var $chatOutputHeader = $('div.Chat div.Header');
	var $chatInputText = $('div.Chat div.Input');
	var $camera = $('div.Chat div.Options a.Camera');
	var $users = $('div.Users');
	var $localVideo = $('<video class="Local" autoplay="true" muted="true" controls="true"></video>');
	var $localMedias = $('.LocalMedias');
	var $remoteMedias = $('.RemoteMedias');
	var selectedRecipient = null;
	var $searchResult = $('.SearchResult');
	var $engine = $.engine();
	
	$('.Hiddable').each(function() {
	   var $content = $(this);
	   var $button = $content.prev();
	   $button.click(function() {
	       $content.toggle('blind', 'slow');
	   })
	});
	
	$camera.click(function() {
	    if (selectedRecipient != null) {
		selectedRecipient.call({
		    
		})
	    }
	    return false;
	})
	
	$chatInputText.keyup(function(e) {
	    if (selectedRecipient != null) {
		if (e.keyCode == 13) {
		    selectedRecipient.sendChatMessage($chatInputText.text());
		    $chatInputText.empty();
		    return false;
		}
	    } 
	});
	
	$engine.onlineUsers = function(users) {
	    $(users).each(function(index, user) {
		addUser(user)
	    });
	};
	$engine.sendingLocalStream = function() {
	    refreshLocalStream();
	};
	$engine.onlineUser = function(user) {
	    addUser(user);
	}
	$engine.searchResult = function(results) {
	    $searchResult.empty();
	    $.each(results, function() {
		var user = this;
		var $add=$('<div class="Add"></div>');
		$add.click(function() {
		   $engine.makeFriend(user.id); 
		});
		var $userItem = $('<div class="User Contrast">'+user.displayName+'</div>');
		$userItem.append($add);
		$searchResult.append($userItem);
	    });
	}
	$engine.onlineFriend = function(friend) {
	    addUser(friend);
	}
	$('.Form.Search').each(function() {
	    var $container = $(this);
	    var $input = $('input', $container);
	    $input.bind('keyup blur', function() {
		var value = $input.val();
		if (value.length > 2) {
		    $engine.searchUserByEmail(value);
		}
	    });
	})
	
	function addUser(user) {
	    var $user = $('<div class="Contrast User"><table><tr><td class="DisplayName">'+user.displayName+'</td><td class="ChatMessageNotification"></td></tr></table></div>');
	    if (!user.online) {
                $user.addClass('Offline');
            } else {
		$user.addClass('Online');
	    }
            user.label = $user;
	    $user.click(function() {
		if (selectedRecipient == null || selectedRecipient.id != user.id) {
		    selectedRecipient = user;
		    selectedRecipientChanged(selectedRecipient);
		}
	    });
	    user.offline = function() {
		$user.remove();
		$user = null;
		selectedRecipient = null;
	    };
	    user.chatMessage = function(pendingChatMessages) {
		if (selectedRecipient!=null && selectedRecipient.id == user.id) {
		    writePendingChatMessages(pendingChatMessages);
		} else {
		    refreshUserLabel(user);
		}
	    };
	    user.streamAdded = function(stream) {
		if (selectedRecipient!=null && selectedRecipient.id == user.id) {
		    refreshRemoteStreams(new Array(user.stream));
		}
	    };
	    user.streamRemoved = function(stream) {
		if (selectedRecipient!=null && selectedRecipient.id == user.id) {
		    refreshRemoteStreams(new Array());
		}
	    };
	    user.onHangUp = function() {
		refreshChat();
	    };
	    user.answered = function() {
		displayHangUpForm(user);
	    };
	    user.offer = function() {
		if (selectedRecipient!=null && selectedRecipient.id == user.id) {
		    displayCallForm(user);
		}
	    };
	    $users.append($user);
	}
	
	function refreshUserLabel(user) {
	    var pendingMessagesLength = user.pendingChatMessages.length;
	    $('.ChatMessageNotification', user.label).each(function(index, element) {
		var $notification = $(element);
		if (pendingMessagesLength) {
		    $notification.text('('+pendingMessagesLength+')');
		    $notification.effect("bounce", "slow");
		} else {
		    $notification.text('');
		}
	    })
	    
	}
	
	function selectedRecipientChanged(recipient) {
	    refreshChat();
	    refreshUserLabel(recipient);
	}
	
	function refreshChat() {
	    refreshStreams();
	    refreshMessages();
	    refreshNotifications();
	}
	
	function refreshStreams() {
	    var user = selectedRecipient;
	    refreshLocalStream();
	    var streams = new Array();
	    if (user.stream != null) {
		streams.push(user.stream);
	    }
	    refreshRemoteStreams(streams);
	}
	function refreshLocalStream() {
	    var user = selectedRecipient;
	    var $localVideo = $('.LocalVideo', $localMedias);
	    if (user.receivingLocalStream && $engine.localStream != null) {
		if ($localVideo.length == 0) {
		    $localVideo = $('<video autoplay="true" controls="true" class="LocalVideo"></video>');
		    $localMedias.append($localVideo);
		}
		if (typeof($localVideo.attr('src')) == 'undefined' || $localVideo.attr('src') == '') {
		    attachMediaStream($localVideo.get(0), $engine.localStream);
		}
	    } else {
		if ($localVideo.length) {
		    $localVideo.get(0).pause();
		    $localVideo.attr('src', 'pause');
		    $localVideo.remove();
		    $localVideo = null;
		}
	    }
	}
	function refreshRemoteStreams(streams) {
	    var $remoteVideos = $('video', $remoteMedias);
	    var i = 0;
	    var videosLen = $remoteVideos.length;
	    var streamsLen = streams.length;
	    
	    while (i < streamsLen) {
		var remoteVideo = null;
		if (i < videosLen) {
		    remoteVideo = $remoteVideos.get(i);
		} else {
		    var $remoteVideo = $('<video autoplay="true" controls="true" class="RemoteVideo"></video>');
		    $remoteMedias.append($remoteVideo);
		    remoteVideo = $remoteVideo.get(0);
		}
		attachMediaStream(remoteVideo, streams[i]);
		remoteVideo.play();
		i++;
	    }
	    
	    while (i<videosLen) {
		$remoteVideos.get(i).pause();
		$remoteVideos.attr('src', '');
		$remoteVideos.remove();
		$remoteVideos = null;
		i++;
	    }
	}
	function refreshMessages() {
	    var user = selectedRecipient;
	    $chatOutputText.empty();
	    writePendingChatMessages(user.pendingChatMessages);
	}
	function refreshNotifications() {
	    var user = selectedRecipient;
	    $chatCallNotification.empty();
	    if (user.pendingOffer != null) {
		displayCallForm();
	    }
	}
	
	function writePendingChatMessages(pendingChatMessages) {
	    while (pendingChatMessages.length > 0) {
		var message = pendingChatMessages.pop();
		$chatOutputText.append($('<p class="Text">'+message.author.displayName+': '+message.content+'</p>'));
	    }
	    $chatOutput.animate({
		scrollTop: $chatOutput[0].scrollHeight
	    }, 100);
	}
	
	function displayCallForm(user) {
	    var user = selectedRecipient;
	    var $question = $('<span>Answer to '+user.displayName+'\'s call ? </span>');
	    var $yes = $('<a href="#">Accept</a>');
	    var $no = $('<a style="margin-left: 10px;" href="#">Reject</a>');
	    $yes.click(function() {
		user.answer();
		$chatCallNotification.empty();
		var $hangup = $('<a href="false">Hang up</a>');
		$hangup.click(function() {
		    user.hangUp();
		    return false;
		});
		$chatCallNotification.append($('<span>Communication established</span>')).append($hangup);
		return false;
	    });
	    $no.click(function() {
		$chatCallNotification.empty();
		return false;
	    })
	    $chatCallNotification.empty();
	    $chatCallNotification.append($question).append($yes).append($no);
	}
	
	function displayHangUpForm(user) {
	    $chatCallNotification.empty();
	    var $hangup = $('<a href="false">Hang up</a>');
	    $hangup.click(function() {
		user.hangUp();
		return false;
	    });
	    $chatCallNotification.append($('<span>Communication established</span>')).append($hangup);
	}
	
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
				    url: 'http://127.0.0.1:8080/nexus/login',
				    data: data,
				    success: function(data) {
					if (data.code) {
                                        
					} else {
					    $.cookie('id', data.content.id);
					    $.cookie('uuid', data.content.uuid);
					    window.location.href = 'nexus.html';
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
	$('.Form.Login').not('.Inline').each(function() {
	    var $container = $(this);
	    var $form = $('form',$container);
	    $.form($container, {
		validate: function() {
		    var data = $form.serialize();
		    $.ajax({
			url: 'http://127.0.0.1:8080/nexus/login',
			data: data,
			success: function(data) {
			    if (data.code) {
                                        
			    } else {
				$.cookie('id', data.content.id);
				$.cookie('uuid', data.content.uuid);
				window.location.href = 'nexus.html';
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
		    url: '127.0.0.1:8080/nexus/login',
		    data: $form.serialize(),
		    asynch: false,
		    success: function(response) {
			if (response.code) {
			    result = true;
			} else {
			    $.cookie('id', response.content.id);
			    $.cookie('uuid', response.content.uuid);
			    window.location.href = 'nexus.html';
			    result = false;
			}
		    }
		});
		return result;
	    });
	});
    });
})(jQuery);