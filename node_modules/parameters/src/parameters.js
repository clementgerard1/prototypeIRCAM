import paramTemplates from './paramTemplates';

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
class Param {
  constructor(name, definitionTemplate, typeCheckFunction, definition, value) {
    definitionTemplate.forEach(function(key) {
      if (definition.hasOwnProperty(key) === false)
        throw new Error(`Invalid definition for param "${name}", ${key} is not defined`);
    });

    this.name = name;
    this.type = definition.type;
    this.definition = definition;

    if (this.definition.nullable === true && value === null)
      this.value = null;
    else
      this.value = typeCheckFunction(value, definition, name);
    this._typeCheckFunction = typeCheckFunction;
  }

  /**
   * Returns the current value.
   * @return {Mixed}
   */
  getValue() {
    return this.value;
  }

  /**
   * Update the current value.
   * @param {Mixed} value - New value of the parameter.
   * @return {Boolean} - `true` if the param has been updated, false otherwise
   *  (e.g. if the parameter already had this value).
   */
  setValue(value) {
    if (this.definition.constant === true)
      throw new Error(`Invalid assignement to constant param "${this.name}"`);

    if (!(this.definition.nullable === true && value === null))
      value = this._typeCheckFunction(value, this.definition, this.name);

    if (this.value !== value) {
      this.value = value;
      return true;
    }

    return false;
  }
}


/**
 * Bag of parameters. Main interface of the library
 */
class ParameterBag {
  constructor(params, definitions) {
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
    for (let name in params)
      this._paramsListeners[name] = new Set();
  }

  /**
   * Return the given definitions along with the initialization values.
   *
   * @return {Object}
   */
  getDefinitions(name = null) {
    if (name !== null)
      return this._definitions[name];
    else
      return this._definitions;
  }

  /**
   * Return the value of the given parameter.
   *
   * @param {String} name - Name of the parameter.
   * @return {Mixed} - Value of the parameter.
   */
  get(name) {
    if (!this._params[name])
      throw new Error(`Cannot read property value of undefined parameter "${name}"`);

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
  set(name, value) {
    const param = this._params[name];
    const updated = param.setValue(value);
    value = param.getValue();

    if (updated) {
      const metas = param.definition.metas;
      // trigger global listeners
      for (let listener of this._globalListeners)
        listener(name, value, metas);

      // trigger param listeners
      for (let listener of this._paramsListeners[name])
        listener(value, metas);
    }

    return value;
  }

  /**
   * Define if the `name` parameter exists or not.
   *
   * @param {String} name - Name of the parameter.
   * @return {Boolean}
   */
  has(name) {
    return (this._params[name]) ? true : false;
  }

  /**
   * Reset a parameter to its init value. Reset all parameters if no argument.
   *
   * @param {String} [name=null] - Name of the parameter to reset.
   */
  reset(name = null) {
    if (name !== null)
      this.set(name, param.definition.initValue);
    else
      Object.keys(this._params).forEach((name) => this.reset(name));
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
  addListener(callback) {
    this._globalListeners.add(callback);
  }

  /**
   * Remove listener from all param changes.
   *
   * @param {ParameterBag~listenerCallack} callback - Listener to remove. If
   *  `null` remove all listeners.
   */
  removeListener(callback = null) {
    if (callback === null)
      this._globalListeners.clear();
    else
      this._globalListeners.delete(callback);
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
  addParamListener(name, callback) {
    this._paramsListeners[name].add(callback);
  }

  /**
   * Remove listener from a given param updates.
   *
   * @param {String} name - Parameter name.
   * @param {ParameterBag~paramListenerCallack} callback - Listener to remove.
   *  If `null` remove all listeners.
   */
  removeParamListener(name, callback = null) {
    if (callback === null)
      this._paramsListeners[name].clear();
    else
      this._paramsListeners[name].delete(callback);
  }
}

/**
 * Factory for the `ParameterBag` class.
 *
 * @param {Object<String, paramDefinition>} definitions - Object describing the
 *  parameters.
 * @param {Object<String, Mixed>} values - Initialization values for the
 *  parameters.
 * @return {ParameterBag}
 */
function parameters(definitions, values = {}) {
  const params = {};

  for (let name in values) {
    if (definitions.hasOwnProperty(name) === false)
      throw new Error(`Unknown param "${name}"`);
  }

  for (let name in definitions) {
    if (params.hasOwnProperty(name) === true)
      throw new Error(`Parameter "${name}" already defined`);

    const definition = definitions[name];

    if (!paramTemplates[definition.type])
      throw new Error(`Unknown param type "${definition.type}"`);

    const {
      definitionTemplate,
      typeCheckFunction
    } = paramTemplates[definition.type];

    let value;

    if (values.hasOwnProperty(name) === true)
      value = values[name];
    else
      value = definition.default;

    // store init value in definition
    definition.initValue = value;

    if (!typeCheckFunction || !definitionTemplate)
      throw new Error(`Invalid param type definition "${definition.type}"`);

    params[name] = new Param(name, definitionTemplate, typeCheckFunction, definition, value);
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
parameters.defineType = function(typeName, parameterDefinition) {
  paramTemplates[typeName] = parameterDefinition;
}

export default parameters;
