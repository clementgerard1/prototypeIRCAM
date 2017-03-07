'use strict';

require('source-map-support/register');

var _server = require('soundworks/server');

var soundworks = _interopRequireWildcard(_server);

var _default = require('./config/default');

var _default2 = _interopRequireDefault(_default);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _PlayerExperience = require('./PlayerExperience');

var _PlayerExperience2 = _interopRequireDefault(_PlayerExperience);

var _ShapeDesignerExperience = require('./ShapeDesignerExperience');

var _ShapeDesignerExperience2 = _interopRequireDefault(_ShapeDesignerExperience);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var config = null; // enable sourcemaps in node


switch (process.env.ENV) {
  default:
    config = _default2.default;
    break;
}

// configure express environment ('production' enables cache systems)
process.env.NODE_ENV = config.env;
// initialize application with configuration options
soundworks.server.init(config);

// define the configuration object to be passed to the `.ejs` template
soundworks.server.setClientConfigDefinition(function (clientType, config, httpRequest) {
  return {
    clientType: clientType,
    env: config.env,
    appName: config.appName,
    socketIO: config.socketIO,
    version: config.version,
    defaultType: config.defaultClient,
    assetsDomain: config.assetsDomain
  };
});

// create the experience
// activities must be mapped to client types:
// - the `'player'` clients (who take part in the scenario by connecting to the
//   server through the root url) need to communicate with the `checkin` (see
// `src/server/playerExperience.js`) and the server side `playerExperience`.
// - we could also map activities to additional client types (thus defining a
//   route (url) of the following form: `/${clientType}`)
var playerExperience = new _PlayerExperience2.default('player');
var shapedesignerExperience = new _ShapeDesignerExperience2.default('shapedesigner');

