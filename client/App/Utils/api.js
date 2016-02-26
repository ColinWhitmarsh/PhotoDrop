var api = {
  login(username, password) {
    var user = { username: username, password: password };
    var url = 'http://162.243.130.124:8000/login';
    return fetch(url, {
      method: "POST",
      body: JSON.stringify(user)
    });
  },

  signup(username, password) {
    var user = { username: username, password: password };
    return fetch('http://162.243.130.124:8000/signup', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  },

  checkJWT(JWT, callback) {
    var url = 'http://162.243.130.124:8000/checkJWT/' + JWT;
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function(userData) { // handle error here for some reason catch was not working
      if (userData.status === 404) console.log('Problem with GET request for JWT');
      else callback(userData._bodyInit);
    });
  },

  uploadPhoto(data, latitude, longitude, userId) {
    var url = 'http://162.243.130.124:8000/imgUpload';
    return fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: data,
        latitude: latitude,
        longitude: longitude,
        userId: userId
      })
    }).catch(function(err) { console.log(err) });
  },

  fetchPhotos(latitude, longitude, radius, callback) {
    var url = 'http://162.243.130.124:8000/fetchPhotos?lat=' + latitude + '&lon=' + longitude + '&radius=' + radius;
    return fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function(photos) {
        callback(photos._bodyInit);
      })
      .catch(function(err) {
        console.log(err);
      });
  },

  fetchLocations(latitude, longitude, latdelta, londelta, callback) {
    var url = 'http://162.243.130.124:8000/fetchLocations?lat=' + latitude + '&lon=' + longitude + '&latdelta=' + latdelta + '&londelta=' + londelta;
    return fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function(photos) {
        callback(photos._bodyInit);
      })
      .catch(function(err) {
        console.log(err);
      });
  }
};

module.exports = api;
