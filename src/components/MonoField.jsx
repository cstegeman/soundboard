import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { enableMono } from '../features/monoSlice';

const MonoField = () => {
  const mono = useSelector(state => state.mono.value);
  const dispatch = useDispatch();

  return (
    <FormGroup>
      <FormControlLabel
        control={<Checkbox />}
        label="One at a time"
        checked={mono}
        onChange={event => dispatch(enableMono(event.target.checked))}
      />
    </FormGroup>
  );
};

export default MonoField;
