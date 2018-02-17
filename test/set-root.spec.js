'use strict'

import tree from '../src'

describe('test', () => {
	test('setRoot(state, root)', () => {

		let root = tree.model.root('path/to/root', {
			name: 'root node'
		})
		let state = tree.setRoot(tree.defaultState(), root)

		expect(state).toEqual({
			rootId: root.id,
			byId: {
				[root.id]: root,
			}
		})
	})
})
