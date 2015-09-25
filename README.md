linter-csslint
=========================

This linter plugin for [Linter](https://github.com/AtomLinter/Linter) provides
an interface to [csslint](https://github.com/CSSLint/csslint). It will be used
with files that have the “CSS” or “HTML” syntax.

## Installation
If the `linter` is not already installed, it will be installed for you to provide
a UI for the service this package provides.

### Plugin installation
```ShellSession
$ apm install linter-csslint
```

## Settings
You can configure linter-csslint by editing ~/.atom/config.cson (choose Open Your Config in Atom menu):
```cson
'linter-csslint':
  #csslint path. run 'which csslint' to find the path
  'executablePath': null
```

## Contributing
If you would like to contribute enhancements or fixes, please do the following:

1. Fork the plugin repository.
1. Hack on a separate topic branch created from the latest `master`.
1. Commit and push the topic branch.
1. Make a pull request.
1. Welcome to the club!

Please note that modifications should follow these coding guidelines:

- Indent is 2 spaces.
- Code should pass [CoffeeLint](http://www.coffeelint.org/) with the provided `coffeelint.json`
- Vertical whitespace helps readability, don’t be afraid to use it.

**Thank you for helping out!**
