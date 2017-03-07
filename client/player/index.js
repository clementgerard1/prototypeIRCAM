'use strict';

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

var _viewTemplates = require('../shared/viewTemplates');

var _viewTemplates2 = _interopRequireDefault(_viewTemplates);

var _viewContent = require('../shared/viewContent');

var _viewContent2 = _interopRequireDefault(_viewContent);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _PlayerExperience = require('./PlayerExperience.js');

var _PlayerExperience2 = _interopRequireDefault(_PlayerExperience);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbInNvdW5kd29ya3MiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwic291bmR3b3Jrc0NvbmZpZyIsImFwcE5hbWUiLCJjbGllbnRUeXBlIiwic29ja2V0SU8iLCJhc3NldHNEb21haW4iLCJjbGllbnQiLCJpbml0Iiwic2V0Vmlld0NvbnRlbnREZWZpbml0aW9ucyIsInNldFZpZXdUZW1wbGF0ZURlZmluaXRpb25zIiwiZXhwZXJpZW5jZSIsInN0YXJ0Il0sIm1hcHBpbmdzIjoiOztBQUNBOztJQUFZQSxVOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7Ozs7OztBQUVBO0FBQ0FDLE9BQU9DLGdCQUFQLENBQXdCLE1BQXhCLEVBQWdDLFlBQU07QUFDcEM7QUFDQTtBQUNBO0FBSG9DLDhCQUlxQkQsT0FBT0UsZ0JBSjVCO0FBQUEsTUFJNUJDLE9BSjRCLHlCQUk1QkEsT0FKNEI7QUFBQSxNQUluQkMsVUFKbUIseUJBSW5CQSxVQUptQjtBQUFBLE1BSVBDLFFBSk8seUJBSVBBLFFBSk87QUFBQSxNQUlHQyxZQUpILHlCQUlHQSxZQUpIO0FBS3BDOztBQUNBUCxhQUFXUSxNQUFYLENBQWtCQyxJQUFsQixDQUF1QkosVUFBdkIsRUFBbUMsRUFBRUQsZ0JBQUYsRUFBV0Usa0JBQVgsRUFBbkM7QUFDQU4sYUFBV1EsTUFBWCxDQUFrQkUseUJBQWxCO0FBQ0FWLGFBQVdRLE1BQVgsQ0FBa0JHLDBCQUFsQjs7QUFFQTtBQUNBLE1BQU1DLGFBQWEsK0JBQXFCTCxZQUFyQixDQUFuQjs7QUFFQTtBQUNBUCxhQUFXUSxNQUFYLENBQWtCSyxLQUFsQjtBQUNELENBZkQsRSxDQVRBIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaW1wb3J0IGNsaWVudCBzaWRlIHNvdW5kd29ya3MgYW5kIHBsYXllciBleHBlcmllbmNlXG5pbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmltcG9ydCB2aWV3VGVtcGxhdGVzIGZyb20gJy4uL3NoYXJlZC92aWV3VGVtcGxhdGVzJztcbmltcG9ydCB2aWV3Q29udGVudCBmcm9tICcuLi9zaGFyZWQvdmlld0NvbnRlbnQnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuaW1wb3J0IFBsYXllckV4cGVyaWVuY2UgZnJvbSAnLi9QbGF5ZXJFeHBlcmllbmNlLmpzJztcblxuLy8gbGF1bmNoIGFwcGxpY2F0aW9uIHdoZW4gZG9jdW1lbnQgaXMgZnVsbHkgbG9hZGVkXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcbiAgLy8gY29uZmlndXJhdGlvbiByZWNlaXZlZCBmcm9tIHRoZSBzZXJ2ZXIgdGhyb3VnaCB0aGUgYGluZGV4Lmh0bWxgXG4gIC8vIEBzZWUge34vc3JjL3NlcnZlci9pbmRleC5qc31cbiAgLy8gQHNlZSB7fi9odG1sL2RlZmF1bHQuZWpzfVxuICBjb25zdCB7IGFwcE5hbWUsIGNsaWVudFR5cGUsIHNvY2tldElPLCBhc3NldHNEb21haW4gfSAgPSB3aW5kb3cuc291bmR3b3Jrc0NvbmZpZztcbiAgLy8gaW5pdGlhbGl6ZSB0aGUgJ3BsYXllcicgY2xpZW50XG4gIHNvdW5kd29ya3MuY2xpZW50LmluaXQoY2xpZW50VHlwZSwgeyBhcHBOYW1lLCBzb2NrZXRJTyB9KTtcbiAgc291bmR3b3Jrcy5jbGllbnQuc2V0Vmlld0NvbnRlbnREZWZpbml0aW9ucyh2aWV3Q29udGVudCk7XG4gIHNvdW5kd29ya3MuY2xpZW50LnNldFZpZXdUZW1wbGF0ZURlZmluaXRpb25zKHZpZXdUZW1wbGF0ZXMpO1xuXG4gIC8vIGNyZWF0ZSBjbGllbnQgc2lkZSAocGxheWVyKSBleHBlcmllbmNlXG4gIGNvbnN0IGV4cGVyaWVuY2UgPSBuZXcgUGxheWVyRXhwZXJpZW5jZShhc3NldHNEb21haW4pO1xuXG4gIC8vIHN0YXJ0IHRoZSBjbGllbnRcbiAgc291bmR3b3Jrcy5jbGllbnQuc3RhcnQoKTtcbn0pO1xuIl19