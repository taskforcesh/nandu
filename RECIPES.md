## Creating tokens on behalf of other users

When using Nandu, you will need to create tokens for other users than yourself. You can use nandu-cli for this,
but sometimes you need to be able to do it programmatically. Here a code-snippet that allows you to do exactly
that:

```ts
export const addToken = async (
  registry: string,
  userName: string,
  password: string,
  token: string,
  readonly = false,
  cidrWhitelist = ""
) => {
  const url = `${registry}/-/npm/v1/tokens/org.couchdb.user:${userName}`;

  const { data: token } = await axios.post(
    url,
    {
      password,
      readonly,
      cidr_whitelist: cidrWhitelist.split(","),
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return token;
};
```

`registry` would be the URL to where you have your Nandu registry running. `password` would be your "root" user's password. The call will return a new token for the given `userName`.

## How can a user publish a package in a given scope

There basically two ways a user can get rights to publish new scoped packages, either being a member
of the same scope/organization than the package _or_ by being in a team that has rights to publish on
that particular package.

Note that "root" users have not the right to publish, this is by design so that root tokens are not used by
mistake on CI systems when deploying packages automatically. Of course a root could belong to a team oor scope with
publish rights on a given package but this is not recommended.

### As member of the scope (organization)

In order to publish a package on a given scope, a user needs to be at least a "developer" of
an organization. See [this](https://docs.npmjs.com/organization-roles-and-permissions), note that
in npm's documentation it may say "member" instead of "developer", however "developer" is the correct type.

Check that you are the owner of the organization.

```bash
$ npm whoami
john
```

```bash
$ npm org ls myorg
┌──────┬───────┐
│ user │ role  │
├──────┼───────┤
│ john │ owner │
└──────┴───────┘
```

Since "john" is owner he can add other users to the organization (an admin could also do it):

```bash
$ npm org set myorg sarah
Added sarah as developer to myorg. You now have 2 members in this org.
```

```bash
$ npm org ls myorg
┌────────┬───────────┐
│ user   │ role      │
├────────┼───────────┤
│ sarah  │ developer │
├────────┼───────────┤
│ root   │ owner     │
└────────┴───────────┘
```

User sarah can now publish packages in this organization. A developer is just limited to this right.
Remember that the token sarah uses for publishing cannot be readonly, since that would also restrict
her to publish a package.

### Using npm access

It is also possible to give access for publishing (and reading/installing) a package using `npm access` and teams. However consider that the package must already have been published at least once before you can give access to other users.

Create a new team in your organization.

```bash

```

Grant read-write permissions:

```bash
npm access grant read-write myorg:myteam mypackage
```
