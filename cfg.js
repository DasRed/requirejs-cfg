'use strict';

define(['config-loader'], function (ConfigLoader) {
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
            write('define("' + pluginName + '!' + moduleName + '",["config-loader"],function(ConfigLoader){console.debug("Config loaded from #' + moduleName + '"); return (new ConfigLoader("#' + moduleName + '")).config;});');
        }
    };
});
