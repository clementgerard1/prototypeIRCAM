'use strict';

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

var _viewTemplates = require('../shared/viewTemplates');

var _viewTemplates2 = _interopRequireDefault(_viewTemplates);

var _viewContent = require('../shared/viewContent');

var _viewContent2 = _interopRequireDefault(_viewContent);

var _ShapeDesignerExperience = require('./ShapeDesignerExperience.js');

var _ShapeDesignerExperience2 = _interopRequireDefault(_ShapeDesignerExperience);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// launch application when document is fully loaded
// import client side soundworks and player experience
window.addEventListener('load', function () {
  // configuration received from the server through the `index.html`
  // @see {~/src/server/index.js}
  // @see {~/html/default.ejs}
  var _window$soundworksCon = window.soundworksConfig,
      appName = _window$soundworksCon.appName,
      clientType = _window$soundworksCon.clientType,
      socketIO = _window$soundworksCon.socketIO,
      assetsDomain = _window$soundworksCon.assetsDomain;

  // initialize the 'player' client

  soundworks.client.init(clientType, { appName: appName, socketIO: socketIO });
  soundworks.client.setViewContentDefinitions(_viewContent2.default);
  soundworks.client.setViewTemplateDefinitions(_viewTemplates2.default);

  // create client side (player) experience
  var experience = new _ShapeDesignerExperience2.default(assetsDomain);

  // start the client
  soundworks.client.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbInNvdW5kd29ya3MiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwic291bmR3b3Jrc0NvbmZpZyIsImFwcE5hbWUiLCJjbGllbnRUeXBlIiwic29ja2V0SU8iLCJhc3NldHNEb21haW4iLCJjbGllbnQiLCJpbml0Iiwic2V0Vmlld0NvbnRlbnREZWZpbml0aW9ucyIsInNldFZpZXdUZW1wbGF0ZURlZmluaXRpb25zIiwiZXhwZXJpZW5jZSIsInN0YXJ0Il0sIm1hcHBpbmdzIjoiOztBQUNBOztJQUFZQSxVOztBQUNaOzs7O0FBQ0E7Ozs7QUFFQTs7Ozs7Ozs7QUFFQTtBQVBBO0FBUUFDLE9BQU9DLGdCQUFQLENBQXdCLE1BQXhCLEVBQWdDLFlBQU07QUFDcEM7QUFDQTtBQUNBO0FBSG9DLDhCQUlxQkQsT0FBT0UsZ0JBSjVCO0FBQUEsTUFJNUJDLE9BSjRCLHlCQUk1QkEsT0FKNEI7QUFBQSxNQUluQkMsVUFKbUIseUJBSW5CQSxVQUptQjtBQUFBLE1BSVBDLFFBSk8seUJBSVBBLFFBSk87QUFBQSxNQUlHQyxZQUpILHlCQUlHQSxZQUpIOztBQU1wQzs7QUFDQVAsYUFBV1EsTUFBWCxDQUFrQkMsSUFBbEIsQ0FBdUJKLFVBQXZCLEVBQW1DLEVBQUVELGdCQUFGLEVBQVdFLGtCQUFYLEVBQW5DO0FBQ0FOLGFBQVdRLE1BQVgsQ0FBa0JFLHlCQUFsQjtBQUNBVixhQUFXUSxNQUFYLENBQWtCRywwQkFBbEI7O0FBRUE7QUFDQSxNQUFNQyxhQUFhLHNDQUE0QkwsWUFBNUIsQ0FBbkI7O0FBRUE7QUFDQVAsYUFBV1EsTUFBWCxDQUFrQkssS0FBbEI7QUFFRCxDQWpCRCIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGltcG9ydCBjbGllbnQgc2lkZSBzb3VuZHdvcmtzIGFuZCBwbGF5ZXIgZXhwZXJpZW5jZVxuaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5pbXBvcnQgdmlld1RlbXBsYXRlcyBmcm9tICcuLi9zaGFyZWQvdmlld1RlbXBsYXRlcyc7XG5pbXBvcnQgdmlld0NvbnRlbnQgZnJvbSAnLi4vc2hhcmVkL3ZpZXdDb250ZW50JztcblxuaW1wb3J0IFNoYXBlRGVzaWduZXJFeHBlcmllbmNlIGZyb20gJy4vU2hhcGVEZXNpZ25lckV4cGVyaWVuY2UuanMnO1xuXG4vLyBsYXVuY2ggYXBwbGljYXRpb24gd2hlbiBkb2N1bWVudCBpcyBmdWxseSBsb2FkZWRcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAvLyBjb25maWd1cmF0aW9uIHJlY2VpdmVkIGZyb20gdGhlIHNlcnZlciB0aHJvdWdoIHRoZSBgaW5kZXguaHRtbGBcbiAgLy8gQHNlZSB7fi9zcmMvc2VydmVyL2luZGV4LmpzfVxuICAvLyBAc2VlIHt+L2h0bWwvZGVmYXVsdC5lanN9XG4gIGNvbnN0IHsgYXBwTmFtZSwgY2xpZW50VHlwZSwgc29ja2V0SU8sIGFzc2V0c0RvbWFpbiB9ICA9IHdpbmRvdy5zb3VuZHdvcmtzQ29uZmlnO1xuXG4gIC8vIGluaXRpYWxpemUgdGhlICdwbGF5ZXInIGNsaWVudFxuICBzb3VuZHdvcmtzLmNsaWVudC5pbml0KGNsaWVudFR5cGUsIHsgYXBwTmFtZSwgc29ja2V0SU8gfSk7XG4gIHNvdW5kd29ya3MuY2xpZW50LnNldFZpZXdDb250ZW50RGVmaW5pdGlvbnModmlld0NvbnRlbnQpO1xuICBzb3VuZHdvcmtzLmNsaWVudC5zZXRWaWV3VGVtcGxhdGVEZWZpbml0aW9ucyh2aWV3VGVtcGxhdGVzKTtcblxuICAvLyBjcmVhdGUgY2xpZW50IHNpZGUgKHBsYXllcikgZXhwZXJpZW5jZVxuICBjb25zdCBleHBlcmllbmNlID0gbmV3IFNoYXBlRGVzaWduZXJFeHBlcmllbmNlKGFzc2V0c0RvbWFpbik7XG5cbiAgLy8gc3RhcnQgdGhlIGNsaWVudFxuICBzb3VuZHdvcmtzLmNsaWVudC5zdGFydCgpO1xuICBcbn0pO1xuIl19