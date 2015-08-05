helpers = require('atom-linter')
path = require('path')

module.exports =
  provideLinter: ->
    helpers = require('atom-linter')
    provider =
      grammarScopes: ['source.css', 'source.html']
      scope: 'file'
      lintOnFly: true
      lint: (textEditor) ->
        filePath = textEditor.getPath()
        text = textEditor.getText()
        parameters = ['--format=json', '-']
        exec = path.join(__dirname, '..', 'node_modules', 'csslint', 'cli.js')
        helpers.execNode(exec, parameters, {stdin: text}).then (output) ->
          lintResult = JSON.parse(output)
          toReturn = []
          if lintResult.messages.length < 1
            return toReturn
          for data in lintResult.messages
            line = data.line - 1
            col = data.col - 1
            toReturn.push({
              type: data.type.charAt(0).toUpperCase() + data.type.slice(1),
              text: data.message,
              filePath: filePath
              range: [[line, col], [line, col]],
              trace: [{
                type: "Text",
                text: '[' + data.rule.id + '] ' + data.rule.desc
              }]
            })
          return toReturn
