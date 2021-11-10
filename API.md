
# Rules for publishing a package

In order to publish a package you need to have several pieces of authentication and authorization in place:

- You need to be authenticated (i.e. either with a token or user/password combination stored in .npmrc) if not, ERR Forbidden 403.
- If using a token, the token needs to be read-only = false.
- The user needs to have "publish" rights to publish the given package:
  - Have ownership of the package (see npm owner).
  - 
- The scope of the package needs to exist, otherwise ERR Not Found 404.
- The user needs to have rights to publish on that scope otherwise 403 Forbidden.
- The scope needs to have publish rights, otherwise ERR Payment required 402.

