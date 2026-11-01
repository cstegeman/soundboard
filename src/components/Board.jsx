import { play } from '../utils/audio';
import { Box, Button, Divider, Grid, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const Board = ({ files }) => {
  const reversePlayback = useSelector(state => state.reverse.value);
  const playSpeed = useSelector(state => state.speed.value);
  const enableDelay = useSelector(state => state.delay.value);

  return (
    <>
      {files.map((file, index) => {
        return (
          <Box key={index} sx={{ mt: 3 }}>
            <Typography variant="h4" component="h2">
              {file.title}
            </Typography>
            <Divider variant="middle" />
            <Grid container spacing={1} sx={{ mt: 1 }}>
              {file.sounds.map((sound, i) => {
                return (
                  <Grid size="auto" key={i}>
                    <Button
                      variant="contained"
                      onClick={() =>
                        play(file.category, sound.name, playSpeed, reversePlayback, enableDelay)
                      }
                    >
                      {sound.title}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        );
      })}
    </>
  );
};

Board.propTypes = {
  files: PropTypes.arrayOf(PropTypes.object)
};

export default Board;
