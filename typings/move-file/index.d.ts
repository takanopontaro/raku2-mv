export = moveFile;

declare function moveFile(
  source: string,
  destination: string,
  options?: moveFile.Options
): Promise<void>;

declare namespace moveFile {
  function sync(source: string, destination: string, options?: Options): void;

  interface Options {
    overwrite?: boolean;
  }
}
