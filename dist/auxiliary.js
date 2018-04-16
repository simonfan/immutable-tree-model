'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.splitNodePath = exports.minArity = exports.strictArity = exports.arrayRemoveItem = exports.deleteProperties = exports.deleteProperty = exports.computeProperty = exports.scopeState = exports.generateId = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ID_COUNTER = 0;
var generateId = exports.generateId = function generateId() {
	return ++ID_COUNTER;
};

// unused
var scopeState = exports.scopeState = function scopeState(property, fn) {
	return function (state) {
		for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			args[_key - 1] = arguments[_key];
		}

		return Object.assign({}, state, _defineProperty({}, property, fn.apply(undefined, [state[property]].concat(args))));
	};
};

var computeProperty = exports.computeProperty = function computeProperty(obj, property, fn) {
	return Object.assign({}, obj, _defineProperty({}, property, fn(obj[property])));
};

var deleteProperty = exports.deleteProperty = function deleteProperty(obj, property) {
	obj = Object.assign({}, obj);
	delete obj[property];

	return obj;
};

var deleteProperties = exports.deleteProperties = function deleteProperties(obj, properties) {
	return properties.reduce(deleteProperty, obj);
};

var arrayRemoveItem = exports.arrayRemoveItem = function arrayRemoveItem(arr, item) {
	var index = arr.indexOf(item);

	return [].concat(_toConsumableArray(arr.slice(0, index)), _toConsumableArray(arr.slice(index + 1)));
};

var arityError = function arityError(required, actual) {
	return new Error('Insufficient args: requires ' + required + ' but got ' + actual);
};

var strictArity = exports.strictArity = function strictArity(fn) {
	return function () {
		if (arguments.length < fn.length) {
			throw arityError(fn.length, arguments.length);
		}

		return fn.apply(undefined, arguments);
	};
};

var minArity = exports.minArity = function minArity(arity, fn) {
	return function () {
		if (arguments.length < arity) {
			throw arityError(arity, arguments.length);
		}

		return fn.apply(undefined, arguments);
	};
};

var splitNodePath = exports.splitNodePath = function splitNodePath(nodePath) {
	return nodePath.split(_path2.default.sep).filter(Boolean);
};