#!/usr/bin/env node

/*
 * Copyright 2019 balena.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require('path')
const shell = require('shelljs')
const Bluebird = require('bluebird')
const gitBranch = require('git-branch')
const rimraf = require('rimraf')
const tmp = require('tmp')
const chalk = require('chalk')
const recursiveCopy = require('recursive-copy')

const theme = require('./theme')
const netlify = require('./netlify')
const skel = require('./skel')
const packageJSON = require('../package.json')

const ENV_VAR_NETLIFY_TOKEN = 'NETLIFY_AUTH_TOKEN'
const TOKEN_NETLIFY = process.env[ENV_VAR_NETLIFY_TOKEN]
const OPTION_COMMAND = process.argv[2] || 'deploy'
const OPTION_DEPLOY = OPTION_COMMAND === 'deploy' && TOKEN_NETLIFY
const OPTION_CONTRACT_PATH = process.argv[3]
const OPTIONS_OUTPUT_DIRECTORY = path.resolve(process.cwd(), 'dist')
const projectRoot = path.resolve(__dirname, '..')

// Get a list of paths were the contract file might live
// in. The choice is just one if the user passes it as
// a command line argument.
const contractPaths = OPTION_CONTRACT_PATH
  ? [ path.resolve(process.cwd(), OPTION_CONTRACT_PATH) ]
  : [ path.resolve(process.cwd(), 'meta.json') ]

const printHeader = () => {
  console.error(`
  / /  __ _ _ __   __| |_ __
 / /  / _\` | '_ \\ / _\` | '__|
/ /__| (_| | | | | (_| | |
\\____/\\__,_|_| |_|\\__,_|_|
`)
  console.error(packageJSON.description)
  console.error(`Version v${packageJSON.version}`)
  console.error()
}

const log = (message) => {
  console.log(chalk.blue('[landr]'), message)
}

const warning = (message) => {
  console.log(chalk.yellow('[warn]'), message)
}

const abort = (message) => {
  console.error(chalk.red('[error]'), message)
  process.exit(1)
}

const loadContract = async (paths) => {
  for (const contractPath of paths) {
    log(`Trying to load repository contract from ${contractPath}`)
    try {
      require(contractPath)
      return contractPath
    } catch (error) {
      continue
    }
  }

  return null
}

const getCommandString = (mode) => {
  const reactStaticBin = require.resolve('react-static/bin/react-static')
  const reactStaticConfig = path.resolve(
    projectRoot, 'lib', 'static.config.js')

  if (mode === 'deploy' || mode === 'build') {
    return `${reactStaticBin} build --config=${reactStaticConfig}`
  }

  return null
}

Bluebird.try(async () => {
  printHeader()

  const contract = await loadContract(contractPaths)
  if (!contract) {
    abort('Could not load contract file')
  }

  const contractData = require(contract)

  const command = getCommandString(OPTION_COMMAND)
  if (!command) {
    abort(`Unknown command: ${OPTION_COMMAND}`)
  }

  log(`Running from ${contract} into ${OPTIONS_OUTPUT_DIRECTORY}`)

  const localDist = path.join(projectRoot, 'dist')

  // Wipe out output directory so that we start fresh everytime.
  rimraf.sync(OPTIONS_OUTPUT_DIRECTORY)
  rimraf.sync(localDist)

  if (!contractData.data.name) {
    abort('The contract does not have a name')
  }

  // Deploy to a preview site if running on a branch
  // other than master.
  const branch = await gitBranch(process.cwd())
  log(`Current branch is ${branch}`)
  const siteName = branch === 'master'
    ? contractData.data.name
    : `${contractData.data.name}-preview-${branch}`

  log(`Preparing site ${siteName}`)
  const siteOptions = OPTION_DEPLOY
    ? await netlify.setupSite(TOKEN_NETLIFY, siteName)
    : {}

  log('Parsing banner image')
  const siteTheme = await theme(contractData.data.images.banner)

  const skeletonDirectory = tmp.dirSync().name
  log(`Creating site skeleton at ${skeletonDirectory}`)
  await skel.create(contractData,
    path.resolve(projectRoot, 'skeleton'),
    skeletonDirectory)

  // TODO: Don't output react-static log information,
  // as it has details that are non Landr related, such
  // as instructions to deploy to Netlify directly.
  const {
    code
  } = shell.exec(command, {
    // The react-static project assumes in many places
    // that the root directory is the current working
    // directory, which may not be the case when Landr
    // is globally installed.
    // Fixing react-static doesn't seem easy, so this
    // is more of a workaround.
    cwd: projectRoot,

    // We need to merge `process.env` as otherwise we
    // completely override the environment, including
    // important variables like `PATH`.
    env: Object.assign({}, process.env, {
      LANDR_CONTRACT_PATH: contract,
      LANDR_SKELETON_DIRECTORY: skeletonDirectory,
      LANDR_OUTPUT_DIRECTORY: localDist,
      LANDR_DEPLOY_URL: siteOptions.url,
      LANDR_MIXPANEL_TOKEN: process.env.LANDR_MIXPANEL_TOKEN,
      LANDR_MIXPANEL_PROXY: process.env.LANDR_MIXPANEL_PROXY,
      LANDR_THEME: JSON.stringify(siteTheme)
    })
  })

  if (code !== 0) {
    abort(`Command failed with code ${code}: ${command}`)
  }

  if (localDist !== OPTIONS_OUTPUT_DIRECTORY) {
    await recursiveCopy(localDist, OPTIONS_OUTPUT_DIRECTORY)
  }

  log('Site generated successfully')

  if (OPTION_COMMAND === 'deploy' && !OPTION_DEPLOY) {
    warning(`Omitting deployment. Please set ${ENV_VAR_NETLIFY_TOKEN}`)
  }

  if (OPTION_DEPLOY) {
    log(`Deploying site to ${siteOptions.url}`)

    const result = await netlify.deploy(
      TOKEN_NETLIFY, siteOptions.id, OPTIONS_OUTPUT_DIRECTORY)
    log(result.message)
    log(`Visit ${result.url}`)
    const domainSetupUrl = `${siteOptions.adminUrl}/settings/domain/setup`
    log(`Head over to ${domainSetupUrl} to setup a different domain`)
  }
}).catch((error) => {
  console.error(error)
  process.exit(1)
})