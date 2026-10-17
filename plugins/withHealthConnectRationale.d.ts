// Types for the CommonJS config plugin (app.json loads plugins with require, so it stays .js).
import type { AndroidManifest, ConfigPlugin } from 'expo/config-plugins';

declare const withHealthConnectRationale: ConfigPlugin;
export default withHealthConnectRationale;
export function applyHealthConnectRationale(manifest: AndroidManifest): AndroidManifest;
export function rationaleActivitySource(packageName: string): string;
export const PRIVACY_POLICY_URL: string;
export const RATIONALE_ACTION: string;
