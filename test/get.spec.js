'use strict'

const tree = require('../')
const { model } = tree
const {
	getNode,
	getNodes,
	getDescendantIds,
	getAncestorIds
} = tree

let D = {
	state: null
}

beforeEach(() => {
	let treeData = {
		name: 'root',
		nodeType: 'branch',
		children: [
			{
				name: 'node-1',
				nodeType: 'leaf',
			},
			{
				name: 'node-2',
				nodeType: 'branch',
				children: [
					{
						name: 'node-21',
						nodeType: 'leaf',
					},
					{
						name: 'node-22',
						nodeType: 'branch',
						children: [
							{
								name: 'node-221',
								nodeType: 'leaf',
							},
							{
								name: 'node-222',
								nodeType: 'leaf',
							}
						],
					},
					{
						name: 'node-23',
						nodeType: 'leaf',
					}
				]
			},
			{
				name: 'node-3',
				nodeType: 'leaf',
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

	D.getNodeByName = (name) => {
		return D.treeNodes.find(node => node.name === name)
	}
})

describe('getNode(state, nodeId)', () => {
	test('should retrieve the node with the given nodeId', () => {
		let node = getNode(D.state, D.treeNodes[3].id)

		expect(node).toEqual(D.state.byId[D.treeNodes[3].id])
	})
})

describe('getNodes(state, nodeIds)', () => {
	test('should retrieve the nodes corresponding to the given nodeIds', () => {
		let query = [
			D.treeNodes[0].id,
			D.treeNodes[4].id,
			D.treeNodes[2].id
		]
		let nodes = getNodes(D.state, query)

		expect(nodes).toEqual(query.map(nodeId => D.state.byId[nodeId]))
	})
})

describe('getDescendantIds(state, nodeId)', () => {
	test('should retrieve an array of all descendant node ids', () => {
		let descendantIds = getDescendantIds(D.state, D.rootNode.id)

		expect(descendantIds).toEqual(expect.arrayContaining(D.treeNodes.map(node => node.id)))
		expect(descendantIds.length).toEqual(D.treeNodes.length)
	})
})

describe('getAncestorIds(state, nodeId)', () => {
	test('should retrieve an array of ancestor ids', () => {
		let ancestorIds = getAncestorIds(D.state, D.getNodeByName('node-222').id)
		let ancestors = getNodes(D.state, ancestorIds)

		let path = ancestors.reduce((acc, ancestor) => {
			return ancestor.name + '/' + acc
		}, '')

		console.log(path)
	})
})
