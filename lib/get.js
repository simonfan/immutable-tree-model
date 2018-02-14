const _pipe = (...fns) => {
	return (state, arg) => fns.reduce((res, fn) => {
		return fn(state, res)
	}, arg)
}

const getNode = (state, nodeId) => {
	let node = state.byId[nodeId]
	
	if (!node) {
		throw new Error(`Node with id '${nodeId}' not found`)
	}

	return node
}

const getNodes = (state, nodeIds) => {
	return nodeIds.map(id => getNode(state, id))
}

const getChildIds = (state, nodeId) => {
	return getNode(state, nodeId).childIds
}
const getChildren = _pipe(getChildIds, getNodes)

const getIndex = (state, nodeId) => {
	return getParent(state, nodeId).childIds.indexOf(nodeId)
}

const getParentId = (state, nodeId) => {
	return getNode(state, nodeId).parentId
}
const getParent = _pipe(getParentId, getNode)

const getDescendantIds = (state, nodeId) => {
	return getChildIds(state, nodeId).reduce((acc, childId) => {
		return getNode(state, childId).nodeType === 'branch' ?
			[...acc, childId, ...getDescendantIds(state, childId)] :
			[...acc, childId]
	}, [])
}
const getDescendants = _pipe(getDescendantIds, getNodes)

const getAncestorIds = (state, nodeId) => {
	let ids = []
	let parentId = getNode(state, nodeId).parentId

	while (parentId) {
		ids.push(parentId)

		parentId = getNode(state, parentId).parentId
	}

	return ids
}
const getAncestors = _pipe(getAncestorIds, getNodes)

const getRootId = (state) => {
	return state.rootId
}
const getRoot = _pipe(getRootId, getNode)

const getAllNodeIds = (state) => {
	return Object.keys(state.byId)
}
const getAllNodes = _pipe(getAllNodeIds, getNodes)

module.exports = {
	getNode,
	getNodes,
	getChildIds,
	getChildren,
	getParentId,
	getParent,
	getDescendantIds,
	getDescendants,
	getRootId,
	getRoot,
	getAllNodeIds,
	getAllNodes,
	getAncestorIds,
	getAncestors
}
