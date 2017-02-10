'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _paramTemplates = require('./paramTemplates');

var _paramTemplates2 = _interopRequireDefault(_paramTemplates);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Generic class for typed parameters.
 *
 * @param {String} name - Name of the parameter.
 * @param {Array} definitionTemplate - List of mandatory keys in the param
 *  definition.
 * @param {Function} typeCheckFunction - Function to be used in order to check
 *  the value against the param definition.
 * @param {Object} definition - Definition of the parameter.
 * @param {Mixed} value - Value of the parameter.
 * @private
 */
var Param = function () {
  function Param(name, definitionTemplate, typeCheckFunction, definition, value) {
    _classCallCheck(this, Param);

    definitionTemplate.forEach(function (key) {
      if (definition.hasOwnProperty(key) === false) throw new Error('Invalid definition for param "' + name + '", ' + key + ' is not defined');
    });

    this.name = name;
    this.type = definition.type;
    this.definition = definition;

    if (this.definition.nullable === true && value === null) this.value = null;else this.value = typeCheckFunction(value, definition, name);
    this._typeCheckFunction = typeCheckFunction;
  }

  /**
   * Returns the current value.
   * @return {Mixed}
   */


  _createClass(Param, [{
    key: 'getValue',
    value: function getValue() {
      return this.value;
    }

    /**
     * Update the current value.
     * @param {Mixed} value - New value of the parameter.
     * @return {Boolean} - `true` if the param has been updated, false otherwise
     *  (e.g. if the parameter already had this value).
     */

  }, {
    key: 'setValue',
    value: function setValue(value) {
      if (this.definition.constant === true) throw new Error('Invalid assignement to constant param "' + this.name + '"');

      if (!(this.definition.nullable === true && value === null)) value = this._typeCheckFunction(value, this.definition, this.name);

      if (this.value !== value) {
        this.value = value;
        return true;
      }

      return false;
    }
  }]);

  return Param;
}();

/**
 * Bag of parameters. Main interface of the library
 */


