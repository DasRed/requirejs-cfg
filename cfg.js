'use strict';

define(['config-loader'], function (ConfigLoader) {
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

    return {
        /**
         * @param {String} name
         * @param {Function} parentRequire
         * @param {Function} onLoad
         * @param {Object} config
         */
        load: function (name, parentRequire, onLoad, config) {
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
                loadedConfig = (new ConfigLoader('#' + name, {
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
        },

        /**
         *
         * @param {String} pluginName
         * @param {String} moduleName
         * @param {Function} write
         */
        write: function (pluginName, moduleName, write) {
            write('define("' + pluginName + '!' + moduleName + '",["config-loader"],function(ConfigLoader){return (new ConfigLoader("#' + moduleName + '")).config;});');
        }
    };
});
