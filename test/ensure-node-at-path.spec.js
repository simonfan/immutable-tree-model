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

describe('tree.ensureNodeAtPath(state, sourceNodeId, path, spec)', () => {
	test('should add all necessary intermediate branch nodes and add the last node', () => {

		D.state = tree.ensureNodeAtPath(
			D.state,
			tree.getRootId(D.state),
			'node2/node22/node223/node2231',
			tree.model.leaf('node22311')
		)

		expect(tree.getNodeByPath(D.state, tree.getRootId(D.state), 'node2/node22/node223')).toEqual({
			nodePathName: 'node223',
			nodeType: 'branch',
			id: expect.any(Number),
			parentId: expect.any(Number),
			childIds: [expect.any(Number)]
		})

		expect(tree.getNodeByPath(D.state, tree.getRootId(D.state), 'node2/node22/node223/node2231')).toEqual({
			nodePathName: 'node2231',
			nodeType: 'branch',
			id: expect.any(Number),
			parentId: expect.any(Number),
			childIds: [expect.any(Number)]
		})

		expect(tree.getNodeByPath(
			D.state,
			tree.getRootId(D.state),
			'node2/node22/node223/node2231/node22311'
		))
		.toEqual({
			nodePathName: 'node22311',
			nodeType: 'leaf',
			id: expect.any(Number),
			parentId: expect.any(Number),
		})
	})

	test('should not add any new nodes if the path is already occupied by another node', () => {
		let stateBefore = D.state
		let stateAfter  = tree.ensureNodeAtPath(
			stateBefore,
			tree.getRootId(D.state),
			'node2/node22',
			tree.model.leaf('node221')
		)

		expect(stateBefore).toEqual(stateAfter)
	})
})
