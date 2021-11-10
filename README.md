# Nandu - NPM Registry

Nandu is an open source NPM registry compatible with Npm, Yarn and Pnpm.

Note: Although quite functional, this software cannot be classified as production ready just yet,
so be careful for production critical projects.

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
currently no documetation available.

## Architecture

The registry is both a package metadata store, for which you can use any SQL based database (even SQLlite), as well as a package store which is based on a file storage. The package store can be anything capable of storing files but currently we are shipping support for local files as well as S3, it is easy to add other file storages by implementing a simple interface if needed.

All settings are controlled by environment variables, so no configuration files are used which makes it easier
to deploy following the 12 factor app principles (https://12factor.net/).

## Used by

Currently used by (Taskforce.sh)[https://taskforce.sh] to provide the BullMQ Pro package to licensed users.

## Features

Currently Nandu is capable of the basic set of features needed for publishing packages, handle authentication and
authorization, organizations and teams.

- Secured by default, only registered users can access the registry.
- Complete authorization tokens and passwords support including cidr whitelisting.
- Use any SQL database (including SQLite) for storing persistent metadata.
- Store packages in disk-storages or S3.
- publish
- scoped packages
- (access)[https://docs.npmjs.com/cli/v7/commands/npm-access]
- organizations and teams

## License

This project is provided as open source and licensed under GNU's AGPL license terms.
If you require a commercial license please contact licenses@taskforce.sh.

(c) 2021 Taskforce.sh Inc.
