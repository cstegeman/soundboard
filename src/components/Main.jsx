import Header from './Header';
import Board from './Board';
import { useMemo, useState } from 'react';
import { Box, TextField } from '@mui/material';
import PropTypes from 'prop-types';

const Main = ({ files }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return files;
    }
    return files
      .map(file =>
        file.title.toLowerCase().includes(q)
          ? file
          : { ...file, sounds: file.sounds.filter(sound => sound.title.toLowerCase().includes(q)) }
      )
      .filter(file => file.sounds.length > 0);
  }, [files, query]);

  return (
    <>
      <Header />
      <Box component="main" sx={{ pl: 2, pr: 2 }}>
        <TextField
          type="search"
          label="Search sounds"
          size="small"
          fullWidth
          sx={{ mt: 2 }}
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <Board files={filtered} />
      </Box>
      <Box component="footer" sx={{ mt: 3, pl: 2, pr: 2, pb: 2 }}>
        &copy; Copyright 2021
      </Box>
    </>
  );
};

Main.propTypes = {
  files: PropTypes.arrayOf(PropTypes.object)
};

export default Main;
