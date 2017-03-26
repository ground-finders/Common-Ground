angular.module('etapartments')
.directive('anchorBar', function($timeout) {
  return {
    link: function(scope, element, attrs, controller) {
        var options = {
          types: [],
        };
        
        
        $timeout(function() {
          controller.initAutocomplete(options, element[0].children[0].children[0].children[0], element)}, 1000);      
        },
    scope: {
      sendanchor: '<'
    },
    controllerAs: 'anchor',
    bindToController: true,
    controller: 'AnchorBar',
		templateUrl: 'client/htmlTemplates/anchorBar.html'
  } 
})

.controller('AnchorBar', function($scope, $window) {
  this.sendandclear = function() {
    $scope.anchor.sendanchor($scope.anchor.name, $scope.anchor.address, $scope.anchor.city, $scope.anchor.state, $scope.anchor.zip, $scope.anchor.travel_mode);
    $scope.anchor.name = '';
    $scope.anchor.address = '';
    $scope.anchor.city = '';
    $scope.anchor.state = '';
    $scope.anchor.zip = '';
    $scope.anchor.travel_mode = 'driving';
    $scope.anchor.query = '';
  };

  this.autocomplete;
  this.initAutocomplete = function(options, input, element) {
    this.autocomplete = new $window.google.maps.places.Autocomplete(input, options);
    this.addListener(element);
  }.bind(this);

  this.addListener = function(element) {
    $window.google.maps.event.addListener(this.autocomplete, 'place_changed', function() {
        $scope.$apply(function() {
          $scope.anchor.fillInAddress(element);
        });
    });
  }.bind(this);

  this.fillInAddress = function(element) {
    var place = this.autocomplete.getPlace();
    
    this.name = place.name;
    this.address = place.address_components[0].long_name + ' ' + place.address_components[1].long_name;
    this.city = place.address_components[3].long_name;
    this.state = place.address_components[5].short_name;
    this.zip = parseInt(place.address_components[7].long_name);

  }.bind(this);
});