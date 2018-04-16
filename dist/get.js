'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isRoot = exports.canMoveNode = exports.hasChild = exports.isAncestor = exports.getNodeByAbsolutePath = exports.getNodeIdByPath = exports.getNodeByPath = exports.getChildId = exports.getChild = exports.getAbsoluteNodePath = exports.getNodePath = exports.getTree = exports.getAllNodes = exports.getAllNodeIds = exports.getRoot = exports.getRootId = exports.getAncestors = exports.getAncestorIds = exports.getDescendants = exports.getDescendantIds = exports.getParent = exports.getParentId = exports.getIndex = exports.getChildren = exports.getChildIds = exports.getNodes = exports.getNode = undefined;

var _auxiliary = require('./auxiliary');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var pipeState = function pipeState() {
	for (var _len = arguments.length, fns = Array(_len), _key = 0; _key < _len; _key++) {
		fns[_key] = arguments[_key];
	}

	var first = fns[0],
	    rest = fns.slice(1);


	return function (state) {
		for (var _len2 = arguments.length, firstArgs = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
			firstArgs[_key2 - 1] = arguments[_key2];
		}

		return rest.reduce(function (res, fn) {
			return fn(state, res);
		}, first.apply(undefined, [state].concat(firstArgs)));
	};
};

/**
 * [description]
 * @param  {[type]} state  [description]
 * @param  {[type]} nodeId [description]
 * @return {[type]}        [description]
 */
var getNode = exports.getNode = (0, _auxiliary.strictArity)(function (state, nodeId) {
	var node = state.byId[nodeId];

	if (!node) {
		throw new Error('Node with id \'' + nodeId + '\' not found');
	}

	return node;
});

/**
 * [description]
 * @param  {[type]} state   [description]
 * @param  {[type]} nodeIds [description]
 * @return {[type]}         [description]
 */
var getNodes = exports.getNodes = (0, _auxiliary.strictArity)(function (state, nodeIds) {
	return nodeIds.map(function (id) {
		return getNode(state, id);
	});
});

/**
 * [description]
 * @param  {[type]} state  [description]
 * @param  {[type]} nodeId [description]
 * @return {[type]}        [description]
 */
var getChildIds = exports.getChildIds = (0, _auxiliary.strictArity)(function (state, nodeId) {
	return getNode(state, nodeId).childIds;
});
var getChildren = exports.getChildren = pipeState(getChildIds, getNodes);

/**
 * [description]
 * @param  {[type]} state  [description]
 * @param  {[type]} nodeId [description]
 * @return {[type]}        [description]
 */
var getIndex = exports.getIndex = (0, _auxiliary.strictArity)(function (state, nodeId) {
	return getParent(state, nodeId).childIds.indexOf(nodeId);
});

/**
 * [description]
 * @param  {[type]} state  [description]
 * @param  {[type]} nodeId [description]
 * @return {[type]}        [description]
 */
var getParentId = exports.getParentId = (0, _auxiliary.strictArity)(function (state, nodeId) {
	return getNode(state, nodeId).parentId;
});
var getParent = exports.getParent = pipeState(getParentId, getNode);

/**
 * [description]
 * @param  {[type]} state  [description]
 * @param  {[type]} nodeId [description]
 * @return {[type]}        [description]
 */
var getDescendantIds = exports.getDescendantIds = (0, _auxiliary.strictArity)(function (state, nodeId) {
	return getChildIds(state, nodeId).reduce(function (acc, childId) {
		return getNode(state, childId).nodeType === 'branch' ? [].concat(_toConsumableArray(acc), [childId], _toConsumableArray(getDescendantIds(state, childId))) : [].concat(_toConsumableArray(acc), [childId]);
	}, []);
});
var getDescendants = exports.getDescendants = pipeState(getDescendantIds, getNodes);

/**
 * [description]
 * @param  {[type]} state  [description]
 * @param  {[type]} nodeId [description]
 * @return {[type]}        [description]
 */
var getAncestorIds = exports.getAncestorIds = (0, _auxiliary.strictArity)(function (state, nodeId) {
	var ids = [];
	var parentId = getNode(state, nodeId).parentId;

	while (parentId) {
		ids.push(parentId);

		parentId = getNode(state, parentId).parentId;
	}

	return ids;
});
var getAncestors = exports.getAncestors = pipeState(getAncestorIds, getNodes);

/**
 * [description]
 * @param  {[type]} state [description]
 * @return {[type]}       [description]
 */
var getRootId = exports.getRootId = (0, _auxiliary.strictArity)(function (state) {
	return state.rootId;
});
var getRoot = exports.getRoot = pipeState(getRootId, getNode);

/**
 * [description]
 * @param  {[type]} state [description]
 * @return {[type]}       [description]
 */
var getAllNodeIds = exports.getAllNodeIds = (0, _auxiliary.strictArity)(function (state) {
	return Object.keys(state.byId);
});
var getAllNodes = exports.getAllNodes = pipeState(getAllNodeIds, getNodes);

/**
 * [description]
 * @param  {[type]} state  [description]
 * @param  {[type]} nodeId [description]
 * @return {[type]}        [description]
 */
