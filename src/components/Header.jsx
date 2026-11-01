import ReverseField from './ReverseField';
import SpeedSelection from './SpeedSelection';
import DelayField from './DelayField';
import { AppBar, Box, Grid, Toolbar, Typography } from '@mui/material';

const Header = () => {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h2" component="h1" color="inherit">
            Soundboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ mt: 1, pl: 2, pr: 2 }}>
        <Grid container spacing={1}>
          <Grid size="auto">
            <ReverseField />
          </Grid>
          <Grid size="auto">
            <DelayField />
          </Grid>
        </Grid>
        <SpeedSelection />
      </Box>
    </>
  );
};

export default Header;
