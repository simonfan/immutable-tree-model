import {
	computeProperty,
	deleteProperty,
	deleteProperties,
	arrayRemoveItem,
	strictArity
} from './auxiliary'
import model from './model'
import {
	getNode,
	getAncestorIds,
	getDescendantIds,
	getChildren
} from './get'

/**
 * 
 */
export const defaultState = (state) => {
	return {
		...state,
		rootId: null,
		byId: {}
	}
}

/**
 * Sets the root
 */
export const setRoot = strictArity((state, root) => {
	return {
		...state,
		rootId: root.id,
		byId: {
			[root.id]: root,
		},
	}
})

/**
 * Adds a node to the tree.
 * The node must have already been formatted by the model
 */
export const addNode = strictArity((state, node) => {
	const { id, parentId } = node
	let parentNode = getNode(state, parentId)
	let siblings = getChildren(state, parentId)

	if (siblings.some(s => s.nodePathName === node.nodePathName)) {
		throw new Error(`Duplicated nodePathName '${node.nodePathName}'`)
	}

	return computeProperty(state, 'byId', (byId) => {
		return {
			...byId,
			[id]: node,
			[parentId]: {
				...parentNode,
				childIds: [
					...parentNode.childIds,
					id,
				]
			}
		}
	})
})

/**
 * 
 */
export const addNodes = strictArity((state, nodes) => {
	return nodes.reduce((state, node) => {
		return addNode(state, node)
	}, state)
})

/**
 * 
 */
export const removeNode = strictArity((state, nodeId) => {
	let node = getNode(state, nodeId)

	if (node.isRoot) {
		throw new Error(`Node '${nodeId}' is the root node and thus cannot be removed.`)
	}

	let parentNode = getNode(state, node.parentId)
	let descendantIds = node.nodeType === 'branch' ?
		getDescendantIds(state, nodeId) : []

	return computeProperty(state, 'byId', (byId) => {
		return deleteProperties({
			...byId,
			[parentNode.id]: {
				...parentNode,
				childIds: arrayRemoveItem(parentNode.childIds, nodeId)
			}
		}, [...descendantIds, nodeId])
	})
})

const hasChildWithNodePathName = (state, parentId, nodePathName) => {
	return getChildren(state, parentId).some(child => {
		return child.nodePathName === nodePathName
	})
}

const isAncestor = (state, candidateAncestorId, nodeId) => {
	return getAncestorIds(state, nodeId).some(ancestorId => {
		return ancestorId === candidateAncestorId
	})
}

/**
 * 
 */
export const moveNode = strictArity((state, nodeId, targetParentId) => {
	let node = getNode(state, nodeId)

	if (node.isRoot) {
		throw new Error(`Cannot move root node '${nodeId}'`)
	}

	if (nodeId === targetParentId) {
		throw new Error('Cannot move node into itself')
	}
	
	if (hasChildWithNodePathName(state, targetParentId, node.nodePathName)) {
		throw new Error(`Duplicated nodePathName '${node.nodePathName}'`)
	}
	
	if (isAncestor(state, nodeId, targetParentId)) {
		throw new Error(`Cannot move node '${nodeId}' into a descendant '${targetParentId}'`)
	}

	let parentNode = getNode(state, node.parentId)
	let targetParentNode = getNode(state, targetParentId)

	return computeProperty(state, 'byId', (byId) => {
		return {
			...byId,
			[parentNode.id]: {
				...parentNode,
				childIds: arrayRemoveItem(parentNode.childIds, nodeId)
			},
			[targetParentId]: {
				...targetParentNode,
				childIds: targetParentNode.childIds.concat([nodeId])
			},
			[nodeId]: {
				...node,
				parentId: targetParentId
			}
		}
	})
})

export const updateNode = strictArity((state, nodeId, update) => {
	let node = getNode(state, nodeId)

	return computeProperty(state, 'byId', (byId) => {
		return {
			...byId,
			[nodeId]: typeof update === 'function' ?
				update(node) : {
					...node,
					...update,
				}
		}
	})
})
