
## Hos can a user publish a package in a given scope

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

It is also possible to give access for publishing (and reading/installing) a package using ```npm access``` and teams. However consider that the package must already have been published at least once before you can give access to other users. 

Create a new team in your organization. 
```bash

```

Grant read-write permissions:

```bash
npm access grant read-write myorg:myteam foobar
```
