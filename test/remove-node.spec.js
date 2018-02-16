'use strict'

const tree = require('../src')
const { model, removeNode } = tree
const { getNode, getNodes, getDescendantIds, getRootId, getAllNodeIds } = tree

let D = {
	state: null
}

beforeEach(() => {
	let treeData = {
		name: 'root',
		nodeType: 'branch',
		children: [
			{
				name: 'node 1',
				nodeType: 'leaf',
			},
			{
				name: 'node 2',
				nodeType: 'branch',
				children: [
					{
						name: 'node 21',
						nodeType: 'leaf',
					},
					{
						name: 'node 22',
						nodeType: 'branch',
						children: [
							{
								name: 'node 221',
								nodeType: 'leaf',
							},
							{
								name: 'node 222',
								nodeType: 'leaf',
							}
						],
					},
					{
						name: 'node 23',
						nodeType: 'leaf',
					}
				]
			},
			{
				name: 'node 3',
				nodeType: 'leaf',
			}
		]
	}

	let [rootNode, ...treeNodes] = model.flatten(treeData)

	D.state = tree.setRoot(tree.defaultState(), rootNode)
	D.state = treeNodes.reduce((state, node) => {
		return tree.addNode(state, node)
	}, D.state)

	D.rootNode = rootNode
	D.treeNodes = treeNodes
})

describe('removeNode(state, nodeId)', () => {
	test('removing a leaf should remove only the node itself', () => {

		let state = removeNode(D.state, D.treeNodes[0].id)

		expect(getNode(state, state.rootId).childIds).not.toContain(D.treeNodes[0].id)
		expect(state.byId[D.treeNodes[0].id]).toBeUndefined()
		expect(getAllNodeIds(state)).toHaveLength(8)
	})

	test('removing a branch should remove the node corresponding to the given nodeId and all its descendants', () => {
		let state = removeNode(D.state, D.treeNodes[1].id)

		expect(getNode(state, state.rootId).childIds).not.toContain(D.treeNodes[1].id)
		expect(getAllNodeIds(state)).toHaveLength(3)
	})

	test('should refuse to remove the root node', () => {

		expect(() => {
			removeNode(D.state, D.rootNode.id)
		}).toThrow()
	})
})
