### General Information

L.MoveMarker is a leaflet plugin that is used to create moving marker and also trail polylines animation, equipped with a variety of features that are quite complete. plugin currently built in `leaflet version ^1.9.2`.

#### Feature

| Marker                        | Polyline                        |
| ----------------------------- | ------------------------------- |
| animate marker                | animate polyline                |
| duration by speed             | duration by speed ❌            |
| rotate marker                 | show/hide polyline              |
| show/hide marker              | limit max polyline length       |
| disable/enable animate marker | disable/enable animate polyline |
| stop animate marker           | stop animate polyline           |
| follow marker when moving     |                                 |

### How to install

you can go to [npm package](https://www.npmjs.com/package/l.movemarker)

```js
npm i l.movemarker
```

### Import

if you are using ES6, you can import

```js
import 'l.movemarker'
```

### Demo

| demo                                                                           | description                                                                                      |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| [basic demo](https://codesandbox.io/s/l-movemarker-basic-usage-fkdvty)         | basic demo is a simple usage example                                                             |
| [real case demo](https://codesandbox.io/s/l-movemarker-real-case-usage-916l5u) | an example of a real L.MoveMarker implementation using multiple markers and the lat lng mock API |

### First Call

`prevLatLng = [lat, lng]` (required) first position
`nextLatLng = [lat, lng]` (optional) it will be call animate to next position
if you just fill lat lng without nextLatLng, it will still work and will only create marker that are positioned in prevLatLng

```js
const instance = L.MoveMarker(
  [[prevLatLng], [nextLatLng]],
  markerOptions,
  polylineOptions,
  featureGroupOtions
)
```

the `L.MoveMarker` will return the instance layer `L.FeatureGroup` and it inside have many layers L.MotionLine and one layer L.MotionMarker.

### Options

#### Marker Options

| props        | type    | default value | description                                                                                                               |
| ------------ | ------- | ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| animate      | boolean | true          | this will activate the moving animation effect on the marker                                                              |
| duration     | number  | 5000          | value in milliseconds, we recommended duration the marker and the polyline must same                                      |
| followMarker | boolean | false         | this will activate the follow marker feature, when the marker moves, the screen will follow the movement of the marker    |
| hideMarker   | boolean | true          | hide marker from map, you can also show/hide with method hideMarker(boolean), for more detail see on method documentation |
| rotateMarker | boolean | false         | this will activate the rotation marker and props rotateAngle will be required                                             |
| rotateAngle  | number  | 210           | 0 to 360 degrees                                                                                                          |
| speed        | number  | 0             | if the speed value is filled then the duration props will not work and the value unit is km/h                             |

You can also fill in the default options marker from the leaflet marker [options marker](https://leafletjs.com/reference.html#marker-option)

### Polyline Options

| props            | type    | default value | description                                                                                                                     |
| ---------------- | ------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| color            | string  | red           | used to set the color of the polylines                                                                                          |
| weight           | number  | 4             | used to set the weight of the polylines                                                                                         |
| animate          | boolean | true          | this will activate the moving animation effect on the polyline                                                                  |
| duration         | number  | 5000          | value in milliseconds, we recommended duration the marker and the polyline must same                                            |
| hidePolylines    | boolean | false         | hide polylines from map, you can also show/hide with method hidePolylines(boolean), for more detail see on method documentation |
| removeFirstLines | boolean | false         | this will remove first line of polylines, this prop have relation with prop maxLengthLines                                      |
| maxLengthLines   | number  | 3             | This prop used to limit the number of polylines and if it exceeds the limit then the first polyline will be deleted             |

You can also fill in the default options polyline from the leaflet polyline [options polyline](https://leafletjs.com/reference.html#polyline-option)

### Feature Group Options

currently we dont make specific props for feature group, you can also fill in the default options feature group from the leaflet feature group [options feature group](https://leafletjs.com/reference.html#featuregroup)

### Methods

after you make a first call, you can call severals method from the instance

##### addMoreLine

this method used to add more line and move the marker, example usage method `addMoreLine(latLng, options)`

```js
instance.addMoreLine([-8.822512, 115.186803], {
  duration: 5000, // in milliseconds (optional)
  speed: 25, // in km/h (optional)
  rotateAngle: 141, // (required if rotateMarker enable)
  animatePolyline: true, // (required)
})
```

##### getMarker

this is used to get marker instance and will return object class of marker, example usage method `getMarker()`

```js
instance.getMarker()
```

##### hideMarker

this is used to hide/show the marker and this method called from `getMarker`, example usage method `getMarker().hideMarker(boolean)`

```js
instance.getMarker().hideMarker(true)
```

##### disableAnimate (marker)

this is used to enable/disable the marker and this method called from `getMarker`, example usage method `getMarker().disableAnimate(boolean)`

```js
instance.getMarker().disableAnimate(true)
```

##### disableFollowMarker

this used to disable/enable screen follow the marker moving and this method called from `getMarker`, example usage method `getMarker().disableFollowMarker(boolean)`

```js
instance.getMarker().disableFollowMarker(true)
```

##### getCurrentPolyline

this is used to get the polyline instance which is moving, example usage method `getCurrentPolyline()`

```js
instance.getCurrentPolyline()
```

##### hidePolylines

this is used to hide/show the polylines and this method not called from `getCurrentPolyline`, example usage method `hidePolylines(boolean)`

```js
instance.hidePolylines(true)
```

##### disableAnimate (polyline)

this is used to disable/enable the current polyline which is moving and this method called from `getCurrentPolyline`, example usage method `getCurrentPolyline().disableAnimate(boolean)`

```js
instance.getCurrentPolyline().disableAnimate(true)
```

### Report Issue/Question

if you have a question about `L.MoveMarker` or if you found a bug, you can make a issue, more detail how to make a report/question [here](https://github.com/dekguh/L.MoveMarker/issues/4)

thanks,
kadek.
