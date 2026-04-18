import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  useReactFlow,
  ReactFlowProvider,
  useViewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { ProfileNode } from './ProfileNode';
import { CompactNode } from './CompactNode';
import { RelationshipEdge } from './RelationshipEdge';
import { TreeSearch } from './TreeSearch';
import { useFamilyTree } from '../hooks/useFamilyTree';

const ZOOM_THRESHOLD = 0.6;

interface FamilyTreeProps {
  focusProfileId: string;
}

const nodeTypes = {
  profileNode: ProfileNode,
  compactNode: CompactNode,
};

const edgeTypes = {
  relationshipEdge: RelationshipEdge,
};

function FamilyTreeInner({ focusProfileId }: FamilyTreeProps) {
  const { nodes, edges, loading, treeData } = useFamilyTree(focusProfileId);
  const { fitView, setCenter, getZoom } = useReactFlow();
  const { zoom } = useViewport();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const initialFitDone = useRef(false);

  useEffect(() => {
    if (nodes.length > 0 && !initialFitDone.current) {
      const focusNode = nodes.find(n => n.id === focusProfileId);
      if (focusNode) {
        setTimeout(() => {
          setCenter(
            focusNode.position.x + 130,
            focusNode.position.y + 100,
            { zoom: 1, duration: 500 }
          );
          initialFitDone.current = true;
        }, 100);
      }
    }
  }, [nodes, focusProfileId, setCenter]);

  const displayNodes = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      type: zoom < ZOOM_THRESHOLD ? 'compactNode' : 'profileNode',
    }));
  }, [nodes, zoom]);

  const handleNodeClick = useCallback((_: any, node: { id: string; position: { x: number; y: number } }) => {
    setCenter(node.position.x + 130, node.position.y + 100, {
      zoom: 1,
      duration: 500,
    });
  }, [setCenter]);

  const handleSearchSelect = useCallback((profileId: string) => {
    const node = nodes.find(n => n.id === profileId);
    if (node) {
      setCenter(node.position.x + 130, node.position.y + 100, {
        zoom: 1,
        duration: 500,
      });
    }
  }, [nodes, setCenter]);

  if (loading) return null;

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 140px)', position: 'relative' }}>
      <TreeSearch profiles={treeData.profiles} onSelect={handleSearchSelect} />
      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        fitView={false}
        minZoom={0.1}
        maxZoom={1.5}
        panOnDrag
        zoomOnScroll={!isMobile}
        zoomOnPinch
        preventScrolling
        proOptions={{ hideAttribution: true }}
      >
        {!isMobile && zoom < ZOOM_THRESHOLD && (
          <MiniMap
            nodeStrokeWidth={3}
            nodeColor={theme.palette.primary.main}
            maskColor={
              theme.palette.mode === 'dark'
                ? 'rgba(0,0,0,0.7)'
                : 'rgba(255,255,255,0.7)'
            }
          />
        )}
        <Controls showInteractive={false} />
      </ReactFlow>
    </Box>
  );
}

export function FamilyTree(props: FamilyTreeProps) {
  return (
    <ReactFlowProvider>
      <FamilyTreeInner {...props} />
    </ReactFlowProvider>
  );
}
