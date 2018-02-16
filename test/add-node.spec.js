'use strict'

const tree = require('../src')
const { model } = tree

describe('addNode(state, node)', () => {
	test('adding one by one', () => {
		let rootNode = model.root()
		let state = tree.setRoot(tree.defaultState(), rootNode)

		let node1 = model.leaf(rootNode.id, 'node 1')
		let node2 = model.branch(rootNode.id, 'node 2')
		let node21 = model.branch(node2.id, 'node 21')

		state = tree.addNode(state, node1)
		expect(state).toEqual({
			rootId: rootNode.id,
			byId: {
				[rootNode.id]: {
					...rootNode,
					childIds: [node1.id],
				},
				[node1.id]: node1,
			}
		})

		state = tree.addNode(state, node2)
		expect(state).toEqual({
			rootId: rootNode.id,
			byId: {
				[rootNode.id]: {
					...rootNode,
					childIds: [node1.id, node2.id],
				},
				[node1.id]: node1,
				[node2.id]: node2,
			}
		})

		state = tree.addNode(state, node21)
		expect(state).toEqual({
			rootId: rootNode.id,
			byId: {
				[rootNode.id]: {
					...rootNode,
					childIds: [node1.id, node2.id],
				},
				[node1.id]: node1,
				[node2.id]: {
					...node2,
					childIds: [node21.id]
				},
				[node21.id]: node21,
			}
		})
	})
})
