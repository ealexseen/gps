const status = document.getElementById('status');
const socket = io();
let map;
let flag = true;

ymaps.ready(function () {
  map = new ymaps.Map("map", {
    center: [55.76, 37.64],
    zoom: 12
  });

  start();
  update();
});

function success(res) {
  const {
    coords: {
      latitude,
      longitude
    }
  } = res;

  status.textContent = `latitude: ${latitude}, longitude: ${longitude}`;

  if (flag) {
    map.setCenter(
      [latitude, longitude]
    );

    flag = false;
  }

  var myPlacemark = new ymaps.GeoObject({
    geometry: {
      type: "Point",
      coordinates: [latitude, longitude]
    }
  });

  map.geoObjects
    .removeAll()
    .add(myPlacemark);

  socket.emit('message', [latitude, longitude]);
}

socket.on('message', function (data) {
  map.geoObjects.removeAll();

  data.forEach(function (coord) {
    map.geoObjects
      .add(
        new ymaps.GeoObject({
          geometry: {
            type: "Point",
            coordinates: coord
          }
        })
      );
  });
});

function error(err) {
  console.log(err);
}

function start() {
  if(!navigator.geolocation) {
    status.textContent = 'Geolocation is not supported by your browser';
  } else {
    status.textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition(success, error);
  }
}

function update() {
  setInterval(function () {
    navigator.geolocation.getCurrentPosition(success, error);
  }, 1000);
}

