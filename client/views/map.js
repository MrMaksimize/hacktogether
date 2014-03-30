///////////////////////////////////////////////////////////////////////////////
// Map display

$(window).resize(function () {
  var h = $(window).height(), offsetTop = 90; // Calculate the top offset
  $mc = $('#map_canvas');
  $mc.css('height', (h - offsetTop));
}).resize();

var map, markers = [ ];



var initialize = function(element, centroid, zoom, features) {
  map = L.map(element, {
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    touchZoom: false
  }).setView(new L.LatLng(centroid[0], centroid[1]), zoom);

  // Location.
  var lc = L.control.locate().addTo(map);
  lc.locate();
  map.on('startfollowing', function() {
    map.on('dragstart', lc.stopFollowing);
  }).on('stopfollowing', function() {
    map.off('dragstart', lc.stopFollowing);
  });

  //L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {opacity: .5}).addTo(map);
  //L.tileLayer('http://{s}.https://a.tiles.mapbox.com/v3/mrmaksimize.hlbm11il/page.html?secure=1#10/18.2404/-66.5339
  L.tileLayer('http://api.tiles.mapbox.com/v3/mrmaksimize.hlbm11il/{z}/{x}/{y}.png', {opacity: .5}).addTo(map);

  // Search + GeoCoding
  var geocoder = new google.maps.Geocoder();

  function googleGeocoding(text, callResponse) {
    geocoder.geocode({address: text}, callResponse);
  }

  function filterJSONCall(rawjson)  {
    var json = {},
	  key, loc, disp = [];

    for (var i in rawjson) {
	  key = rawjson[i].formatted_address;
	  loc = L.latLng( rawjson[i].geometry.location.lat(), rawjson[i].geometry.location.lng() );
	  json[ key ]= loc;	//key,value format
    }
	return json;
  }

	map.addControl( new L.Control.Search({
      callData: googleGeocoding,
	  filterJSON: filterJSONCall,
      markerLocation: false,
      autoType: false,
      autoCollapse: true,
      minLength: 2,
      zoom: 9
	}) );

  // Attribution
  map.attributionControl.setPrefix('');

	var attribution = new L.Control.Attribution();
  attribution.addAttribution("Geocoding data &copy; 2013 <a href='http://open.mapquestapi.com'>MapQuest, Inc.</a>");
  attribution.addAttribution("Map tiles by <a href='http://mapbox.com'>Mapbox Design</a> under <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>.");
  attribution.addAttribution("Data by <a href='http://openstreetmap.org'>OpenStreetMap</a> under <a href='http://creativecommons.org/licenses/by-sa/3.0'>CC BY SA</a>.");

  map.addControl(attribution);
}

var addMarker = function(marker) {
  map.addLayer(marker);
  markers[marker.options._id] = marker;

}


var removeMarker = function(_id) {
  var marker = markers[_id];
  if (map.hasLayer(marker)) map.removeLayer(marker);
}

var createIcon = function(party) {
  var className = 'leaflet-div-icon ';
  className += party.public ? 'public' : 'private';
  return L.divIcon({
    iconSize: [30, 30],
    html: '<b>' + attending(party) + '</b>',
    className: className
  });
}

var openCreateDialog = function (latlng) {
  Session.set("createCoords", latlng);
  Session.set("createError", null);
  Session.set("showCreateDialog", true);
};

Template.map.created = function() {
  Parties.find({}).observe({
    added: function(party) {
      var marker = new L.Marker(party.latlng, {
        _id: party._id,
        icon: createIcon(party)
      }).on('click', function(e) {
        Session.set("selected", e.target.options._id);
      });
      addMarker(marker);
    },
    changed: function(party) {
      var marker = markers[party._id];
      if (marker) marker.setIcon(createIcon(party));
    },
    removed: function(party) {
      removeMarker(party._id);
    }
  });
}


Template.map.rendered = function () {
  // basic housekeeping
  $(window).resize(function () {
    var h = $(window).height(), offsetTop = 90; // Calculate the top offset
    $('#map_canvas').css('height', (h - offsetTop));
  }).resize();

  // initialize map events
  if (!map) {
    initialize($("#map_canvas")[0], [ 18.2500, -66.5000 ], 9);

    map.on("dblclick", function(e) {
      if (! Meteor.userId()) // must be logged in to create parties
        return;

      openCreateDialog(e.latlng);
    });


    var self = this;
    Meteor.autorun(function() {
      var selectedParty = Parties.findOne(Session.get("selected"));
      if (selectedParty) {
        if (!self.animatedMarker) {
          var line = L.polyline([[selectedParty.latlng.lat, selectedParty.latlng.lng]]);
          self.animatedMarker = L.animatedMarker(line.getLatLngs(), {
            autoStart: false,
            distance: 3000,  // meters
            interval: 200, // milliseconds
            icon: L.divIcon({
              iconSize: [50, 50],
              className: 'leaflet-animated-icon'
            })
          });
          map.addLayer(self.animatedMarker);
        } else {
          // animate to here
          var line = L.polyline([[self.animatedMarker.getLatLng().lat, self.animatedMarker.getLatLng().lng],
            [selectedParty.latlng.lat, selectedParty.latlng.lng]]);
          self.animatedMarker.setLine(line.getLatLngs());
          self.animatedMarker.start();
        }
      }
    })
  }
};
