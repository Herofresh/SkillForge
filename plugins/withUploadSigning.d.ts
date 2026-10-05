// Types for the CommonJS config plugin (app.json loads plugins with require, so it stays .js).
import type { ConfigPlugin } from 'expo/config-plugins';

declare const withUploadSigning: ConfigPlugin;
export default withUploadSigning;
export function applyUploadSigning(contents: string): string;
export const UPLOAD_PROPERTIES: readonly string[];
export const UPLOAD_SIGNING_FLAG: string;
