import { generateId, minArity } from './auxiliary'

const TRAILING_SLASH_RE = /\/$/
const trimTrailingSlash = (str) => {
	return typeof str === 'string' ?
		str.replace(TRAILING_SLASH_RE, '') : undefined
}

/**
 * [description]
 * @param  {[type]} nodeRootPath [description]
 * @param  {[type]} spec         [description]
 * @return {[type]}              [description]
 */
export const root = (nodeRootPath, spec) => ({
	...spec,
	nodeRootPath: trimTrailingSlash(nodeRootPath),
	nodeType: 'branch',
	id: generateId(),
	childIds: [],
	isRoot: true,
})

/**
 * [description]
 * @param  {[type]} parentId     [description]
 * @param  {[type]} nodePathName [description]
 * @param  {[type]} spec         [description]
 * @return {[type]}              [description]
 */
export const branch = minArity(2, (parentId, nodePathName, spec) => ({
	...spec,
	nodePathName,
	nodeType: 'branch',
	id: generateId(),
	childIds: [],
	parentId: parentId,
}))

/**
 * [description]
 * @param  {[type]} parentId     [description]
 * @param  {[type]} nodePathName [description]
 * @param  {[type]} spec         [description]
 * @return {[type]}              [description]
 */
export const leaf = minArity(2, (parentId, nodePathName, spec) => ({
	...spec,
	nodePathName,
	nodeType: 'leaf',
	id: generateId(),
	parentId: parentId,
}))


const FLATTEN_DEFAULT_OPTIONS = {
	parentId: false,
}

/**
 * [description]
 * @param  {[type]} obj     [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
export const flatten = minArity(1, (obj, options = Object.assign({}, FLATTEN_DEFAULT_OPTIONS)) => {
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
})
