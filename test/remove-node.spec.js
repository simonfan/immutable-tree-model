'use strict'

import tree from '../src'

let D = {
	state: null
}

beforeEach(() => {
	let treeData = {
		label: 'root',
		nodePathName: 'root',
		nodeType: 'branch',
		children: [
			{
				label: 'node1',
				nodePathName: 'node1',
				nodeType: 'leaf',
			},
			{
				label: 'node2',
				nodePathName: 'node2',
				nodeType: 'branch',
				children: [
					{
						label: 'node21',
						nodePathName: 'node21',
						nodeType: 'leaf',
					},
					{
						label: 'node22',
						nodePathName: 'node22',
						nodeType: 'branch',
						children: [
							{
								label: 'node221',
								nodePathName: 'node221',
								nodeType: 'leaf',
							},
							{
								label: 'node222',
								nodePathName: 'node222',
								nodeType: 'leaf',
							}
						],
					},
					{
						label: 'node23',
						nodePathName: 'node23',
						nodeType: 'leaf',
					}
				]
			},
			{
				label: 'node3',
				nodePathName: 'node3',
				nodeType: 'leaf',
			}
		]
	}

	let nodes = tree.model.flatten(treeData)
	let [rootNode, ...otherNodes] = nodes

	D.state = tree.setRoot(tree.defaultState(), rootNode)
	D.state = tree.addNodes(D.state, otherNodes)

	D.nodesByLabel = nodes.reduce((acc, node) => {
		acc[node.label] = node
		return acc
	}, {})
})

describe('tree.removeNode(state, nodeId)', () => {
	test('removing a leaf should remove only the node itself', () => {

		let state = tree.removeNode(D.state, D.nodesByLabel['node1'].id)

		expect(tree.getNode(state, state.rootId).childIds).not.toContain(D.nodesByLabel['node1'].id)
		expect(state.byId[D.nodesByLabel['node1'].id]).toBeUndefined()
		expect(tree.getAllNodeIds(state)).toHaveLength(8)
	})

	test('removing a branch should remove the node corresponding to the given nodeId and all its descendants', () => {
		let state = tree.removeNode(D.state, D.nodesByLabel['node2'].id)

		expect(tree.getNode(state, state.rootId).childIds).not.toContain(D.nodesByLabel['node2'].id)
		expect(tree.getAllNodeIds(state)).toHaveLength(3)
	})

	test('should refuse to remove the root node', () => {

		expect(() => {
			tree.removeNode(D.state, D.rootNode.id)
		}).toThrow()
	})
})
