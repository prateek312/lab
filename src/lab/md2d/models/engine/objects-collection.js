/*global define: false */

define(function (require) {

  var arrays          = require('arrays'),
      arrayTypes      = require('common/array-types'),
      DispatchSupport = require('common/dispatch-support'),
      validator       = require('common/validator'),
      utils           = require('md2d/models/engine/utils');

  return function ObjectsCollection(metadata) {
    var api,

        propNames = Object.keys(metadata),

        capacity = 0,
        data = (function () {
          var res = {},
              type;
          propNames.forEach(function (name) {
            type = (metadata[name].type || "any") + "Type";
            type = type === "anyType" ? "regular" : arrayTypes[type];
            res[name] = arrays.create(capacity, 0, type);
          });
          return res;
        }()),
        count = 0,

        dispatch = new DispatchSupport("add", "remove", "set"),

        objects = [];

    function ObjectWrapper(idx) {
      this.idx = idx;
      Object.freeze(this);
    }

    propNames.forEach(function (name) {
      Object.defineProperty(ObjectWrapper.prototype, name, {
        enumerable: true,
        configurable: false,
        get: function () {
          return data[name][this.idx];
        },
        set: function (v) {
          data[name][this.idx] = v;
        }
      });
    });

    api = {
      get count() {
        return count;
      },

      get data() {
        return data;
      },

      get objects() {
        return objects;
      },

      get objectPrototype() {
        // It can be used to extend functionality of the object wrapper.
        return ObjectWrapper.prototype;
      },

      add: function (props) {
        props = validator.validateCompleteness(metadata, props);
        if (count + 1 > capacity) {
          capacity = capacity * 2 || 1;
          utils.extendArrays(data, capacity);
        }
        count++;
        api.set(count - 1, props);
        api.syncObjects();
        dispatch.add();
      },

      remove: function (i) {
        if (i >= count) {
          throw new Error("Object with index " + i +
            " doesn't exist, so it can't be removed.");
        }
        var prop;
        count--;
        for (; i < count; i++) {
          for (prop in data) {
            if (data.hasOwnProperty(prop)) {
              data[prop][i] = data[prop][i + 1];
            }
          }
        }
        api.syncObjects();
        dispatch.remove();
      },

      set: function (i, props) {
        props = validator.validate(metadata, props);
        if (i >= count) {
          throw new Error("Object with index " + i +
            " doesn't exist, so its properties can't be set.");
        }
        propNames.forEach(function (key) {
          data[key][i] = props[key];
        });
        dispatch.set();
      },

      get: function (i) {
        var props = {};
        propNames.forEach(function (key) {
          props[key] = data[key][i];
        });
        return props;
      },

      syncObjects: function () {
        var objectsCount = objects.length;
        while (objectsCount < count) {
          objects.push(new ObjectWrapper(objectsCount));
          ++objectsCount;
        }
        if (objectsCount > count) {
          objects.length = count;
        }
      }
    };

    dispatch.mixInto(api);

    return api;
  };
});