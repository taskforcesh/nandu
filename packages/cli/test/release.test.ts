import {expect} from 'chai'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

describe('release configuration', () => {
  for (const name of ['cli', 'service', 'dashboard']) {
    const manifest = JSON.parse(readFileSync(resolve('..', name, 'package.json'), 'utf8'))
    const {plugins} = manifest.release
    const pluginNames = plugins.map((plugin: [string, unknown] | string) => Array.isArray(plugin) ? plugin[0] : plugin)

    it(`${name} releases without committing to protected main`, () => {
      expect(pluginNames).not.to.include('@semantic-release/git')
    })

    it(`${name} still prepares versions and publishes npm and GitHub releases`, () => {
      const execPlugin = plugins.find((plugin: [string, unknown] | string) => Array.isArray(plugin) && plugin[0] === '@semantic-release/exec')
      expect(execPlugin).to.be.an('array')
      expect(execPlugin[1].prepareCmd).to.match(/^npm pkg set version=\${nextRelease\.version}$/)
      expect(plugins).to.deep.include([
        '@semantic-release/npm',
        {npmPublish: true, pkgRoot: '.'},
      ])
      expect(pluginNames).to.include('@semantic-release/github')
    })
  }
})
