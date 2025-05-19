import { DataTypes, Model, Sequelize } from "sequelize";
import { Author } from "./author";
import { DistTag } from "../models/dist-tag";
import { Version as IVersion, Attachment } from "../interfaces";
import { uploadAttachment } from "../services/storage";
import { Storage } from "../interfaces";
import { Hook, HookEvent } from "./hook";

export interface Dist {
  tarball: string;
  shasum: string;
  integrity: string;
}

export class Version extends Model {
  static addVersions(
    storage: Storage,
    packageId: string,
    versions: Record<string, IVersion>,
    attachments: Record<string, Attachment>,
    tarballPrefix: string,
    tagName: string
  ) {
    return Promise.all(
      Object.keys(versions).map(async (ver) => {
        const version = versions[ver];

        const versionFile = `${version.name}-${version.version}.tgz`;
        const attachment = attachments[versionFile];

        const { shasum, integrity } = await uploadAttachment(
          storage,
          versionFile,
          attachment
        );

        await Version.create({
          ...version,
          packageId,
          dist: {
            shasum,
            integrity,
            tarball: `${tarballPrefix}${versionFile}`,
          },
        });

        await Hook.notifyHooks("package", packageId, {
          event: HookEvent.PackagePublish,
          name: packageId,
          type: "package",
          version: version.version,
          // hookOwner: { username: string };
          //payload: object; // PackageMetadata
          change: {
            version: version.version,
          },
          time: Date.now(),
        });

        await DistTag.upsert({
          key: `${packageId}-${tagName}`,
          name: tagName,
          version: version.version,
          packageId,
        });
      })
    );
  }
}

export default function (db: Sequelize) {
  Version.init(
    {
      _id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      readme: {
        type: DataTypes.TEXT,
      },
      version: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.STRING,
      repository: DataTypes.JSON,
      keywords: DataTypes.STRING, // Not the best solution if we want to do searches.

      author: DataTypes.JSON,

      maintainers: DataTypes.JSON,

      devDependencies: DataTypes.JSON,
      dependencies: DataTypes.JSON,

      dist: DataTypes.JSON,

      license: DataTypes.STRING,
    },
    {
      sequelize: db,
      modelName: "Version",
      // Other model options go here
    }
  );

  Version.belongsTo(Author, { foreignKey: "authorId" });
  // Version.belongsTo(Package, { foreignKey: "packageId" });
};
/*
export class Version {
    _id: string;
    name: string;
    version: string;
    description: string;
    main: string;
    scripts: string;
    repository: {
        type: string;
        url: string;
    };
    files: string;
    keywords: string[];
    author: {
        name: string;
        email: string;
        url: string;
    },
    license: string;
    bugs: string;
    homepage: string;
    devDependencies: object;
    dependencies: object;
    dist: {
        shasum: string;
        tarball: string; // "https://registry.npmjs.org/koa-bodyparser/-/koa-bodyparser-0.0.1.tgz"
    },
    _from: string;
    _npmVersion: string;
    _npmUser: { "name": string, "email": string };
    maintainers: [{ "name": "dead_horse", "email": "dead_horse@qq.com" }];
    directories: {};
}
*/
