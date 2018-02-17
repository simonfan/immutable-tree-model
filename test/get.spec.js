import tree from '../src'
const { model } = tree
const {
	getNode,
	getNodes,
	getDescendantIds,
	getAncestorIds,
	getTree,
	getNodePath,
	getChildByPathName,
	getNodeIdByPath
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
				nodePathName: 'node1',
				nodeType: 'leaf',
			},
			{
				nodePathName: 'node2',
				nodeType: 'branch',
				children: [
					{
						nodePathName: 'node21',
						nodeType: 'leaf',
					},
					{
						nodePathName: 'node22',
						nodeType: 'branch',
						children: [
							{
								nodePathName: 'node221',
								nodeType: 'leaf',
							},
							{
								nodePathName: 'node222',
								nodeType: 'leaf',
							}
						],
					},
					{
						nodePathName: 'node23',
						nodeType: 'leaf',
					}
				]
			},
			{
				nodePathName: 'node3',
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
		let ancestorIds = getAncestorIds(D.state, D.getNodeByPathName('node222').id)
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

describe('getNodePath(state, nodeId)', () => {
	test('should return the path to the node preceded by the nodeRootPath', () => {
		let nodePath = getNodePath(D.state, D.getNodeByPathName('node222').id)

		expect(nodePath).toEqual('path/to/root/node2/node22/node222')
	})

	test('if given the root, should return the nodeRootPath', () => {
		let nodePath = getNodePath(D.state, D.rootNode.id)

		expect(nodePath).toEqual('path/to/root')
	})

	test('if the root node has no nodeRootPath, the nodeRootPath should not be prepended', () => {
		let root = tree.model.root()
		let node1 = tree.model.branch(root.id, 'node1')
		let node11 = tree.model.leaf(node1.id, 'node11')

		let state = tree.setRoot(tree.defaultState(), root)
		state = tree.addNode(state, node1)
		state = tree.addNode(state, node11)

		expect(tree.getNodePath(state, node11.id)).toEqual('node1/node11')
	})
})

describe('getChildByPathName(state, parentId, childPathName)', () => {
	test('should return the id of the child that corresponds to the childPathName', () => {
		let node = getChildByPathName(D.state, D.getNodeByPathName('node22').id, 'node222')

		expect(node).toEqual({
			nodePathName: 'node222',
			nodeType: 'leaf',
			id: expect.any(Number),
			parentId: expect.any(Number)
		})
	})
})

describe('getNodeIdByPath(state, rootNodeId, nodePath)', () => {
	test('should return the nodeId that corresponds to the nodePath', () => {
		let node221 = D.getNodeByPathName('node221')
		let nodeId = getNodeIdByPath(D.state, D.rootNode.id, 'node2/node22/node221')

		expect(nodeId).toEqual(node221.id)
	})

	test('should resolve paths relative to the rootNodeId', () => {
		let node2 = D.getNodeByPathName('node2')
		let node221 = D.getNodeByPathName('node221')
		let nodeId = getNodeIdByPath(D.state, node2.id, 'node22/node221')

		expect(nodeId).toEqual(node221.id)
	})
})
