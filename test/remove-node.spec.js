'use strict'

import tree from '../src'

let D = {
	state: null
}

beforeEach(() => {
	let treeData = {
		nodePathName: 'root',
		nodeType: 'branch',
		children: [
			{
				nodePathName: 'node 1',
				nodeType: 'leaf',
			},
			{
				nodePathName: 'node 2',
				nodeType: 'branch',
				children: [
					{
						nodePathName: 'node 21',
						nodeType: 'leaf',
					},
					{
						nodePathName: 'node 22',
						nodeType: 'branch',
						children: [
							{
								nodePathName: 'node 221',
								nodeType: 'leaf',
							},
							{
								nodePathName: 'node 222',
								nodeType: 'leaf',
							}
						],
					},
					{
						nodePathName: 'node 23',
						nodeType: 'leaf',
					}
				]
			},
			{
				nodePathName: 'node 3',
				nodeType: 'leaf',
			}
		]
	}

	let [rootNode, ...treeNodes] = tree.model.flatten(treeData)

	D.state = tree.setRoot(tree.defaultState(), rootNode)
	D.state = treeNodes.reduce((state, node) => {
		return tree.addNode(state, node)
	}, D.state)

	D.rootNode = rootNode
	D.treeNodes = treeNodes
})

describe('tree.removeNode(state, nodeId)', () => {
	test('removing a leaf should remove only the node itself', () => {

		let state = tree.removeNode(D.state, D.treeNodes[0].id)

		expect(tree.getNode(state, state.rootId).childIds).not.toContain(D.treeNodes[0].id)
		expect(state.byId[D.treeNodes[0].id]).toBeUndefined()
		expect(tree.getAllNodeIds(state)).toHaveLength(8)
	})

	test('removing a branch should remove the node corresponding to the given nodeId and all its descendants', () => {
		let state = tree.removeNode(D.state, D.treeNodes[1].id)

		expect(tree.getNode(state, state.rootId).childIds).not.toContain(D.treeNodes[1].id)
		expect(tree.getAllNodeIds(state)).toHaveLength(3)
	})

	test('should refuse to remove the root node', () => {

		expect(() => {
			tree.removeNode(D.state, D.rootNode.id)
		}).toThrow()
	})
})
