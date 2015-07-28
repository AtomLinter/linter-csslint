csslint = require('csslint').CSSLint
path = require('path')
fs = require('fs')

# Adapted from cli/common.js in CSSLint
gatherRules = (options, ruleset) ->
  warnings = options.rules or options.warnings
  errors = options.errors
  if warnings
    ruleset = ruleset or {}
    warnings.split(",").map (value) ->
      ruleset[value] = 1
  if errors
    ruleset = ruleset or {}
    errors.split(",").map (value) ->
      ruleset[value] = 2
  return ruleset

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
        settingRules = @rules
        try
          configData = fs.readFileSync(path.join(path.dirname(filePath), '.csslintrc'), "utf-8")
        if configData
          fileConfig = JSON.parse(configData)
        else
          fileConfig = {}
        ruleset = gatherRules(fileConfig, settingRules)
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
