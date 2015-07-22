{CompositeDisposable} = require 'atom'
{parseString} = require 'xml2js'
path = require 'path'

module.exports =
  config:
    executablePath:
      title: 'CSSLint Executable Path'
      type: 'string'
      # default: path.join(__dirname, '..', 'node_modules', '.bin', 'csslint.cmd')
      default: 'csslint'
      description: 'Path of the `csslint` executable.'

  activate: ->
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.config.observe 'linter-csslint.executablePath',
      (executablePath) =>
        @executablePath = executablePath

  deactivate: ->
    @subscriptions.dispose()

  provideLinter: ->
    helpers = require('atom-linter')
    provider =
      grammarScopes: ['source.css', 'source.html']
      scope: 'file'
      lintOnFly: false # FIXME
      lint: (textEditor) =>
        filePath = textEditor.getPath()
        text = textEditor.getText()
        parameters = ['--format=lint-xml', filePath]
        return helpers.exec(@executablePath, parameters, {stdin: text}).then (output) ->
          # return [{
          #   type: "Warning",
          #   text: "Unknown property 'stroke-width'.",
          #   range: [[1, 1], [1, 4]],
          #   trace: [{
          #     type: "Trace",
          #     text: "\tstroke-width: 3px;\r",
          #     range: [[1, 1], [1, 4]]
          #   }]
          # }]
          toReturn = []
          parseString output, (err, result) ->
            for issue in result.lint.file[0].issue
              data = issue['$']
              line = parseInt(data.line, 10) - 1
              char = parseInt(data.char, 10)
              toReturn.push({
                type: data.severity.charAt(0).toUpperCase() + data.severity.slice(1),
                text: data.reason,
                range: [[line, char], [line, char]],
                trace: [{
                  type: "Trace",
                  text: data.evidence,
                  range: [[line, char], [line, char]]
                }]
              })
          return toReturn