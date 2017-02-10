'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var min = Math.min;
var max = Math.max;

function clip(value) {
  var lower = arguments.length <= 1 || arguments[1] === undefined ? -Infinity : arguments[1];
  var upper = arguments.length <= 2 || arguments[2] === undefined ? +Infinity : arguments[2];

  return max(lower, min(upper, value));
}

/**
 * Dictionnary of the available types. Each key correspond to the type of the
 * implemented param while the corresponding object value should the
 * {@link `paramDefinition`} of the defined type.
 *
 * typedef {Object} paramTemplates
 * @type {Object<String, paramTemplate>}
 */

/**
 * Definition of a parameter. The definition should at least contain the entries
 * `type` and `default`. Every parameter can also accept optionnal configuration
 * entries `constant` and `metas`.
 * Available definitions are:
 * - {@link booleanDefinition}
 * - {@link integerDefinition}
 * - {@link floatDefinition}
 * - {@link stringDefinition}
 * - {@link enumDefinition}
 *
 * typedef {Object} paramDefinition
 * @property {String} type - Type of the parameter.
 * @property {Mixed} default - Default value of the parameter if no
 *  initialization value is provided.
 * @property {Boolean} [constant=false] - Define if the parameter can be change
 *  after its initialization.
 * @property {Object} [metas=null] - Any user defined data associated to the
 *  parameter that couls be usefull in the application.
 */

