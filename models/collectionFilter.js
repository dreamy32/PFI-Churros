const utilities = require('../utilities');

module.exports =
    class collectionFilter {
        constructor(collection, filterParams, model = null) {

            this.model = model;
            this.collection = collection;
            this.sortFields = [];
            this.searchKeys = [];
            this.fields = [];
            this.filteredCollection = [];
            this.limit = 0;
            this.offset = 0;
            let instance = this;

            Object.keys(filterParams).forEach(function (paramName) {
                let paramValue = filterParams[paramName];
                if (paramValue) {
                    switch (paramName) {
                        case "sort": instance.setSortFields(paramValue); break;
                        case "limit": instance.limit = parseInt(paramValue); break;
                        case "offset": instance.offset = parseInt(paramValue); break;
                        case "fields": instance.fields = paramValue.split(','); break;
                        default: instance.addSearchKey(paramName, paramValue);
                    }
                }
            });

            if (isNaN(this.limit) || isNaN(this.offset)) {
                this.limit = 0;
                this.offset = 0;
            }
        }
        makeSortField(fieldName) {

            let parts = fieldName.split(',');
            let sortField = "";
            let descending = false;

            if (parts.length > 0)
                sortField = utilities.capitalizeFirstLetter(parts[0].toLowerCase().trim());
            else
                return null;

            // not friendly with extra members added dynamically
            //if (this.model && !(sortField in this.model))
            //    return null;

            descending = (parts.length > 1) && (parts[1].toLowerCase().includes('desc'));

            return {
                name: sortField,
                ascending: !descending
            };
        }

        setSortFields(fieldNames) {

            let sortField = null;

            if (Array.isArray(fieldNames)) {
                for (let fieldName of fieldNames) {
                    sortField = this.makeSortField(fieldName);
                    if (sortField)
                        this.sortFields.push(sortField);
                }
            } else {
                sortField = this.makeSortField(fieldNames);
                if (sortField)
                    this.sortFields.push(sortField);
            }
        }
        addSearchKey(keyName, value) {
            if (this.model && !(keyName in this.model))
                return;
            this.searchKeys.push({ name: keyName, value: value });
        }
        valueMatch(value, searchValue) {
            try {
                let sv = '^' + searchValue.toLowerCase().replace(/\*/g, '.*') + '$';
                let v = value.toString().replace(/(\r\n|\n|\r)/gm, "").toLowerCase();
                return new RegExp(sv).test(v);
            } catch (error) {
                console.log(error);
                return false;
            }
        }

        itemMatch(item) {
            if (item) {
                for (let key of this.searchKeys) {
                    if (key.name in item) {
                        if (!Array.isArray(key.value)) {
                            if (!this.valueMatch(item[key.name], key.value))
                                return false;
                        } else {
                            let allMatch = true;
                            for (let value of key.value) {
                                if (!this.valueMatch(item[key.name], value))
                                    allMatch = false;
                            }
                            return allMatch;
                        }
                    } else
                        return false;
                }
                return true;
            }
            return false;
        }
        keepFields() {
            function exist(collection, object) {
                if (collection.length > 0) {
                    for (let item of collection) {
                        let equal = true;
                        Object.keys(item).forEach(function (member) {
                            if (item[member] != object[member]) {
                                equal = false;
                            }
                        })
                        if (equal) return true;
                    }
                    return false;
                }
                return false;
            }
            if (this.fields.length > 0) {
                let subCollection = [];
                for (let item of this.collection) {
                    let subItem = {};
                    for (let field of this.fields) {
                        subItem[field] = item[field];
                    }
                    if (!exist(subCollection, subItem))
                        subCollection.push(subItem);
                }
                return subCollection;
            } else
                return this.collection;
        }
        findByKeys(collection) {
            if (this.searchKeys.length > 0) {
                this.filteredCollection = [];
                for (let item of collection) {
                    if (this.itemMatch(item))
                        this.filteredCollection.push(item);
                }
            } else
                this.filteredCollection = collection;
        }
        compareNum(x, y) {
            if (x === y) return 0;
            else if (x < y) return -1;
            return 1;
        }
        innerCompare(x, y) {
            if ((typeof x) === 'string')
                return x.localeCompare(y);
            else
                return this.compareNum(x, y);
        }
        compare(itemX, itemY) {
            let fieldIndex = 0;
            let max = this.sortFields.length;
            do {
                let result = 0;

                if (this.sortFields[fieldIndex].ascending)
                    result = this.innerCompare(itemX[this.sortFields[fieldIndex].name], itemY[this.sortFields[fieldIndex].name]);
                else
                    result = this.innerCompare(itemY[this.sortFields[fieldIndex].name], itemX[this.sortFields[fieldIndex].name]);

                if (result == 0)
                    fieldIndex++;
                else
                    return result;

            } while (fieldIndex < max);
            return 0;
        }
        sort() {
            this.filteredCollection.sort((a, b) => this.compare(a, b));
        }
        get() {

            this.findByKeys(this.keepFields());

            if (this.sortFields.length > 0)
                this.sort();

            if (this.limit != 0) {
                return this.filteredCollection.slice(this.offset * this.limit, (this.offset + 1) * this.limit);
            }

            return this.filteredCollection;
        }
    }
