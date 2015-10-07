helpers = require('atom-linter')
path = require('path')

module.exports =
  activate: ->
    require('atom-package-deps').install('linter-csslint')

  provideLinter: ->
    helpers = require('atom-linter')
    provider =
      name: 'CSSLint'
      grammarScopes: ['source.css', 'source.html']
      scope: 'file'
      lintOnFly: true
      lint: (textEditor) ->
        filePath = textEditor.getPath()
        text = textEditor.getText()
        parameters = ['--format=json', '-']
        exec = path.join(__dirname, '..', 'node_modules', 'csslint', 'cli.js')
        cwd = path.dirname(textEditor.getPath())
        helpers.execNode(exec, parameters, {stdin: text, cwd: cwd}).then (output) ->
          lintResult = JSON.parse(output)
          toReturn = []
          if lintResult.messages.length < 1
            return toReturn
          for data in lintResult.messages
            msg = {}
            if not (data.line and data.col)
              # Use the file start if location not defined
              msg.range = helpers.rangeFromLineNumber(textEditor, 0)
            else
              line = data.line - 1
              col = data.col - 1
              msg.range = [[line, col], [line, col]]
            msg.type = data.type.charAt(0).toUpperCase() + data.type.slice(1)
            msg.text = data.message
            msg.filePath = filePath
            if data.rule.id and data.rule.desc
              msg.trace = [{
                type: "Trace",
                text: '[' + data.rule.id + '] ' + data.rule.desc
              }]
            toReturn.push(msg)
          return toReturn
