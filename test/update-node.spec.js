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

describe('tree.updateNode(state, nodeId, update)', () => {
	test('should update the node by assigning the update object', () => {
		let node22 = tree.getNodeByPath(D.state, D.nodesByLabel.root.id, 'node2/node22')

		D.state = tree.updateNode(D.state, node22.id, { someNewProperty: 'some new value'})

		let updatedNode22 = tree.getNodeByPath(D.state, D.nodesByLabel.root.id, 'node2/node22')
		expect(node22).not.toHaveProperty('someNewProperty')
		expect(updatedNode22).toEqual({
			...node22,
			someNewProperty: 'some new value'
		})
	})

	test('should call the update function with the node', () => {

		let node22 = tree.getNodeByPath(D.state, D.nodesByLabel.root.id, 'node2/node22')
		let node222 = tree.getNodeByPath(D.state, D.nodesByLabel.root.id, 'node2/node22/node222')

		D.state = tree.updateNode(D.state, node22.id, (node) => {
			return {
				...node,
				nodePathName: 'new node path name'
			}
		})

		let updatedNode22 = tree.getNodeByPath(D.state, D.nodesByLabel.root.id, 'node2/new node path name')

		expect(node22 !== updatedNode22).toEqual(true)
		expect(updatedNode22).toEqual({
			...node22,
			nodePathName: 'new node path name',
		})

		let node222after = tree.getNodeByPath(D.state, D.nodesByLabel.root.id, 'node2/new node path name/node222')
		expect(node222after).toEqual(node222)
	})
})
