import {
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatVisitDate } from './geo';
import { Place } from './travelData';

export interface PlacePopupProps {
  selection: { place: Place; pos: { top: number; left: number } } | null;
  onClose: () => void;
}

const VisitList = ({ place }: { place: Place }) => {
  const visits = [...place.visits].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <List dense disablePadding>
      {visits.map((v, i) => (
        <ListItem key={`${v.date}-${i}`} disableGutters alignItems="flex-start">
          <ListItemText
            primary={
              <Typography fontWeight="bold" color="primary">
                {formatVisitDate(v.date)}
              </Typography>
            }
            secondary={
              <>
                {v.note && (
                  <Typography variant="body2" component="span" display="block">
                    {v.note}
                  </Typography>
                )}
                {v.cities && v.cities.length > 0 && (
                  <Typography
                    variant="body2"
                    component="span"
                    display="block"
                    color="text.secondary"
                  >
                    {v.cities.join(' · ')}
                  </Typography>
                )}
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export const PlacePopup = ({ selection, onClose }: PlacePopupProps) => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  if (!selection) return null;
  const { place, pos } = selection;

  if (mobile) {
    return (
      <Dialog open fullWidth onClose={onClose}>
        <DialogTitle>{place.name}</DialogTitle>
        <DialogContent>
          <VisitList place={place} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover
      open
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={pos}
    >
      <Typography variant="h6" sx={{ px: 2, pt: 2 }}>
        {place.name}
      </Typography>
      <DialogContent sx={{ pt: 1, maxWidth: 360 }}>
        <VisitList place={place} />
      </DialogContent>
    </Popover>
  );
};
