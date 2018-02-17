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

describe('tree.model.leaf(parentId, nodePathName, spec)', () => {
	test('should return an object describing a leaf node', () => {
		let leaf = tree.model.leaf('parent-id-123', 'leaf name', {
			arbitrary: 'data',
		})
		
		expect(leaf).toEqual({
			id: expect.any(Number),
			parentId: 'parent-id-123',
			nodeType: 'leaf',
			nodePathName: 'leaf name',
			arbitrary: 'data',
		})
	})

	test('should ensure min arity of 2', () => {
		expect(() => {
			let leaf = tree.model.leaf('parent-id-123')
		}).toThrow(`Insufficient args: requires 2 but got 1`)
	})
})

describe('tree.model.branch(parentId, nodePathName, spec)', () => {
	test('should return an object describing a branch node', () => {
		let branch = tree.model.branch('parent-id-123', 'branch name', {
			arbitrary: 'data',
		})
		
		expect(branch).toEqual({
			id: expect.any(Number),
			parentId: 'parent-id-123',
			nodeType: 'branch',
			nodePathName: 'branch name',
			arbitrary: 'data',
			childIds: [],
		})
	})

	test('should ensure min arity of 2', () => {
		expect(() => {
			let branch = tree.model.branch('parent-id-123')
		}).toThrow(`Insufficient args: requires 2 but got 1`)
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

	test('should ensure min arity of 1', () => {
		expect(() => {
			let nodes = tree.model.flatten()
		}).toThrow(`Insufficient args: requires 1 but got 0`)
	})
})
