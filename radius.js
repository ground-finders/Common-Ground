//finds a suitable radius given a set of coordinates
//coords should be an array of coordinates of the form: (latitude, longitude)

//computes the distance formula for all possible pairs of points
//returns the maximum * 2

var radius = function (coords) {
  var matrix = [];
  for (var i = 0 ; i<coords.length; i++) {
    var row = [];
    for (var j = 0; j<coords.length; j++) { 
      row.push(Math.sqrt(Math.pow((coords[i][0] + coords[j][0]), 2) +
                         Math.pow((coords[i][1] + coords[j][1]), 2)));
    }
    matrix.concat(row);
  }
  var rad = max(matrix);
  return Math.floor(rad*2);
}

var max = function(array) {
  return array.reduce(function(prev, curr) {
    return curr > prev ? curr : prev;
  });
}

