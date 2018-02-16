import { deleteProperties, strictArity } from './auxiliary'

const _pipe = (...fns) => {
	return (state, arg) => fns.reduce((res, fn) => {
		return fn(state, res)
	}, arg)
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
export const getChildren = _pipe(getChildIds, getNodes)

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
export const getParent = _pipe(getParentId, getNode)

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
export const getDescendants = _pipe(getDescendantIds, getNodes)

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
export const getAncestors = _pipe(getAncestorIds, getNodes)

/**
 * [description]
 * @param  {[type]} state [description]
 * @return {[type]}       [description]
 */
export const getRootId = strictArity((state) => {
	return state.rootId
})
export const getRoot = _pipe(getRootId, getNode)

/**
 * [description]
 * @param  {[type]} state [description]
 * @return {[type]}       [description]
 */
export const getAllNodeIds = strictArity((state) => {
	return Object.keys(state.byId)
})
export const getAllNodes = _pipe(getAllNodeIds, getNodes)

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
export const getPath = strictArity((state, nodeId) => {
	let node = getNode(state, nodeId)

	if (node.isRoot) {
		return node.nodeRootPath
	} else {
		let pathNodes = getAncestors(state, nodeId)
		let root = pathNodes.pop()

		return root.nodeRootPath + '/' + pathNodes.reduce((p, ancestor) => {
			return ancestor.nodePathName + '/' + p
		}, node.nodePathName)
	}
})

/**
 * [description]
 * @param  {[type]} state    [description]
 * @param  {[type]} nodePath [description]
 * @return {[type]}          [description]
 */
export const getNodeByPath = strictArity((state, nodePath) => {

})
