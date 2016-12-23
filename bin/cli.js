#!/usr/bin/env node

/*
 * Copyright 2016 Resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
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

'use strict';

/**
 * @module landr.CLI
 */

const yargs = require('yargs');
const chalk = require('chalk');
const landr = require('../lib/landr');
const packageJSON = require('../package.json');
const Promise = require('bluebird');
const ghpages = Promise.promisifyAll(require('gh-pages'));

const showErrorAndQuit = (error) => {
  console.error(chalk.red(error.message));
  console.error(chalk.red(error.stack));
  console.error('Join our Gitter channel if you need any help!');
  console.error('  https://gitter.im/resin-io/landr');
  process.exit(1);
};

const dev = (argv) => {
  console.log('compiling...');
  landr.compile(argv)
  .then((compiler) => {
    console.log(chalk.green('Compile successful'));
    return landr.serve(argv, compiler);
  })
  .then(() => {
    console.log(chalk.green(`Serving on port ${argv.port}`));
  })
  .catch((err) => {
    return showErrorAndQuit(err);
  });
};

const deploy = (argv) => {
  // always compile for prod
  console.log('Deploying...');
  argv.prod = true;
  landr.compile(argv)
  .then(() => {
    console.log(chalk.green('Compile successful'));
    return ghpages.publishAsync(argv.buildDir);
  })
  .then(() => {
    console.log(chalk.green('Successfully deployed'));
  })
  .catch((err) => {
    return showErrorAndQuit(err);
  });
};

yargs
  .command('dev', 'Compiles + serves landr', {
    port: {
      describe: 'Set webpack server port',
      default: 3000,
      type: 'integer',
      alias: 'p'
    }
  }, dev)
  .command('deploy', 'Pushes compiled assets to gh-pages branch on remote', {
    prefix: {
      describe: 'Prefixes all links with supplied string',
      type: 'string',
      defualt: null
    }
  }, deploy)
  .usage('Usage: $0 [OPTIONS]')
  .help()
  .version(packageJSON.version)
  .options({
    help: {
      describe: 'show help',
      boolean: true,
      alias: 'h'
    },
    version: {
      describe: 'show version number',
      boolean: true,
      alias: 'v'
    },
    prod: {
      describe: 'Flag for production compile',
      default: false,
      boolean: true,
      global: true
    },
    buildDir: {
      describe: 'Prefixes all links with supplied string',
      type: 'string',
      default: `/tmp/${packageJSON.name}/build`,
      global: true
    }
  })
  .fail((err) => {
    // Prints to `stderr` by default
    console.error(err);
    yargs.showHelp();
    process.exit(1);
  })
  .argv;

process.on('uncaughtException', showErrorAndQuit);
