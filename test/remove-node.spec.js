'use strict'

const tree = require('../')
const { model, removeNode } = tree
const { getNode, getNodes, getDescendantIds, getRootId, getAllNodeIds } = tree

let D = {
	state: null
}

beforeEach(() => {
	let treeData = {
		name: 'root',
		type: 'branch',
		children: [
			{
				name: 'node 1',
				type: 'leaf',
			},
			{
				name: 'node 2',
				type: 'branch',
				children: [
					{
						name: 'node 21',
						type: 'leaf',
					},
					{
						name: 'node 22',
						type: 'branch',
						children: [
							{
								name: 'node 221',
								type: 'leaf',
							},
							{
								name: 'node 222',
								type: 'leaf',
							}
						],
					},
					{
						name: 'node 23',
						type: 'leaf',
					}
				]
			},
			{
				name: 'node 3',
				type: 'leaf',
			}
		]
	}

	let [rootNode, ...treeNodes] = model.flatten(treeData)

	D.state = tree.initialize(rootNode)
	D.state = treeNodes.reduce((state, node) => {
		return tree.addNode(state, node)
	}, D.state)

	D.rootNode = rootNode
	D.treeNodes = treeNodes
})

describe('removeNode(state, nodeId)', () => {
	test('removing a leaf should remove only the node itself', () => {

		let state = removeNode(D.state, D.treeNodes[0].id)


		console.log(tree.getRoot(D.state))

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
