'use strict'

import tree from '../src'

describe('tree.model.root(spec)', () => {
	test('should return an object describing the root node', () => {
		let root = tree.model.root('path/to/root', {
			arbitrary: 'data',
		})

		expect(root).toEqual({
			id: expect.any(Number),
			nodeRootPath: 'path/to/root',
			nodeType: 'branch',
			childIds: [],
			arbitrary: 'data',
			isRoot: true,
		})
	})

	test('should normalize the nodeRootPath to have no trailing slash', () => {
		let root = tree.model.root('path/to/root/', {
			arbitrary: 'data',
		})

		expect(root).toEqual({
			id: expect.any(Number),
			nodeRootPath: 'path/to/root',
			nodeType: 'branch',
			childIds: [],
			arbitrary: 'data',
			isRoot: true,
		})
	})
})

describe('tree.model.leaf(nodePathName, spec)', () => {
	test('should return an object describing a leaf node', () => {
		let leaf = tree.model.leaf('leaf name', {
			arbitrary: 'data',
		})
		
		expect(leaf).toEqual({
			id: expect.any(Number),
			nodeType: 'leaf',
			nodePathName: 'leaf name',
			arbitrary: 'data',
		})
	})
})

describe('tree.model.branch(nodePathName, spec)', () => {
	test('should return an object describing a branch node', () => {
		let branch = tree.model.branch('branch name', {
			arbitrary: 'data',
		})
		
		expect(branch).toEqual({
			id: expect.any(Number),
			nodeType: 'branch',
			nodePathName: 'branch name',
			arbitrary: 'data',
			childIds: [],
		})
	})
})

describe('tree.model.flatten(tree, options)', () => {
	test('should convert an object tree into an array of nodes ready to be added', () => {
		let nodes = tree.model.flatten({
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
