import fs from 'fs';
import path from 'path';
import { deleteAsync } from 'del';
import archiver from 'archiver';

async function cleanAndZip() {
  const distZipPath = path.resolve('dist.zip');
  const distPath = path.resolve('dist');

  // Remove existing dist.zip
  console.log('Deleting old dist.zip...');
  await deleteAsync(distZipPath);

  // Create a zip archive of the dist folder
  console.log('Creating dist.zip...');
  const output = fs.createWriteStream(distZipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`dist.zip created (${archive.pointer()} total bytes)`);
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);
  archive.directory(distPath, false);
  await archive.finalize();
}

cleanAndZip().catch((err) => {
  console.error('Error during post-build script:', err);
  process.exit(1);
});
