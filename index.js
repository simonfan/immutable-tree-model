const set = require('./lib/set')
const get = require('./lib/get')
const model = require('./lib/model')

module.exports = {
	...set,
	...get,
	model,
}
