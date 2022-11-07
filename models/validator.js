/////////////////////////////////////////////////////////////////////
// This class provide a model validation
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////
module.exports =
    class Validator {
        constructor() {
            this.fields = [];
        }
        addField(name, type) {
            this.fields.push({ name: name, type: type });
        }

        // https://regex-generator.olafneumann.org/?sampleText=2020 really cool!
        // https://regex101.com/ for testing your regex
        
        valueValid(value, type) {
            if (value !== null) {
                switch (type) {
                    case "string": return value != "";
                    case "integer": return parseInt(value) != NaN;
                    case "float": return parseFloat(value) != NaN;
                    case "boolean": return value === false || value === true;
                    case "phone": return /^\(\d\d\d\) \d\d\d-\d\d\d\d$/.test(value);
                    case "email": return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value);
                    case "url": return /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/.test(value);
                    default:
                        return false;
                }
            }
            return false;
        }
        test(objectInstance) {
            let oneIsWrong = false;
            this.fields.forEach(field => {
                if (!(field.name in objectInstance)) {
                    oneIsWrong = true;
                } else {
                    if (!this.valueValid(objectInstance[field.name], field.type))
                        oneIsWrong = true;
                }
            });
            return !oneIsWrong;
        }
    }