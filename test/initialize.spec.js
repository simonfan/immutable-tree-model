'use strict'

const tree = require('../')
const { model } = tree

describe('test', () => {
	test('initialize()', () => {

		let rootNode = model.root({
			name: 'root node'
		})
		let state = tree.initialize(rootNode)

		expect(state).toEqual({
			rootId: rootNode.id,
			byId: {
				[rootNode.id]: rootNode,
			}
		})
	})
})
