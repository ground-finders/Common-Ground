angular.module('etapartments')
.directive('mapDisplay', function() {
  
  return {
    scope: {
      anchors: '<',
      results: '<',
      center: '<'
    },
    controllerAs: 'gmap',
    bindToController: true,
    controller: 'MapCtrl',
    templateUrl: 'client/htmlTemplates/map.html'
  }
})

.controller('MapCtrl', function($scope, $window, $timeout) {

  this.options = {
    start: {lng: -122.41, lat: 37.78},
    minZoom: 5,
    maxZoom: 19,
    zoom: 11
  }

  this.lastWindow = null;
  this.markers = [];
  this.anchorsList = [];

  this.addPoints = function (map, locations){
    // Clear markers array
    this.markers = [];
    
    var marker, i
    // Loop through all locations
    for (i = 0; i < locations.length; i++) {  
      // Create a new marker object

      var pos = {lat: locations[i].coordinates.latitude, lng: locations[i].coordinates.longitude}
      var marker = new $window.google.maps.Marker({
        // marker.map sets which map to set marker on
        // marker.position takes an object with lat, lng properties  
        map: map, position: pos , icon: '/client/images/marker.png' 
      });

      // Store marker in markers array for later retrieval
      this.markers.push(marker);
      this.bounds.extend(pos);

      // content is the HTML we want to render inside the infowindow
      // var content = '<div class="infoWindow"><p><a class="infoWindowLink" href="' + locations[i].url + '" target="_blank"><h4>' + locations[i].name + '</h4></a></p><img class="infoWindowImg" src="' + locations[i].image_url + '"><div class="infoWindowBlock"><span class="infoWindowLabel">Address:</span> ' + locations[i].location.display_address[0] + '<br>' + locations[i].location.display_address[1] + '</div><br><div class="infoWindowBlock"><span class="infoWindowLabel">Phone:</span> ' + locations[i].display_phone + '</div></div>'
      var content = '<a href=' + locations[i].url + 'target="_blank"><h4>' + locations[i].name + '</h4></a><br><div class="row"><div class="col-md-4"><img class="entryImg pull-left" src=' + locations[i].image_url + '></div><div class="col-md-6"><address><strong>Address</strong><br>' + locations[i].location.display_address[0] + '<br>' + locations[i].location.display_address[1] + '<br><strong>Phone</strong><br>' + locations[i].display_phone + '</address></div></div>'
      // Create InfoWindow object   
      var infowindow = new $window.google.maps.InfoWindow();

      // Add an event listener to listen for a click on a marker
      // Uses closure to retain access to individual content
      $window.google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
        return function() {
        // Close the previous infowindow
        this.closeInfos();
        // Set the contents of infowindow to our HTML content
        infowindow.setContent(content);
        // Display the infowindow for clicked marker
        infowindow.open(map,marker);
        // Keep the marker to close it on next click event
        this.lastWindow = infowindow;
        }.bind(this);
      }.bind(this))(marker, content, infowindow));
    }
  }.bind(this);

  this.addAnchors = function (map, anchors){
    var marker, i
    // Loop through all anchors
    for (i = 0; i < anchors.length; i++) {  
      // Create a new marker object
      var marker = new $window.google.maps.Marker({
        // marker.map sets which map to set marker on
        // marker.position takes an object with lat, lng properties  
        map: map, position: {lat: anchors[i].coordinates.lat, lng: anchors[i].coordinates.lng}, icon: '/client/images/anchor.png'
      });

      // Store marker in anchors array for later retrieval
      this.anchorsList.push(marker);
      this.bounds.extend({lat: anchors[i].coordinates.lat, lng: anchors[i].coordinates.lng});

      // content is the HTML we want to render inside the infowindow
      var content = '<div class="infoWindow"><p><h2>' + anchors[i].name + '</h2></p><div class="infoWindowBlock"><span class="infoWindowLabel">Address:</span> ' + anchors[i].address + '</div></div>';

      // Create InfoWindow object   
      var infowindow = new $window.google.maps.InfoWindow();

      // Add an event listener to listen for a click on a marker
      // Uses closure to retain access to individual content
      $window.google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
        return function() {
        // Close the previous infowindow
        this.closeInfos();
        // Set the contents of infowindow to our HTML content
        infowindow.setContent(content);
        // Display the infowindow for clicked marker
        infowindow.open(map,marker);
        // Keep the marker to close it on next click event
        this.lastWindow = infowindow;
        }.bind(this);
      }.bind(this))(marker, content, infowindow));
    }
  }.bind(this);

  this.closeInfos = function (){
   if(this.lastWindow){
      // Detach the infowindow from the marker
      this.lastWindow.set("marker", null);
      // Close the marker
      this.lastWindow.close();
      // Reset infos
      this.lastWindow = null;
   }
  }.bind(this);

  this.deleteMarkers = function(array) {
    // Go through each marker in  array
    for (var i = 0; i < array.length; i++) {
      // Unlink marker from map
      array[i].setMap(null);
    }
    // Then clear  array
    array = [];
  }.bind(this);

  // Wait for the Google Maps API call to finish loading before trying to instantiate the maps object
 window.createMap = function() {
    $scope.map = new $window.google.maps.Map(document.getElementById('mapWindow'), {
      center: this.options.start,
      minZoom: this.options.minZoom,
      maxZoom: this.options.maxZoom,
      zoom: this.options.zoom
    })

    this.bounds = new $window.google.maps.LatLngBounds();

    // Wait for Yelp to return results which will trigger addPoints()
    $scope.$watch('gmap.results', function() {
      // If markers length > 0
      if (this.markers.length > 0) {
        // We need to delete markers
        this.deleteMarkers(this.markers);
        // Then recenter map accordingly
        $scope.map.setCenter($scope.gmap.center)
      }
      // Then add new points
      this.addPoints($scope.map, $scope.gmap.results);
      //adjust bounds when markers are added
      if (this.markers.length > 0) {
        $scope.map.fitBounds(this.bounds);
      }
    }.bind(this), true);

    $scope.$watch('gmap.anchors', function() {
      // If anchors are already rendered
      if (this.anchorsList.length > 0) {
        // Delete all anchors
        this.deleteMarkers(this.anchorsList);
      }
      // If anchors need to be rendered
      if ($scope.gmap.anchors.length > 0) {
        // Set the center of the map to the most recent centroid
        $scope.map.setCenter($scope.gmap.anchors[$scope.gmap.anchors.length - 1].centroid);
        // Get current bounds of viewport
        this.bounds = new $window.google.maps.LatLngBounds();
        // Loop through anchors
        for (var i = 0; i < $scope.gmap.anchors.length; i++) {
          // Extend the bounds to fit the anchor
          this.bounds.extend($scope.gmap.anchors[i].coordinates);
        }
        // Set the bounds of the map to the newly extended bounds
        $scope.map.fitBounds(this.bounds);

      }
      // Finally, add all anchors
      this.addAnchors($scope.map, $scope.gmap.anchors);
    }.bind(this), true);

    $scope.$on('showResultOnMap', function(event, index) {
      // This waits for a 'showResultOnMap' broadcast from app
      // Once triggered, it will trigger a click event on the marker which will show the infowindow associated with that marker
      $window.google.maps.event.trigger(this.markers[index], 'click');
    }.bind(this));

  }.bind(this);
})