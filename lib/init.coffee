path = require 'path'

module.exports =
  configDefaults:
    csslintExecutablePath: path.join __dirname, '..', 'node_modules', '.bin'

  activate: ->
    console.log 'activate linter-csslint'
