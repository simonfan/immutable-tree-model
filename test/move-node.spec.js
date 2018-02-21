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

describe('tree.moveNode(state, nodeId, targetParentId)', () => {
	test('should move the node to another position in the tree', () => {
		let node3 = tree.getNodeByPath(D.state, D.nodesByLabel.root.id, 'node3')
		let node22 = tree.getNodeByPath(D.state, D.nodesByLabel.root.id, 'node2/node22')
		D.state = tree.moveNode(D.state, node3.id, node22.id)

		expect(tree.getNodePath(D.state, D.nodesByLabel.root.id, node3.id)).toEqual('node2/node22/node3')
	})

	test('should throw error when moving a node to parent that already has a child with the same nodePathName', () => {
		let node3 = tree.getNodeByPath(D.state, D.nodesByLabel.root.id, 'node3')
		let node22 = tree.getNodeByPath(D.state, D.nodesByLabel.root.id, 'node2/node22')

		let anotherNode3 = tree.model.leaf('node3')

		D.state = tree.addNode(D.state, node22.id, anotherNode3)

		expect(() => {
			tree.moveNode(D.state, node3.id, node22.id)
		}).toThrow(`Duplicated nodePathName 'node3'`)
	})

	test('should throw error when moving a node into itself', () => {
		let node3 = tree.getNodeByPath(D.state, D.nodesByLabel.root.id, 'node3')
		
		expect(() => {
			tree.moveNode(D.state, node3.id, node3.id)
		}).toThrow('Cannot move node into itself')
	})

	test('should throw error when moving a node into one of its own descendants', () => {
		let node2 = tree.getNodeByPath(D.state, D.nodesByLabel.root.id, 'node2')
		let node22 = tree.getNodeByPath(D.state, D.nodesByLabel.root.id, 'node2/node22')

		expect(() => {
			tree.moveNode(D.state, node2.id, node22.id)
		}).toThrow(`Cannot move node '${node2.id}' into a descendant '${node22.id}'`)
	})
})
