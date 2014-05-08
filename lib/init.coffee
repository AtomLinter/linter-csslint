path = require 'path'

module.exports =
  configDefaults:
    csslintExecutablePath: path.join __dirname, '..', 'node_modules', 'csslint', 'bin'
