import del from 'del';
import makeDir from 'make-dir';
import moveFile from 'move-file';
import ndPath from 'path';

import { Options, ProgressCallback, ProgressData } from '../index.d';

import { buildPathsInfoList } from './lib';

type Src = string | string[];

async function mv(
  src: Src,
  dest: string,
  options: Options,
  cb: ProgressCallback
): Promise<ProgressData>;

async function mv(
  src: Src,
  dest: string,
  options: Options
): Promise<ProgressData>;

async function mv(
  src: Src,
  dest: string,
  cb: ProgressCallback
): Promise<ProgressData>;

async function mv(src: Src, dest: string): Promise<ProgressData>;

async function mv(src: Src, dest: string, ...args: any[]) {
  let options: Options | undefined;
  let cb: ProgressCallback | undefined;

  if (args.length === 2) {
    options = args[0];
    cb = args[1];
  } else if (typeof args[0] === 'object') {
    options = args[0];
  } else if (typeof args[0] === 'function') {
    cb = args[0];
  }

  const { cwd, overwrite } = { cwd: '.', overwrite: true, ...options };
  const absDest = ndPath.resolve(cwd, dest);

  const pathsInfo = await buildPathsInfoList(src, cwd);

  const filesMap = new Map<string, string>();
  const emptyDirs = new Set<string>();

  pathsInfo.forEach(({ dirname, paths, file }) => {
    if (paths.length === 0) {
      const to = ndPath.join(absDest, ndPath.basename(dirname));
      emptyDirs.add(to);
      return;
    }

    paths.forEach(path => {
      const from = ndPath.join(dirname, path);
      const dir = file ? '' : ndPath.basename(dirname);
      const to = ndPath.join(absDest, dir, path);

      if (path.endsWith(ndPath.sep)) {
        emptyDirs.add(to);
        return;
      }

      filesMap.set(from, to);
    });
  });

  const totalEmptyDirs = emptyDirs.size;
  const totalItems = totalEmptyDirs + filesMap.size;

  let completedItems = 0;

  const handleProgress = () => {
    completedItems += 1;
    if (cb) {
      cb({ completedItems, totalItems });
    }
  };

  const files: Promise<void>[] = [];

  filesMap.forEach((to, from) => {
    const p = (async () => {
      await moveFile(from, to, { overwrite });
      handleProgress();
    })();

    files.push(p);
  });

  const dirs = [...emptyDirs].map(dir => makeDir(dir));

  await Promise.all<void | string>([...files, ...dirs]);

  await del(src, { force: true, cwd });

  const data: ProgressData = {
    completedItems: completedItems + totalEmptyDirs,
    totalItems
  };

  if (totalEmptyDirs > 0 && cb) {
    cb(data);
  }

  return data;
}

module.exports = mv;
