![nandu](https://github.com/taskforcesh/nandu/blob/assets/nandu.png?raw=true)

[![Version](https://img.shields.io/npm/v/nandu.svg)](https://npmjs.org/package/nandu)
[![Downloads/week](https://img.shields.io/npm/dw/nandu.svg)](https://npmjs.org/package/nandu)
[![License](https://img.shields.io/npm/l/nandu.svg)](https://github.com/taskforcesh/nandu/blob/main/package.json)

## Introduction

Nandu is an open source NPM registry compatible with Npm, Yarn and Pnpm.

Note: Although quite functional, this software cannot be classified as production ready just yet,
so be careful for production critical projects.

You are still encouraged to test it (it is quite functional already!) and report any issues you may
find. As the project is currently under heavy development expect quick resolution of the issues.

## Motivation

NPM is the core of all the NodeJS Ecosystem, and even though all NPM clients are open source,
the server itself is propietary software.

There a couple of attempts to provide an open source alternative (such as Sintopia and Verdaccio),
but these projects are oriented to support private local repositories instead a full NPM server
replacement within a professional environment.

Nandu is secured by default, focusing on user, team and organization management, enabling
corporate use cases where user access management is important as well as other popular
use cases such as providing subscription based licenses for commercial packages.

Furthermore, we are currently also aiming at documenting the NPM Apis, for which there are
currently no documentation available.

## Architecture

The registry is both a package metadata store, for which you can use any SQL based database (even SQLlite), as well as a package store which is based on a file storage. The package store can be anything capable of storing files but currently we are shipping support for local files as well as S3, it is easy to add other file storages by implementing a simple interface if needed.

All settings are controlled by environment variables, so no configuration files are used which makes it easier
to deploy following the [12 factor app principles](https://12factor.net/).

## Used by

Currently used by [Taskforce.sh](https://taskforce.sh) to provide the BullMQ Pro package to licensed users.

## Features

Currently Nandu is capable of the basic set of features needed for publishing packages, handle authentication and
authorization, organizations and teams.

- Secured by default, only registered users can access the registry.
- Complete authorization tokens and passwords support including cidr whitelisting.
- Use any SQL database (including SQLite) for storing persistent metadata.
- Store packages in a disk base storage or S3.
- publish
- scoped packages
- [hooks](https://docs.npmjs.com/cli/v7/commands/npm-hook)
- [access](https://docs.npmjs.com/cli/v7/commands/npm-access)
- [teams](https://docs.npmjs.com/cli/v8/commands/npm-team)
- [organizations](https://docs.npmjs.com/cli/v8/commands/npm-org)

## How to use

In order to use Nandu you should use the [Nandu-cli](https://github.com/taskforcesh/nandu-cli) tool and following the instructions there.

## License

This project is provided as open source and licensed under GNU's AGPL license terms.

(c) 2021 Taskforce.sh Inc.
