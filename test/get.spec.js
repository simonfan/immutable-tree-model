const tree = require('../src')
const { model } = tree
const {
	getNode,
	getNodes,
	getDescendantIds,
	getAncestorIds,
	getTree,
	getPath
} = tree

let D = {
	state: null
}

beforeEach(() => {
	let treeData = {
		nodeRootPath: 'path/to/root',
		nodeType: 'branch',
		children: [
			{
				nodePathName: 'node-1',
				nodeType: 'leaf',
			},
			{
				nodePathName: 'node-2',
				nodeType: 'branch',
				children: [
					{
						nodePathName: 'node-21',
						nodeType: 'leaf',
					},
					{
						nodePathName: 'node-22',
						nodeType: 'branch',
						children: [
							{
								nodePathName: 'node-221',
								nodeType: 'leaf',
							},
							{
								nodePathName: 'node-222',
								nodeType: 'leaf',
							}
						],
					},
					{
						nodePathName: 'node-23',
						nodeType: 'leaf',
					}
				]
			},
			{
				nodePathName: 'node-3',
				nodeType: 'leaf',
			}
		]
	}

	let [rootNode, ...treeNodes] = model.flatten(treeData)

	D.state = tree.setRoot(D.state, rootNode)
	D.state = treeNodes.reduce((state, node) => {
		return tree.addNode(state, node)
	}, D.state)

	D.rootNode = rootNode
	D.treeNodes = treeNodes

	D.getNodeByPathName = (nodePathName) => {
		return D.treeNodes.find(node => node.nodePathName === nodePathName)
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
		let ancestorIds = getAncestorIds(D.state, D.getNodeByPathName('node-222').id)
		let ancestors = getNodes(D.state, ancestorIds)

		let path = ancestors.reduce((acc, ancestor) => {
			return ancestor.nodePathName + '/' + acc
		}, '')
	})
})

describe('getTree(state, nodeId)', () => {
	test('should return the node tree in nested format', () => {
		let nodeTree = getTree(D.state, D.rootNode.id)

		// console.log(JSON.stringify(nodeTree, null, '  '))
	})
})


describe('getPath(state, nodeId)', () => {
	test('should return the path to the node preceded by the nodeRootPath', () => {
		let nodePath = getPath(D.state, D.getNodeByPathName('node-222').id)

		expect(nodePath).toEqual('path/to/root/node-2/node-22/node-222')
	})

	test('if given the root, should return the nodeRootPath', () => {
		let nodePath = getPath(D.state, D.rootNode.id)

		expect(nodePath).toEqual('path/to/root')
	})
})
