const path = require('path');

module.exports = {
  entry: {
    app: ['./src/L.MotionMarker.js', './src/L.MotionLine.js', './src/L.MoveMarker.js']
  },
  output: {
    filename: 'L.MoveMarker.js',
    path: path.resolve(__dirname, 'dist'),
  },
};