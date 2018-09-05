declare function Raku2Mv(
  src: string | string[],
  dest: string,
  options?: Raku2Mv.Options | null,
  cb?: Raku2Mv.ProgressCallback
): Promise<Raku2Mv.ProgressData>;

declare namespace Raku2Mv {
  type Options = {
    cwd?: string;
    [key: string]: any;
  };
  type ProgressData = {
    completedItems: number;
    totalItems: number;
  };
  type ProgressCallback = (data: ProgressData) => void;
}

export = Raku2Mv;
