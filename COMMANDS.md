# Suported commands

## npm adduser (https://docs.npmjs.com/cli/v7/commands/npm-adduser)

The npm adduser as originally implemented in the npm server is unsecure by design. When you use this command,
npm will create a new "publish read-write" token (without communicating this back to the user) and store this
token on the users global .npmrc (again silently).

This behaviour is not supported in Nandu by design. Instead you can use the npm adduser command to add 

Due to The npm adduser command as implemented by the original npm server is not supported by Nandu by design. 


User creation is secured by default so only root users can add new users to the system.

In Nandu you can add users if you are a root user. Otherwise it is not possible to add new users.
In any case, consider that npm-cli will add every user to the global .npmrc. So this functionality
is better to be used using the API directly.

## npm token (https://docs.npmjs.com/cli/v7/commands/npm-token)

All token commands are implemented and can be used with the standard npm-cli, see documentation here:
https://docs.npmjs.com/cli/v7/commands/npm-token

Besides these commands, Nandu offers an extension, namely it is possible to create, remove and list tokens for other users than the one calling the token create api, if the user has the proper rights, currently it must be
a "root" user. All users are standard "user" when created.

The extensions are avaialable as nandu-cli commands.

## npm-org (https://docs.npmjs.com/cli/v7/commands/npm-org)

All organizations commands implemented.

For reference check this table with what permissions are given depending on the user role on the
organization:

https://docs.npmjs.com/organization-roles-and-permissions

As a Nandu root user you have full access to all groups, not just the groups your user owns.

## npm team (https://docs.npmjs.com/cli/v7/commands/npm-token)

All team commands implemented.

## npm-access (https://docs.npmjs.com/cli/v7/commands/npm-access)

All access commands implemented except 2fa-required, 2fa-not-required and ls-collaborator.

## npm-publish

Publish implementing access rights both of tokens and team ownership.

## npm whoami




