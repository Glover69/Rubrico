import { Box, Text } from "ink";
import type { Node } from "../models";
import path from "node:path";

interface TreeNodeProps {
  node: Node;
  depth: number;
  selectedPath?: string;
}

function TreeNode({ node, depth, selectedPath }: TreeNodeProps) {
  const isSelected = node.path === selectedPath;

  return (
    <Box flexDirection="column">
      {
        <Box
          backgroundColor={isSelected ? "#6AA9FF" : ""}
          flexDirection="row"
          justifyContent="space-between"
          gap={2}
          paddingLeft={depth * 2}>
          <Box gap={1}>
            <Text color={node.isDir ? "#6AA9FF" : ""}>
              {node.isDir ? ">" : ""}
            </Text>
            <Text dimColor={!node.isDir} bold={node.isDir} color={isSelected ? "#0A0C11" : "#CED4DF"}>{node.name}</Text>
          </Box>
          

          <Text dimColor color={isSelected ? "#0A0C11" : "#CED4DF"}>{path.extname(node.path).slice(1)}</Text>
        </Box>
      }

      {node.isDir &&
        node.children?.map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            depth={depth + 1}
            selectedPath={selectedPath}
          />
        ))}
    </Box>
  );
}

export default TreeNode;
