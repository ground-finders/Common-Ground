angular.module('etapartments')
.directive('autocomplete', function ($window, $timeout) {
	return {
	    link: function(scope, element, attrs, controller) {
	    	var options = {
	    		types: [],
	    	};
	    	
    		
    		$timeout(function() {controller.setAutocomplete(options, element[0].children[0], element)}, 1000);
    		
	    	},
	    
	    controllerAs: 'autocomplete',
	    bindToController: true,
		controller: 'autocompleteCtrl',
		templateUrl: 'client/htmlTemplates/autocomplete.html'
	}
})
.controller('autocompleteCtrl', function($scope, $window, $timeout) {
	this.gPlace;
	this.setAutocomplete = function(options, input, element) {
		this.gPlace = new $window.google.maps.places.Autocomplete(input, options);
		this.addListener(element);
	}.bind(this);

	this.addListener = function(element) {
		$window.google.maps.event.addListener(this.gPlace, 'place_changed', function() {
	    	this.fillInAddress();

		}.bind(this))
	}.bind(this);

	this.fillInAddress = function() {
		var place = this.gPlace.getPlace();
		console.log(place);
	}
	

})