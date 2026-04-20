import { mkdir, rm, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distDir = resolve(rootDir, 'dist');
const filesToCopy = ['index.html', 'styles.css', 'app.js'];

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await Promise.all(
  filesToCopy.map((fileName) => copyFile(resolve(rootDir, fileName), resolve(distDir, fileName))),
);

console.log(`Built static site to ${distDir}`);
