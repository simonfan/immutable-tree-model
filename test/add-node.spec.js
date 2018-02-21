'use strict'

import tree from '../src'
const { model } = tree

describe('addNode(state, node)', () => {
	test('should require strict arity of 3', () => {

		expect(() => {
			tree.addNode()
		}).toThrow('Insufficient args: requires 3 but got 0')
	})

	test('adding one by one', () => {
		let rootNode = model.root()
		let state = tree.setRoot(tree.defaultState(), rootNode)

		let node1 = model.leaf('node 1')
		let node2 = model.branch('node 2')
		let node21 = model.branch('node 21')

		state = tree.addNode(state, rootNode.id, node1)
		expect(state).toEqual({
			rootId: rootNode.id,
			byId: {
				[rootNode.id]: {
					...rootNode,
					childIds: [node1.id],
				},
				[node1.id]: {
					...node1,
					parentId: rootNode.id,
				}
			}
		})

		state = tree.addNode(state, rootNode.id, node2)
		expect(state).toEqual({
			rootId: rootNode.id,
			byId: {
				[rootNode.id]: {
					...rootNode,
					childIds: [node1.id, node2.id],
				},
				[node1.id]: {
					...node1,
					parentId: rootNode.id,
				},
				[node2.id]: {
					...node2,
					parentId: rootNode.id,
				}
			}
		})

		state = tree.addNode(state, node2.id, node21)
		expect(state).toEqual({
			rootId: rootNode.id,
			byId: {
				[rootNode.id]: {
					...rootNode,
					childIds: [node1.id, node2.id],
				},
				[node1.id]: {
					...node1,
					parentId: rootNode.id,
				},
				[node2.id]: {
					...node2,
					parentId: rootNode.id,
					childIds: [node21.id]
				},
				[node21.id]: {
					...node21,
					parentId: node2.id,
				}
			}
		})
	})

	test('should throw error when attempting to add a node with repeated name to the same parent', () => {
		let rootNode = model.root()
		let state = tree.setRoot(tree.defaultState(), rootNode)

		let node1 = model.leaf('sameNodeName')
		let node2 = model.branch('sameNodeName')
		
		state = tree.addNode(state, rootNode.id, node1)

		expect(() => {
			tree.addNode(state, rootNode.id, node2)
		}).toThrow(`Duplicated nodePathName 'sameNodeName'`)
	})
})
