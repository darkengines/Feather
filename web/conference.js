(function() {
    $(document).ready(function() {
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
	$.form($('.Join'), {
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
})(jQuery);