'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _set = require('./set');

var set = _interopRequireWildcard(_set);

var _get = require('./get');

var get = _interopRequireWildcard(_get);

var _model = require('./model');

var model = _interopRequireWildcard(_model);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = Object.assign({}, set, get, {
	model: model
});