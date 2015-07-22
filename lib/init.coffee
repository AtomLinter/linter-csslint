path = require 'path'

module.exports =
  config:
    csslintExecutable:
      title: 'CSSLint Executable'
      description: 'The path and name of your csslint executable. Leave blank if you want to use the bundled version.'
      default: path.join __dirname, '..', 'node_modules', '.bin', 'csslint'
      type: 'string'

  activate: ->
    @regex = '.+:\\s*' + # filename
             # csslint emits errors that pertain to the code as a whole,
             # in which case there is no line/col information, so that
             # part is optional.
             '(line (?<line>\\d+), col (?<col>\\d+), )?' +
             '((?<error>Error)|(?<warning>Warning)) - (?<message>.*)'

  provideLinter: ->
    helpers = require('atom-linter')

    provider =
      grammarScopes: ['source.css', 'source.html']
      scope: 'file'
      lintOnFly: false

      lint: (editor) =>
        filePath = editor.getPath()
        command = atom.config.get 'linter-csslint.csslintExecutable'
        parameters = ['--format=compact', filePath]

        return helpers.execNode(command, parameters).then (output) =>
          messages = helpers.parse(output, @regex, {filePath: filePath})
          messages.forEach (message) -> message.type = 'Error' unless message.type
          return messages
