import del from 'del';
import globby from 'globby';
import makeDir from 'make-dir';
import moveFile from 'move-file';
import ndPath from 'path';

import { Options, ProgressCallback, ProgressData } from './index.d';

function getPath(path: string, dest: string) {
  const { dir, base } = ndPath.parse(path);
  return ndPath.join(dest, dir, base);
}

module.exports = async (
  src: string | string[],
  dest: string,
  options?: Options | null,
  cb?: ProgressCallback
) => {
  let paths = await globby(src, {
    ...options,
    markDirectories: true,
    onlyFiles: false
  });

  const emptyDirs: string[] = [];

  paths = paths.sort().filter((path, i) => {
    if (!path.endsWith(ndPath.sep)) return true;
    const next = paths[i + 1];
    if (!next || next.indexOf(path) !== 0) emptyDirs.push(path);
    return false;
  });

  const totalEmptyDirs = emptyDirs.length;
  const totalItems = paths.length + totalEmptyDirs;

  let completedItems = 0;

  const handleProgress = () => {
    completedItems += 1;
    if (cb) cb({ completedItems, totalItems });
  };

  const files = paths.map(path =>
    (async () => {
      const realPath =
        options && options.cwd ? ndPath.resolve(options.cwd, path) : path;
      await moveFile(realPath, getPath(path, dest));
      handleProgress();
    })()
  );

  const dirs = emptyDirs.map(path => makeDir(getPath(path, dest)));

  await Promise.all<void | string>([...files, ...dirs]);

  await del(src, { force: true });

  const data: ProgressData = {
    completedItems: completedItems + totalEmptyDirs,
    totalItems
  };

  if (totalEmptyDirs > 0 && cb) cb(data);

  return data;
};
