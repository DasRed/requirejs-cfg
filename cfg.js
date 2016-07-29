'use strict';

define(function () {
    // Polyfill Object.assign
    if (typeof Object.assign != 'function') {
        Object.assign = function (target) {
            'use strict';
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }

            target = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var source = arguments[index];
                if (source != null) {
                    for (var key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            target[key] = source[key];
                        }
                    }
                }
            }
            return target;
        };
    }

    /**
     * loads config from script type application json
     *
     * @param {String} element
     * @param {Object} options
     */
    function Loader(element, options) {
        this.element = element;

        options = options || {};

        this.throwError = options.throwError !== undefined ? options.throwError : this.throwError;
    }

    // prototype
    Loader.prototype = Object.create(Object.prototype, {
        /**
         * the loaded config
         *
         * @var {Object}
         */
        config: {
            enumerable: false,
            configurable: false,
            get: function () {
                if (this._config === undefined) {
                    var elementId = this.element;
                    if (elementId.substr(0, 1) === '#') {
                        elementId = elementId.substr(1);
                    }

                    if (typeof document === 'undefined') {
                        if (this.throwError === true) {
                            throw new Error('Can not find the documnet node to find configuration element "' + this.element + '".');
                        }

                        return {};
                    }

                    // try to find the user config element
                    var element = document.getElementById(elementId);
                    if (element === null) {
                        if (this.throwError === true) {
                            throw new Error('Can not find the Element "' + this.element + '" for configuration.');
                        }

                        return {};
                    }

                    // try to parse the JSON from element
                    try {
                        var config = JSON.parse(element.innerHTML);
                    }
                    catch (exception) {
                        if (this.throwError === true) {
                            throw new Error('Can not parse the data from Element "' + this.element + '" for configuration.\n' + (exception.message || e));
                        }

                        return {};
                    }

                    this._config = config;
                }

                return this._config;
            }
        },

        /**
         * @var {String}
         */
        element: {
            value: null,
            enumerable: false,
            configurable: false,
            writable: true
        },

        /**
         * @var {Boolean}
         */
        throwError: {
            value: true,
            enumerable: false,
            configurable: false,
            writable: true
        }
    });


    /**
     * @param {String} name
     * @param {Function} parentRequire
     * @param {Function} onLoad
     * @param {Object} config
     */
    Loader.load = function (name, parentRequire, onLoad, config) {
        /**
         * Indicate that the optimizer should not wait for this resource any more and complete optimization.
         * This resource will be resolved dynamically during run time in the web browser.
         */
        if (config.isBuild) {
            onLoad(null);
            return;
        }

        var loadedConfig = null;

        try {
            loadedConfig = (new Loader('#' + name, {
                throwError: false
            })).config;
        }
        catch (exception) {
            console.error(exception.message);
        }
        finally {
            loadedConfig = Object.assign({}, loadedConfig);
        }

        console.debug('Config loaded from #' + name);
        onLoad(loadedConfig);
    };

    /**
     *
     * @param {String} pluginName
     * @param {String} moduleName
     * @param {Function} write
     */
    Loader.write = function (pluginName, moduleName, write) {
        write('define("' + pluginName + '!' + moduleName + '",["./loader"],function(Loader){return (new Loader("#' + moduleName + '")).config;});');
    };

    return Loader;
});
