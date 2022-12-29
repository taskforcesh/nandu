![nandu](https://github.com/taskforcesh/nandu/blob/assets/nandu.png?raw=true)

[![Version](https://img.shields.io/npm/v/nandu.svg)](https://npmjs.org/package/nandu)
[![Downloads/week](https://img.shields.io/npm/dw/nandu.svg)](https://npmjs.org/package/nandu)
[![License](https://img.shields.io/npm/l/nandu.svg)](https://github.com/taskforcesh/nandu/blob/main/package.json)

## Introduction

Nandu is a new open source NPM registry compatible with Npm, Yarn and Pnpm.

It has been built from scratch with the following goals in mind:
- Secured by default, so it can be used in a corporate environment with peace of mind.
- Easy to deploy, so you can have your registry up and running in minutes.
- Compatible with scalable technologies such as S3 and PostreSQL so you can scale your registry to meet your needs.
- Implement most of the NPM registry API so you can use it with your existing tools.
- Clean code base, serving as documentation for most NPM currently undocumented APIs.

## Motivation

NPM is the core of all the NodeJS Ecosystem, and even though all NPM clients are open source,
the server itself is proprietary software.

There have been a couple of attempts to provide an open source alternative (such as Sintopia and Verdaccio),
but these projects are oriented to support private local repositories instead a full NPM server
replacement within a professional environment.

Nandu is secured by default, focusing on user, team and organization management, enabling
corporate use cases where user access management is important as well as other popular
use cases such as providing subscription-based licenses for commercial packages.

Furthermore, we are currently also aiming at documenting the NPM Apis, for which there is
currently no documentation available.

## Architecture

The registry is both a package metadata store, for which you can use any SQL-based database (including SQLlite),
as well as a package store that is based on file storage. The package store can be anything capable of storing
files but currently, we are shipping support for local files as well as S3, but it is quite easy to add other file
storage by implementing a simple interface if needed.

All settings are controlled by environment variables, so no configuration files are used which makes it easier
to deploy following the [12-factor app principles](https://12factor.net/).

## Used by

Currently used by [Taskforce.sh](https://taskforce.sh) to provide the BullMQ Pro package to licensed users.

## Features

Nandu is capable of the basic set of features needed for publishing packages, handling authentication and
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

Nandu provides a simple CLI tool that is used to manage the registry. The CLI tool should
be installed globally:
    
```bash
    yarn global add @nandu/cli
```

Run the cli tool to see the available commands:
    
```bash
    $ nandu

    Nandu Open NPM Registry CLI

VERSION
  @nandu/cli/1.0.2 darwin-x64 node-v16.15.1

USAGE
  $ nandu [COMMAND]

TOPICS
  token  Manage NPM Registry tokens
  user   Manage NPM Registry users

COMMANDS
  help   display help for nandu
  start  Starts Nandu Open NPM Server
  token  Manage NPM Registry tokens
  user   Manage NPM Registry users
```

### Starting the server

If you just want to start the server to try it out, go to a suitable directory (as the following command will create a SQLite database file) and run:

```bash
    nandu start
```

This command will start a Nandu service using an SQLite database and local file storage. You will find the database and the storage
under the directory ```storage``` under the current directory.

The service will be by default available at http://localhost:4567

If you point your browser to http://localhost:4567 you will see the Nandu login page, however, you will
not be able to login as there are no users in the system yet. 
You should start by creating a root user:

```bash
    nandu user:create --root --username root --password root
```

To start the server, you need to provide the following environment variables:

```bash
    export NPM_REGISTRY_PORT=8080
    export NPM_REGISTRY_HOST=
```


## License

This project is provided as open source and licensed under GNU's AGPL license terms.

(c) 2022 Taskforce.sh Inc.
