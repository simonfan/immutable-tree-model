let ID_COUNTER = 0
export const generateId = () => {
	// ID_COUNTER += 1
	return ++ID_COUNTER
}

// unused
export const scopeState = (property, fn) => {
	return (state, ...args) => {
		return {
			...state,
			[property]: fn(state[property], ...args)
		}
	}
}

export const computeProperty = (obj, property, fn) => {
	return {
		...obj,
		[property]: fn(obj[property])
	}
}

export const deleteProperty = (obj, property) => {
	obj = Object.assign({}, obj)
	delete obj[property]

	return obj
}

export const deleteProperties = (obj, properties) => {
	return properties.reduce(deleteProperty, obj)
}

export const arrayRemoveItem = (arr, item) => {
	let index = arr.indexOf(item)

	return [
		...arr.slice(0, index),
		...arr.slice(index + 1)
	]
}

const arityError = (required, actual) => new Error(`Insufficient args: requires ${required} but got ${actual}`)

export const strictArity = (fn) => {
	return (...args) => {
		if (args.length < fn.length) {
			throw arityError(fn.length, args.length)
		}

		return fn(...args)
	}
}

export const minArity = (arity, fn) => {
	return (...args) => {
		if (args.length < arity) {
			throw arityError(arity, args.length)
		}

		return fn(...args)
	}
}
