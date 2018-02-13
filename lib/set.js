const {
	computeProperty,
	deleteProperty,
	deleteProperties,
	arrayRemoveItem
} = require('./auxiliary')
const model = require('./model')
const { getNode, getDescendantIds } = require('./get')

const initialize = (root) => {
	return {
		rootId: root.id,
		byId: {
			[root.id]: root,
		},
	}
}

const addNode = (state, node) => {
	let parentNode = getNode(state, node.parentId)

	return computeProperty(state, 'byId', (byId) => {
		return {
			...byId,
			[node.id]: node,
			[parentNode.id]: {
				...parentNode,
				childIds: [
					...parentNode.childIds,
					node.id,
				]
			}
		}
	})
}

const addNodes = (state, nodes) => {
	return nodes.reduce((state, node) => {
		return addNode(state, node)
	}, state)
}

const removeNode = (state, nodeId) => {
	let node = getNode(state, nodeId)

	if (node.isRoot) {
		throw new Error(`Node '${nodeId}' is the root node and thus cannot be removed.`)
	}

	let parentNode = getNode(state, node.parentId)
	let descendantIds = node.type === 'branch' ?
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
}

const moveNode = (state, nodeId, targetParentId) => {
	let node = getNode(state, nodeId)

	if (node.isRoot) {
		throw new Error(`Node '${nodeId}' is the root node and thus cannot be removed.`)
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
}

module.exports = {
	initialize,
	addNode,
	addNodes,
	removeNode,
	model
}
