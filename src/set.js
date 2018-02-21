import {
	computeProperty,
	deleteProperty,
	deleteProperties,
	arrayRemoveItem,
	strictArity,
	splitNodePath
} from './auxiliary'
import { branch } from './model'
import {
	getNode,
	getNodes,
	getNodeIdByPath,
	getAncestorIds,
	getDescendantIds,
	getChildren,
	getChildByPathName
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
 * Adds a nodeSpec to the tree.
 * The nodeSpec must have already been formatted by the model
 */
export const addNode = strictArity((state, parentId, nodeSpec) => {
	const { id } = nodeSpec
	let parentNode = getNode(state, parentId)
	let siblings = getNodes(state, parentNode.childIds)

	if (siblings.some(sibling => sibling.nodePathName === nodeSpec.nodePathName)) {
		throw new Error(`Duplicated nodePathName '${nodeSpec.nodePathName}'`)
	}

	return computeProperty(state, 'byId', (byId) => {
		return {
			...byId,
			[id]: {
				...nodeSpec,
				parentId: parentId,
			},
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

export const addNodeAtPath = strictArity((state, sourceNodeId, path, nodeSpec) => {
	return addNode(state, getNodeIdByPath(state, sourceNodeId, path), nodeSpec)
})

export const ensureNodeAtPath = strictArity((state, sourceNodeId, path, nodeSpec) => {
	let nodePathNames = Array.isArray(path) ? path : splitNodePath(path)
	let sourceNode = getNode(state, sourceNodeId)
	let parentNode = sourceNode

	while (nodePathNames.length > 0) {
		let nextNodePathName = nodePathNames.shift()
		let nextNode = getChildByPathName(state, parentNode.id, nextNodePathName)

		if (nextNode) {
			parentNode = nextNode
		} else {
			let newNode = branch(nextNodePathName)
			state = addNode(state, parentNode.id, newNode)
			parentNode = newNode
		}
	}

	if (!getChildByPathName(state, parentNode.id, nodeSpec.nodePathName)) {
		state = addNode(state, parentNode.id, nodeSpec)
	}

	return state
})

/**
 * 
 */
export const addNodes = strictArity((state, nodeSpecs) => {
	return nodeSpecs.reduce((state, nodeSpec) => {
		const { parentId, ...spec } = nodeSpec
		return addNode(state, parentId, spec)
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
