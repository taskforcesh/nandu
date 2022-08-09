export interface Version {
  _id: string;
  name: string;
  version: string;
  main: string;
  license: string;
  dependencies: object;
  readme: string;
  _nodeVersion: string;
  _npmVersion: string;
  dist: object;
}
