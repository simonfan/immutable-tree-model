'use strict'

const tree = require('../')
const { model } = tree
const freeze = require('deep-freeze')

describe('addNode(state, node)', () => {
	test('adding one by one', () => {
		let rootNode = model.root({
			name: 'root node'
		})
		let state = tree.initialize(rootNode)

		let node1 = model.leaf(rootNode.id, {
			name: 'node 1',
		})
		let node2 = model.branch(rootNode.id, {
			name: 'node 2',
		})
		let node21 = model.branch(node2.id, {
			name: 'node 21',
		})

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
