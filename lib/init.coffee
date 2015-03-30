path = require 'path'

module.exports =
  config:
    executablePath:
      title: 'Csslint executable path'
      description: 'Directory where executable csslint is located.'
      type: 'string'
      default: path.join __dirname, '..', 'node_modules', '.bin'
    ignoreRules:
      title: 'Indicate which rules to ignore completely'
      description: 'This option allows you to specify which rules to turnoff. The rules are represented as a comma-delimited list of rule IDs.'
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
