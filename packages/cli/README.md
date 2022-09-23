
![nandu](https://github.com/taskforcesh/nandu/blob/assets/nandu.png?raw=true)

# Nandu CLI

Nandu Open NPM Registry CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/nandu-cli.svg)](https://npmjs.org/package/nandu-cli)
[![Downloads/week](https://img.shields.io/npm/dw/nandu-cli.svg)](https://npmjs.org/package/nandu-cli)
[![License](https://img.shields.io/npm/l/nandu-cli.svg)](https://github.com/taskforcesh/nandu-cli/blob/master/package.json)

<!-- toc -->
* [Nandu CLI](#nandu-cli)
* [Quick Start](#quick-start)
* [Teams](#teams)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Quick Start

In order to quickly get a working Nandu NPM registry you can follow this steps and recommendations.

Nandu uses env variables for configuring all its settings, inclusive the ROOT user credentials. The root
user is the one that can bootstrap the service, by creating new users and so on. Also the root user
has godlike permissions, therefore it is important to only use it for bootstrapping, and the first thing to
do is to create a new user and give it "admin" permissions.

When you start Nandu for the first time it will create such root user that you can then use to interact with the
registry. 

```bash
$ nandu start
Nandu is running on port 4567.
```

You will get a lot of debug logs unless you set ```NODE_ENV``` to ```production```.

By default Nandu will use Sqlite for storing the registry metadata, and the database file will be
stored at ```./storage/db/nandu.db```. You can change this setting with the ```NANDU_SEQUELIZE_URI``` env
variable.

The next step is to create an authentication token for the root user, you need to use the nandu cli for this as well,

```bash
$ nandu token:create root
username: root
password: ******

New token created for user root {
  id: 'ad4ac909-2cea-40ba-be4e-03ec4fbb57bf',
  token: 'c0463461-23fb-4642-a927-820b0d71ffb8',
  readonly: false,
  created: '2021-11-11T08:09:47.532Z'
}
```

You can create tokens on behalf of other users if the user you use for creating the tokens has the correct permissions.


# Teams

Nandu support many of the advanced features of the NPM registry, such as teams, scopes, and more. So you will most
likely interact with your Nandu server using the standard (NPM CLI)[https://docs.npmjs.com/cli/v8]

Lets take for example the case we want to create a team, add a user to said team and then give read access to a given
package that is part of that team.

Start by adding a team:

```
$ npm team add myorg:myteam
```

We have now created a team inside the org/scope "myorg". You can see the list of teams by running:

```
$ npm team ls
```

Now we want to add a package to said team:

```
$ npm access grant read-only  @myorg:myteam @myorg/mypackage
```

# Usage

<!-- usage -->
```sh-session
$ npm install -g @nanduland/cli
$ nandu COMMAND
running command...
$ nandu (-v|--version|version)
@nanduland/cli/1.0.4 linux-x64 node-v14.20.0
$ nandu --help [COMMAND]
USAGE
  $ nandu COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`nandu help [COMMAND]`](#nandu-help-command)
* [`nandu start`](#nandu-start)
* [`nandu token`](#nandu-token)
* [`nandu token:create USER`](#nandu-tokencreate-user)
* [`nandu token:ls USER`](#nandu-tokenls-user)
* [`nandu user`](#nandu-user)
* [`nandu user:add USER`](#nandu-useradd-user)

## `nandu help [COMMAND]`

display help for nandu

```
USAGE
  $ nandu help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.3.1/src/commands/help.ts)_

## `nandu start`

Starts Nandu Open NPM Server

```
USAGE
  $ nandu start

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -p, --port=port  [default: 4567] listen to port

EXAMPLE
  $ nandu start -p 4567
```

_See code: [src/commands/start.ts](https://github.com/taskforcesh/nandu/blob/v1.0.4/src/commands/start.ts)_

## `nandu token`

Manage NPM Registry tokens

```
USAGE
  $ nandu token

EXAMPLE
  $ nandu token:create myuser
```

_See code: [src/commands/token/index.ts](https://github.com/taskforcesh/nandu/blob/v1.0.4/src/commands/token/index.ts)_

## `nandu token:create USER`

create a new token for given user

```
USAGE
  $ nandu token:create USER

OPTIONS
  -h, --help                       show CLI help
  --cidr-whitelist=cidr-whitelist  comma separated list of whitelisted cidrs
  --readonly                       generate a readonly token
  --registry=registry              (required) URI pointing to your Nandu NPM Registry
  --token=token                    Token to be used for authentication, uses NPM_TOKEN env variable if unspecified

EXAMPLE
  $ nandu start -p 4567
```

_See code: [src/commands/token/create.ts](https://github.com/taskforcesh/nandu/blob/v1.0.4/src/commands/token/create.ts)_

## `nandu token:ls USER`

list tokens for given user

```
USAGE
  $ nandu token:ls USER

OPTIONS
  -h, --help           show CLI help
  --registry=registry  (required) URI pointing to your Nandu NPM Registry
  --token=token        Token to be used for authentication, uses NPM_TOKEN env variable if unspecified

EXAMPLE
  $ nandu start -p 4567
```

_See code: [src/commands/token/ls.ts](https://github.com/taskforcesh/nandu/blob/v1.0.4/src/commands/token/ls.ts)_

## `nandu user`

Manage NPM Registry users

```
USAGE
  $ nandu user

EXAMPLE
  $ nandu user:add myuser
```

_See code: [src/commands/user/index.ts](https://github.com/taskforcesh/nandu/blob/v1.0.4/src/commands/user/index.ts)_

## `nandu user:add USER`

add or update a new token for given user

```
USAGE
  $ nandu user:add USER

OPTIONS
  -h, --help           show CLI help
  --registry=registry  (required) URI pointing to your Nandu NPM Registry
  --token=token        Token to be used for authentication, uses NPM_TOKEN env variable if unspecified

EXAMPLE
  $ nandu user:add myuser
```

_See code: [src/commands/user/add.ts](https://github.com/taskforcesh/nandu/blob/v1.0.4/src/commands/user/add.ts)_
<!-- commandsstop -->
