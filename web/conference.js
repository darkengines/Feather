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
	$('.Join').each(function() {
	    var $container = $(this);
	    var $email = $('input[name=email]', $container);
	    var $password = $('input[name=password]', $container);
	    var $displayName = $('input[name=display_name]', $container);
	    var $emailResult = $('.Result', $email.parent());
	    var $passwordResult = $('.Result', $password.parent());
	    var $displayNameResult = $('.Result', $displayName.parent());
	    var emailRegExp = new RegExp('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-zA-Z]{2,4}$');
	    var displayNameRegExp = new RegExp('^[A-Za-z0-9 _.-]*$');
	    $email.bind('keyup blur', function() {
		if (emailRegExp.test($email.val())) {
		    $.ajax({
			url: '../nexus/email_available',
			data: {
			    email: $email.val()
			},
			success: function(data) {
			    if (data.code) {
				$emailResult.removeClass('Accept').addClass('Error').text(data.content['email']);
			    } else {
				$emailResult.removeClass('Error').addClass('Accept').text('Email correct');
			    }
			}
		    });
		} else {
		    $emailResult.removeClass('Accept').addClass('Error').text('Invalid email');
		}	
	    });
	    $password.bind('keyup blur', function() {
		if ($password.val().length < 4) {
		    $passwordResult.removeClass('Accept').addClass('Error').text('Invalid password');
		} else {
		    $passwordResult.removeClass('Error').addClass('Accept').text('Password correct');
		}	
	    });
	    $displayName.bind('keyup blur', function() {
		if ($displayName.val().length > 3 && $displayName.val().length < 32 && displayNameRegExp.test($displayName.val())) {
		    $displayNameResult.removeClass('Error').addClass('Accept').text('Display name correct');
		} else {
		    $displayNameResult.removeClass('Accept').addClass('Error').text('Invalid display name');
		}	
	    });
	});
    });
})(jQuery);