// Variable for topographical map tiles
let tileBase = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  }
);

// Map object with tile base
let mainMap = L.map("map", {
  center: [40.7, -94.5],
  zoom: 3
});

tileBase.addTo(mainMap);

// Fetch geoJSON data for earthquakes
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {

  // Function to style earthquake data
  function dataStyle(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: determineColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Function to determine color based on earthquake depth
  function determineColor(depth) {
    switch (true) {
      case depth > 90:
        return "#ea2c2c"; // red
      case depth > 70:
        return "#ea822c"; // bright orange
      case depth > 50:
        return "#ee9c00"; // orange peel
      case depth > 30:
        return "#eecc00"; // yellow
      case depth > 10:
        return "#d4ee00"; // green-tinted yellow
      default:
        return "#98ee00"; // green
    }
  }

  // Function to determine circle radius based on earthquake magnitude
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
  }

  // Process geoJSON data
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: dataStyle,
    onEachFeature: function(feature, layer) {
      layer.bindPopup(
        "Magnitude: " +
        feature.properties.mag +
        "<br>Depth: " +
        feature.geometry.coordinates[2] +
        "<br>Location: " +
        feature.properties.place
      );
    }
  }).addTo(mainMap);

  // Legend control object
  let legend = L.control({
    position: "bottomright"
  });

  // Add legend details
  legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");

    let grades = [-10, 10, 30, 50, 70, 90];
    let colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"
    ];

    // Loop through to generate legend labels
    for (let i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Add legend to map
  legend.addTo(mainMap);
});
