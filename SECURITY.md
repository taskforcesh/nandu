# Security

Security is implemented in Nandu with a combination of approaches, much in the same way as the official NPM
registry works but with some limitations on top of it and also some extensions.

## Root user

First of all in Nandu we have the concept of "root" user. This is the first user that is created when you run
Nandu for the first time. You can configure using the env variable NANDU_ROOT_USER the default username for root (by default
is root) and a initial password with NANDU_ROOT_PASSWORD (also root by default). It is obviously quite important that you do not
deploy a production server with the default password. Furthermore you are encourage to manually change this password to a different
one that is not accessible via env variables for even more security.

The root user has rights to do anything in Nandu if using user/passwoord credentials, but when using tokens you need a non readonly
token, otherwise it will just be limited to read operations.

With the root credentials is thus possible to create/remove users, create/remove organizations and so on.

## Organization roles

## Teams and packages

## Passwords and Tokens

Passwords and tokens are all stored as hashes in the database, so it also means that when a new token is generated, it will only be
available once (same as original NPM does), after that there is no way to figure out the token.

