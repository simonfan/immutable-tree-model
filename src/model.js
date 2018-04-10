import { generateId, minArity } from './auxiliary'

const TRAILING_SLASH_RE = /\/$/
const trimTrailingSlash = (str) => {
	return typeof str === 'string' ?
		str.replace(TRAILING_SLASH_RE, '') : undefined
}

/**
 * [description]
 * @param  {[type]} nodeRootPath [description]
 * @param  {[type]} nodeData         [description]
 * @return {[type]}              [description]
 */
export const root = (nodeRootPath, nodeData) => ({
	...nodeData,
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
 * @param  {[type]} nodeData         [description]
 * @return {[type]}              [description]
 */
export const branch = (nodePathName, nodeData) => ({
	...nodeData,
	nodePathName,
	nodeType: 'branch',
	id: generateId(),
	childIds: [],
})

/**
 * [description]
 * @param  {[type]} parentId     [description]
 * @param  {[type]} nodePathName [description]
 * @param  {[type]} nodeData         [description]
 * @return {[type]}              [description]
 */
export const leaf = (nodePathName, nodeData) => ({
	...nodeData,
	nodePathName,
	nodeType: 'leaf',
	id: generateId(),
})


const FLATTEN_DEFAULT_OPTIONS = {
	parentId: false,
}

/**
 * [description]
 * @param  {[type]} obj     [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
export const flatten = minArity(1, (obj, options = {...FLATTEN_DEFAULT_OPTIONS}) => {
	const { children, nodePathName, nodeRootPath, ...nodeData } = obj
	const { parentId } = options
	let currentNode = parentId ?
		branch(nodePathName, {
			...nodeData,
			parentId: parentId
		}) : root(nodeRootPath, nodeData)

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
				return [
					...acc,
					leaf(childName, {
						...childObj,
						parentId: currentNode.id
					})
				]
			default: 
				throw new Error(`Invalid node nodeType '${childObj.nodeType}'`)
		}

	}, [currentNode])
})
