import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { reversePlayback } from '../features/reverseSlice';

const ReverseField = () => {
  const reverse = useSelector(state => state.reverse.value);
  const dispatch = useDispatch();

  return (
    <FormGroup>
      <FormControlLabel
        control={<Checkbox />}
        label="Reverse playback"
        checked={reverse}
        onChange={event => dispatch(reversePlayback(event.target.checked))}
      />
    </FormGroup>
  );
};

export default ReverseField;
