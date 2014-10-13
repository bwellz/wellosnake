'use strict';
/*global $:false */

angular.module('core').controller('IndexController', ['$scope', '$timeout',
	function($scope, $timeout) {
		function resize_func() {
			// Calculate window size
			var window_height = Math.ceil(window.innerHeight);
			var window_width = Math.ceil(window.innerWidth);

			// Calculate a relative header_height (applied to both headers)
			var header_height = window_width/40.0;
			$('.main_nav').height(header_height+'px');
			$('#canvas_head').height(header_height+'px');
			
			// Subtract the header height from the window_height and use that as a starting guess for the canvas
			window_height -= header_height*2;
			$scope.canvas_width = window_width;
			
			// apply a notional 4:3 aspect ratio
			$scope.canvas_height = $scope.canvas_width*0.75;

			// if the calculated height exceeds the allowed window_height, restrict by height instead
			if ( $scope.canvas_height > window_height ) {
				$scope.canvas_height = window_height;
				$scope.canvas_width = window_height*1.33333;	
				// ensure there is no extra padding when restricted by height
				$('#canvas_container').css('padding','0');		
			} else {
				// vertically center the canvas container when restricted by width
				$('#canvas_container').css('padding',(window_height-$scope.canvas_height)/2+'px 0');				
			}

			// set remaining properties that need to be set
			$('.canvas_layer').width($scope.canvas_width)
			$('#canvas_container').height($scope.canvas_height+$('#canvas_head').height());
			
			// dynamically calculate relative font size to keep it static
			$scope.header_font_size = window_width/700.0;
			$scope.overlay_font_size = $scope.canvas_width/600.0;
			// apply all these snazzy scope changes
			$scope.$apply();
		}

		// call the resize function when first loaded and when resized
		$timeout(function(){
			resize_func();		
		},100);
		$(window).resize(function() {
			resize_func();				
		});		
	}
]);