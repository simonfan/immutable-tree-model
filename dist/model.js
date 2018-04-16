'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.flatten = exports.leaf = exports.branch = exports.root = undefined;

var _auxiliary = require('./auxiliary');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var TRAILING_SLASH_RE = /\/$/;
var trimTrailingSlash = function trimTrailingSlash(str) {
	return typeof str === 'string' ? str.replace(TRAILING_SLASH_RE, '') : undefined;
};

/**
 * [description]
 * @param  {[type]} nodeRootPath [description]
 * @param  {[type]} nodeData         [description]
 * @return {[type]}              [description]
 */
var root = exports.root = function root(nodeRootPath, nodeData) {
	return Object.assign({}, nodeData, {
		nodeRootPath: trimTrailingSlash(nodeRootPath),
		nodeType: 'branch',
		id: (0, _auxiliary.generateId)(),
		childIds: [],
		isRoot: true
	});
};

/**
 * [description]
 * @param  {[type]} parentId     [description]
 * @param  {[type]} nodePathName [description]
 * @param  {[type]} nodeData         [description]
 * @return {[type]}              [description]
 */
var branch = exports.branch = function branch(nodePathName, nodeData) {
	return Object.assign({}, nodeData, {
		nodePathName: nodePathName,
		nodeType: 'branch',
		id: (0, _auxiliary.generateId)(),
		childIds: []
	});
};

/**
 * [description]
 * @param  {[type]} parentId     [description]
 * @param  {[type]} nodePathName [description]
 * @param  {[type]} nodeData         [description]
 * @return {[type]}              [description]
 */
var leaf = exports.leaf = function leaf(nodePathName, nodeData) {
	return Object.assign({}, nodeData, {
		nodePathName: nodePathName,
		nodeType: 'leaf',
		id: (0, _auxiliary.generateId)()
	});
};

var FLATTEN_DEFAULT_OPTIONS = {
	parentId: false

	/**
  * [description]
  * @param  {[type]} obj     [description]
  * @param  {[type]} options [description]
  * @return {[type]}         [description]
  */
};var flatten = (0, _auxiliary.minArity)(1, function (obj) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Object.assign({}, FLATTEN_DEFAULT_OPTIONS);

	var children = obj.children,
	    nodePathName = obj.nodePathName,
	    nodeRootPath = obj.nodeRootPath,
	    nodeData = _objectWithoutProperties(obj, ['children', 'nodePathName', 'nodeRootPath']);

	var parentId = options.parentId;

	var currentNode = parentId ? branch(nodePathName, Object.assign({}, nodeData, {
		parentId: parentId
	})) : root(nodeRootPath, nodeData);

	return children.reduce(function (acc, childObj) {
		var childName = childObj.nodePathName,
		    childSpec = _objectWithoutProperties(childObj, ['nodePathName']);

		switch (childObj.nodeType) {
			case 'branch':
				return [].concat(_toConsumableArray(acc), _toConsumableArray(flatten(childObj, Object.assign({}, options, {
					parentId: currentNode.id
				}))));
			case 'leaf':
				return [].concat(_toConsumableArray(acc), [leaf(childName, Object.assign({}, childObj, {
					parentId: currentNode.id
				}))]);
			default:
				throw new Error('Invalid node nodeType \'' + childObj.nodeType + '\'');
		}
	}, [currentNode]);
});
exports.flatten = flatten;