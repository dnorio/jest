const importLocal = require('import-local')

if (!importLocal(__filename)) {
  require('./jest-cli/bin/jest')
}