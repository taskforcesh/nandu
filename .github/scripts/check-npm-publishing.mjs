// Verifies npm publishing credentials (OIDC trusted publishing) for every
// workspace package released by multi-semantic-release, using the same checks as
// @semantic-release/npm. multi-semantic-release discards the plugin's log output, so this
// step also makes authentication failures diagnosable.
//
// If a package cannot be published to npm, npm publishing is disabled for that package in
// the working tree (never committed) so that the git tag, GitHub release and the semantically
// versioned Docker image are still created instead of failing the whole release.
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { verifyConditions } from '@semantic-release/npm'

const NPM_PLUGIN = '@semantic-release/npm'

const root = process.cwd()
const { workspaces = [] } = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))

const logger = {
  log: (...args) => console.log(...args),
  error: (...args) => console.error(...args),
  success: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
}

const summary = []

for (const workspace of workspaces) {
  const dir = resolve(root, workspace)
  const manifestPath = resolve(dir, 'package.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const plugins = manifest.release?.plugins ?? []
  const index = plugins.findIndex(plugin => (Array.isArray(plugin) ? plugin[0] : plugin) === NPM_PLUGIN)

  if (manifest.private === true || index === -1) {
    continue
  }

  const pluginConfig = Array.isArray(plugins[index]) ? { ...plugins[index][1] } : {}
  if (pluginConfig.npmPublish === false) {
    continue
  }

  console.log(`::group::Verify npm publishing for ${manifest.name}`)
  let errors = []
  try {
    await verifyConditions({ ...pluginConfig }, {
      cwd: dir,
      env: process.env,
      options: {},
      logger,
      stdout: process.stdout,
      stderr: process.stderr,
    })
  } catch (error) {
    errors = error.errors ?? [error]
  }

  console.log('::endgroup::')

  if (errors.length === 0) {
    console.log(`npm publishing is available for ${manifest.name}`)
    summary.push(`- ✅ \`${manifest.name}\`: npm publishing enabled`)
    continue
  }

  const reasons = errors.map(error => String(error.message).replace(/\s+/g, ' ').trim()).join('; ')
  console.log(`::warning title=npm publishing disabled for ${manifest.name}::${reasons} ` +
    'The release still creates the git tag, GitHub release and Docker image, but does not publish to npm. ' +
    'Configure npm trusted publishing for this repository and the release.yml workflow.')

  plugins[index] = [NPM_PLUGIN, { ...pluginConfig, npmPublish: false }]
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  summary.push(`- ⚠️ \`${manifest.name}\`: npm publishing disabled (${reasons})`)
}

if (process.env.GITHUB_STEP_SUMMARY && summary.length > 0) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## npm publishing\n\n${summary.join('\n')}\n`)
}
