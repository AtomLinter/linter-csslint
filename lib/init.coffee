path = require 'path'

module.exports =
  config:
    csslintExecutablePath:
      default: path.join __dirname, '..', 'node_modules', '.bin'
      title: 'CSSLint Executable Path'
      type: 'string'

  activate: ->
    console.log 'activate linter-csslint'
