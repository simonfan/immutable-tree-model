'use strict'

const tree = require('../')
const { model } = tree

describe('model.flatten(tree, options)', () => {
	test('should convert an object tree into an array of nodes ready to be added', () => {
		let nodes = model.flatten({
			name: 'root',
			nodeType: 'branch',
			children: [
				{
					name: 'branch1',
					nodeType: 'branch',	
					children: [
						{
							nodeType: 'leaf',
							name: 'leaf11',
						},
						{
							nodeType: 'leaf',
							name: 'leaf12'
						}
					]
				},
				{
					name: 'branch2',
					nodeType: 'branch',
					children: [
						{
							nodeType: 'branch',
							name: 'branch21',
							children: [],
						},
						{
							nodeType: 'leaf',
							name: 'leaf22'
						}
					],
				}
			],
		})

		expect(nodes).toHaveLength(7)
	})
})
