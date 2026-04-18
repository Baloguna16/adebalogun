import { BaseEdge, getSmoothStepPath, EdgeProps } from '@xyflow/react';
import { useTheme } from '@mui/material/styles';
import { Relationship } from '../types';

interface RelationshipEdgeData {
  relationship: Relationship;
}

export function RelationshipEdge(props: EdgeProps) {
  const theme = useTheme();
  const { relationship } = (props.data as unknown as RelationshipEdgeData) || {};

  const [edgePath] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    borderRadius: 12,
  });

  const isSpouse = relationship?.relationship_type === 'spouse';
  const isDivorced = isSpouse && relationship?.end_year != null;

  return (
    <BaseEdge
      path={edgePath}
      style={{
        stroke: theme.palette.divider,
        strokeWidth: isSpouse ? 2 : 1.5,
        strokeDasharray: isDivorced ? '6 3' : undefined,
      }}
    />
  );
}
