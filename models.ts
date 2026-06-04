export type Capabilities = {
  id: string;
  ok: true;
  extensions: string[];
};

export type Conversion = {
  id: string;
  ok: true;
  markdown: string;
};

export type Node = {
  name: string;
  path: string;
  isDir: boolean;
  children?: Node[];
};
