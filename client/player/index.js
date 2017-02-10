'use strict';

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

var _PlayerExperience = require('./PlayerExperience.js');

var _PlayerExperience2 = _interopRequireDefault(_PlayerExperience);

var _viewTemplates = require('../shared/viewTemplates');

var _viewTemplates2 = _interopRequireDefault(_viewTemplates);

var _viewContent = require('../shared/viewContent');

var _viewContent2 = _interopRequireDefault(_viewContent);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// launch application when document is fully loaded
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
  var experience = new _PlayerExperience2.default(assetsDomain);

  // start the client
  soundworks.client.start();
}); // import client side soundworks and player experience
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbInNvdW5kd29ya3MiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwic291bmR3b3Jrc0NvbmZpZyIsImFwcE5hbWUiLCJjbGllbnRUeXBlIiwic29ja2V0SU8iLCJhc3NldHNEb21haW4iLCJjbGllbnQiLCJpbml0Iiwic2V0Vmlld0NvbnRlbnREZWZpbml0aW9ucyIsInNldFZpZXdUZW1wbGF0ZURlZmluaXRpb25zIiwiZXhwZXJpZW5jZSIsInN0YXJ0Il0sIm1hcHBpbmdzIjoiOztBQUNBOztJQUFZQSxVOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7OztBQUVBO0FBQ0FDLE9BQU9DLGdCQUFQLENBQXdCLE1BQXhCLEVBQWdDLFlBQU07QUFDcEM7QUFDQTtBQUNBO0FBSG9DLDhCQUlxQkQsT0FBT0UsZ0JBSjVCO0FBQUEsTUFJNUJDLE9BSjRCLHlCQUk1QkEsT0FKNEI7QUFBQSxNQUluQkMsVUFKbUIseUJBSW5CQSxVQUptQjtBQUFBLE1BSVBDLFFBSk8seUJBSVBBLFFBSk87QUFBQSxNQUlHQyxZQUpILHlCQUlHQSxZQUpIO0FBS3BDOztBQUNBUCxhQUFXUSxNQUFYLENBQWtCQyxJQUFsQixDQUF1QkosVUFBdkIsRUFBbUMsRUFBRUQsZ0JBQUYsRUFBV0Usa0JBQVgsRUFBbkM7QUFDQU4sYUFBV1EsTUFBWCxDQUFrQkUseUJBQWxCO0FBQ0FWLGFBQVdRLE1BQVgsQ0FBa0JHLDBCQUFsQjs7QUFFQTtBQUNBLE1BQU1DLGFBQWEsK0JBQXFCTCxZQUFyQixDQUFuQjs7QUFFQTtBQUNBUCxhQUFXUSxNQUFYLENBQWtCSyxLQUFsQjtBQUNELENBZkQsRSxDQVJBIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaW1wb3J0IGNsaWVudCBzaWRlIHNvdW5kd29ya3MgYW5kIHBsYXllciBleHBlcmllbmNlXG5pbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmltcG9ydCBQbGF5ZXJFeHBlcmllbmNlIGZyb20gJy4vUGxheWVyRXhwZXJpZW5jZS5qcyc7XG5pbXBvcnQgdmlld1RlbXBsYXRlcyBmcm9tICcuLi9zaGFyZWQvdmlld1RlbXBsYXRlcyc7XG5pbXBvcnQgdmlld0NvbnRlbnQgZnJvbSAnLi4vc2hhcmVkL3ZpZXdDb250ZW50JztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5cbi8vIGxhdW5jaCBhcHBsaWNhdGlvbiB3aGVuIGRvY3VtZW50IGlzIGZ1bGx5IGxvYWRlZFxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XG4gIC8vIGNvbmZpZ3VyYXRpb24gcmVjZWl2ZWQgZnJvbSB0aGUgc2VydmVyIHRocm91Z2ggdGhlIGBpbmRleC5odG1sYFxuICAvLyBAc2VlIHt+L3NyYy9zZXJ2ZXIvaW5kZXguanN9XG4gIC8vIEBzZWUge34vaHRtbC9kZWZhdWx0LmVqc31cbiAgY29uc3QgeyBhcHBOYW1lLCBjbGllbnRUeXBlLCBzb2NrZXRJTywgYXNzZXRzRG9tYWluIH0gID0gd2luZG93LnNvdW5kd29ya3NDb25maWc7XG4gIC8vIGluaXRpYWxpemUgdGhlICdwbGF5ZXInIGNsaWVudFxuICBzb3VuZHdvcmtzLmNsaWVudC5pbml0KGNsaWVudFR5cGUsIHsgYXBwTmFtZSwgc29ja2V0SU8gfSk7XG4gIHNvdW5kd29ya3MuY2xpZW50LnNldFZpZXdDb250ZW50RGVmaW5pdGlvbnModmlld0NvbnRlbnQpO1xuICBzb3VuZHdvcmtzLmNsaWVudC5zZXRWaWV3VGVtcGxhdGVEZWZpbml0aW9ucyh2aWV3VGVtcGxhdGVzKTtcblxuICAvLyBjcmVhdGUgY2xpZW50IHNpZGUgKHBsYXllcikgZXhwZXJpZW5jZVxuICBjb25zdCBleHBlcmllbmNlID0gbmV3IFBsYXllckV4cGVyaWVuY2UoYXNzZXRzRG9tYWluKTtcblxuICAvLyBzdGFydCB0aGUgY2xpZW50XG4gIHNvdW5kd29ya3MuY2xpZW50LnN0YXJ0KCk7XG59KTtcbiJdfQ==