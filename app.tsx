import React, { useEffect, useState } from "react";
import { Box, render, Text, useApp, useInput } from "ink";
import { send, shutdown } from "./bridge";
import type { Capabilities, Conversion, Node } from "./models";
import { readdirSync } from "node:fs";
import path, { join } from "node:path";
import TreeNode from "./components/treeNode";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";

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
  const directoryTree: Node[] = [];

  const entries = readdirSync(cwd, { withFileTypes: true });

  entries.forEach((item) => {
    if (IGNORE.has(item.name)) return;

    if (item.isDirectory()) {
      //   console.log(`Directory: ${item.name}`);
      const newPath = join(cwd, item.name);
      directoryTree.push({
        name: item.name,
        path: newPath,
        isDir: true,
        children: initializeDirectory(newPath),
      });
    } else if (item.isFile()) {
      // console.log(`File: ${item.name}`);
      const newPath = join(cwd, item.name);
      directoryTree.push({ name: item.name, path: newPath, isDir: false });
    }
  });

  return directoryTree;
}

function flattenDirectoryTree(n: Node[]): Node[] {
  const finalList: Node[] = [];

  n.forEach((item) => {
    if (item.children) {
      finalList.push(item);
      finalList.push(...flattenDirectoryTree(item.children));
    } else {
      finalList.push(item);
    }
  });

  // console.log(finalList);
  return finalList;
}

function isSupported(n: Node | undefined, supported: string[]): boolean {
  if (!n) return false;
  const ext = path.extname(n.path).slice(1).toLowerCase();
  return supported.includes(ext);
}

const App = () => {
  const [supportedFiles, setSupportedFiles] = useState<string[]>([]);
  const [markdown, setMarkdown] = useState("");
  const [selectedindex, setSelectedIndex] = useState(0);

  const [directory, setDrectory] = useState(() => {
    return initializeDirectory(process.cwd());
  });

  const [flatList, setFlatList] = useState(() => {
    return flattenDirectoryTree(directory);
  });

  const selectedPath = flatList[selectedindex]?.path;

  const { exit } = useApp();

  useInput((i, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(flatList.length - 1, prev + 1));
    } else if (i == "c") {
      const node = flatList[selectedindex];
      if (node?.isDir) return;

      if (!isSupported(node, supportedFiles)) return;
      send<Conversion>({ cmd: "convert", path: node?.path }).then((r) =>
        setMarkdown(r.markdown),
      );
    } else if (i == "q") {
      shutdown();
      exit();
    }
  });

  useEffect(() => {
    send<Capabilities>({ cmd: "capabilities" }).then((r) =>
      setSupportedFiles(r.extensions),
    );
  }, []);

  return (
    <Box
      backgroundColor=""
      width="100%"
      flexDirection="column"
      height="100%"
      flexGrow={1}
    >
      <Box
        backgroundColor=""
        borderColor="#555F70"
        borderTopDimColor
        borderBottomDimColor
        height={2}
        width="100%"
        borderStyle="bold"
        borderLeft={false}
        paddingX={5}
        paddingTop={0}
        paddingBottom={1}
        gap={3}
        alignSelf="center"
        justifyContent="space-between"
        borderRight={false}
      >
        <Box gap={1}>
          <Box gap={2}>
            <Text color="#6AA9FF">▌</Text>
            <Text>Rubrico</Text>
            {/* <BigText text="Rubrico"/> */}
          </Box>

          <Text>·</Text>

          <Text color="#8B94A3">
            Turn any file into clean Markdown — locally.
          </Text>
        </Box>

        <Text color="#8B94A3">LOCAL · OFFLINE</Text>
      </Box>

      <Box
        backgroundColor=""
        width="100%"
        height={process.stdout.rows - 12}
        flexGrow={1}
        paddingX={4}
        gap={5}
        paddingY={1}
      >
        <Box
          backgroundColor=""
          position="relative"
          borderStyle="bold"
          borderColor="#6AA9FF"
          paddingX={2}
          paddingY={1}
          flexDirection="column"
          height="100%"
          flexGrow={1}
        >
          <Box position="absolute" top={-1} paddingLeft={2} backgroundColor="">
            <Text bold color="#6AA9FF">
              {" >_ Files "}
            </Text>
          </Box>

          {directory.map((i) => {
            return (
              <TreeNode
                key={i.path}
                node={i}
                depth={0}
                selectedPath={selectedPath}
              />
            );
          })}
        </Box>

        <Box
          position="relative"
          borderStyle="bold"
          borderColor="#555F70"
          flexDirection="column"
          height="100%"

          paddingX={4}
          paddingY={2}
          flexGrow={4}
          alignItems="center"
          justifyContent="center"
        >
          <Box
            position="absolute"
            top={-1}
            left={2}
            paddingLeft={2}
            backgroundColor=""
          >
            <Text bold color="#555F70">
              {" Preview "}
            </Text>
          </Box>

          <Box gap={0.25} alignItems="center" flexDirection="column">
            {/* <Text color="#6AA9FF">⌁</Text> */}

            <Gradient name="vice">
              <BigText text="Rubrico"/>
            </Gradient>
            <Text>{directory[selectedindex]?.name}</Text>
            <Box
              backgroundColor="#6AA9FF"
              paddingX={3}
              paddingY={1}
              gap={1}
              justifyContent="center"
            >
              <Text bold color="#0A0C11">↵</Text>
              <Text bold color="#0A0C11">Convert to Markdown</Text>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        flexDirection="column"
        backgroundColor=""
        paddingX={4}
        paddingTop={0}
        gap={1}
        width="100%"
      >
        <Box
          borderStyle="round"
          borderColor="#555F70"
          paddingX={1}
          flexGrow={1}
        >
          <Text color="#8B94A3">
            ~/Documents/reports/q3-financial-report.pdf
          </Text>
        </Box>

        <Box paddingX={1} flexGrow={1}>
          <Text color="#8B94A3">
            ~/Documents/reports/q3-financial-report.pdf
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

render(<App />, { stdout: process.stdout });
