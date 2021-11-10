export const scopeRegEx = "^@[a-z\\d][\\w-.]+/[a-z\\d][\\w-.]*$";

export function isScoped(pkgName: string) {
  return new RegExp(scopeRegEx, "i").test(pkgName);
}

export const packageName =
  /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

export function isValidPackageName(pgkName: string) {
  return packageName.test(pgkName);
}
