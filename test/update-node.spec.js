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

describe('tree.updateNode(state, nodeId, update)', () => {
	test('should update the node by assigning the update object', () => {
		let node22 = tree.getNodeByPath(D.state, D.rootNode.id, 'node2/node22')

		D.state = tree.updateNode(D.state, node22.id, { someNewProperty: 'some new value'})

		let updatedNode22 = tree.getNodeByPath(D.state, D.rootNode.id, 'node2/node22')
		expect(node22).not.toHaveProperty('someNewProperty')
		expect(updatedNode22).toEqual({
			...node22,
			someNewProperty: 'some new value'
		})
	})

	test('should call the update function with the node', () => {

		let node22 = tree.getNodeByPath(D.state, D.rootNode.id, 'node2/node22')
		let node222 = tree.getNodeByPath(D.state, D.rootNode.id, 'node2/node22/node222')

		D.state = tree.updateNode(D.state, node22.id, (node) => {
			return {
				...node,
				nodePathName: 'new node path name'
			}
		})

		let updatedNode22 = tree.getNodeByPath(D.state, D.rootNode.id, 'node2/new node path name')

		expect(node22 !== updatedNode22).toEqual(true)
		expect(updatedNode22).toEqual({
			...node22,
			nodePathName: 'new node path name',
		})

		let node222after = tree.getNodeByPath(D.state, D.rootNode.id, 'node2/new node path name/node222')
		expect(node222after).toEqual(node222)
	})
})
