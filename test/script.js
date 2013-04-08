(function($) {
	$('document').ready(function() {
		$('div.Container').each(function() {
			var $container = $(this);
			$('div.Content.Middle', $container).each(function() {
				var $container = $(this);
				$('div.Controls ul li.Control', $container).click(function() {
					$this = $(this);
					if ($this.not('.Selected')) {
						var id = $this.attr('data-table');
						var $table = $('.Table.Selected');
						$table.removeClass('Selected');
						$table = $('#'+id);
						$table.addClass('Selected');
						$('div.Controls ul li.Control.Selected', $container).removeClass('Selected');
						$this.addClass('Selected');
					}
				});
			});			
		});
	});
})(jQuery);