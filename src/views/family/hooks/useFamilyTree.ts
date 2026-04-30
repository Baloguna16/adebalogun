import { useState, useEffect, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import ELK, { ElkNode } from 'elkjs/lib/elk.bundled';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Profile, Relationship } from '../types';

const elk = new ELK();

const ELK_OPTIONS = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': '80',
  'elk.layered.spacing.nodeNodeBetweenLayers': '120',
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
};

const PROFILE_NODE_WIDTH = 260;
const PROFILE_NODE_HEIGHT = 200;

export interface TreeData {
  profiles: Profile[];
  relationships: Relationship[];
}

export function useFamilyTree(focusProfileId: string | null) {
  const [treeData, setTreeData] = useState<TreeData>({ profiles: [], relationships: [] });
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [profilesSnap, relationshipsSnap] = await Promise.all([
      getDocs(query(collection(db, 'profiles'), where('status', '==', 'approved'))),
      getDocs(query(collection(db, 'relationships'), where('status', '==', 'approved'))),
    ]);

    const profiles = profilesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Profile[];
    const relationships = relationshipsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Relationship[];

    setTreeData({ profiles, relationships });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (treeData.profiles.length === 0) return;

    const layoutTree = async () => {
      const visibleProfiles = getVisibleProfiles(
        treeData.profiles,
        treeData.relationships,
        collapsedNodes
      );

      const visibleIds = new Set(visibleProfiles.map(p => p.id));

      const visibleRelationships = treeData.relationships.filter(
        r => visibleIds.has(r.personAId) && visibleIds.has(r.personBId)
      );

      const elkGraph: ElkNode = {
        id: 'root',
        layoutOptions: ELK_OPTIONS,
        children: visibleProfiles.map(p => ({
          id: p.id,
          width: PROFILE_NODE_WIDTH,
          height: PROFILE_NODE_HEIGHT,
        })),
        edges: visibleRelationships.map(r => ({
          id: r.id,
          sources: [r.personAId],
          targets: [r.personBId],
        })),
      };

      try {
        const layout = await elk.layout(elkGraph);

        const newNodes: Node[] = (layout.children || []).flatMap(elkNode => {
          const profile = visibleProfiles.find(p => p.id === elkNode.id);
          if (!profile) return [];
          const descendantCount = getDescendantCount(profile.id, treeData.relationships, treeData.profiles);
          const isCollapsed = collapsedNodes.has(profile.id);

          return [{
            id: profile.id,
            type: 'profileNode',
            position: { x: elkNode.x || 0, y: elkNode.y || 0 },
            data: {
              profile,
              isCollapsed,
              collapsedCount: isCollapsed ? descendantCount : 0,
              onToggleCollapse: () => toggleCollapse(profile.id),
            },
          }];
        });

        const newEdges: Edge[] = visibleRelationships.map(r => ({
          id: r.id,
          source: r.personAId,
          target: r.personBId,
          type: 'relationshipEdge',
          data: { relationship: r },
        }));

        setNodes(newNodes);
        setEdges(newEdges);
      } catch (err) {
        console.error('Layout failed:', err);
      }
    };

    layoutTree();
  }, [treeData, collapsedNodes]);

  const toggleCollapse = useCallback((nodeId: string) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  return { nodes, edges, loading, treeData, refetch: fetchData };
}

function getDescendants(
  nodeId: string,
  relationships: Relationship[],
  visited: Set<string> = new Set()
): Set<string> {
  if (visited.has(nodeId)) return visited;
  visited.add(nodeId);

  const children = relationships
    .filter(r => r.relationshipType === 'parent_child' && r.personAId === nodeId)
    .map(r => r.personBId);

  children.forEach(childId => {
    getDescendants(childId, relationships, visited);
  });
  return visited;
}

function getDescendantCount(
  nodeId: string,
  relationships: Relationship[],
  profiles: Profile[]
): number {
  const descendants = getDescendants(nodeId, relationships);
  descendants.delete(nodeId);
  return descendants.size;
}

function getVisibleProfiles(
  profiles: Profile[],
  relationships: Relationship[],
  collapsedNodes: Set<string>
): Profile[] {
  const hiddenIds = new Set<string>();

  Array.from(collapsedNodes).forEach(collapsedId => {
    const descendants = getDescendants(collapsedId, relationships);
    descendants.delete(collapsedId);
    Array.from(descendants).forEach(id => {
      hiddenIds.add(id);
    });
  });

  return profiles.filter(p => !hiddenIds.has(p.id));
}