// start application
soundworks.server.start();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbInNvdW5kd29ya3MiLCJjb25maWciLCJwcm9jZXNzIiwiZW52IiwiRU5WIiwiTk9ERV9FTlYiLCJzZXJ2ZXIiLCJpbml0Iiwic2V0Q2xpZW50Q29uZmlnRGVmaW5pdGlvbiIsImNsaWVudFR5cGUiLCJodHRwUmVxdWVzdCIsImFwcE5hbWUiLCJzb2NrZXRJTyIsInZlcnNpb24iLCJkZWZhdWx0VHlwZSIsImRlZmF1bHRDbGllbnQiLCJhc3NldHNEb21haW4iLCJwbGF5ZXJFeHBlcmllbmNlIiwic2hhcGVkZXNpZ25lckV4cGVyaWVuY2UiLCJzdGFydCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFDQTs7SUFBWUEsVTs7QUFDWjs7OztBQUNBOzs7O0FBRUE7Ozs7QUFDQTs7Ozs7Ozs7QUFHQSxJQUFJQyxTQUFTLElBQWIsQyxDQVRzQzs7O0FBV3RDLFFBQU9DLFFBQVFDLEdBQVIsQ0FBWUMsR0FBbkI7QUFDRTtBQUNFSDtBQUNBO0FBSEo7O0FBTUE7QUFDQUMsUUFBUUMsR0FBUixDQUFZRSxRQUFaLEdBQXVCSixPQUFPRSxHQUE5QjtBQUNBO0FBQ0FILFdBQVdNLE1BQVgsQ0FBa0JDLElBQWxCLENBQXVCTixNQUF2Qjs7QUFFQTtBQUNBRCxXQUFXTSxNQUFYLENBQWtCRSx5QkFBbEIsQ0FBNEMsVUFBQ0MsVUFBRCxFQUFhUixNQUFiLEVBQXFCUyxXQUFyQixFQUFxQztBQUMvRSxTQUFPO0FBQ0xELGdCQUFZQSxVQURQO0FBRUxOLFNBQUtGLE9BQU9FLEdBRlA7QUFHTFEsYUFBU1YsT0FBT1UsT0FIWDtBQUlMQyxjQUFVWCxPQUFPVyxRQUpaO0FBS0xDLGFBQVNaLE9BQU9ZLE9BTFg7QUFNTEMsaUJBQWFiLE9BQU9jLGFBTmY7QUFPTEMsa0JBQWNmLE9BQU9lO0FBUGhCLEdBQVA7QUFTRCxDQVZEOztBQVlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsbUJBQW1CLCtCQUFxQixRQUFyQixDQUF6QjtBQUNBLElBQU1DLDBCQUEwQixzQ0FBNEIsZUFBNUIsQ0FBaEM7O0FBRUE7QUFDQWxCLFdBQVdNLE1BQVgsQ0FBa0JhLEtBQWxCIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInOyAvLyBlbmFibGUgc291cmNlbWFwcyBpbiBub2RlXG5pbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3Mvc2VydmVyJztcbmltcG9ydCBkZWZhdWx0Q29uZmlnIGZyb20gJy4vY29uZmlnL2RlZmF1bHQnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuaW1wb3J0IFBsYXllckV4cGVyaWVuY2UgZnJvbSAnLi9QbGF5ZXJFeHBlcmllbmNlJztcbmltcG9ydCBTaGFwZURlc2lnbmVyRXhwZXJpZW5jZSBmcm9tICcuL1NoYXBlRGVzaWduZXJFeHBlcmllbmNlJztcblxuXG5sZXQgY29uZmlnID0gbnVsbDtcblxuc3dpdGNoKHByb2Nlc3MuZW52LkVOVikge1xuICBkZWZhdWx0OlxuICAgIGNvbmZpZyA9IGRlZmF1bHRDb25maWc7XG4gICAgYnJlYWs7XG59XG5cbi8vIGNvbmZpZ3VyZSBleHByZXNzIGVudmlyb25tZW50ICgncHJvZHVjdGlvbicgZW5hYmxlcyBjYWNoZSBzeXN0ZW1zKVxucHJvY2Vzcy5lbnYuTk9ERV9FTlYgPSBjb25maWcuZW52O1xuLy8gaW5pdGlhbGl6ZSBhcHBsaWNhdGlvbiB3aXRoIGNvbmZpZ3VyYXRpb24gb3B0aW9uc1xuc291bmR3b3Jrcy5zZXJ2ZXIuaW5pdChjb25maWcpO1xuXG4vLyBkZWZpbmUgdGhlIGNvbmZpZ3VyYXRpb24gb2JqZWN0IHRvIGJlIHBhc3NlZCB0byB0aGUgYC5lanNgIHRlbXBsYXRlXG5zb3VuZHdvcmtzLnNlcnZlci5zZXRDbGllbnRDb25maWdEZWZpbml0aW9uKChjbGllbnRUeXBlLCBjb25maWcsIGh0dHBSZXF1ZXN0KSA9PiB7XG4gIHJldHVybiB7XG4gICAgY2xpZW50VHlwZTogY2xpZW50VHlwZSxcbiAgICBlbnY6IGNvbmZpZy5lbnYsXG4gICAgYXBwTmFtZTogY29uZmlnLmFwcE5hbWUsXG4gICAgc29ja2V0SU86IGNvbmZpZy5zb2NrZXRJTyxcbiAgICB2ZXJzaW9uOiBjb25maWcudmVyc2lvbixcbiAgICBkZWZhdWx0VHlwZTogY29uZmlnLmRlZmF1bHRDbGllbnQsXG4gICAgYXNzZXRzRG9tYWluOiBjb25maWcuYXNzZXRzRG9tYWluLFxuICB9O1xufSk7XG5cbi8vIGNyZWF0ZSB0aGUgZXhwZXJpZW5jZVxuLy8gYWN0aXZpdGllcyBtdXN0IGJlIG1hcHBlZCB0byBjbGllbnQgdHlwZXM6XG4vLyAtIHRoZSBgJ3BsYXllcidgIGNsaWVudHMgKHdobyB0YWtlIHBhcnQgaW4gdGhlIHNjZW5hcmlvIGJ5IGNvbm5lY3RpbmcgdG8gdGhlXG4vLyAgIHNlcnZlciB0aHJvdWdoIHRoZSByb290IHVybCkgbmVlZCB0byBjb21tdW5pY2F0ZSB3aXRoIHRoZSBgY2hlY2tpbmAgKHNlZVxuLy8gYHNyYy9zZXJ2ZXIvcGxheWVyRXhwZXJpZW5jZS5qc2ApIGFuZCB0aGUgc2VydmVyIHNpZGUgYHBsYXllckV4cGVyaWVuY2VgLlxuLy8gLSB3ZSBjb3VsZCBhbHNvIG1hcCBhY3Rpdml0aWVzIHRvIGFkZGl0aW9uYWwgY2xpZW50IHR5cGVzICh0aHVzIGRlZmluaW5nIGFcbi8vICAgcm91dGUgKHVybCkgb2YgdGhlIGZvbGxvd2luZyBmb3JtOiBgLyR7Y2xpZW50VHlwZX1gKVxuY29uc3QgcGxheWVyRXhwZXJpZW5jZSA9IG5ldyBQbGF5ZXJFeHBlcmllbmNlKCdwbGF5ZXInKTtcbmNvbnN0IHNoYXBlZGVzaWduZXJFeHBlcmllbmNlID0gbmV3IFNoYXBlRGVzaWduZXJFeHBlcmllbmNlKCdzaGFwZWRlc2lnbmVyJyk7XG5cbi8vIHN0YXJ0IGFwcGxpY2F0aW9uXG5zb3VuZHdvcmtzLnNlcnZlci5zdGFydCgpO1xuIl19