#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var commander = require('commander')

var files = []

commander
	.version(require('../package').version)
	.usage('[options] <file...>')
	.option('-o, --output <file|directory>', 'Output to file or directory')
	.option('-l, --lines', 'Split into lines')
	.option('-e, --empty', 'Filter empty')
    .option('-a, --array', 'Treat as array')
	.option('-d, --delim <delimiter>', 'Split with delimiter')
	.option('-s, --space <space>', 'JSON output white space')
	.option('-p, --param <name>', 'JSON parameter name', 'output')
	.action(function () {
		files = Array.prototype.slice.call(arguments, 0, -1)
	})
	.parse(process.argv)

files.forEach(function (file) {
    if (!fs.existsSync(file)) {
    	console.error()
    	console.error('  error: file', file, 'does not exist')
    	console.error()
    	process.exit(1)
    }
})

files.forEach(function (file) {
    if (!fs.lstatSync(file).isFile()) {
    	console.error()
    	console.error('  error: file', file, 'is not a file')
    	console.error()
    	process.exit(1)
    }
})

if (files.length === 0) {
	console.error()
	console.error('  error: missing file')
	console.error()
	process.exit(1)
}

files = files.map(function (file) {
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

    return [file, contents]
})

if (files.length === 1) {
    var object = {}
    object[commander.param] = {}

    if (commander.array) {
        object[commander.param][files[0][0]] = files[0][1]
    } else {
        object[commander.param] = files[0][1]
    }

    var output = JSON.stringify(object, null, commander.space)

    if (commander.output) {
        if (fs.existsSync(commander.output) && fs.lstatSync(commander.output).isDirectory()) {
            var extname = path.extname(files[0][0])
            var pathname = files[0][0].slice(0, -extname.length) + '.json'
            var destination = path.join(commander.output, pathname)
        } else {
            var destination = commander.output
        }

    	try {
    		fs.writeFileSync(destination, output)
    	} catch (e) {
    		console.error()
    		console.error('  error: cannot write to file', destination)
    		console.error()
    		process.exit(1)
    	}
    } else {
    	console.log(output)
    }
} else {
    if (commander.array) {
        var object = {}
        object[commander.param] = {}

        files.forEach(function (file) {
            object[commander.param][file[0]] = file[1]
        })

        var output = JSON.stringify(object, null, commander.space)

        if (commander.output) {
            if (fs.existsSync(commander.output) && fs.lstatSync(commander.output).isDirectory()) {
                var extname = path.extname(files[0][0])
                var pathname = files[0][0].slice(0, -extname.length) + '.json'
                var destination = path.join(commander.output, pathname)
            } else {
                var destination = commander.output
            }

        	try {
        		fs.writeFileSync(destination, output)
        	} catch (e) {
        		console.error()
        		console.error('  error: cannot write to file', destination)
        		console.error()
        		process.exit(1)
        	}
        } else {
        	console.log(output)
        }
    } else {
        files.forEach(function (file) {
            var object = {}
            object[commander.param] = file[1]

            var output = JSON.stringify(object, null, commander.space)

            var extname = path.extname(file[0])
            var pathname = file[0].slice(0, -extname.length) + '.json'
            var destination = path.join(commander.output, pathname)

        	try {
        		fs.writeFileSync(destination, output)
        	} catch (e) {
        		console.error()
        		console.error('  error: cannot write to file', destination)
        		console.error()
        		process.exit(1)
        	}
        })
    }
}
