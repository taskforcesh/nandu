# [1.5.0](https://github.com/taskforcesh/nandu/compare/v1.4.4...v1.5.0) (2022-01-12)


### Features

* add hooks support ([5ad7267](https://github.com/taskforcesh/nandu/commit/5ad7267b92d3521efebeefd90adc7e2bd546630c))

## [1.4.4](https://github.com/taskforcesh/nandu/compare/v1.4.3...v1.4.4) (2022-01-12)


### Bug Fixes

* fix compiling error ([19ae9cd](https://github.com/taskforcesh/nandu/commit/19ae9cd34f34b2ca84a0c3b5314e521128283c1f))
* **org-packages:** list following same format as npm registry ([4c7139e](https://github.com/taskforcesh/nandu/commit/4c7139eb473cf95a82895c2ab84b03f4b885ffaf))

## [1.4.3](https://github.com/taskforcesh/nandu/compare/v1.4.2...v1.4.3) (2021-12-01)


### Bug Fixes

* **packages:** remove userId from package existence query ([b69f50a](https://github.com/taskforcesh/nandu/commit/b69f50a04308f0d6580aebf6a8ade29676b9d3ad))
* **packages:** try to correctly get the host for the packages url ([d5ab082](https://github.com/taskforcesh/nandu/commit/d5ab0828d4a0c0d28c1e9cadb9b607937f263ba1))

## [1.4.2](https://github.com/taskforcesh/nandu/compare/v1.4.1...v1.4.2) (2021-11-25)


### Bug Fixes

* use remotePort for the tarball url ([a7dc28d](https://github.com/taskforcesh/nandu/commit/a7dc28d9820d03cd3532e64b0d01673385fdc10c))

## [1.4.1](https://github.com/taskforcesh/nandu/compare/v1.4.0...v1.4.1) (2021-11-25)


### Bug Fixes

* return "UNPROCESSABLE_ENTITY" if republishing package ([d88f644](https://github.com/taskforcesh/nandu/commit/d88f644ffdc4b553a47d15429021a75892afd416))

# [1.4.0](https://github.com/taskforcesh/nandu/compare/v1.3.0...v1.4.0) (2021-11-25)


### Features

* add more fields to the Version model ([3c86b47](https://github.com/taskforcesh/nandu/commit/3c86b4704682ad81d05eb2ca83138d1c484bad47))

# [1.3.0](https://github.com/taskforcesh/nandu/compare/v1.2.4...v1.3.0) (2021-11-25)


### Features

* make package size limit configurable ([ccc2db3](https://github.com/taskforcesh/nandu/commit/ccc2db36fbdb867c1622161ffe7a43005fa58e62))

## [1.2.4](https://github.com/taskforcesh/nandu/compare/v1.2.3...v1.2.4) (2021-11-25)


### Bug Fixes

* remove unused dependencies ([1596790](https://github.com/taskforcesh/nandu/commit/159679058bff20e24f5e3190ddb002b2c5824831))

## [1.2.3](https://github.com/taskforcesh/nandu/compare/v1.2.2...v1.2.3) (2021-11-21)


### Bug Fixes

* correct how root user is authorised ([7a9b4b7](https://github.com/taskforcesh/nandu/commit/7a9b4b74ab628155f82fb1920b9d961d42d4ce16))
* remove unnecessary dependency ([099b963](https://github.com/taskforcesh/nandu/commit/099b963a345ed069f6838d24d6f8aff1aa557889))

## [1.2.2](https://github.com/taskforcesh/nandu/compare/v1.2.1...v1.2.2) (2021-11-19)


### Bug Fixes

* **teams:** send an object with packages ([d0c4a4e](https://github.com/taskforcesh/nandu/commit/d0c4a4e5f5b274a8af9f1d02200e4975c7f80e33))

## [1.2.1](https://github.com/taskforcesh/nandu/compare/v1.2.0...v1.2.1) (2021-11-18)


### Bug Fixes

* remove debug console.logs ([27dedda](https://github.com/taskforcesh/nandu/commit/27deddad05f22efd6476d1ffe1b9c531d51e4cd7))

# [1.2.0](https://github.com/taskforcesh/nandu/compare/v1.1.2...v1.2.0) (2021-11-18)


### Features

* add s3 storage support ([a70dff4](https://github.com/taskforcesh/nandu/commit/a70dff46083efab7c144f62b38e902bf1ea8d0e3))
* add support for all organization actions ([f89d360](https://github.com/taskforcesh/nandu/commit/f89d3601daaaae581ed85f84a49de093abccb86b))

## [1.1.2](https://github.com/taskforcesh/nandu/compare/v1.1.1...v1.1.2) (2021-11-12)


### Bug Fixes

* read package.json from correct path ([e1e2042](https://github.com/taskforcesh/nandu/commit/e1e20425b9d02d3032210dc268f05084262eb416))

## [1.1.1](https://github.com/taskforcesh/nandu/compare/v1.1.0...v1.1.1) (2021-11-12)


### Bug Fixes

* **package:** add build prepare step ([338ad6e](https://github.com/taskforcesh/nandu/commit/338ad6e9dc364a6f7833330c4b37a1af5083952c))
* remove @types/pino-http ([8393695](https://github.com/taskforcesh/nandu/commit/83936959c96661afd15cf1e40913cbe044781b7f))

# [1.1.0](https://github.com/taskforcesh/nandu/compare/v1.0.0...v1.1.0) (2021-11-12)


### Bug Fixes

* **auth:** check that user owning token exists ([c520ab4](https://github.com/taskforcesh/nandu/commit/c520ab4cce2d388021a48098726d4d2bc03b7838))
* **token:** do not set userId to undefined ([a5fc5ac](https://github.com/taskforcesh/nandu/commit/a5fc5ac8f4e400d47c383d1bf1c461184d1997ee))
* **tokens:** return key as key ([a3fb4ec](https://github.com/taskforcesh/nandu/commit/a3fb4ec01097626438c3a7b36f80f208bfa6f5bb))


### Features

* add version string to ping endpoint ([a467b43](https://github.com/taskforcesh/nandu/commit/a467b43484f58b3a1fc431dfc4228cf2dbfddd8f))

# 1.0.0 (2021-11-11)


### Bug Fixes

* check password exists before testing it ([4083cd3](https://github.com/taskforcesh/nandu/commit/4083cd3a1d04e30a072aede49db8caf9cb0b24c0))
* **tokens:** make sure cidr is an array ([bcb6c6c](https://github.com/taskforcesh/nandu/commit/bcb6c6c77d655f8f834fe4d9c19ec60e6c06bc2c))


### Features

* add a root user when starting for the first time ([2a38fba](https://github.com/taskforcesh/nandu/commit/2a38fbafccc2ec713c13aaccb42f755661531c04))
* add some more functionality to user routes ([827d854](https://github.com/taskforcesh/nandu/commit/827d854708fac71b8f61e7d6fb454de42c6f0a0f))
* **auth:** use pino for logging error ([9ab12e1](https://github.com/taskforcesh/nandu/commit/9ab12e1c558f662ebc4a41838d7d022382d005e6))
* initial commit ([6d7cbc2](https://github.com/taskforcesh/nandu/commit/6d7cbc266cd9ae0e12d7e56bece49aa9829bc534))
