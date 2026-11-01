import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { enableDelay } from '../features/delaySlice';

const DelayField = () => {
  const delay = useSelector(state => state.delay.value);
  const dispatch = useDispatch();

  return (
    <FormGroup>
      <FormControlLabel
        control={<Checkbox />}
        label="Delay"
        checked={delay}
        onChange={event => dispatch(enableDelay(event.target.checked))}
      />
    </FormGroup>
  );
};

export default DelayField;
