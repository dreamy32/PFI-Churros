exports.get = (variableName) => {
    var propertiesReader = require('properties-reader');
    var properties = propertiesReader('./serverVariables.ini');
    return properties.get(variableName);
}
