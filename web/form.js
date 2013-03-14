(function($){
    $.extend({
	form: function($form, args) {
	    var fieldRefreshCallback = function($field, classe, message) {
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
	    $.each(args.fields, function(i, field) {
		var $input = $('input[name='+i+']', $form);
		var $field = $input.parent();
		$input.bind('keyup blur', function() {
		    args.fields[i].validate($input.val(), function(cl, msg) {
			fieldRefreshCallback($field, cl, msg);
		    });
		});
	    });
	}
    });
})(jQuery);