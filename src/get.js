import { deleteProperties, strictArity, splitNodePath } from './auxiliary'

const pipeState = (...fns) => {
	const [first, ...rest] = fns

	return (state, ...firstArgs) => {
		return rest.reduce(
			(res, fn) => fn(state, res),
			first(state, ...firstArgs)
		)
	}
}

/**
 * [description]
 * @param  {[type]} state  [description]
 * @param  {[type]} nodeId [description]
 * @return {[type]}        [description]
 */
export const getNode = strictArity((state, nodeId) => {
	let node = state.byId[nodeId]
	
	if (!node) {
		throw new Error(`Node with id '${nodeId}' not found`)
	}

	return node
})

/**
 * [description]
 * @param  {[type]} state   [description]
 * @param  {[type]} nodeIds [description]
 * @return {[type]}         [description]
 */
export const getNodes = strictArity((state, nodeIds) => {
	return nodeIds.map(id => getNode(state, id))
})

/**
 * [description]
 * @param  {[type]} state  [description]
 * @param  {[type]} nodeId [description]
 * @return {[type]}        [description]
 */
export const getChildIds = strictArity((state, nodeId) => {
	return getNode(state, nodeId).childIds
})
export const getChildren = pipeState(getChildIds, getNodes)

/**
 * [description]
 * @param  {[type]} state  [description]
 * @param  {[type]} nodeId [description]
 * @return {[type]}        [description]
 */
export const getIndex = strictArity((state, nodeId) => {
	return getParent(state, nodeId).childIds.indexOf(nodeId)
})

/**
 * [description]
 * @param  {[type]} state  [description]
 * @param  {[type]} nodeId [description]
 * @return {[type]}        [description]
 */
export const getParentId = strictArity((state, nodeId) => {
	return getNode(state, nodeId).parentId
})
export const getParent = pipeState(getParentId, getNode)

/**
 * [description]
 * @param  {[type]} state  [description]
 * @param  {[type]} nodeId [description]
 * @return {[type]}        [description]
 */
export const getDescendantIds = strictArity((state, nodeId) => {
	return getChildIds(state, nodeId).reduce((acc, childId) => {
		return getNode(state, childId).nodeType === 'branch' ?
			[...acc, childId, ...getDescendantIds(state, childId)] :
			[...acc, childId]
	}, [])
})
export const getDescendants = pipeState(getDescendantIds, getNodes)

/**
 * [description]
 * @param  {[type]} state  [description]
 * @param  {[type]} nodeId [description]
 * @return {[type]}        [description]
 */
export const getAncestorIds = strictArity((state, nodeId) => {
	let ids = []
	let parentId = getNode(state, nodeId).parentId

	while (parentId) {
		ids.push(parentId)

		parentId = getNode(state, parentId).parentId
	}

	return ids
})
export const getAncestors = pipeState(getAncestorIds, getNodes)

/**
 * [description]
 * @param  {[type]} state [description]
 * @return {[type]}       [description]
 */
export const getRootId = strictArity((state) => {
	return state.rootId
})
export const getRoot = pipeState(getRootId, getNode)

/**
 * [description]
 * @param  {[type]} state [description]
 * @return {[type]}       [description]
 */
export const getAllNodeIds = strictArity((state) => {
	return Object.keys(state.byId)
})
export const getAllNodes = pipeState(getAllNodeIds, getNodes)

/**
 * [description]
 * @param  {[type]} state  [description]
 * @param  {[type]} nodeId [description]
 * @return {[type]}        [description]
 */
export const getTree = strictArity((state, nodeId) => {
	let node = getNode(state, nodeId)


	if (node.nodeType === 'branch') {
		node = {
			...node,
			children: getChildren(state, nodeId).map(childNode => getTree(state, childNode.id))
		}
	}

	return deleteProperties(node, ['childIds', 'parentId'])
})

/**
 * [description]
 * @param  {[type]} state  [description]
 * @param  {[type]} nodeId [description]
 * @return {[type]}        [description]
 */
export const getNodePath = strictArity((state, nodeId) => {
	let node = getNode(state, nodeId)

	if (node.isRoot) {
		return node.nodeRootPath ? node.nodeRootPath : ''
	} else {
		let pathNodes = getAncestors(state, nodeId)
		let root = pathNodes.pop()

		let pre = root.nodeRootPath ? (root.nodeRootPath + '/') : ''

		return pre + pathNodes.reduce((p, ancestor) => {
			return ancestor.nodePathName + '/' + p
		}, node.nodePathName)
	}
})

/**
 * [description]
 * @param  {[type]} (state, nodeId,       nodePathName [description]
 * @return {[type]}         [description]
 */
export const getChildByPathName = strictArity((state, parentId, childPathName) => {
	let node = getChildren(state, parentId).find(child => child.nodePathName === childPathName)

	return node
})

export const getChildIdByPathName = strictArity((state, parentId, childPathName) => {
	return getChildByPathName(state, parentId, childPathName).id
})


/**
 * [description]
 * @param  {[type]} state    [description]
 * @param  {[type]} nodePath [description]
 * @return {[type]}          [description]
 */
export const getNodeIdByPath = strictArity((state, fromNodeId, nodePath) => {
	let nodePathNames = Array.isArray(nodePath) ? nodePath : splitNodePath(nodePath)

	return nodePathNames.reduce((parentId, nodePathName) => {
		return getChildIdByPathName(state, parentId, nodePathName)
	}, fromNodeId)
})
export const getNodeByPath = pipeState(getNodeIdByPath, getNode)
