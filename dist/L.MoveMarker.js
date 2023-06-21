/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/* eslint-disable no-prototype-builtins */
/* eslint-disable no-undef */
/**
 * author: I Kadek Teguh Mahesa
 * github: https://github.com/dekguh
 * license: MIT
 * repo: https://github.com/dekguh/L.MoveMarker
 * copyright 2022
 */

var defaultValue = __webpack_require__(1);

/**
  * @class L.MotionMarker
  * @aka L.motionMarker
  * @inherits L.Marker 
  */
L.MotionMarker = L.Marker.extend({
  options: {
    animate: true,
    duration: 5000 - defaultValue.reductionDuration, // in milliseconds
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
      this._duration = this.options.duration - defaultValue.reductionDuration;
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
      this._duration = options.duration - defaultValue.reductionDuration;
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
  activeFollowMarker: function (value) {
    this.options.followMarker = value;
 
    // bypass
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
    this._duration = (Number((distanceStreet/speedKmToMeter).toFixed(0)) * 1000) - defaultValue.reductionDuration;
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
    // using display is better for performance than opacity
    if (hide) this._icon.style.display = 'none';
    else if (!hide) this._icon.style.display = 'block';
    this.options.hideMarker = hide;
  },
   
  /**
      * disable animate and when on animate, move to next lat lng
      * @param {Boolean} value 
      */  
  activeAnimate: function (value) {
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

/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = {
  // The marker duration was reduced to address issue #12
  reductionDuration: 100,
};

/***/ }),
/* 2 */
/***/ (() => {

/* eslint-disable no-undef */
/**
 * author: I Kadek Teguh Mahesa
 * github: https://github.com/dekguh
 * license: MIT
 * repo: https://github.com/dekguh/L.MoveMarker
 * copyright 2022
 */


/**
 * @class L.MotionLine
 * @aka L.motionLine
 * @inherits L.Polyline 
 */
L.MotionLine = L.Polyline.extend({
  options: {
    animate: true,
    duration: 5000,
  },
  
  initialize: function (latLngs, options) {
    L.Polyline.prototype.initialize.call(this, latLngs, options);
  
    // state
    this._isOnAnimate = false;
    this._animate = this.options.animate;
  
    // lat lng
    this._prevLatLng = latLngs[0];
    this._nextLatLng = latLngs[1];
  
    // set _latlngs to start vertex and update instance
    // [ [array<lat, lng>, array<lat, lng>], [array<lat, lng>, array<lat, lng>] ]
    this._latlngs = [[ this._prevLatLng, this._prevLatLng ]];
  
    // add temp latlngs
    if (!this._tempLatLngs) {
      this._tempLatLngs = L.LineUtil.isFlat(this._latlngs) ? [ this._latlngs ] : this._latlngs;
    }
      
    this._update();
  
    // run animate
    this._play();
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
     * stop animate and move to next lat lng
     */
  stop: function () {
    // stop animate
    if(this._isOnAnimate) {
      this._isOnAnimate = false;
      L.Util.cancelAnimFrame(this._frameAnimId);
      this._frameAnimId = null;
  
      // set the next latlngs
      this._latlngs[0].push(L.latLng(this._nextLatLng[0], this._nextLatLng[1]));
      this.setLatLngs(this._latlngs);
    }
  },
  
  _play: function () {
    if(this._isOnAnimate) return;
    this._animStartTime = performance.now();
  
    // execute when animate disable
    if(!this._animate) {
      this._latlngs = [[ this._prevLatLng, this._nextLatLng ]];
      this.setLatLngs(this._latlngs);
      return;
    }
  
    this._isOnAnimate = true;
    this._playAnimate();
  
    return this;
  },
  
  _playAnimate: function () {
    var currentTimestamp = performance.now();
    this._currentTimelapse = currentTimestamp - this._animStartTime;	// milliseconds
      
    // stop anim when animate in disable when animate on run
    if(!this._animate) {
      this.stop();
      return;
    }
  
    // dont execute animate
    if(!this._isOnAnimate) return;
  
    // cut next latlngs
    this._latlngs[0].pop();
      
    return this._doAnimate(currentTimestamp);
  },
  
  _doAnimate: function (currentTimestamp) {
    var elapsedTime = currentTimestamp - this._animStartTime;
  
    // interpolate next lat lng
    var position = this._interpolatePosition(
      this._prevLatLng,
      this._nextLatLng,
      this.options.duration,
      elapsedTime
    );
  
    // set new next latlngs
    this._latlngs[0].push(L.latLng(position.lat, position.lng));
    this.setLatLngs(this._latlngs);
  
    // stop animate when more than duration time
    if (elapsedTime >= this.options.duration) {
      this._isOnAnimate = false;
      return;
    } 
  
    this._frameAnimId = L.Util.requestAnimFrame(this._playAnimate, this);
  },
  
  /**
     * disable animate and when on animate then stop animate
     * @param {Boolean} value 
     */  
  activeAnimate: function (value) {
    if (value === this._animate) return;

    var currentTimestamp = performance.now();
    var elapsedTime = currentTimestamp - this._animStartTime;
  
    // if animate back to true and still have a time for run the animate
    if(value && elapsedTime < this.options.duration && this._nextLatLng) {
      // current next position at current time
      var currentNextPosition = this._interpolatePosition(
        this._prevLatLng,
        this._nextLatLng,
        this.options.duration,
        elapsedTime
      );
      this._latlngs = [[ this._prevLatLng, [currentNextPosition.lat, currentNextPosition.lng] ]];
  
      // set state and play animate
      this._isOnAnimate = true;
      this._animate = true;
      this._playAnimate();
    } else {
      this._animate = value;
    }
  }
});
  
L.motionLine = function (latlngs, options) {
  return new L.MotionLine(latlngs, options);
};

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/* eslint-disable no-undef */
/**
 * author: I Kadek Teguh Mahesa
 * github: https://github.com/dekguh
 * license: MIT
 * repo: https://github.com/dekguh/L.MoveMarker
 * copyright 2022
 */

__webpack_require__(2);
__webpack_require__(0);
  
/**
   * @class L.MoveMarker
   * @aka L.moveMarker
   * @inherits L.FeatureGroup 
   */
L.MoveMarker = L.FeatureGroup.extend({
  /**
     * also can use the options polyline
     * @link https://leafletjs.com/reference.html#polyline-option
     */
  optionsPolyline: {
    animate: true,
    color: 'red',
    weight: 4,
    hidePolylines: false,
    duration: 5000,
    // remove first line
    removeFirstLines: false,
    maxLengthLines: 3,
  },
  
  /**
     * also can use the options marker
     * @link https://leafletjs.com/reference.html#marker-option
     */
  optionsMarker: {
    animate: true,
    hideMarker: false,
    followMarker: false, // beta, need more improve
    rotateMarker: false, // beta, need more improve
    duration: 5000, // IN MS
    speed: 0, // IN KM
  },
  
  /**
     * also can use the options feature group
     * @link https://leafletjs.com/reference.html#featuregroup
     */
  optionsGroup: {},
  
  initialize: function (latLngs, optionsPolyline, optionsMarker, optionsGroup) {
    L.FeatureGroup.prototype.initialize.call(this, [], optionsGroup);
    this._latLngs = latLngs;
  
    // merge all options
    L.setOptions(this, {
      optionsPolyline: {
        ...this.optionsPolyline,
        ...optionsPolyline
      },
      optionsMarker: {
        ...this.optionsMarker,
        ...optionsMarker,
      },
      optionsGroup: {
        ...this.optionsGroup,
        ...optionsGroup,
      }
    });
  },
  
  onAdd: function (map) {
    L.FeatureGroup.prototype.onAdd.call(this, map);
    // set style
    !this.options.optionsPolyline.hidePolylines && this.setStyleOpacityLines();
  
    // create first init marker
    if (this._latLngs.length === 1) this._createMarker([
      this._latLngs[0],
    ]);
    else if (this._latLngs.length >= 2) this._createMarker([
      this._latLngs[this._latLngs.length - 2],
      this._latLngs[this._latLngs.length - 1],
    ]);
 
    // create first init poyline
    if(!this.options.optionsPolyline.animate) this.addMoreLine(this._latLngs[1], {
      rotateAngle: this.optionsPolyline.rotateAngle, animatePolyline: false
    });
    if (this._latLngs.length === 2 && this.options.optionsPolyline.animate) this.addMoreLine(null, {
      rotateAngle: this.optionsPolyline.rotateAngle, animatePolyline: this.optionsPolyline.animate
    });
  },
  
  /**
     * @param {Array<latLng[]>} latLngs example: [[lat, lng], [lat, lng]]
     */
  _createLinesNoAnimate: function (latLngs) {
    for (var i = 0; i < latLngs.length - 1; i++) {
      var line = L.polyline([latLngs[i], latLngs[i+1]], this.options.optionsPolyline);
  
      this.addLayer(line);
    }
  },
  
  /**
     * will animate poyline and marker
     * @param {Array<lat, lng>} latLng example [lat, lng] (required)
     * @param {Object} options { duration, speed, rotateAngle, animatePolyline (required) }
     */
  addMoreLine: function (latLng, options) {
    // layers polyline
    var layersLines = Object.keys(this._layers).filter(key => {
      if(this._layers[key] instanceof L.MotionLine) return true;
      else false;
    });
  
    // remove first line
    if(
      this.options.optionsPolyline.removeFirstLines
        && layersLines.length >= this.options.optionsPolyline.maxLengthLines
    ) {
      this.removeLayer(Number(layersLines[0]));
    }
  
    var latLngslength = this._latLngs.length;
  
    // animate polyline
    this._currentInstanceline = L.motionLine(
      !latLng ? [this._latLngs[latLngslength-2], this._latLngs[latLngslength-1]] : [this._latLngs[latLngslength-1], latLng],
      {
        ...this.options.optionsPolyline,
        animate: !options?.animatePolyline ? false : true
      }
    );
    this.addLayer(this._currentInstanceline);
    latLng ? this._latLngs.push(latLng) : this._latLngs.push(this._latLngs[1]);
  
    // hide/show polyline when on animate
    this.hidePolylines(this.options.optionsPolyline.hidePolylines);
  
    // animate marker
    this._marker.moveTo(latLng ? latLng : this._latLngs[this._latLngs.length - 1], options);
  },
  
  /**
     * @param {Array<latLng[]>} latLngs example: [[lat, lng], [lat, lng]]
     * @param {Map} map map instance
     */
  _createMarker: function (latLngs) {
    this._marker = L.motionMarker(latLngs, this.options.optionsMarker);
    this.addLayer(this._marker);
  },
  
  /**
     * @param {Boolean} hide 
     */
  hidePolylines: function (hide = this.options.optionsPolyline.hidePolylines) {
    this.options.optionsPolyline.hidePolylines = hide;
  
    if(this.options.optionsPolyline.hidePolylines) this.setStyleHideLines();
    else this.setStyleOpacityLines();
  },
  
  /**
     * @returns marker instance
     */
  getMarker: function () {
    return this._marker;
  },
  
  /**
     * @returns current polyline instance (on animate or last polyline)
     */
  getCurrentPolyline: function () {
    return this._currentInstanceline;
  },
  
  /**
     * stop polyline and marker
     */
  stop: function () {
    // stop animation polyline and make it move to next lat lng
    if(this._currentInstanceline instanceof L.MotionLine) this._currentInstanceline.stop();
  
    // stop animation marker and make it move to next lat lng
    if(this._marker instanceof L.MotionMarker) this._marker.stop();
  },
  
  setStyleOpacityLines: function () {
    var layer;
    var layersLineTotal = Object.keys(this._layers).filter(key => {
      if(this._layers[key] instanceof L.MotionLine) return true;
      else false;
    });
  
    var currIndex = 1;
    for (var key in this._layers) {
      layer = this._layers[key];
  
      // only for layers polyline
      if(layer instanceof L.MotionLine) {
        layer.setStyle({ opacity: currIndex/layersLineTotal.length });
        currIndex++;
      }
    }
  },
  
  setStyleHideLines: function () {
    var layer;
  
    for (var key in this._layers) {
      layer = this._layers[key];
      if(layer instanceof L.MotionLine)  layer.setStyle({ opacity: 0 });
    }
  }
});
  
L.moveMarker = function (latLngs, optionsPolyline, optionsMarker, optionsGroup) {
  return new L.MoveMarker(latLngs, optionsPolyline, optionsMarker, optionsGroup);
};

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	__webpack_require__(0);
/******/ 	__webpack_require__(2);
/******/ 	var __webpack_exports__ = __webpack_require__(3);
/******/ 	
/******/ })()
;