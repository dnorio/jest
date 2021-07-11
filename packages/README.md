## @dnorio/jest
Single jest entrypoint package for easily testing unreleased features.

I created this mainly to be able to easily use the jest [mock-esm version](https://github.com/SimenB/jest/tree/mock-esm) in my projects.

### Usage
1. Install jest at your project (Tested with 27.0.6);
2. Install @dnorio/jest@1.0.0-alpha.2 at your project;
3. Use the following configuration or similar at your package.json:
```json
  "type": "module",
  "scripts": {
    "test-script-when-the-mock-esm-version-is-released": "node --experimental-vm-modules node_modules/.bin/jest",
    "test": "node --experimental-vm-modules ./node_modules/@dnorio/jest/index.js"
  },
  "jest": {
    "verbose": true,
    "collectCoverageFrom": [
      "**/*.js",
      "!dist/**"
    ],
    "collectCoverage": true,
    "coverageProvider": "babel",
    "transform": {}
  },
  "devDependencies": {
    "jest": "27.0.6",
    "@dnorio/jest": "1.0.0-alpha.2"
  }

```

### Example
I created the following code for reverse lookup results in-memory caching:

```dns.js```
```js
import { lookupService } from 'dns'

/**
 * Returns hostname by ip doing reverse lookup
 * @param {String} ip
 * @param {Number} port
 */
const lookupServiceAsync = (ip, port) => new Promise(resolve => lookupService(ip, port, (err, hostname) => err ? resolve(null) : resolve(hostname)))

const lookupResults = new Map()

export const getLookupResults = () => lookupResults

export const lookupServiceWithCache = async (ip, port) => {
  if (lookupResults.has(ip)) {
    return lookupResults.get(ip)
  } else {
    const hostname = await lookupServiceAsync(ip, port)
    lookupResults.set(ip, hostname)
    setTimeout(() => lookupResults.delete(ip), 60000)
    return hostname
  }
}
```

Using ESM syntax, in order to prevent a real dns lookup we can use the ```jest.mockModule``` function with a factory:

```dns.test.js```
```js
import { jest, expect } from '@jest/globals'

jest.mockModule('dns', () => ({
  lookupService: jest.fn((ip, port, callback) => callback(null, 'mockedValue'))
}))

const { lookupServiceWithCache, getLookupResults } = await import('./dns.js')

jest.useFakeTimers()

describe('dns.js', () => {
  describe('#lookupServiceWithCache', () => {
    test('Should lookupService properly', async () => {
      const hostname = await lookupServiceWithCache('127.0.0.1', 8080)
      expect(getLookupResults().get('127.0.0.1')).toBe('mockedValue')
      jest.advanceTimersByTime(60000)
      expect(getLookupResults().get('127.0.0.1')).toBeUndefined()
      expect(hostname).toBe('mockedValue')
    })
  })
})
```

### Notes
- If you don't install jest alongside you still may be able to run some tests, but importing ```@jest/globals``` may trigger a memory-leak.
- No warranty of anything if you use this version.
- alpha.1 was a version to attach into the ```master``` branch, while alpha.2 uses the ```mock-esm``` branch.