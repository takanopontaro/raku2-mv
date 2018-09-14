declare function Raku2Mv(
  src: string | string[],
  dest: string,
  options: Raku2Mv.Options,
  cb: Raku2Mv.ProgressCallback
): Promise<Raku2Mv.ProgressData>;

declare function Raku2Mv(
  src: string | string[],
  dest: string,
  options: Raku2Mv.Options
): Promise<Raku2Mv.ProgressData>;

declare function Raku2Mv(
  src: string | string[],
  dest: string,
  cb: Raku2Mv.ProgressCallback
): Promise<Raku2Mv.ProgressData>;

declare function Raku2Mv(
  src: string | string[],
  dest: string
): Promise<Raku2Mv.ProgressData>;

declare namespace Raku2Mv {
  type Options = {
    cwd?: string;
    overwrite?: boolean;
  };

  type ProgressData = {
    completedItems: number;
    totalItems: number;
  };

  type ProgressCallback = (data: ProgressData) => void;
}

export = Raku2Mv;