var getTree = exports.getTree = (0, _auxiliary.minArity)(2, function (state, nodeId) {
	var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	var node = getNode(state, nodeId);

	if (node.nodeType === 'branch') {
		var children = node.childIds.map(function (childId) {
			return getTree(state, childId, options);
		});

		if (options.sort) {
			children.sort(options.sort);
		}

		node = Object.assign({}, node, {
			children: children
		});
	}

	return options.project ? options.project(node) : (0, _auxiliary.deleteProperties)(node, ['childIds', 'parentId']);
});

/**
 * [description]
 * @param  {[type]} state  [description]
 * @param  {[type]} nodeId [description]
 * @return {[type]}        [description]
 */
var getNodePath = exports.getNodePath = (0, _auxiliary.strictArity)(function (state, sourceNodeId, nodeId) {
	var node = getNode(state, nodeId);

	var ancestors = getAncestors(state, nodeId).reverse();
	var sourceNodePathNodeIndex = ancestors.findIndex(function (ancestor) {
		return ancestor.id === sourceNodeId;
	});

	if (sourceNodePathNodeIndex === -1) {
		throw new Error('Node ' + sourceNodeId + ' is not an ancestor of ' + nodeId);
	}

	// restrict the ancestors to the sourceNodeId
	ancestors = ancestors.slice(sourceNodePathNodeIndex + 1);

	return ancestors.map(function (ancestor) {
		return ancestor.nodePathName;
	}).concat([node.nodePathName]).join('/');
});

var getAbsoluteNodePath = exports.getAbsoluteNodePath = function getAbsoluteNodePath(state, nodeId) {
	var root = getNode(state, state.rootId);

	if (nodeId === state.rootId) {
		return '/';
	} else {
		return '/' + getNodePath(state, state.rootId, nodeId);
	}
};

/**
 * [description]
 * @param  {[type]} (state, nodeId,       nodePathName [description]
 * @return {[type]}         [description]
 */
var getChild = exports.getChild = (0, _auxiliary.strictArity)(function (state, parentId, childPathName) {
	return getChildren(state, parentId).find(function (child) {
		return child.nodePathName === childPathName;
	});
});

var getChildId = exports.getChildId = (0, _auxiliary.strictArity)(function (state, parentId, childPathName) {
	return getChild(state, parentId, childPathName).id;
});

/**
 * [description]
 * @param  {[type]} state    [description]
 * @param  {[type]} nodePath [description]
 * @return {[type]}          [description]
 */
var getNodeByPath = exports.getNodeByPath = (0, _auxiliary.strictArity)(function (state, sourceNodeId, path) {
	var sourceNode = getNode(state, sourceNodeId);
	var nodePathNames = Array.isArray(path) ? path : (0, _auxiliary.splitNodePath)(path);

	return nodePathNames.reduce(function (sourceNode, nodePathName) {
		return sourceNode ? getNodes(state, sourceNode.childIds).find(function (childNode) {
			return childNode.nodePathName === nodePathName;
		}) : null;
	}, sourceNode);
});
var getNodeIdByPath = exports.getNodeIdByPath = pipeState(getNodeByPath, function (state, node) {
	return node ? node.id : null;
});

var getNodeByAbsolutePath = exports.getNodeByAbsolutePath = (0, _auxiliary.strictArity)(function (state, path) {
	return getNodeByPath(state, state.rootId, path);
});

/**
 * [description]
 * @param  {[type]} state               [description]
 * @param  {[type]} candidateAncestorId [description]
 * @param  {[type]} nodeId              [description]
 * @return {[type]}                     [description]
 */
var isAncestor = exports.isAncestor = (0, _auxiliary.strictArity)(function (state, candidateAncestorNodeId, nodeId) {
	return getAncestorIds(state, nodeId).some(function (ancestorId) {
		return ancestorId === candidateAncestorNodeId;
	});
});

/**
 * [description]
 * @param  {[type]} state        [description]
 * @param  {[type]} parentId     [description]
 * @param  {[type]} nodePathName [description]
 * @return {[type]}              [description]
 */
var hasChild = exports.hasChild = (0, _auxiliary.strictArity)(function (state, parentNodeId, nodePathName) {
	return getChild(state, parentNodeId, nodePathName) ? true : false;
});

var canMoveNode = exports.canMoveNode = (0, _auxiliary.minArity)(3, function (state, nodeId, targetParentNodeId) {
	var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { throwError: false };

	var node = getNode(state, nodeId);
	var targetParentNode = getNode(state, targetParentNodeId);

	var throwError = options.throwError;

	var err = false;

	if (node.isRoot) {
		err = new Error('Cannot move root node \'' + node.id + '\'');
	} else if (node.id === targetParentNode.id) {
		err = new Error('Cannot move node into itself');
	} else if (hasChild(state, targetParentNode.id, node.nodePathName)) {
		err = new Error('Duplicated nodePathName \'' + node.nodePathName + '\'');
	} else if (isAncestor(state, node.id, targetParentNode.id)) {
		err = new Error('Cannot move node \'' + node.id + '\' into a descendant \'' + targetParentNode.id + '\'');
	}

	if (err) {
		if (throwError) {
			throw err;
		}

		return false;
	} else {
		return true;
	}
});

var isRoot = exports.isRoot = function isRoot(state, nodeId) {
	return state.rootId === nodeId;
};