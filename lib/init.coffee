path = require 'path'

module.exports =
  configDefaults:
    executablePath:
      type: 'string'
      default: path.join __dirname, '..', 'node_modules', '.bin'
    ignoreRules:
      type: 'array'
      default: []
      items:
        type: 'string'

  activate: ->
    # Internal: Prevent old deprecated config to be visible in the package settings
    # Keep the old config settings
    if (atom.config.get('linter-csslint.cssLintExecutablePath'))
      atom.config.set('linter-csslint.executablePath', atom.config.get('linter-csslint.cssLintExecutablePath'))

    console.log 'activate linter-csslint'
