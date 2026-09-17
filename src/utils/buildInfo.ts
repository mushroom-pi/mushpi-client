/** Client component SemVer (versioning.md axis ①) — baked from mushpi-client/package.json. */
export const CLIENT_BUILD_VERSION: string = __APP_BUILD_VERSION__;

/** Release-bundle version (axis ②, release.json `release`) — null when the manifest is absent/unreadable. */
export const RELEASE_VERSION: string | null = __APP_RELEASE_VERSION__;

/** Sidebar footer label: `v0.8.0` normally, `dev` when no release bundle is known. */
export const RELEASE_LABEL: string = RELEASE_VERSION ? `v${RELEASE_VERSION}` : 'dev';
