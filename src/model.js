import uuid from 'uuid'

const TRAILING_SLASH_RE = /\/$/
const trimTrailingSlash = (str) => {
	return typeof str === 'string' ?
		str.replace(TRAILING_SLASH_RE, '') : undefined
}

const root = (nodeRootPath, spec) => ({
	...spec,
	nodeRootPath: trimTrailingSlash(nodeRootPath),
	nodeType: 'branch',
	id: uuid.v4(),
	childIds: [],
	isRoot: true,
})

const branch = (parentId, nodePathName, spec) => ({
	...spec,
	nodePathName,
	nodeType: 'branch',
	id: uuid.v4(),
	childIds: [],
	parentId: parentId,
})

const leaf = (parentId, nodePathName, spec) => ({
	...spec,
	nodePathName,
	nodeType: 'leaf',
	id: uuid.v4(),
	parentId: parentId,
})


const FLATTEN_DEFAULT_OPTIONS = {
	parentId: false,
}

const flatten = (obj, options = Object.assign({}, FLATTEN_DEFAULT_OPTIONS)) => {
	const { children, nodePathName, nodeRootPath, ...spec } = obj
	let currentNode = options.parentId ?
		branch(options.parentId, nodePathName, spec) : root(nodeRootPath, spec)

	return children.reduce((acc, childObj) => {
		const { nodePathName: childName, ...childSpec } = childObj

		switch (childObj.nodeType) {
			case 'branch':
				return [
					...acc,
					...flatten(childObj, {
						...options,
						parentId: currentNode.id
					})
				]
			case 'leaf':
				return [...acc, leaf(currentNode.id, childName, childObj)]
			default: 
				throw new Error(`Invalid node nodeType '${childObj.nodeType}'`)
		}

	}, [currentNode])
}

module.exports = {
	root,
	branch,
	leaf,
	flatten
}
