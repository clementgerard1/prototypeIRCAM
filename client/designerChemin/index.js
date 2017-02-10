'use strict';

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

var _DesignerCheminExperience = require('./DesignerCheminExperience.js');

var _DesignerCheminExperience2 = _interopRequireDefault(_DesignerCheminExperience);

var _viewTemplates = require('../shared/viewTemplates');

var _viewTemplates2 = _interopRequireDefault(_viewTemplates);

var _viewContent = require('../shared/viewContent');

var _viewContent2 = _interopRequireDefault(_viewContent);

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
  var experience = new _DesignerCheminExperience2.default(assetsDomain);

  // start the client
  soundworks.client.start();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbInNvdW5kd29ya3MiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwic291bmR3b3Jrc0NvbmZpZyIsImFwcE5hbWUiLCJjbGllbnRUeXBlIiwic29ja2V0SU8iLCJhc3NldHNEb21haW4iLCJjbGllbnQiLCJpbml0Iiwic2V0Vmlld0NvbnRlbnREZWZpbml0aW9ucyIsInNldFZpZXdUZW1wbGF0ZURlZmluaXRpb25zIiwiZXhwZXJpZW5jZSIsInN0YXJ0Il0sIm1hcHBpbmdzIjoiOztBQUNBOztJQUFZQSxVOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFFQTtBQU5BO0FBT0FDLE9BQU9DLGdCQUFQLENBQXdCLE1BQXhCLEVBQWdDLFlBQU07QUFDcEM7QUFDQTtBQUNBO0FBSG9DLDhCQUlxQkQsT0FBT0UsZ0JBSjVCO0FBQUEsTUFJNUJDLE9BSjRCLHlCQUk1QkEsT0FKNEI7QUFBQSxNQUluQkMsVUFKbUIseUJBSW5CQSxVQUptQjtBQUFBLE1BSVBDLFFBSk8seUJBSVBBLFFBSk87QUFBQSxNQUlHQyxZQUpILHlCQUlHQSxZQUpIO0FBS3BDOztBQUNBUCxhQUFXUSxNQUFYLENBQWtCQyxJQUFsQixDQUF1QkosVUFBdkIsRUFBbUMsRUFBRUQsZ0JBQUYsRUFBV0Usa0JBQVgsRUFBbkM7QUFDQU4sYUFBV1EsTUFBWCxDQUFrQkUseUJBQWxCO0FBQ0FWLGFBQVdRLE1BQVgsQ0FBa0JHLDBCQUFsQjs7QUFFQTtBQUNBLE1BQU1DLGFBQWEsdUNBQTZCTCxZQUE3QixDQUFuQjs7QUFFQTtBQUNBUCxhQUFXUSxNQUFYLENBQWtCSyxLQUFsQjtBQUNELENBZkQiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBpbXBvcnQgY2xpZW50IHNpZGUgc291bmR3b3JrcyBhbmQgcGxheWVyIGV4cGVyaWVuY2VcbmltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuaW1wb3J0IERlc2lnbmVyQ2hlbWluRXhwZXJpZW5jZSBmcm9tICcuL0Rlc2lnbmVyQ2hlbWluRXhwZXJpZW5jZS5qcyc7XG5pbXBvcnQgdmlld1RlbXBsYXRlcyBmcm9tICcuLi9zaGFyZWQvdmlld1RlbXBsYXRlcyc7XG5pbXBvcnQgdmlld0NvbnRlbnQgZnJvbSAnLi4vc2hhcmVkL3ZpZXdDb250ZW50JztcblxuLy8gbGF1bmNoIGFwcGxpY2F0aW9uIHdoZW4gZG9jdW1lbnQgaXMgZnVsbHkgbG9hZGVkXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcbiAgLy8gY29uZmlndXJhdGlvbiByZWNlaXZlZCBmcm9tIHRoZSBzZXJ2ZXIgdGhyb3VnaCB0aGUgYGluZGV4Lmh0bWxgXG4gIC8vIEBzZWUge34vc3JjL3NlcnZlci9pbmRleC5qc31cbiAgLy8gQHNlZSB7fi9odG1sL2RlZmF1bHQuZWpzfVxuICBjb25zdCB7IGFwcE5hbWUsIGNsaWVudFR5cGUsIHNvY2tldElPLCBhc3NldHNEb21haW4gfSAgPSB3aW5kb3cuc291bmR3b3Jrc0NvbmZpZztcbiAgLy8gaW5pdGlhbGl6ZSB0aGUgJ3BsYXllcicgY2xpZW50XG4gIHNvdW5kd29ya3MuY2xpZW50LmluaXQoY2xpZW50VHlwZSwgeyBhcHBOYW1lLCBzb2NrZXRJTyB9KTtcbiAgc291bmR3b3Jrcy5jbGllbnQuc2V0Vmlld0NvbnRlbnREZWZpbml0aW9ucyh2aWV3Q29udGVudCk7XG4gIHNvdW5kd29ya3MuY2xpZW50LnNldFZpZXdUZW1wbGF0ZURlZmluaXRpb25zKHZpZXdUZW1wbGF0ZXMpO1xuXG4gIC8vIGNyZWF0ZSBjbGllbnQgc2lkZSAocGxheWVyKSBleHBlcmllbmNlXG4gIGNvbnN0IGV4cGVyaWVuY2UgPSBuZXcgRGVzaWduZXJDaGVtaW5FeHBlcmllbmNlKGFzc2V0c0RvbWFpbik7XG5cbiAgLy8gc3RhcnQgdGhlIGNsaWVudFxuICBzb3VuZHdvcmtzLmNsaWVudC5zdGFydCgpO1xufSk7XG4iXX0=