var ParameterBag = function () {
  function ParameterBag(params, definitions) {
    _classCallCheck(this, ParameterBag);

    /**
     * List of parameters.
     *
     * @type {Object<String, Param>}
     * @name _params
     * @memberof ParameterBag
     * @instance
     * @private
     */
    this._params = params;

    /**
     * List of definitions with init values.
     *
     * @type {Object<String, paramDefinition>}
     * @name _definitions
     * @memberof ParameterBag
     * @instance
     * @private
     */
    this._definitions = definitions;

    /**
     * List of global listeners.
     *
     * @type {Set}
     * @name _globalListeners
     * @memberof ParameterBag
     * @instance
     * @private
     */
    this._globalListeners = new Set();

    /**
     * List of params listeners.
     *
     * @type {Object<String, Set>}
     * @name _paramsListeners
     * @memberof ParameterBag
     * @instance
     * @private
     */
    this._paramsListeners = {};

    // initialize empty Set for each param
    for (var name in params) {
      this._paramsListeners[name] = new Set();
    }
  }

  /**
   * Return the given definitions along with the initialization values.
   *
   * @return {Object}
   */


  _createClass(ParameterBag, [{
    key: 'getDefinitions',
    value: function getDefinitions() {
      var name = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      if (name !== null) return this._definitions[name];else return this._definitions;
    }

    /**
     * Return the value of the given parameter.
     *
     * @param {String} name - Name of the parameter.
     * @return {Mixed} - Value of the parameter.
     */

  }, {
    key: 'get',
    value: function get(name) {
      if (!this._params[name]) throw new Error('Cannot read property value of undefined parameter "' + name + '"');

      return this._params[name].value;
    }

    /**
     * Set the value of a parameter. If the value of the parameter is updated
     * (aka if previous value is different from new value) all registered
     * callbacks are registered.
     *
     * @param {String} name - Name of the parameter.
     * @param {Mixed} value - Value of the parameter.
     * @return {Mixed} - New value of the parameter.
     */

  }, {
    key: 'set',
    value: function set(name, value) {
      var param = this._params[name];
      var updated = param.setValue(value);
      value = param.getValue();

      if (updated) {
        var metas = param.definition.metas;
        // trigger global listeners
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this._globalListeners[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var listener = _step.value;

            listener(name, value, metas);
          } // trigger param listeners
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this._paramsListeners[name][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _listener = _step2.value;

            _listener(value, metas);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }

      return value;
    }

    /**
     * Define if the `name` parameter exists or not.
     *
     * @param {String} name - Name of the parameter.
     * @return {Boolean}
     */

  }, {
    key: 'has',
    value: function has(name) {
      return this._params[name] ? true : false;
    }

    /**
     * Reset a parameter to its init value. Reset all parameters if no argument.
     *
     * @param {String} [name=null] - Name of the parameter to reset.
     */

  }, {
    key: 'reset',
    value: function reset() {
      var _this = this;

      var name = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      if (name !== null) this.set(name, param.definition.initValue);else Object.keys(this._params).forEach(function (name) {
        return _this.reset(name);
      });
    }

    /**
     * @callback ParameterBag~listenerCallback
     * @param {String} name - Parameter name.
     * @param {Mixed} value - Updated value of the parameter.
     * @param {Object} [meta=] - Given meta data of the parameter.
     */

    /**
     * Add listener to all param updates.
     *
     * @param {ParameterBag~listenerCallack} callback - Listener to register.
     */

  }, {
    key: 'addListener',
    value: function addListener(callback) {
      this._globalListeners.add(callback);
    }

    /**
     * Remove listener from all param changes.
     *
     * @param {ParameterBag~listenerCallack} callback - Listener to remove. If
     *  `null` remove all listeners.
     */

  }, {
    key: 'removeListener',
    value: function removeListener() {
      var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      if (callback === null) this._globalListeners.clear();else this._globalListeners.delete(callback);
    }

    /**
     * @callback ParameterBag~paramListenerCallack
     * @param {Mixed} value - Updated value of the parameter.
     * @param {Object} [meta=] - Given meta data of the parameter.
     */

    /**
     * Add listener to a given param updates.
     *
     * @param {String} name - Parameter name.
     * @param {ParameterBag~paramListenerCallack} callback - Function to apply
     *  when the value of the parameter changes.
     */

  }, {
    key: 'addParamListener',
    value: function addParamListener(name, callback) {
      this._paramsListeners[name].add(callback);
    }

    /**
     * Remove listener from a given param updates.
     *
     * @param {String} name - Parameter name.
     * @param {ParameterBag~paramListenerCallack} callback - Listener to remove.
     *  If `null` remove all listeners.
     */

  }, {
    key: 'removeParamListener',
    value: function removeParamListener(name) {
      var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      if (callback === null) this._paramsListeners[name].clear();else this._paramsListeners[name].delete(callback);
    }
  }]);

  return ParameterBag;
}();

/**
 * Factory for the `ParameterBag` class.
 *
 * @param {Object<String, paramDefinition>} definitions - Object describing the
 *  parameters.
 * @param {Object<String, Mixed>} values - Initialization values for the
 *  parameters.
 * @return {ParameterBag}
 */


function parameters(definitions) {
  var values = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var params = {};

  for (var name in values) {
    if (definitions.hasOwnProperty(name) === false) throw new Error('Unknown param "' + name + '"');
  }

  for (var _name in definitions) {
    if (params.hasOwnProperty(_name) === true) throw new Error('Parameter "' + _name + '" already defined');

    var definition = definitions[_name];

    if (!_paramTemplates2.default[definition.type]) throw new Error('Unknown param type "' + definition.type + '"');

    var _paramTemplates$defin = _paramTemplates2.default[definition.type];
    var definitionTemplate = _paramTemplates$defin.definitionTemplate;
    var typeCheckFunction = _paramTemplates$defin.typeCheckFunction;


    var value = void 0;

    if (values.hasOwnProperty(_name) === true) value = values[_name];else value = definition.default;

    // store init value in definition
    definition.initValue = value;

    if (!typeCheckFunction || !definitionTemplate) throw new Error('Invalid param type definition "' + definition.type + '"');

    params[_name] = new Param(_name, definitionTemplate, typeCheckFunction, definition, value);
  }

  return new ParameterBag(params, definitions);
}

/**
 * Register a new type for the `parameters` factory.
 * @param {String} typeName - Value that will be available as the `type` of a
 *  param definition.
 * @param {parameterDefinition} parameterDefinition - Object describing the
 *  parameter.
 */
parameters.defineType = function (typeName, parameterDefinition) {
  _paramTemplates2.default[typeName] = parameterDefinition;
};

exports.default = parameters;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcmFtZXRlcnMuanMiXSwibmFtZXMiOlsiUGFyYW0iLCJuYW1lIiwiZGVmaW5pdGlvblRlbXBsYXRlIiwidHlwZUNoZWNrRnVuY3Rpb24iLCJkZWZpbml0aW9uIiwidmFsdWUiLCJmb3JFYWNoIiwia2V5IiwiaGFzT3duUHJvcGVydHkiLCJFcnJvciIsInR5cGUiLCJudWxsYWJsZSIsIl90eXBlQ2hlY2tGdW5jdGlvbiIsImNvbnN0YW50IiwiUGFyYW1ldGVyQmFnIiwicGFyYW1zIiwiZGVmaW5pdGlvbnMiLCJfcGFyYW1zIiwiX2RlZmluaXRpb25zIiwiX2dsb2JhbExpc3RlbmVycyIsIlNldCIsIl9wYXJhbXNMaXN0ZW5lcnMiLCJwYXJhbSIsInVwZGF0ZWQiLCJzZXRWYWx1ZSIsImdldFZhbHVlIiwibWV0YXMiLCJsaXN0ZW5lciIsInNldCIsImluaXRWYWx1ZSIsIk9iamVjdCIsImtleXMiLCJyZXNldCIsImNhbGxiYWNrIiwiYWRkIiwiY2xlYXIiLCJkZWxldGUiLCJwYXJhbWV0ZXJzIiwidmFsdWVzIiwiZGVmYXVsdCIsImRlZmluZVR5cGUiLCJ0eXBlTmFtZSIsInBhcmFtZXRlckRlZmluaXRpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7Ozs7O0FBRUE7Ozs7Ozs7Ozs7OztJQVlNQSxLO0FBQ0osaUJBQVlDLElBQVosRUFBa0JDLGtCQUFsQixFQUFzQ0MsaUJBQXRDLEVBQXlEQyxVQUF6RCxFQUFxRUMsS0FBckUsRUFBNEU7QUFBQTs7QUFDMUVILHVCQUFtQkksT0FBbkIsQ0FBMkIsVUFBU0MsR0FBVCxFQUFjO0FBQ3ZDLFVBQUlILFdBQVdJLGNBQVgsQ0FBMEJELEdBQTFCLE1BQW1DLEtBQXZDLEVBQ0UsTUFBTSxJQUFJRSxLQUFKLG9DQUEyQ1IsSUFBM0MsV0FBcURNLEdBQXJELHFCQUFOO0FBQ0gsS0FIRDs7QUFLQSxTQUFLTixJQUFMLEdBQVlBLElBQVo7QUFDQSxTQUFLUyxJQUFMLEdBQVlOLFdBQVdNLElBQXZCO0FBQ0Es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QW5COztBQUVGO0FBQ0FuQyxlQUFXeUIsU0FBWCxHQUF1QnhCLEtBQXZCOztBQUVBLFFBQUksQ0FBQ0YsaUJBQUQsSUFBc0IsQ0FBQ0Qsa0JBQTNCLEVBQ0UsTUFBTSxJQUFJTyxLQUFKLHFDQUE0Q0wsV0FBV00sSUFBdkQsT0FBTjs7QUFFRkssV0FBT2QsS0FBUCxJQUFlLElBQUlELEtBQUosQ0FBVUMsS0FBVixFQUFnQkMsa0JBQWhCLEVBQW9DQyxpQkFBcEMsRUFBdURDLFVBQXZELEVBQW1FQyxLQUFuRSxDQUFmO0FBQ0Q7O0FBRUQsU0FBTyxJQUFJUyxZQUFKLENBQWlCQyxNQUFqQixFQUF5QkMsV0FBekIsQ0FBUDtBQUNEOztBQUVEOzs7Ozs7O0FBT0FxQixXQUFXRyxVQUFYLEdBQXdCLFVBQVNDLFFBQVQsRUFBbUJDLG1CQUFuQixFQUF3QztBQUM5RCwyQkFBZUQsUUFBZixJQUEyQkMsbUJBQTNCO0FBQ0QsQ0FGRDs7a0JBSWVMLFUiLCJmaWxlIjoicGFyYW1ldGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXJhbVRlbXBsYXRlcyBmcm9tICcuL3BhcmFtVGVtcGxhdGVzJztcblxuLyoqXG4gKiBHZW5lcmljIGNsYXNzIGZvciB0eXBlZCBwYXJhbWV0ZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gTmFtZSBvZiB0aGUgcGFyYW1ldGVyLlxuICogQHBhcmFtIHtBcnJheX0gZGVmaW5pdGlvblRlbXBsYXRlIC0gTGlzdCBvZiBtYW5kYXRvcnkga2V5cyBpbiB0aGUgcGFyYW1cbiAqICBkZWZpbml0aW9uLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdHlwZUNoZWNrRnVuY3Rpb24gLSBGdW5jdGlvbiB0byBiZSB1c2VkIGluIG9yZGVyIHRvIGNoZWNrXG4gKiAgdGhlIHZhbHVlIGFnYWluc3QgdGhlIHBhcmFtIGRlZmluaXRpb24uXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmaW5pdGlvbiAtIERlZmluaXRpb24gb2YgdGhlIHBhcmFtZXRlci5cbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIC0gVmFsdWUgb2YgdGhlIHBhcmFtZXRlci5cbiAqIEBwcml2YXRlXG4gKi9cbmNsYXNzIFBhcmFtIHtcbiAgY29uc3RydWN0b3IobmFtZSwgZGVmaW5pdGlvblRlbXBsYXRlLCB0eXBlQ2hlY2tGdW5jdGlvbiwgZGVmaW5pdGlvbiwgdmFsdWUpIHtcbiAgICBkZWZpbml0aW9uVGVtcGxhdGUuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgIGlmIChkZWZpbml0aW9uLmhhc093blByb3BlcnR5KGtleSkgPT09IGZhbHNlKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgZGVmaW5pdGlvbiBmb3IgcGFyYW0gXCIke25hbWV9XCIsICR7a2V5fSBpcyBub3QgZGVmaW5lZGApO1xuICAgIH0pO1xuXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnR5cGUgPSBkZWZpbml0aW9uLnR5cGU7XG4gICAgdGhpcy5kZWZpbml0aW9uID0gZGVmaW5pdGlvbjtcblxuICAgIGlmICh0aGlzLmRlZmluaXRpb24ubnVsbGFibGUgPT09IHRydWUgJiYgdmFsdWUgPT09IG51bGwpXG4gICAgICB0aGlzLnZhbHVlID0gbnVsbDtcbiAgICBlbHNlXG4gICAgICB0aGlzLnZhbHVlID0gdHlwZUNoZWNrRnVuY3Rpb24odmFsdWUsIGRlZmluaXRpb24sIG5hbWUpO1xuICAgIHRoaXMuX3R5cGVDaGVja0Z1bmN0aW9uID0gdHlwZUNoZWNrRnVuY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCB2YWx1ZS5cbiAgICogQHJldHVybiB7TWl4ZWR9XG4gICAqL1xuICBnZXRWYWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGN1cnJlbnQgdmFsdWUuXG4gICAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIC0gTmV3IHZhbHVlIG9mIHRoZSBwYXJhbWV0ZXIuXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IC0gYHRydWVgIGlmIHRoZSBwYXJhbSBoYXMgYmVlbiB1cGRhdGVkLCBmYWxzZSBvdGhlcndpc2VcbiAgICogIChlLmcuIGlmIHRoZSBwYXJhbWV0ZXIgYWxyZWFkeSBoYWQgdGhpcyB2YWx1ZSkuXG4gICAqL1xuICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0aGlzLmRlZmluaXRpb24uY29uc3RhbnQgPT09IHRydWUpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgYXNzaWduZW1lbnQgdG8gY29uc3RhbnQgcGFyYW0gXCIke3RoaXMubmFtZX1cImApO1xuXG4gICAgaWYgKCEodGhpcy5kZWZpbml0aW9uLm51bGxhYmxlID09PSB0cnVlICYmIHZhbHVlID09PSBudWxsKSlcbiAgICAgIHZhbHVlID0gdGhpcy5fdHlwZUNoZWNrRnVuY3Rpb24odmFsdWUsIHRoaXMuZGVmaW5pdGlvbiwgdGhpcy5uYW1lKTtcblxuICAgIGlmICh0aGlzLnZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cblxuLyoqXG4gKiBCYWcgb2YgcGFyYW1ldGVycy4gTWFpbiBpbnRlcmZhY2Ugb2YgdGhlIGxpYnJhcnlcbiAqL1xuY2xhc3MgUGFyYW1ldGVyQmFnIHtcbiAgY29uc3RydWN0b3IocGFyYW1zLCBkZWZpbml0aW9ucykge1xuICAgIC8qKlxuICAgICAqIExpc3Qgb2YgcGFyYW1ldGVycy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtPYmplY3Q8U3RyaW5nLCBQYXJhbT59XG4gICAgICogQG5hbWUgX3BhcmFtc1xuICAgICAqIEBtZW1iZXJvZiBQYXJhbWV0ZXJCYWdcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX3BhcmFtcyA9IHBhcmFtcztcblxuICAgIC8qKlxuICAgICAqIExpc3Qgb2YgZGVmaW5pdGlvbnMgd2l0aCBpbml0IHZhbHVlcy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtPYmplY3Q8U3RyaW5nLCBwYXJhbURlZmluaXRpb24+fVxuICAgICAqIEBuYW1lIF9kZWZpbml0aW9uc1xuICAgICAqIEBtZW1iZXJvZiBQYXJhbWV0ZXJCYWdcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX2RlZmluaXRpb25zID0gZGVmaW5pdGlvbnM7XG5cbiAgICAvKipcbiAgICAgKiBMaXN0IG9mIGdsb2JhbCBsaXN0ZW5lcnMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7U2V0fVxuICAgICAqIEBuYW1lIF9nbG9iYWxMaXN0ZW5lcnNcbiAgICAgKiBAbWVtYmVyb2YgUGFyYW1ldGVyQmFnXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9nbG9iYWxMaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG5cbiAgICAvKipcbiAgICAgKiBMaXN0IG9mIHBhcmFtcyBsaXN0ZW5lcnMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7T2JqZWN0PFN0cmluZywgU2V0Pn1cbiAgICAgKiBAbmFtZSBfcGFyYW1zTGlzdGVuZXJzXG4gICAgICogQG1lbWJlcm9mIFBhcmFtZXRlckJhZ1xuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fcGFyYW1zTGlzdGVuZXJzID0ge307XG5cbiAgICAvLyBpbml0aWFsaXplIGVtcHR5IFNldCBmb3IgZWFjaCBwYXJhbVxuICAgIGZvciAobGV0IG5hbWUgaW4gcGFyYW1zKVxuICAgICAgdGhpcy5fcGFyYW1zTGlzdGVuZXJzW25hbWVdID0gbmV3IFNldCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgZ2l2ZW4gZGVmaW5pdGlvbnMgYWxvbmcgd2l0aCB0aGUgaW5pdGlhbGl6YXRpb24gdmFsdWVzLlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqL1xuICBnZXREZWZpbml0aW9ucyhuYW1lID0gbnVsbCkge1xuICAgIGlmIChuYW1lICE9PSBudWxsKVxuICAgICAgcmV0dXJuIHRoaXMuX2RlZmluaXRpb25zW25hbWVdO1xuICAgIGVsc2VcbiAgICAgIHJldHVybiB0aGlzLl9kZWZpbml0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIHZhbHVlIG9mIHRoZSBnaXZlbiBwYXJhbWV0ZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gTmFtZSBvZiB0aGUgcGFyYW1ldGVyLlxuICAgKiBAcmV0dXJuIHtNaXhlZH0gLSBWYWx1ZSBvZiB0aGUgcGFyYW1ldGVyLlxuICAgKi9cbiAgZ2V0KG5hbWUpIHtcbiAgICBpZiAoIXRoaXMuX3BhcmFtc1tuYW1lXSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHJlYWQgcHJvcGVydHkgdmFsdWUgb2YgdW5kZWZpbmVkIHBhcmFtZXRlciBcIiR7bmFtZX1cImApO1xuXG4gICAgcmV0dXJuIHRoaXMuX3BhcmFtc1tuYW1lXS52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHZhbHVlIG9mIGEgcGFyYW1ldGVyLiBJZiB0aGUgdmFsdWUgb2YgdGhlIHBhcmFtZXRlciBpcyB1cGRhdGVkXG4gICAqIChha2EgaWYgcHJldmlvdXMgdmFsdWUgaXMgZGlmZmVyZW50IGZyb20gbmV3IHZhbHVlKSBhbGwgcmVnaXN0ZXJlZFxuICAgKiBjYWxsYmFja3MgYXJlIHJlZ2lzdGVyZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gTmFtZSBvZiB0aGUgcGFyYW1ldGVyLlxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZSAtIFZhbHVlIG9mIHRoZSBwYXJhbWV0ZXIuXG4gICAqIEByZXR1cm4ge01peGVkfSAtIE5ldyB2YWx1ZSBvZiB0aGUgcGFyYW1ldGVyLlxuICAgKi9cbiAgc2V0KG5hbWUsIHZhbHVlKSB7XG4gICAgY29uc3QgcGFyYW0gPSB0aGlzLl9wYXJhbXNbbmFtZV07XG4gICAgY29uc3QgdXBkYXRlZCA9IHBhcmFtLnNldFZhbHVlKHZhbHVlKTtcbiAgICB2YWx1ZSA9IHBhcmFtLmdldFZhbHVlKCk7XG5cbiAgICBpZiAodXBkYXRlZCkge1xuICAgICAgY29uc3QgbWV0YXMgPSBwYXJhbS5kZWZpbml0aW9uLm1ldGFzO1xuICAgICAgLy8gdHJpZ2dlciBnbG9iYWwgbGlzdGVuZXJzXG4gICAgICBmb3IgKGxldCBsaXN0ZW5lciBvZiB0aGlzLl9nbG9iYWxMaXN0ZW5lcnMpXG4gICAgICAgIGxpc3RlbmVyKG5hbWUsIHZhbHVlLCBtZXRhcyk7XG5cbiAgICAgIC8vIHRyaWdnZXIgcGFyYW0gbGlzdGVuZXJzXG4gICAgICBmb3IgKGxldCBsaXN0ZW5lciBvZiB0aGlzLl9wYXJhbXNMaXN0ZW5lcnNbbmFtZV0pXG4gICAgICAgIGxpc3RlbmVyKHZhbHVlLCBtZXRhcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIERlZmluZSBpZiB0aGUgYG5hbWVgIHBhcmFtZXRlciBleGlzdHMgb3Igbm90LlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIE5hbWUgb2YgdGhlIHBhcmFtZXRlci5cbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG4gIGhhcyhuYW1lKSB7XG4gICAgcmV0dXJuICh0aGlzLl9wYXJhbXNbbmFtZV0pID8gdHJ1ZSA6IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IGEgcGFyYW1ldGVyIHRvIGl0cyBpbml0IHZhbHVlLiBSZXNldCBhbGwgcGFyYW1ldGVycyBpZiBubyBhcmd1bWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IFtuYW1lPW51bGxdIC0gTmFtZSBvZiB0aGUgcGFyYW1ldGVyIHRvIHJlc2V0LlxuICAgKi9cbiAgcmVzZXQobmFtZSA9IG51bGwpIHtcbiAgICBpZiAobmFtZSAhPT0gbnVsbClcbiAgICAgIHRoaXMuc2V0KG5hbWUsIHBhcmFtLmRlZmluaXRpb24uaW5pdFZhbHVlKTtcbiAgICBlbHNlXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLl9wYXJhbXMpLmZvckVhY2goKG5hbWUpID0+IHRoaXMucmVzZXQobmFtZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBjYWxsYmFjayBQYXJhbWV0ZXJCYWd+bGlzdGVuZXJDYWxsYmFja1xuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIFBhcmFtZXRlciBuYW1lLlxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZSAtIFVwZGF0ZWQgdmFsdWUgb2YgdGhlIHBhcmFtZXRlci5cbiAgICogQHBhcmFtIHtPYmplY3R9IFttZXRhPV0gLSBHaXZlbiBtZXRhIGRhdGEgb2YgdGhlIHBhcmFtZXRlci5cbiAgICovXG5cbiAgLyoqXG4gICAqIEFkZCBsaXN0ZW5lciB0byBhbGwgcGFyYW0gdXBkYXRlcy5cbiAgICpcbiAgICogQHBhcmFtIHtQYXJhbWV0ZXJCYWd+bGlzdGVuZXJDYWxsYWNrfSBjYWxsYmFjayAtIExpc3RlbmVyIHRvIHJlZ2lzdGVyLlxuICAgKi9cbiAgYWRkTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgICB0aGlzLl9nbG9iYWxMaXN0ZW5lcnMuYWRkKGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgbGlzdGVuZXIgZnJvbSBhbGwgcGFyYW0gY2hhbmdlcy5cbiAgICpcbiAgICogQHBhcmFtIHtQYXJhbWV0ZXJCYWd+bGlzdGVuZXJDYWxsYWNrfSBjYWxsYmFjayAtIExpc3RlbmVyIHRvIHJlbW92ZS4gSWZcbiAgICogIGBudWxsYCByZW1vdmUgYWxsIGxpc3RlbmVycy5cbiAgICovXG4gIHJlbW92ZUxpc3RlbmVyKGNhbGxiYWNrID0gbnVsbCkge1xuICAgIGlmIChjYWxsYmFjayA9PT0gbnVsbClcbiAgICAgIHRoaXMuX2dsb2JhbExpc3RlbmVycy5jbGVhcigpO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuX2dsb2JhbExpc3RlbmVycy5kZWxldGUoY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIEBjYWxsYmFjayBQYXJhbWV0ZXJCYWd+cGFyYW1MaXN0ZW5lckNhbGxhY2tcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgLSBVcGRhdGVkIHZhbHVlIG9mIHRoZSBwYXJhbWV0ZXIuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbbWV0YT1dIC0gR2l2ZW4gbWV0YSBkYXRhIG9mIHRoZSBwYXJhbWV0ZXIuXG4gICAqL1xuXG4gIC8qKlxuICAgKiBBZGQgbGlzdGVuZXIgdG8gYSBnaXZlbiBwYXJhbSB1cGRhdGVzLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIFBhcmFtZXRlciBuYW1lLlxuICAgKiBAcGFyYW0ge1BhcmFtZXRlckJhZ35wYXJhbUxpc3RlbmVyQ2FsbGFja30gY2FsbGJhY2sgLSBGdW5jdGlvbiB0byBhcHBseVxuICAgKiAgd2hlbiB0aGUgdmFsdWUgb2YgdGhlIHBhcmFtZXRlciBjaGFuZ2VzLlxuICAgKi9cbiAgYWRkUGFyYW1MaXN0ZW5lcihuYW1lLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX3BhcmFtc0xpc3RlbmVyc1tuYW1lXS5hZGQoY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBsaXN0ZW5lciBmcm9tIGEgZ2l2ZW4gcGFyYW0gdXBkYXRlcy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBQYXJhbWV0ZXIgbmFtZS5cbiAgICogQHBhcmFtIHtQYXJhbWV0ZXJCYWd+cGFyYW1MaXN0ZW5lckNhbGxhY2t9IGNhbGxiYWNrIC0gTGlzdGVuZXIgdG8gcmVtb3ZlLlxuICAgKiAgSWYgYG51bGxgIHJlbW92ZSBhbGwgbGlzdGVuZXJzLlxuICAgKi9cbiAgcmVtb3ZlUGFyYW1MaXN0ZW5lcihuYW1lLCBjYWxsYmFjayA9IG51bGwpIHtcbiAgICBpZiAoY2FsbGJhY2sgPT09IG51bGwpXG4gICAgICB0aGlzLl9wYXJhbXNMaXN0ZW5lcnNbbmFtZV0uY2xlYXIoKTtcbiAgICBlbHNlXG4gICAgICB0aGlzLl9wYXJhbXNMaXN0ZW5lcnNbbmFtZV0uZGVsZXRlKGNhbGxiYWNrKTtcbiAgfVxufVxuXG4vKipcbiAqIEZhY3RvcnkgZm9yIHRoZSBgUGFyYW1ldGVyQmFnYCBjbGFzcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdDxTdHJpbmcsIHBhcmFtRGVmaW5pdGlvbj59IGRlZmluaXRpb25zIC0gT2JqZWN0IGRlc2NyaWJpbmcgdGhlXG4gKiAgcGFyYW1ldGVycy5cbiAqIEBwYXJhbSB7T2JqZWN0PFN0cmluZywgTWl4ZWQ+fSB2YWx1ZXMgLSBJbml0aWFsaXphdGlvbiB2YWx1ZXMgZm9yIHRoZVxuICogIHBhcmFtZXRlcnMuXG4gKiBAcmV0dXJuIHtQYXJhbWV0ZXJCYWd9XG4gKi9cbmZ1bmN0aW9uIHBhcmFtZXRlcnMoZGVmaW5pdGlvbnMsIHZhbHVlcyA9IHt9KSB7XG4gIGNvbnN0IHBhcmFtcyA9IHt9O1xuXG4gIGZvciAobGV0IG5hbWUgaW4gdmFsdWVzKSB7XG4gICAgaWYgKGRlZmluaXRpb25zLmhhc093blByb3BlcnR5KG5hbWUpID09PSBmYWxzZSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBwYXJhbSBcIiR7bmFtZX1cImApO1xuICB9XG5cbiAgZm9yIChsZXQgbmFtZSBpbiBkZWZpbml0aW9ucykge1xuICAgIGlmIChwYXJhbXMuaGFzT3duUHJvcGVydHkobmFtZSkgPT09IHRydWUpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFBhcmFtZXRlciBcIiR7bmFtZX1cIiBhbHJlYWR5IGRlZmluZWRgKTtcblxuICAgIGNvbnN0IGRlZmluaXRpb24gPSBkZWZpbml0aW9uc1tuYW1lXTtcblxuICAgIGlmICghcGFyYW1UZW1wbGF0ZXNbZGVmaW5pdGlvbi50eXBlXSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBwYXJhbSB0eXBlIFwiJHtkZWZpbml0aW9uLnR5cGV9XCJgKTtcblxuICAgIGNvbnN0IHtcbiAgICAgIGRlZmluaXRpb25UZW1wbGF0ZSxcbiAgICAgIHR5cGVDaGVja0Z1bmN0aW9uXG4gICAgfSA9IHBhcmFtVGVtcGxhdGVzW2RlZmluaXRpb24udHlwZV07XG5cbiAgICBsZXQgdmFsdWU7XG5cbiAgICBpZiAodmFsdWVzLmhhc093blByb3BlcnR5KG5hbWUpID09PSB0cnVlKVxuICAgICAgdmFsdWUgPSB2YWx1ZXNbbmFtZV07XG4gICAgZWxzZVxuICAgICAgdmFsdWUgPSBkZWZpbml0aW9uLmRlZmF1bHQ7XG5cbiAgICAvLyBzdG9yZSBpbml0IHZhbHVlIGluIGRlZmluaXRpb25cbiAgICBkZWZpbml0aW9uLmluaXRWYWx1ZSA9IHZhbHVlO1xuXG4gICAgaWYgKCF0eXBlQ2hlY2tGdW5jdGlvbiB8fMKgIWRlZmluaXRpb25UZW1wbGF0ZSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYXJhbSB0eXBlIGRlZmluaXRpb24gXCIke2RlZmluaXRpb24udHlwZX1cImApO1xuXG4gICAgcGFyYW1zW25hbWVdID0gbmV3IFBhcmFtKG5hbWUsIGRlZmluaXRpb25UZW1wbGF0ZSwgdHlwZUNoZWNrRnVuY3Rpb24sIGRlZmluaXRpb24sIHZhbHVlKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUGFyYW1ldGVyQmFnKHBhcmFtcywgZGVmaW5pdGlvbnMpO1xufVxuXG4vKipcbiAqIFJlZ2lzdGVyIGEgbmV3IHR5cGUgZm9yIHRoZSBgcGFyYW1ldGVyc2AgZmFjdG9yeS5cbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlTmFtZSAtIFZhbHVlIHRoYXQgd2lsbCBiZSBhdmFpbGFibGUgYXMgdGhlIGB0eXBlYCBvZiBhXG4gKiAgcGFyYW0gZGVmaW5pdGlvbi5cbiAqIEBwYXJhbSB7cGFyYW1ldGVyRGVmaW5pdGlvbn0gcGFyYW1ldGVyRGVmaW5pdGlvbiAtIE9iamVjdCBkZXNjcmliaW5nIHRoZVxuICogIHBhcmFtZXRlci5cbiAqL1xucGFyYW1ldGVycy5kZWZpbmVUeXBlID0gZnVuY3Rpb24odHlwZU5hbWUsIHBhcmFtZXRlckRlZmluaXRpb24pIHtcbiAgcGFyYW1UZW1wbGF0ZXNbdHlwZU5hbWVdID0gcGFyYW1ldGVyRGVmaW5pdGlvbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcGFyYW1ldGVycztcbiJdfQ==