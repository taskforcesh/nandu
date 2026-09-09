import {expect} from 'chai'
import {spawnSync} from 'node:child_process'
import {mkdtempSync, rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join, resolve} from 'node:path'

describe('CLI entry point', () => {
  const bin = resolve(__dirname, '../bin/run')
  let cwd: string

  before(() => {
    cwd = mkdtempSync(join(tmpdir(), 'nandu-cli-'))
  })

  after(() => {
    rmSync(cwd, {force: true, recursive: true})
  })

  for (const args of [[], ['--help'], ['--version']]) {
    it(`runs nandu ${args.join(' ')} outside the package directory`, () => {
      const result = spawnSync(process.execPath, [bin, ...args], {
        cwd,
        encoding: 'utf8',
        timeout: 10_000,
      })

      expect(result.error).to.equal(undefined)
      expect(result.status, result.stderr).to.equal(0)
      expect(result.stdout).to.contain('@nandu/cli/')
      if (!args.includes('--version')) {
        expect(result.stdout).to.contain('USAGE')
        expect(result.stdout).to.contain('start')
      }
    })
  }

  it('reports unknown commands with a nonzero exit status', () => {
    const result = spawnSync(process.execPath, [bin, 'not-a-nandu-command'], {
      cwd,
      encoding: 'utf8',
      timeout: 10_000,
    })

    expect(result.error).to.equal(undefined)
    expect(result.status).to.equal(2)
    expect(result.stderr).to.contain('command not-a-nandu-command not found')
    expect(result.stderr).not.to.contain('MODULE_NOT_FOUND')
  })
})
