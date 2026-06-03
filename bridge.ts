type Capabilities = { 
    id: string; 
    ok: true; 
    extensions: string[] 
};

type Conversion = { 
    id: string; 
    ok: true; 
    markdown: string 
};

const pending = new Map();
let counter = 0;

const proc = Bun.spawn([".venv/bin/python", "engine.py"], {
  stdin: "pipe",
  stdout: "pipe",
  stderr: "inherit",
  cwd: "engine",
});

proc.stdin.write('{"id":"1","cmd":"capabilities"}\n');
proc.stdin.flush();

let buffer = "";

async function readLoop() {
  for await (const chunk of proc.stdout) {
    buffer += new TextDecoder().decode(chunk);
    let nl;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      if (line.trim()) handleLine(line);
    }
  }
}

function send<T>(req: any): Promise<T> {
  const id = String(++counter);
  proc.stdin.write(JSON.stringify({ ...req, id }) + "\n");
  proc.stdin.flush();
  return new Promise<T>((resolve) =>
    pending.set(id, resolve as (v: unknown) => void),
  );
}

function handleLine(line: string) {
  const resp = JSON.parse(line);
  const resolve = pending.get(resp.id);
  if (resolve) {
    pending.delete(resp.id);
    resolve(resp);
  }
}

void readLoop();

const caps = await send<Capabilities>({ cmd: "capabilities" });
console.log(caps.extensions);

const output = await send<Conversion>({ cmd: "convert", path: "hi.pdf" });
console.log(output.markdown);
