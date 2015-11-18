var fs = require('fs')
var commander = require('commander')

var package = require('./package')

var file

commander
	.version(package.version)
	.usage('[options] <file>')
	.option('-o, --output <file>', 'Output to file')
	.option('-l, --lines', 'Split into lines')
	.option('-e, --empty', 'Filter empty')
	.option('-d, --delim <delimiter>', 'Split with delimiter')
	.option('-s, --space <space>', 'JSON output white space')
	.option('-p, --param <name>', 'JSON parameter name', 'output')
	.action(function (fileValue) {
		file = fileValue
	})
	.parse(process.argv)

if (!file) {
	console.error()
	console.error('  error: missing file')
	console.error()
	process.exit(1)
}

if (!fs.existsSync(file)) {
	console.error()
	console.error('  error: file does not exist')
	console.error()
	process.exit(1)
}

if (!fs.lstatSync(file).isFile()) {
	console.error()
	console.error('  error: file is not a file')
	console.error()
	process.exit(1)
}

var contents = fs.readFileSync(file).toString()

if (commander.lines) {
	contents = contents.split('\n')

	if (commander.empty) {
		contents = contents.filter(function (line) {
			return line ? true : false
		})
	}

	if (commander.delim) {
		contents = Array.prototype.concat.call([], contents.map(function (line) {
			return line.split(commander.delim)
		}))
	}
} else {
	if (commander.delim) {
		contents = contents.split(commander.delim)

		if (commander.empty) {
			contents = contents.filter(function (line) {
				return line ? true : false
			})
		}
	}
}

var object = {}

object[commander.param] = contents

var output = JSON.stringify(object, null, commander.space)

if (commander.output) {
	try {
		fs.writeFileSync(commander.output, output)
	} catch (e) {
		console.error()
		console.error('  error: cannot write to file')
		console.error()
		process.exit(1)
	}
} else {
	console.log(output)
}
