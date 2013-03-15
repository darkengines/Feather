(function($){
    $.extend({
	form: function($form, args) {
	    var fieldRefreshCallback = function(field, $field, valid, classe, message) {
		field.valid = valid;
		var $result = $('.Result', $field);
		var classes = args.classes;
		$result.empty();
		$.each(classes, function(i, c) {
		    if ($result.hasClass(c)) {
			$result.removeClass(c)
			return false;
		    }
		});
		$result.text(message).addClass(classe);
	    };
            var formRefreshCallback = function(result) {
                $.each(result, function(i, field) {
                    var $input = $('input[name='+i+']', $form);
                    var $field = $input.parent();
                    var f = args.fiels[i];
                    fieldRefreshCallback(field, $field,field.valid, field.cl, field.msg);
                });
            }
	    $.each(args.fields, function(i, field) {
		var $input = $('input[name='+i+']', $form);
		var $field = $input.parent();
		field.valid = false;
		$input.bind('keyup blur', function() {
		    args.fields[i].validate($input.val(), function(valid, cl, msg) {
			fieldRefreshCallback(field, $field,valid, cl, msg);
		    });
		});
	    });
	    $('input[type=submit]', $form).click(function() {
		var result = true;
		$.each(args.fields, function(i, field) {
		    var $input = $('input[name='+i+']', $form);
		    var $field = $input.parent();
		    args.fields[i].validate($input.val(), function(valid, cl, msg) {
			fieldRefreshCallback(field, $field, valid, cl, msg);
		    });
		    result = result && field.valid;
		});
		if (!result) {
		    $(this).effect("pulsate", "slow");
		} else {
                    args.validate(formRefreshCallback);
                }
		return false;
	    });
	}
    });
})(jQuery);