exports.default = {
  /**
   * @typedef {Object} booleanDefinition
   * @property {String} [type='boolean'] - Define a boolean parameter.
   * @property {Boolean} default - Default value of the parameter.
   * @property {Boolean} [constant=false] - Define if the parameter is constant.
   * @property {Object} [metas={}] - Optionnal metadata of the parameter.
   */
  boolean: {
    definitionTemplate: ['default'],
    typeCheckFunction: function typeCheckFunction(value, definition, name) {
      if (typeof value !== 'boolean') throw new Error('Invalid value for boolean param "' + name + '": ' + value);

      return value;
    }
  },

  /**
   * @typedef {Object} integerDefinition
   * @property {String} [type='integer'] - Define a boolean parameter.
   * @property {Boolean} default - Default value of the parameter.
   * @property {Boolean} [min=-Infinity] - Minimum value of the parameter.
   * @property {Boolean} [max=+Infinity] - Maximum value of the parameter.
   * @property {Boolean} [constant=false] - Define if the parameter is constant.
   * @property {Object} [metas={}] - Optionnal metadata of the parameter.
   */
  integer: {
    definitionTemplate: ['default'],
    typeCheckFunction: function typeCheckFunction(value, definition, name) {
      if (!(typeof value === 'number' && Math.floor(value) === value)) throw new Error('Invalid value for integer param "' + name + '": ' + value);

      return clip(value, definition.min, definition.max);
    }
  },

  /**
   * @typedef {Object} floatDefinition
   * @property {String} [type='float'] - Define a boolean parameter.
   * @property {Boolean} default - Default value of the parameter.
   * @property {Boolean} [min=-Infinity] - Minimum value of the parameter.
   * @property {Boolean} [max=+Infinity] - Maximum value of the parameter.
   * @property {Boolean} [constant=false] - Define if the parameter is constant.
   * @property {Object} [metas={}] - Optionnal metadata of the parameter.
   */
  float: {
    definitionTemplate: ['default'],
    typeCheckFunction: function typeCheckFunction(value, definition, name) {
      if (typeof value !== 'number' || value !== value) // reject NaN
        throw new Error('Invalid value for float param "' + name + '": ' + value);

      return clip(value, definition.min, definition.max);
    }
  },

  /**
   * @typedef {Object} stringDefinition
   * @property {String} [type='string'] - Define a boolean parameter.
   * @property {Boolean} default - Default value of the parameter.
   * @property {Boolean} [constant=false] - Define if the parameter is constant.
   * @property {Object} [metas={}] - Optionnal metadata of the parameter.
   */
  string: {
    definitionTemplate: ['default'],
    typeCheckFunction: function typeCheckFunction(value, definition, name) {
      if (typeof value !== 'string') throw new Error('Invalid value for string param "' + name + '": ' + value);

      return value;
    }
  },

  /**
   * @typedef {Object} enumDefinition
   * @property {String} [type='enum'] - Define a boolean parameter.
   * @property {Boolean} default - Default value of the parameter.
   * @property {Array} list - Possible values of the parameter.
   * @property {Boolean} [constant=false] - Define if the parameter is constant.
   * @property {Object} [metas={}] - Optionnal metadata of the parameter.
   */
  enum: {
    definitionTemplate: ['default', 'list'],
    typeCheckFunction: function typeCheckFunction(value, definition, name) {
      if (definition.list.indexOf(value) === -1) throw new Error('Invalid value for enum param "' + name + '": ' + value);

      return value;
    }
  },

  /**
   * @typedef {Object} anyDefinition
   * @property {String} [type='enum'] - Define a parameter of any type.
   * @property {Boolean} default - Default value of the parameter.
   * @property {Boolean} [constant=false] - Define if the parameter is constant.
   * @property {Object} [metas={}] - Optionnal metadata of the parameter.
   */
  any: {
    definitionTemplate: ['default'],
    typeCheckFunction: function typeCheckFunction(value, definition, name) {
      // no check as it can have any type...
      return value;
    }
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcmFtVGVtcGxhdGVzLmpzIl0sIm5hbWVzIjpbIm1pbiIsIk1hdGgiLCJtYXgiLCJjbGlwIiwidmFsdWUiLCJsb3dlciIsIkluZmluaXR5IiwidXBwZXIiLCJib29sZWFuIiwiZGVmaW5pdGlvblRlbXBsYXRlIiwidHlwZUNoZWNrRnVuY3Rpb24iLCJkZWZpbml0aW9uIiwibmFtZSIsIkVycm9yIiwiaW50ZWdlciIsImZsb29yIiwiZmxvYXQiLCJzdHJpbmciLCJlbnVtIiwibGlzdCIsImluZGV4T2YiLCJhbnkiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsSUFBTUEsTUFBTUMsS0FBS0QsR0FBakI7QUFDQSxJQUFNRSxNQUFNRCxLQUFLQyxHQUFqQjs7QUFFQSxTQUFTQyxJQUFULENBQWNDLEtBQWQsRUFBMkQ7QUFBQSxNQUF0Q0MsS0FBc0MseURBQTlCLENBQUNDLFFBQTZCO0FBQUEsTUFBbkJDLEtBQW1CLHlEQUFYLENBQUNELFFBQVU7O0FBQ3pELFNBQU9KLElBQUlHLEtBQUosRUFBV0wsSUFBSU8sS0FBSixFQUFXSCxLQUFYLENBQVgsQ0FBUDtBQUNEOztBQUVEOzs7Ozs7Ozs7QUFTQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQXFCZTtBQUNiOzs7Ozs7O0FBT0FJLFdBQVM7QUFDUEMsd0JBQW9CLENBQUMsU0FBRCxDQURiO0FBRVBDLHFCQUZPLDZCQUVXTixLQUZYLEVBRWtCTyxVQUZsQixFQUU4QkMsSUFGOUIsRUFFb0M7QUFDekMsVUFBSSxPQUFPUixLQUFQLEtBQWlCLFNBQXJCLEVBQ0UsTUFBTSxJQUFJUyxLQUFKLHVDQUE4Q0QsSUFBOUMsV0FBd0RSLEtBQXhELENBQU47O0FBRUYsYUFBT0EsS0FBUDtBQUNEO0FBUE0sR0FSSTs7QUFrQmI7Ozs7Ozs7OztBQVNBVSxXQUFTO0FBQ1BMLHdCQUFvQixDQUFDLFNBQUQsQ0FEYjtBQUVQQyxxQkFGTyw2QkFFV04sS0FGWCxFQUVrQk8sVUFGbEIsRUFFOEJDLElBRjlCLEVBRW9DO0FBQ3pDLFVBQUksRUFBRSxPQUFPUixLQUFQLEtBQWlCLFFBQWpCLElBQTZCSCxLQUFLYyxLQUFMLENBQVdYLEtBQVgsTUFBc0JBLEtBQXJELENBQUosRUFDRSxNQUFNLElBQUlTLEtBQUosdUNBQThDRCxJQUE5QyxXQUF3RFIsS0FBeEQsQ0FBTjs7QUFFRixhQUFPRCxLQUFLQyxLQUFMLEVBQVlPLFdBQVdYLEdBQXZCLEVBQTRCVyxXQUFXVCxHQUF2QyxDQUFQO0FBQ0Q7QUFQTSxHQTNCSTs7QUFxQ2I7Ozs7Ozs7OztBQVNBYyxTQUFPO0FBQ0xQLHdCQUFvQixDQUFDLFNBQUQsQ0FEZjtBQUVMQyxxQkFGSyw2QkFFYU4sS0FGYixFQUVvQk8sVUFGcEIsRUFFZ0NDLElBRmhDLEVBRXNDO0FBQ3pDLFVBQUksT0FBT1IsS0FBUCxLQUFpQixRQUFqQixJQUE2QkEsVUFBVUEsS0FBM0MsRUFBa0Q7QUFDaEQsY0FBTSxJQUFJUyxLQUFKLHFDQUE0Q0QsSUFBNUMsV0FBc0RSLEtBQXRELENBQU47O0FBRUYsYUFBT0QsS0FBS0MsS0FBTCxFQUFZTyxXQUFXWCxHQUF2QixFQUE0QlcsV0FBV1QsR0FBdkMsQ0FBUDtBQUNEO0FBUEksR0E5Q007O0FBd0RiOzs7Ozs7O0FBT0FlLFVBQVE7QUFDTlIsd0JBQW9CLENBQUMsU0FBRCxDQURkO0FBRU5DLHFCQUZNLDZCQUVZTixLQUZaLEVBRW1CTyxVQUZuQixFQUUrQkMsSUFGL0IsRUFFcUM7QUFDekMsVUFBSSxPQUFPUixLQUFQLEtBQWlCLFFBQXJCLEVBQ0UsTUFBTSxJQUFJUyxLQUFKLHNDQUE2Q0QsSUFBN0MsV0FBdURSLEtBQXZELENBQU47O0FBRUYsYUFBT0EsS0FBUDtBQUNEO0FBUEssR0EvREs7O0FBeUViOzs7Ozs7OztBQVFBYyxRQUFNO0FBQ0pULHdCQUFvQixDQUFDLFNBQUQsRUFBWSxNQUFaLENBRGhCO0FBRUpDLHFCQUZJLDZCQUVjTixLQUZkLEVBRXFCTyxVQUZyQixFQUVpQ0MsSUFGakMsRUFFdUM7QUFDekMsVUFBSUQsV0FBV1EsSUFBWCxDQUFnQkMsT0FBaEIsQ0FBd0JoQixLQUF4QixNQUFtQyxDQUFDLENBQXhDLEVBQ0UsTUFBTSxJQUFJUyxLQUFKLG9DQUEyQ0QsSUFBM0MsV0FBcURSLEtBQXJELENBQU47O0FBRUYsYUFBT0EsS0FBUDtBQUNEO0FBUEcsR0FqRk87O0FBMkZiOzs7Ozs7O0FBT0FpQixPQUFLO0FBQ0haLHdCQUFvQixDQUFDLFNBQUQsQ0FEakI7QUFFSEMscUJBRkcsNkJBRWVOLEtBRmYsRUFFc0JPLFVBRnRCLEVBRWtDQyxJQUZsQyxFQUV3QztBQUN6QztBQUNBLGFBQU9SLEtBQVA7QUFDRDtBQUxFO0FBbEdRLEMiLCJmaWxlIjoicGFyYW1UZW1wbGF0ZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBtaW4gPSBNYXRoLm1pbjtcbmNvbnN0IG1heCA9IE1hdGgubWF4O1xuXG5mdW5jdGlvbiBjbGlwKHZhbHVlLCBsb3dlciA9IC1JbmZpbml0eSwgdXBwZXIgPSArSW5maW5pdHkpIHtcbiAgcmV0dXJuIG1heChsb3dlciwgbWluKHVwcGVyLCB2YWx1ZSkpXG59XG5cbi8qKlxuICogRGljdGlvbm5hcnkgb2YgdGhlIGF2YWlsYWJsZSB0eXBlcy4gRWFjaCBrZXkgY29ycmVzcG9uZCB0byB0aGUgdHlwZSBvZiB0aGVcbiAqIGltcGxlbWVudGVkIHBhcmFtIHdoaWxlIHRoZSBjb3JyZXNwb25kaW5nIG9iamVjdCB2YWx1ZSBzaG91bGQgdGhlXG4gKiB7QGxpbmsgYHBhcmFtRGVmaW5pdGlvbmB9IG9mIHRoZSBkZWZpbmVkIHR5cGUuXG4gKlxuICogdHlwZWRlZiB7T2JqZWN0fSBwYXJhbVRlbXBsYXRlc1xuICogQHR5cGUge09iamVjdDxTdHJpbmcsIHBhcmFtVGVtcGxhdGU+fVxuICovXG5cbi8qKlxuICogRGVmaW5pdGlvbiBvZiBhIHBhcmFtZXRlci4gVGhlIGRlZmluaXRpb24gc2hvdWxkIGF0IGxlYXN0IGNvbnRhaW4gdGhlIGVudHJpZXNcbiAqIGB0eXBlYCBhbmQgYGRlZmF1bHRgLiBFdmVyeSBwYXJhbWV0ZXIgY2FuIGFsc28gYWNjZXB0IG9wdGlvbm5hbCBjb25maWd1cmF0aW9uXG4gKiBlbnRyaWVzIGBjb25zdGFudGAgYW5kIGBtZXRhc2AuXG4gKiBBdmFpbGFibGUgZGVmaW5pdGlvbnMgYXJlOlxuICogLSB7QGxpbmsgYm9vbGVhbkRlZmluaXRpb259XG4gKiAtIHtAbGluayBpbnRlZ2VyRGVmaW5pdGlvbn1cbiAqIC0ge0BsaW5rIGZsb2F0RGVmaW5pdGlvbn1cbiAqIC0ge0BsaW5rIHN0cmluZ0RlZmluaXRpb259XG4gKiAtIHtAbGluayBlbnVtRGVmaW5pdGlvbn1cbiAqXG4gKiB0eXBlZGVmIHtPYmplY3R9IHBhcmFtRGVmaW5pdGlvblxuICogQHByb3BlcnR5IHtTdHJpbmd9IHR5cGUgLSBUeXBlIG9mIHRoZSBwYXJhbWV0ZXIuXG4gKiBAcHJvcGVydHkge01peGVkfSBkZWZhdWx0IC0gRGVmYXVsdCB2YWx1ZSBvZiB0aGUgcGFyYW1ldGVyIGlmIG5vXG4gKiAgaW5pdGlhbGl6YXRpb24gdmFsdWUgaXMgcHJvdmlkZWQuXG4gKiBAcHJvcGVydHkge0Jvb2xlYW59IFtjb25zdGFudD1mYWxzZV0gLSBEZWZpbmUgaWYgdGhlIHBhcmFtZXRlciBjYW4gYmUgY2hhbmdlXG4gKiAgYWZ0ZXIgaXRzIGluaXRpYWxpemF0aW9uLlxuICogQHByb3BlcnR5IHtPYmplY3R9IFttZXRhcz1udWxsXSAtIEFueSB1c2VyIGRlZmluZWQgZGF0YSBhc3NvY2lhdGVkIHRvIHRoZVxuICogIHBhcmFtZXRlciB0aGF0IGNvdWxzIGJlIHVzZWZ1bGwgaW4gdGhlIGFwcGxpY2F0aW9uLlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgLyoqXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IGJvb2xlYW5EZWZpbml0aW9uXG4gICAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBbdHlwZT0nYm9vbGVhbiddIC0gRGVmaW5lIGEgYm9vbGVhbiBwYXJhbWV0ZXIuXG4gICAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gZGVmYXVsdCAtIERlZmF1bHQgdmFsdWUgb2YgdGhlIHBhcmFtZXRlci5cbiAgICogQHByb3BlcnR5IHtCb29sZWFufSBbY29uc3RhbnQ9ZmFsc2VdIC0gRGVmaW5lIGlmIHRoZSBwYXJhbWV0ZXIgaXMgY29uc3RhbnQuXG4gICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBbbWV0YXM9e31dIC0gT3B0aW9ubmFsIG1ldGFkYXRhIG9mIHRoZSBwYXJhbWV0ZXIuXG4gICAqL1xuICBib29sZWFuOiB7XG4gICAgZGVmaW5pdGlvblRlbXBsYXRlOiBbJ2RlZmF1bHQnXSxcbiAgICB0eXBlQ2hlY2tGdW5jdGlvbih2YWx1ZSwgZGVmaW5pdGlvbiwgbmFtZSkge1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Jvb2xlYW4nKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmFsdWUgZm9yIGJvb2xlYW4gcGFyYW0gXCIke25hbWV9XCI6ICR7dmFsdWV9YCk7XG5cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IGludGVnZXJEZWZpbml0aW9uXG4gICAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBbdHlwZT0naW50ZWdlciddIC0gRGVmaW5lIGEgYm9vbGVhbiBwYXJhbWV0ZXIuXG4gICAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gZGVmYXVsdCAtIERlZmF1bHQgdmFsdWUgb2YgdGhlIHBhcmFtZXRlci5cbiAgICogQHByb3BlcnR5IHtCb29sZWFufSBbbWluPS1JbmZpbml0eV0gLSBNaW5pbXVtIHZhbHVlIG9mIHRoZSBwYXJhbWV0ZXIuXG4gICAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gW21heD0rSW5maW5pdHldIC0gTWF4aW11bSB2YWx1ZSBvZiB0aGUgcGFyYW1ldGVyLlxuICAgKiBAcHJvcGVydHkge0Jvb2xlYW59IFtjb25zdGFudD1mYWxzZV0gLSBEZWZpbmUgaWYgdGhlIHBhcmFtZXRlciBpcyBjb25zdGFudC5cbiAgICogQHByb3BlcnR5IHtPYmplY3R9IFttZXRhcz17fV0gLSBPcHRpb25uYWwgbWV0YWRhdGEgb2YgdGhlIHBhcmFtZXRlci5cbiAgICovXG4gIGludGVnZXI6IHtcbiAgICBkZWZpbml0aW9uVGVtcGxhdGU6IFsnZGVmYXVsdCddLFxuICAgIHR5cGVDaGVja0Z1bmN0aW9uKHZhbHVlLCBkZWZpbml0aW9uLCBuYW1lKSB7XG4gICAgICBpZiAoISh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2YWx1ZSBmb3IgaW50ZWdlciBwYXJhbSBcIiR7bmFtZX1cIjogJHt2YWx1ZX1gKTtcblxuICAgICAgcmV0dXJuIGNsaXAodmFsdWUsIGRlZmluaXRpb24ubWluLCBkZWZpbml0aW9uLm1heCk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBmbG9hdERlZmluaXRpb25cbiAgICogQHByb3BlcnR5IHtTdHJpbmd9IFt0eXBlPSdmbG9hdCddIC0gRGVmaW5lIGEgYm9vbGVhbiBwYXJhbWV0ZXIuXG4gICAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gZGVmYXVsdCAtIERlZmF1bHQgdmFsdWUgb2YgdGhlIHBhcmFtZXRlci5cbiAgICogQHByb3BlcnR5IHtCb29sZWFufSBbbWluPS1JbmZpbml0eV0gLSBNaW5pbXVtIHZhbHVlIG9mIHRoZSBwYXJhbWV0ZXIuXG4gICAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gW21heD0rSW5maW5pdHldIC0gTWF4aW11bSB2YWx1ZSBvZiB0aGUgcGFyYW1ldGVyLlxuICAgKiBAcHJvcGVydHkge0Jvb2xlYW59IFtjb25zdGFudD1mYWxzZV0gLSBEZWZpbmUgaWYgdGhlIHBhcmFtZXRlciBpcyBjb25zdGFudC5cbiAgICogQHByb3BlcnR5IHtPYmplY3R9IFttZXRhcz17fV0gLSBPcHRpb25uYWwgbWV0YWRhdGEgb2YgdGhlIHBhcmFtZXRlci5cbiAgICovXG4gIGZsb2F0OiB7XG4gICAgZGVmaW5pdGlvblRlbXBsYXRlOiBbJ2RlZmF1bHQnXSxcbiAgICB0eXBlQ2hlY2tGdW5jdGlvbih2YWx1ZSwgZGVmaW5pdGlvbiwgbmFtZSkge1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicgfHzCoHZhbHVlICE9PSB2YWx1ZSkgLy8gcmVqZWN0IE5hTlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmFsdWUgZm9yIGZsb2F0IHBhcmFtIFwiJHtuYW1lfVwiOiAke3ZhbHVlfWApO1xuXG4gICAgICByZXR1cm4gY2xpcCh2YWx1ZSwgZGVmaW5pdGlvbi5taW4sIGRlZmluaXRpb24ubWF4KTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IHN0cmluZ0RlZmluaXRpb25cbiAgICogQHByb3BlcnR5IHtTdHJpbmd9IFt0eXBlPSdzdHJpbmcnXSAtIERlZmluZSBhIGJvb2xlYW4gcGFyYW1ldGVyLlxuICAgKiBAcHJvcGVydHkge0Jvb2xlYW59IGRlZmF1bHQgLSBEZWZhdWx0IHZhbHVlIG9mIHRoZSBwYXJhbWV0ZXIuXG4gICAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gW2NvbnN0YW50PWZhbHNlXSAtIERlZmluZSBpZiB0aGUgcGFyYW1ldGVyIGlzIGNvbnN0YW50LlxuICAgKiBAcHJvcGVydHkge09iamVjdH0gW21ldGFzPXt9XSAtIE9wdGlvbm5hbCBtZXRhZGF0YSBvZiB0aGUgcGFyYW1ldGVyLlxuICAgKi9cbiAgc3RyaW5nOiB7XG4gICAgZGVmaW5pdGlvblRlbXBsYXRlOiBbJ2RlZmF1bHQnXSxcbiAgICB0eXBlQ2hlY2tGdW5jdGlvbih2YWx1ZSwgZGVmaW5pdGlvbiwgbmFtZSkge1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2YWx1ZSBmb3Igc3RyaW5nIHBhcmFtIFwiJHtuYW1lfVwiOiAke3ZhbHVlfWApO1xuXG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBlbnVtRGVmaW5pdGlvblxuICAgKiBAcHJvcGVydHkge1N0cmluZ30gW3R5cGU9J2VudW0nXSAtIERlZmluZSBhIGJvb2xlYW4gcGFyYW1ldGVyLlxuICAgKiBAcHJvcGVydHkge0Jvb2xlYW59IGRlZmF1bHQgLSBEZWZhdWx0IHZhbHVlIG9mIHRoZSBwYXJhbWV0ZXIuXG4gICAqIEBwcm9wZXJ0eSB7QXJyYXl9IGxpc3QgLSBQb3NzaWJsZSB2YWx1ZXMgb2YgdGhlIHBhcmFtZXRlci5cbiAgICogQHByb3BlcnR5IHtCb29sZWFufSBbY29uc3RhbnQ9ZmFsc2VdIC0gRGVmaW5lIGlmIHRoZSBwYXJhbWV0ZXIgaXMgY29uc3RhbnQuXG4gICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBbbWV0YXM9e31dIC0gT3B0aW9ubmFsIG1ldGFkYXRhIG9mIHRoZSBwYXJhbWV0ZXIuXG4gICAqL1xuICBlbnVtOiB7XG4gICAgZGVmaW5pdGlvblRlbXBsYXRlOiBbJ2RlZmF1bHQnLCAnbGlzdCddLFxuICAgIHR5cGVDaGVja0Z1bmN0aW9uKHZhbHVlLCBkZWZpbml0aW9uLCBuYW1lKSB7XG4gICAgICBpZiAoZGVmaW5pdGlvbi5saXN0LmluZGV4T2YodmFsdWUpID09PSAtMSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZhbHVlIGZvciBlbnVtIHBhcmFtIFwiJHtuYW1lfVwiOiAke3ZhbHVlfWApO1xuXG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBhbnlEZWZpbml0aW9uXG4gICAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBbdHlwZT0nZW51bSddIC0gRGVmaW5lIGEgcGFyYW1ldGVyIG9mIGFueSB0eXBlLlxuICAgKiBAcHJvcGVydHkge0Jvb2xlYW59IGRlZmF1bHQgLSBEZWZhdWx0IHZhbHVlIG9mIHRoZSBwYXJhbWV0ZXIuXG4gICAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gW2NvbnN0YW50PWZhbHNlXSAtIERlZmluZSBpZiB0aGUgcGFyYW1ldGVyIGlzIGNvbnN0YW50LlxuICAgKiBAcHJvcGVydHkge09iamVjdH0gW21ldGFzPXt9XSAtIE9wdGlvbm5hbCBtZXRhZGF0YSBvZiB0aGUgcGFyYW1ldGVyLlxuICAgKi9cbiAgYW55OiB7XG4gICAgZGVmaW5pdGlvblRlbXBsYXRlOiBbJ2RlZmF1bHQnXSxcbiAgICB0eXBlQ2hlY2tGdW5jdGlvbih2YWx1ZSwgZGVmaW5pdGlvbiwgbmFtZSkge1xuICAgICAgLy8gbm8gY2hlY2sgYXMgaXQgY2FuIGhhdmUgYW55IHR5cGUuLi5cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==