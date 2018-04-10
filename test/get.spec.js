import tree from '../src'
const { model } = tree
const {
	getNode,
	getNodes,
	getAllNodes,
	getDescendantIds,
	getAncestorIds,
	getTree,
	getNodePath,
	getChild,
	getNodeIdByPath
} = tree

let D = {
	state: null
}

beforeEach(() => {
	let treeData = {
		label: 'root',
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
							},
							{
								label: 'node223',
								nodePathName: 'node223',
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

	let nodes = model.flatten(treeData)
	let [rootNode, ...otherNodes] = nodes

	D.state = tree.setRoot(D.state, rootNode)
	D.state = tree.addNodes(D.state, otherNodes)

	D.nodesByLabel = nodes.reduce((acc, node) => {
		acc[node.label] = node
		return acc
	}, {})
})

describe('getNode(state, nodeId)', () => {
	test('should retrieve the node with the given nodeId', () => {
		let node = getNode(D.state, D.nodesByLabel['root'].id)

		expect(node).toEqual(D.state.byId[D.nodesByLabel['root'].id])
	})
})

describe('getNodes(state, nodeIds)', () => {
	test('should retrieve the nodes corresponding to the given nodeIds', () => {
		let query = [
			D.nodesByLabel['root'].id,
			D.nodesByLabel['node23'].id,
			D.nodesByLabel['node3'].id
		]
		let nodes = getNodes(D.state, query)

		expect(nodes).toEqual(query.map(nodeId => D.state.byId[nodeId]))
	})
})

describe('getDescendantIds(state, nodeId)', () => {
	test('should retrieve an array of all descendant node ids', () => {
		let descendantIds = getDescendantIds(D.state, D.nodesByLabel.root.id)
		let nonRootNodeIds = Object.keys(D.nodesByLabel)
			.filter(label => label !== 'root')
			.map(label => D.nodesByLabel[label].id)

		expect(descendantIds).toEqual(expect.arrayContaining(nonRootNodeIds))
		expect(descendantIds.length).toEqual(nonRootNodeIds.length)
	})
})

describe('getAncestorIds(state, nodeId)', () => {
	test('should retrieve an array of ancestor ids', () => {
		expect(getAncestorIds(
			D.state,
			D.nodesByLabel['node222'].id
		))
		.toEqual([
			D.nodesByLabel['node22'].id,
			D.nodesByLabel['node2'].id,
			D.nodesByLabel['root'].id
		])

		expect(getAncestorIds(
			D.state,
			D.nodesByLabel['root'].id
		))
		.toEqual([])
	})

	test('should retrieve an array of ancestor ids', () => {
		let ancestorIds = getAncestorIds(D.state, D.nodesByLabel['node222'].id)

		expect(ancestorIds).toEqual([
			D.nodesByLabel['node22'].id,
			D.nodesByLabel['node2'].id,
			D.nodesByLabel['root'].id
		])
	})
})

describe('getTree(state, nodeId, { sort: fn, project: fn })', () => {
	test('should return the node tree in nested format', () => {
		let nodeTree = getTree(D.state, D.nodesByLabel['node22'].id)

		expect(nodeTree).toEqual({
			id: D.nodesByLabel['node22'].id,
			label: 'node22',
			nodePathName: 'node22',
			nodeType: 'branch',
			children: [
				{
					id: D.nodesByLabel['node221'].id,
					label: 'node221',
					nodePathName: 'node221',
					nodeType: 'leaf',
				},
				{
					id: D.nodesByLabel['node222'].id,
					label: 'node222',
					nodePathName: 'node222',
					nodeType: 'leaf',
				},
				{
					id: D.nodesByLabel['node223'].id,
					label: 'node223',
					nodePathName: 'node223',
					nodeType: 'leaf',
				}
			],
		})
	})

	test('should allow specifying children sorting function as third argument', () => {
		const sort = (nodeA, nodeB) => {
			return nodeA.label > nodeB.label ? -1 : 1
		}
		let nodeTree = getTree(
			D.state,
			D.nodesByLabel['node22'].id,
			{ sort }
		)

		expect(nodeTree).toEqual({
			id: D.nodesByLabel['node22'].id,
			label: 'node22',
			nodePathName: 'node22',
			nodeType: 'branch',
			children: [
				{
					id: D.nodesByLabel['node223'].id,
					label: 'node223',
					nodePathName: 'node223',
					nodeType: 'leaf',
				},
				{
					id: D.nodesByLabel['node222'].id,
					label: 'node222',
					nodePathName: 'node222',
					nodeType: 'leaf',
				},
				{
					id: D.nodesByLabel['node221'].id,
					label: 'node221',
					nodePathName: 'node221',
					nodeType: 'leaf',
				},
			],
		})
	})

	test('should apply sorting function recursively', () => {
		const sort = (nodeA, nodeB) => {
			return nodeA.label > nodeB.label ? -1 : 1
		}
		let nodeTree = getTree(
			D.state,
			D.nodesByLabel['node2'].id,
			{ sort }
		)

		expect(nodeTree).toEqual({
			id: D.nodesByLabel['node2'].id,
			label: 'node2',
			nodePathName: 'node2',
			nodeType: 'branch',
			children: [
				{
					id: D.nodesByLabel['node23'].id,
					label: 'node23',
					nodePathName: 'node23',
					nodeType: 'leaf',
				},
				{
					id: D.nodesByLabel['node22'].id,
					label: 'node22',
					nodePathName: 'node22',
					nodeType: 'branch',
					children: [
						{
							id: D.nodesByLabel['node223'].id,
							label: 'node223',
							nodePathName: 'node223',
							nodeType: 'leaf',
						},
						{
							id: D.nodesByLabel['node222'].id,
							label: 'node222',
							nodePathName: 'node222',
							nodeType: 'leaf',
						},
						{
							id: D.nodesByLabel['node221'].id,
							label: 'node221',
							nodePathName: 'node221',
							nodeType: 'leaf',
						},
					],
				},
				{
					id: D.nodesByLabel['node21'].id,
					label: 'node21',
					nodePathName: 'node21',
					nodeType: 'leaf',
				},
			]
		})
	})
})

describe('getNodePath(state, sourceNodeId, nodeId)', () => {
	test('should return the path to the node relative to the sourceNode', () => {
		// relative to root
		expect(getNodePath(
			D.state,
			D.nodesByLabel['root'].id,
			D.nodesByLabel['node222'].id
		))
		.toEqual('node2/node22/node222')

		// relative to some branch
		expect(getNodePath(
			D.state,
			D.nodesByLabel['node2'].id,
			D.nodesByLabel['node222'].id
		))
		.toEqual('node22/node222')

		// immediate parent
		expect(getNodePath(
			D.state,
			D.nodesByLabel['node22'].id,
			D.nodesByLabel['node222'].id
		))
		.toEqual('node222')
	})

	test('should throw error in case the sourceNode is not in the ancestors chain of the nodeId', () => {
		// TODO: maybe implement `..` like relative paths
		expect(() => {
			getNodePath(
				D.state,
				D.nodesByLabel['node1'].id,
				D.nodesByLabel['node222'].id
			)
		})
		.toThrow(`Node ${D.nodesByLabel['node1'].id} is not an ancestor of ${D.nodesByLabel['node222'].id}`)

		// path to itself
		expect(() => {
			getNodePath(
				D.state,
				D.nodesByLabel['root'].id,
				D.nodesByLabel['root'].id
			)
		})
		.toThrow(`Node ${D.nodesByLabel['root'].id} is not an ancestor of ${D.nodesByLabel['root'].id}`)
	})
})

describe('getAbsoluteNodePath(state, nodeId)', () => {
	test('should return an absolute path starting with the forward slash (/)', () => {
		expect(tree.getAbsoluteNodePath(
			D.state, 
			D.nodesByLabel['node222'].id
		))
		.toEqual('/node2/node22/node222')
	})

	test('if the nodeId corresponds to the root node itself, return only a forward slash (/) indicating it is the root node', () => {
		expect(tree.getAbsoluteNodePath(
			D.state,
			D.nodesByLabel['root'].id
		))
		.toEqual('/')
	})
})

describe('getChild(state, parentId, childPathName)', () => {
	test('should return the id of the child that corresponds to the childPathName', () => {
		let node = getChild(D.state, D.nodesByLabel['node22'].id, 'node222')

		expect(node).toEqual({
			nodePathName: 'node222',
			label: 'node222',
			nodeType: 'leaf',
			id: expect.any(Number),
			parentId: expect.any(Number)
		})
	})
})

describe('getNodeIdByPath(state, sourceNodeId, nodePath)', () => {
	test('should return the nodeId that corresponds to the nodePath', () => {
		let node221 = D.nodesByLabel['node221']
		let nodeId = getNodeIdByPath(D.state, D.nodesByLabel['root'].id, 'node2/node22/node221')

		expect(nodeId).toEqual(node221.id)
	})

	test('should resolve paths relative to the sourceNodeId', () => {
		let node2 = D.nodesByLabel['node2']
		let node221 = D.nodesByLabel['node221']
		let nodeId = getNodeIdByPath(D.state, node2.id, 'node22/node221')

		expect(nodeId).toEqual(node221.id)
	})
})
