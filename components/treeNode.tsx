import { Box, Text } from "ink";
import type { Node } from "../models";

interface TreeNodeProps {
  node: Node,
  depth: number,
  selectedPath?: string
}

function TreeNode({ node, depth, selectedPath }: TreeNodeProps){

  const isSelected = node.path === selectedPath

  return (
    <Box flexDirection="column">

      {
        <Box backgroundColor={isSelected ? 'red' : ''} flexDirection="row" gap={2} paddingLeft={depth * 2}>
        <Text>›</Text>
        <Text>{node.name}</Text>
       </Box>
      
      }

      {node.isDir && node.children?.map(child => (
      <TreeNode key={child.path} node={child} depth={depth + 1} selectedPath={selectedPath} />
      ))}

    </Box>
  );
};

export default TreeNode;