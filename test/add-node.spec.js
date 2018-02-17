'use strict'

import tree from '../src'
const { model } = tree

describe('addNode(state, node)', () => {
	test('should require strict arity of 2', () => {

		expect(() => {
			tree.addNode()
		}).toThrow('Insufficient args: requires 2 but got 0')
	})

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

	test('should throw error when attempting to add a node with repeated name to the same parent', () => {
		let rootNode = model.root()
		let state = tree.setRoot(tree.defaultState(), rootNode)

		let node1 = model.leaf(rootNode.id, 'sameNodeName')
		let node2 = model.branch(rootNode.id, 'sameNodeName')
		
		state = tree.addNode(state, node1)

		expect(() => {
			tree.addNode(state, node2)
		}).toThrow(`Duplicated nodePathName 'sameNodeName'`)
	})
})
