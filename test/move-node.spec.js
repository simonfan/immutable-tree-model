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

	let [rootNode, ...treeNodes] = tree.model.flatten(treeData)

	D.state = tree.setRoot(tree.defaultState(), rootNode)
	D.state = treeNodes.reduce((state, node) => {
		return tree.addNode(state, node)
	}, D.state)

	D.rootNode = rootNode
	D.treeNodes = treeNodes
})

describe('tree.moveNode(state, nodeId, targetParentId)', () => {
	test('should move the node to another position in the tree', () => {
		let node3 = tree.getNodeByPath(D.state, D.rootNode.id, 'node3')
		let node22 = tree.getNodeByPath(D.state, D.rootNode.id, 'node2/node22')
		D.state = tree.moveNode(D.state, node3.id, node22.id)

		expect(tree.getNodePath(D.state, node3.id)).toEqual('node2/node22/node3')
	})

	test('should throw error when moving a node to parent that already has a child with the same nodePathName', () => {
		let node3 = tree.getNodeByPath(D.state, D.rootNode.id, 'node3')
		let node22 = tree.getNodeByPath(D.state, D.rootNode.id, 'node2/node22')

		let anotherNode3 = tree.model.leaf(node22.id, 'node3')

		D.state = tree.addNode(D.state, anotherNode3)

		expect(() => {
			tree.moveNode(D.state, node3.id, node22.id)
		}).toThrow(`Duplicated nodePathName 'node3'`)
	})

	test('should throw error when moving a node into itself', () => {
		let node3 = tree.getNodeByPath(D.state, D.rootNode.id, 'node3')
		
		expect(() => {
			tree.moveNode(D.state, node3.id, node3.id)
		}).toThrow('Cannot move node into itself')
	})

	test('should throw error when moving a node into one of its own descendants', () => {
		let node2 = tree.getNodeByPath(D.state, D.rootNode.id, 'node2')
		let node22 = tree.getNodeByPath(D.state, D.rootNode.id, 'node2/node22')

		expect(() => {
			tree.moveNode(D.state, node2.id, node22.id)
		}).toThrow(`Cannot move node '${node2.id}' into a descendant '${node22.id}'`)
	})
})
