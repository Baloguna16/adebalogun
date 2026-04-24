import { Autocomplete, TextField, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Profile } from '../types';

interface TreeSearchProps {
  profiles: Profile[];
  onSelect: (profileId: string) => void;
}

export function TreeSearch({ profiles, onSelect }: TreeSearchProps) {
  const options = profiles.map(p => ({
    id: p.id,
    label: `${p.firstName} ${p.lastName}`,
  }));

  return (
    <Box sx={{ width: 280 }}>
      <Autocomplete
        options={options}
        getOptionLabel={(o) => o.label}
        onChange={(_, v) => { if (v) onSelect(v.id); }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search family members..."
            size="small"
            InputProps={{
              ...params.InputProps,
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': { borderRadius: 1 },
            }}
          />
        )}
        size="small"
        clearOnBlur
        isOptionEqualToValue={(o, v) => o.id === v.id}
      />
    </Box>
  );
}
