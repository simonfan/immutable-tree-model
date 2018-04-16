'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.updateNode = exports.moveNode = exports.removeNode = exports.addNodes = exports.ensureNodeAtPath = exports.addNodeAtPath = exports.addNode = exports.setRoot = exports.defaultState = undefined;

var _auxiliary = require('./auxiliary');

var _model = require('./model');

var _get = require('./get');

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * 
 */
var defaultState = exports.defaultState = function defaultState(state) {
	return Object.assign({}, state, {
		rootId: null,
		byId: {}
	});
};

/**
 * Sets the root
 */
var setRoot = exports.setRoot = (0, _auxiliary.strictArity)(function (state, root) {
	return Object.assign({}, state, {
		rootId: root.id,
		byId: _defineProperty({}, root.id, root)
	});
});

/**
 * Adds a node to the tree.
 * The node must have already been formatted by the model
 */
var addNode = exports.addNode = (0, _auxiliary.strictArity)(function (state, parentId, node) {
	var id = node.id;

	var parentNode = (0, _get.getNode)(state, parentId);
	var siblings = (0, _get.getNodes)(state, parentNode.childIds);

	if (siblings.some(function (sibling) {
		return sibling.nodePathName === node.nodePathName;
	})) {
		throw new Error('Duplicated nodePathName \'' + node.nodePathName + '\'');
	}

	return (0, _auxiliary.computeProperty)(state, 'byId', function (byId) {
		var _Object$assign;

		return Object.assign({}, byId, (_Object$assign = {}, _defineProperty(_Object$assign, id, Object.assign({}, node, {
			parentId: parentId
		})), _defineProperty(_Object$assign, parentId, Object.assign({}, parentNode, {
			childIds: [].concat(_toConsumableArray(parentNode.childIds), [id])
		})), _Object$assign));
	});
});

var addNodeAtPath = exports.addNodeAtPath = (0, _auxiliary.strictArity)(function (state, sourceNodeId, parentNodePath, node) {
	return addNode(state, (0, _get.getNodeIdByPath)(state, sourceNodeId, parentNodePath), node);
});

var ensureNodeAtPath = exports.ensureNodeAtPath = (0, _auxiliary.strictArity)(function (state, sourceNodeId, parentNodePath, node) {
	var nodePathNames = Array.isArray(parentNodePath) ? parentNodePath : (0, _auxiliary.splitNodePath)(parentNodePath);
	var sourceNode = (0, _get.getNode)(state, sourceNodeId);
	var parentNode = sourceNode;

	while (nodePathNames.length > 0) {
		var nextNodePathName = nodePathNames.shift();
		var nextNode = (0, _get.getChild)(state, parentNode.id, nextNodePathName);

		if (nextNode) {
			parentNode = nextNode;
		} else {
			var newNode = (0, _model.branch)(nextNodePathName);
			state = addNode(state, parentNode.id, newNode);
			parentNode = newNode;
		}
	}

	if (!(0, _get.getChild)(state, parentNode.id, node.nodePathName)) {
		state = addNode(state, parentNode.id, node);
	}

	return state;
});

/**
 * 
 */
var addNodes = (0, _auxiliary.strictArity)(function (state, nodes) {
	return nodes.reduce(function (state, node) {
		var parentId = node.parentId,
		    spec = _objectWithoutProperties(node, ['parentId']);

		return addNode(state, parentId, spec);
	}, state);
});

/**
 * 
 */
exports.addNodes = addNodes;
var removeNode = exports.removeNode = (0, _auxiliary.strictArity)(function (state, nodeId) {
	var node = (0, _get.getNode)(state, nodeId);

	if (node.isRoot) {
		throw new Error('Node \'' + nodeId + '\' is the root node and thus cannot be removed.');
	}

	var parentNode = (0, _get.getNode)(state, node.parentId);
	var descendantIds = node.nodeType === 'branch' ? (0, _get.getDescendantIds)(state, nodeId) : [];

	return (0, _auxiliary.computeProperty)(state, 'byId', function (byId) {
		return (0, _auxiliary.deleteProperties)(Object.assign({}, byId, _defineProperty({}, parentNode.id, Object.assign({}, parentNode, {
			childIds: (0, _auxiliary.arrayRemoveItem)(parentNode.childIds, nodeId)
		}))), [].concat(_toConsumableArray(descendantIds), [nodeId]));
	});
});

var hasChildWithNodePathName = function hasChildWithNodePathName(state, parentId, nodePathName) {
	return (0, _get.getChildren)(state, parentId).some(function (child) {
		return child.nodePathName === nodePathName;
	});
};

var isAncestor = function isAncestor(state, candidateAncestorId, nodeId) {
	return (0, _get.getAncestorIds)(state, nodeId).some(function (ancestorId) {
		return ancestorId === candidateAncestorId;
	});
};

/**
 * 
 */
var moveNode = exports.moveNode = (0, _auxiliary.strictArity)(function (state, nodeId, targetParentId) {
	var node = (0, _get.getNode)(state, nodeId);

	(0, _get.canMoveNode)(state, nodeId, targetParentId, { throwError: true });

	var parentNode = (0, _get.getNode)(state, node.parentId);
	var targetParentNode = (0, _get.getNode)(state, targetParentId);

	return (0, _auxiliary.computeProperty)(state, 'byId', function (byId) {
		var _Object$assign3;

		return Object.assign({}, byId, (_Object$assign3 = {}, _defineProperty(_Object$assign3, parentNode.id, Object.assign({}, parentNode, {
			childIds: (0, _auxiliary.arrayRemoveItem)(parentNode.childIds, nodeId)
		})), _defineProperty(_Object$assign3, targetParentId, Object.assign({}, targetParentNode, {
			childIds: targetParentNode.childIds.concat([nodeId])
		})), _defineProperty(_Object$assign3, nodeId, Object.assign({}, node, {
			parentId: targetParentId
		})), _Object$assign3));
	});
});

var updateNode = exports.updateNode = (0, _auxiliary.strictArity)(function (state, nodeId, update) {
	var node = (0, _get.getNode)(state, nodeId);

	return (0, _auxiliary.computeProperty)(state, 'byId', function (byId) {
		return Object.assign({}, byId, _defineProperty({}, nodeId, typeof update === 'function' ? update(node) : Object.assign({}, node, update)));
	});
});