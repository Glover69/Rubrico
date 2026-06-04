import React, { useEffect, useState } from "react";
import { render, Text, useApp, useInput } from "ink";
import { send, shutdown } from "./bridge";
import type { Capabilities, Conversion, Node } from "./models";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import TreeNode from "./components/treeNode";

const IGNORE = new Set([
  "node_modules",
  ".venv",
  "venv",
  ".git",
  "__pycache__",
  ".pytest_cache",
  ".mypy_cache",
  ".DS_Store",
  "dist",
  "build",
  ".next",
  ".cache",
  ".idea",
  ".vscode",
]);

function initializeDirectory(cwd: string): Node[] {
  const directoryTree: Node[] = []

  const entries = readdirSync(cwd, { withFileTypes: true });

  entries.forEach((item) => {

    if (IGNORE.has(item.name)) return;

    if (item.isDirectory()) {
    //   console.log(`Directory: ${item.name}`);
      const newPath = join(cwd, item.name);
      directoryTree.push({ name: item.name, path: newPath, isDir: true, children: initializeDirectory(newPath)})

    } else if (item.isFile()) {
      // console.log(`File: ${item.name}`);
      const newPath = join(cwd, item.name);
      directoryTree.push({ name: item.name, path: newPath, isDir: false});
    }
  });

  return directoryTree;

}


function flattenDirectoryTree(n: Node[]): Node[] {
    const finalList: Node[] = []

    n.forEach((item) => {
        if (item.children){
            finalList.push(item)
            finalList.push(...flattenDirectoryTree(item.children))
        } else {
            finalList.push(item)
        }
    })

    console.log(finalList)
    return finalList;
}

const KeyTracker = () => {
  const [lastPressed, setLastPressed] = useState("None");
  const [caps, setCaps] = useState<string[]>([]);
  const [markdown, setMarkdown] = useState("");
  const [selectedindex, setSelectedIndex] = useState(0)

  const [directory, setDrectory] = useState(() => {
    return initializeDirectory(process.cwd());
  });

  const [flatList, setFlatList] = useState(() => {
    return flattenDirectoryTree(directory)
  });

  const selectedPath = flatList[selectedindex]?.path

  const { exit } = useApp();

  useInput((i, key) => {
    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1))
    } else if (key.downArrow) {
      setSelectedIndex(prev => Math.min(flatList.length - 1, prev + 1))
    } else if (i == "c") {
      send<Conversion>({ cmd: "convert", path: selectedPath }).then((r) =>
        setMarkdown(r.markdown),
      );
    } else if (i == "q") {
      shutdown();
      exit();
    }
  });

  useEffect(() => {
    send<Capabilities>({ cmd: "capabilities" }).then((r) =>
      setCaps(r.extensions),
    );
  }, []);

  return (
    <>
      <Text>
        Files Supported: <Text color="green">{caps.join(", ")}</Text> (c to
        convert, q to quit)
      </Text>
      
      {directory.map((i) => {
        return <TreeNode key={i.path} node={i} depth={0} selectedPath={selectedPath}/>
      })}

    </>
  );
};

render(<KeyTracker />);
