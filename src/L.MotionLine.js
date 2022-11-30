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
  disableAnimate: function (value) {
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