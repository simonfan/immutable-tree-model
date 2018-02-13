const uuid = require('uuid')

const root = (spec) => ({
	...spec,
	type: 'branch',
	id: spec.id || uuid.v4(),
	childIds: [],
	isRoot: true,
})

const branch = (parentId, spec) => ({
	...spec,
	type: 'branch',
	id: spec.id || uuid.v4(),
	childIds: [],
	parentId: parentId,
})

const leaf = (parentId, spec) => ({
	...spec,
	type: 'leaf',
	id: spec.id || uuid.v4(),
	parentId: parentId,
})


const FLATTEN_DEFAULT_OPTIONS = {
	parentId: false,
}

const flatten = (obj, options = Object.assign({}, FLATTEN_DEFAULT_OPTIONS)) => {
	const { children, ...noChildren } = obj
	let currentNode = options.parentId ?
		branch(options.parentId, noChildren) : root(noChildren)

	return children.reduce((acc, childObj) => {

		switch (childObj.type) {
			case 'branch':
				return [
					...acc,
					...flatten(childObj, {
						...options,
						parentId: currentNode.id
					})
				]
			case 'leaf':
				return [...acc, leaf(currentNode.id, childObj)]
			default: 
				throw new Error(`Invalid node type '${childObj.type}'`)
		}

	}, [currentNode])
}

module.exports = {
	root,
	branch,
	leaf,
	flatten
}
