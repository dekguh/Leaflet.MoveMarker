/* eslint-disable no-prototype-builtins */
/* eslint-disable no-undef */
/**
 * author: I Kadek Teguh Mahesa
 * github: https://github.com/dekguh
 * license: MIT
 * repo: https://github.com/dekguh/L.MoveMarker
 * copyright 2022
 */

/**
 * @class L.MotionMarker
 * @aka L.motionMarker
 * @inherits L.Marker 
 */
L.MotionMarker = L.Marker.extend({
  options: {
    animate: true,
    duration: 5000, // in milliseconds
    followMarker: false,
    hideMarker: false,
    rotateMarker: false,
    rotateAngle: 0, // face to east
    speed: 0, // in km
  },
  
  /**
     * @param {Array<[latlng], [latlng]>} latlngs 
     * @param {Object} options
     */
  initialize: function (latlngs, options) {
    L.Marker.prototype.initialize.call(this, latlngs[0], options);
  
    // state
    this._movingEnded = false;
  
    // lat lng
    this._prevLatLng = latlngs[0];
    this._nextLatLng = latlngs[1];
  
    // marker
    this._animate = this.options.animate;
    this._rotateMarker = this.options.rotateMarker;
  
    // using speed as duration
    if(this.options.speed > 0) {
      this._speed = this.options.speed;
      this._convertSpeedToDuration();
    } else {
      this._duration = this.options.duration;
    }
  
    // init rotate marker
    if(this._rotateMarker) {
      this._rotateAngle = this.options.rotateAngle;
      this._tempRotateAngle = 0; // default is 210 deg
    }
  },
  
  /**
     * when marker added to map
     */
  onAdd: function (map) {
    L.Marker.prototype.onAdd.call(this, map);
  
    if(this._nextLatLng) {
      // update temp lat lng
      this._updateTempLatLng(this._prevLatLng, this._nextLatLng);
  
      this._animStartTime = performance.now();
      this._animStartTimeStamp = performance.now();
      this._doAnimation();
    }
  
    // when first create and hideMarker is true
    if(this.options.hideMarker) this.hideMarker(true);
  },
  
  /**
     * when marker removed from map
     */
  onRemove: function(map) {
    L.Marker.prototype.onRemove.call(this, map);
    !this._movingEnded && L.Util.cancelAnimFrame(this._frameAnimId);
    this._movingEnded = true;
  },
  
  /**
     * learn more https://github.com/dekguh/interpolate-x-y-animate
     * @param {Array<lat, lng>} p1 
     * @param {Array<lat, lng>} p2 
     * @param {Number} duration 
     * @param {Number} t 
     * @returns L.latLng
     */
  _interpolatePosition: function(p1, p2, duration, t) {
    var k = t/duration;
    k = (k > 0) ? k : 0;
    k = (k > 1) ? 1 : k;
    return L.latLng(p1[0] + k * (p2[0] - p1[0]),
      p1[1] + k * (p2[1] - p1[1]));
  },
  
  /**
     * to update marker position
     * @param {Array<Number>} nextLatLng in array [lat, lng]
     * @param {Object} options { duration, speed, rotateAngle }
     */
  moveTo: function (nextLatLng, options = {}) {
    this._nextLatLng = nextLatLng;
    this._animStartTime = performance.now();
    this._animStartTimeStamp = performance.now();
  
    // update temp lat lng
    this._updateTempLatLng(this._prevLatLng, nextLatLng);
  
    // check if have duration
    if(options.hasOwnProperty('duration')) {
      this._duration = options.duration;
    }
  
    // check if have speed
    if(options.hasOwnProperty('speed')) {
      this._speed = options.speed;
      this._convertSpeedToDuration();
    }
  
    // check if rotateMarker active
    if(this._rotateMarker && this._rotateAngle !== options.rotateAngle) {
      this._rotateAngle = options.rotateAngle;
    }
  
    this._doAnimation();
  },
  
  /**
     * follow the marker (need more improve)
     * recommended just 1 marker have a options followMarker TRUE
     */
  _followMarker: function () {
    var followDuration = this._animate ? this._duration/1000 : 0;
    this._map.setView(this._nextLatLng, this._map.getZoom(), {
      duration: followDuration + 1,
      animate: true,
    });
  },
  
  /**
   * this is used for enable/disable marker
   * @param {boolean} value 
   */
  disableFollowMarker: function (value) {
    this.options.followMarker = value;

    if(!this._map) return;
    if(!this._nextLatLng) return;
    if(this._movingEnded) return;

    // current position at current time
    var currentTimestamp = performance.now();
    var elapsedTime = currentTimestamp - this._animStartTime;
    var currentPosition = this._interpolatePosition(
      this._prevLatLng,
      this._nextLatLng,
      this.options.duration,
      elapsedTime
    );
    
    if (value && !this._movingEnded) {
      // move to current position at current time
      this._map.setView([currentPosition.lat, currentPosition.lng], this._map.getZoom(), {animate: false});

      // then run animate
      var followDuration = this._animate ? this._duration/1000 : 0;
      this._map.setView(this._nextLatLng, this._map.getZoom(), {
        duration: followDuration + 1,
        animate: true,
      });
    } else if (!value && !this._movingEnded) {
      this._map.setView([currentPosition.lat, currentPosition.lng], this._map.getZoom(), {animate: false});
    }
  },
  
  /**
     * update prev lat lng
     */
  _updatePrevLatLng: function () {
    this._prevLatLng = this._nextLatLng;
  },
  
  /**
     * convert speed (km) to miliseconds
     * EX: 20km/h = 18000 ms
     */
  _convertSpeedToDuration: function () {
    // convert KM/H to M/S
    var speedKmToMeter = (this._speed * 1000)/3600;
  
    // distance (return in meters)
    var distanceStreet = L.latLng(this._prevLatLng[0], this._prevLatLng[1]).distanceTo({
      lat: this._nextLatLng[0],
      lng: this._nextLatLng[1]
    });
  
    // update duration
    this._duration = Number((distanceStreet/speedKmToMeter).toFixed(0)) * 1000;
  },
  
  /**
     * rotate marker (need more improve)
     * must using L.divIcon with html: '<div>your code</div>'
     * heading icon must facing to east/right
     */
  _doRotation: function () {
    if(this._rotateAngle === this._tempRotateAngle) return;

    if(this.options.rotateMarker) {
      this._icon.childNodes[0].style.transformOrigin = 'center';
  
      // for modern browsers, prefer the 3D accelerated version
      this._icon.childNodes[0].style.transform = 'rotate(' + this._rotateAngle + 'deg)';
      this._icon.childNodes[0].style.transition = 'transform .2s';
    }

    this._tempRotateAngle = this._rotateAngle;
  },
  
  _doAnimation: function () {
    this._movingEnded = false;
  
    // do rotation marker
    if(this.options.rotateMarker) {
      this._doRotation();
    }
  
    // follow marker
    if(this.options.followMarker) {
      this._followMarker();
    }
  
    // disable animation
    if(!this._animate && !this._movingEnded) {
      this.setLatLng({
        lat: this._nextLatLng[0],
        lng: this._nextLatLng[1]
      });
      this._movingEnded = true;
      this._updatePrevLatLng();
      return;
    }
  
    this._frameAnimId = L.Util.requestAnimFrame(function (timestamp) {
      this._makeAnimation(timestamp);
    }, this, true);
  },
  
  _makeAnimation: function (timestamp) {
    var elapsedTime = timestamp - this._animStartTimeStamp;
  
    var position = this._interpolatePosition(
      this._prevLatLng,
      this._nextLatLng,
      this._duration,
      elapsedTime
    );
  
    // stop animation when elapsedTime >= duration
    if(elapsedTime >= this._duration) {
      this.stop();
    }
      
    // CHECK IF MOVING ENDED
    if(this._movingEnded) {
      return;
    }
  
    this.setLatLng(position);
    this._frameAnimId = L.Util.requestAnimFrame(this._makeAnimation, this, false);
  },
  
  /**
     * stop animation marker and move to next lat lng
     */
  stop: function () {
    if(!this._movingEnded) {
      L.Util.cancelAnimFrame(this._frameAnimId);
      this._movingEnded = true;
      this._updatePrevLatLng();
      this.setLatLng(this._nextLatLng);
      this.options.followMarker && this._map.setView(this._nextLatLng, this._map.getZoom(), {animate: false});
    } 
  },
  
  /**
     * hide marker with opacity
     * @param {Boolean} hide 
     */
  hideMarker: function (hide) {
    if(hide === this.options.hideMarker) return;
    if (hide) this.setOpacity(0);
    else if (!hide) this.setOpacity(1);
    this.options.hideMarker = hide;
  },
  
  /**
     * disable animate and when on animate, move to next lat lng
     * @param {Boolean} value 
     */  
  disableAnimate: function (value) {
    if(value === this._animate) return;
    
    var currentTimestamp = performance.now();
    var elapsedTime = currentTimestamp - this._animStartTimeStamp;
  
    // stop the animate when it already on a action
    if(this._animate && !value && !this._movingEnded && this._nextLatLng) {
      this._animate = value;
      this.stop();
      return;
    }
  
    // if animate back to true and still have a time for run the animate
    if(value && elapsedTime < this._duration && this._nextLatLng) {
      // update lat lng by temp lat lng
      this._prevLatLng = this._tempPrevLatLng;
      this._nextLatLng = this._tempNextLatLng;
  
      this._animate = true;
      this._doAnimation();
      return;
    }
  
    this._animate = value;
  },
    
  /**
     * 
     * @param {[lat, lng]} prev 
     * @param {[lat, lng]} next 
     */
  _updateTempLatLng: function (prev, next) {
    this._tempPrevLatLng = prev;
    this._tempNextLatLng = next;
  }
});
  
L.motionMarker = function (latlngs, options) {
  return new L.MotionMarker(latlngs, options);
};