path = require 'path'

module.exports =
  configDefaults:
    executablePath:
      type: 'string'
      default: path.join __dirname, '..', 'node_modules', '.bin'

  activate: ->
    console.log 'activate linter-csslint'
