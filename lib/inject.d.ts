/**
 * Unpack app.asar & inject module script tag in index.html
 * @param appPath Application path (ex: /Applications/Crawless.app)
 * @param libFile Relative js file path (ex: app.dev/lib/ext.js)
 * @returns {string} `/Applications/Crawless.app/Contents/Resources/app.dev/lib/ext.js`
 */
export default function inject(appPath: string, libFile: string): Promise<string>;
//# sourceMappingURL=inject.d.ts.map