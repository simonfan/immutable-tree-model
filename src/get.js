import { deleteProperties, strictArity, minArity, splitNodePath } from './auxiliary'

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
			children: getNodes(state, node.childIds).map(childNode => {
				return getTree(state, childNode.id)
			})
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
export const getNodePath = strictArity((state, sourceNodeId, nodeId) => {
	let node = getNode(state, nodeId)

	let ancestors = getAncestors(state, nodeId).reverse()
	let sourceNodePathNodeIndex = ancestors.findIndex(ancestor => ancestor.id === sourceNodeId)

	if (sourceNodePathNodeIndex === -1) {
		throw new Error(`Node ${sourceNodeId} is not an ancestor of ${nodeId}`)
	}

	// restrict the ancestors to the sourceNodeId
	ancestors = ancestors.slice(sourceNodePathNodeIndex + 1)

	return ancestors
		.map(ancestor => ancestor.nodePathName)
		.concat([node.nodePathName])
		.join('/')
})

export const getAbsoluteNodePath = (state, nodeId) => {
	let root = getNode(state, state.rootId)

	if (nodeId === state.rootId) {
		return root.nodeRootPath ? root.nodeRootPath : ''
	} else {
		let pre = root.nodeRootPath ? `${root.nodeRootPath}/` : ''
		return pre + getNodePath(state, state.rootId, nodeId)
	}
}

/**
 * [description]
 * @param  {[type]} (state, nodeId,       nodePathName [description]
 * @return {[type]}         [description]
 */
export const getChild = strictArity((state, parentId, childPathName) => {
	return getChildren(state, parentId).find(child => child.nodePathName === childPathName)
})

export const getChildId = strictArity((state, parentId, childPathName) => {
	return getChild(state, parentId, childPathName).id
})


/**
 * [description]
 * @param  {[type]} state    [description]
 * @param  {[type]} nodePath [description]
 * @return {[type]}          [description]
 */
export const getNodeByPath = strictArity((state, sourceNodeId, path) => {
	let sourceNode = getNode(state, sourceNodeId)
	let nodePathNames = Array.isArray(path) ? path : splitNodePath(path)

	return nodePathNames.reduce((sourceNode, nodePathName) => {
		return sourceNode ?
			getNodes(state, sourceNode.childIds).find(childNode => {
				return childNode.nodePathName === nodePathName
			}) : null
	}, sourceNode)
})
export const getNodeIdByPath = pipeState(getNodeByPath, (state, node) => {
	return node ? node.id : null
})

/**
 * [description]
 * @param  {[type]} state               [description]
 * @param  {[type]} candidateAncestorId [description]
 * @param  {[type]} nodeId              [description]
 * @return {[type]}                     [description]
 */
export const isAncestor = strictArity((state, candidateAncestorNodeId, nodeId) => {
	return getAncestorIds(state, nodeId).some(ancestorId => {
		return ancestorId === candidateAncestorNodeId
	})
})

/**
 * [description]
 * @param  {[type]} state        [description]
 * @param  {[type]} parentId     [description]
 * @param  {[type]} nodePathName [description]
 * @return {[type]}              [description]
 */
export const hasChild = strictArity((state, parentNodeId, nodePathName) => {
	return getChild(state, parentNodeId, nodePathName) ? true : false
})

export const canMoveNode = minArity(3, (state, nodeId, targetParentNodeId, options = { throwError: false }) => {
	let node = getNode(state, nodeId)
	let targetParentNode = getNode(state, targetParentNodeId)

	const { throwError } = options
	let err = false

	if (node.isRoot) {
		err = new Error(`Cannot move root node '${node.id}'`)
	} else if (node.id === targetParentNode.id) {
		err = new Error('Cannot move node into itself')
	} else if (hasChild(state, targetParentNode.id, node.nodePathName)) {
		err = new Error(`Duplicated nodePathName '${node.nodePathName}'`)
	} else if (isAncestor(state, node.id, targetParentNode.id)) {
		err = new Error(`Cannot move node '${node.id}' into a descendant '${targetParentNode.id}'`)
	}

	if (err) {
		if (throwError) {
			throw err
		}

		return false
	} else {
		return true
	}
})
