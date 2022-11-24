/* eslint-disable no-undef */
/**
 * author: I Kadek Teguh Mahesa
 * github: https://github.com/dekguh
 * license: FREEEEEEE
 * repo: https://github.com/dekguh/L.MoveMarker
 * copyright 2022
 */

require('./L.MotionLine');
require('./L.MotionMarker');

/**
 * @class L.MoveMarker
 * @aka L.moveMarker
 * @inherits L.Polyline 
 */
L.MoveMarker = L.FeatureGroup.extend({
  /**
   * also can use the options polyline
   * @link https://leafletjs.com/reference.html#polyline-option
   */
  optionsPolyline: {
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
    autoStart: true,
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

    // create lines
    this._createLinesNoAnimate(latLngs);
  },

  onAdd: function (map) {
    L.FeatureGroup.prototype.onAdd.call(this, map);
    // set style
    !this.options.optionsPolyline.hidePolylines && this.setStyleOpacityLines();

    // create marker
    if (this._latLngs.length === 1) this._createMarker([
      this._latLngs[0],
    ]);
    else if (this._latLngs.length >= 2) this._createMarker([
      this._latLngs[this._latLngs.length - 2],
      this._latLngs[this._latLngs.length - 1],
    ]);
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
      [this._latLngs[latLngslength-1], latLng],
      {
        ...this.options.optionsPolyline,
        animate: !options?.animatePolyline ? false : true
      }
    );
    this.addLayer(this._currentInstanceline);
    this._latLngs.push(latLng);

    // hide/show polyline when on animate
    this.hidePolylines(this.options.optionsPolyline.hidePolylines);

    // animate marker
    this._marker.moveTo(latLng, options);
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