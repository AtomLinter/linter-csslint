csslint = require('csslint').CSSLint

module.exports =
  activate: ->
    @rules = csslint.getRules()

  provideLinter: ->
    helpers = require('atom-linter')
    provider =
      grammarScopes: ['source.css', 'source.html']
      scope: 'file'
      lintOnFly: true
      lint: (textEditor) =>
        filePath = textEditor.getPath()
        text = textEditor.getText()
        ruleset = @rules
        lintResult = csslint.verify(text, ruleset)
        if lintResult.messages.length < 1
          return []
        toReturn = []
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
