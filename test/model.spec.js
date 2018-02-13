'use strict'

const tree = require('../')
const { model } = tree

describe('model.fromObject', () => {
	test('fromObject(parentId, tree)', () => {
		let nodes = model.flatten({
			name: 'root',
			type: 'branch',
			children: [
				{
					name: 'branch1',
					type: 'branch',	
					children: [
						{
							type: 'leaf',
							name: 'leaf11',
						},
						{
							type: 'leaf',
							name: 'leaf12'
						}
					]
				},
				{
					name: 'branch2',
					type: 'branch',
					children: [
						{
							type: 'branch',
							name: 'branch21',
							children: [],
						},
						{
							type: 'leaf',
							name: 'leaf22'
						}
					],
				}
			],
		})

		expect(nodes).toHaveLength(7)
	})
})
