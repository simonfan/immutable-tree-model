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
	getChild,
	canMoveNode
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
export const addNode = strictArity((state, parentId, node) => {
	const { id } = node
	let parentNode = getNode(state, parentId)
	let siblings = getNodes(state, parentNode.childIds)

	if (siblings.some(sibling => sibling.nodePathName === node.nodePathName)) {
		throw new Error(`Duplicated nodePathName '${node.nodePathName}'`)
	}

	return computeProperty(state, 'byId', (byId) => {
		return {
			...byId,
			[id]: {
				...node,
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

export const addNodeAtPath = strictArity((state, sourceNodeId, parentNodePath, node) => {
	return addNode(state, getNodeIdByPath(state, sourceNodeId, parentNodePath), node)
})

export const ensureNodeAtPath = strictArity((state, sourceNodeId, parentNodePath, node) => {
	let nodePathNames = Array.isArray(parentNodePath) ? parentNodePath : splitNodePath(parentNodePath)
	let sourceNode = getNode(state, sourceNodeId)
	let parentNode = sourceNode

	while (nodePathNames.length > 0) {
		let nextNodePathName = nodePathNames.shift()
		let nextNode = getChild(state, parentNode.id, nextNodePathName)

		if (nextNode) {
			parentNode = nextNode
		} else {
			let newNode = branch(nextNodePathName)
			state = addNode(state, parentNode.id, newNode)
			parentNode = newNode
		}
	}

	if (!getChild(state, parentNode.id, node.nodePathName)) {
		state = addNode(state, parentNode.id, node)
	}

	return state
})

/**
 * 
 */
export const addNodes = strictArity((state, nodes) => {
	return nodes.reduce((state, node) => {
		const { parentId, ...spec } = node
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

	canMoveNode(state, nodeId, targetParentId, { throwError: true })

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
