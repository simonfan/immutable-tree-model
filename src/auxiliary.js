
// unused
const scopeState = (property, fn) => {
	return (state, ...args) => {
		return {
			...state,
			[property]: fn(state[property], ...args)
		}
	}
}

const computeProperty = (obj, property, fn) => {
	return {
		...obj,
		[property]: fn(obj[property])
	}
}

const deleteProperty = (obj, property) => {
	obj = Object.assign({}, obj)
	delete obj[property]

	return obj
}

const deleteProperties = (obj, properties) => {
	return properties.reduce(deleteProperty, obj)
}

const arrayRemoveItem = (arr, item) => {
	let index = arr.indexOf(item)

	return [
		...arr.slice(0, index),
		...arr.slice(index + 1)
	]
}

module.exports = {
	scopeState,
	computeProperty,
	deleteProperty,
	deleteProperties,

	arrayRemoveItem
}
