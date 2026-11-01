import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { setSpeed } from '../features/speedSlice';

const options = [
  {
    name: 'playSpeed',
    value: 0.25,
    label: '0.25'
  },
  {
    name: 'playSpeed',
    value: 0.5,
    label: '0.50'
  },
  {
    name: 'playSpeed',
    value: 0.75,
    label: '0.75'
  },
  {
    name: 'playSpeed',
    value: 1,
    label: 'Normal'
  },
  {
    name: 'playSpeed',
    value: 1.25,
    label: '1.25'
  },
  {
    name: 'playSpeed',
    value: 1.5,
    label: '1.50'
  },
  {
    name: 'playSpeed',
    value: 1.75,
    label: '1.75'
  }
];

const SpeedSelection = () => {
  const playSpeed = useSelector(state => state.speed.value);
  const dispatch = useDispatch();

  return (
    <FormControl component="fieldset" sx={{ mt: 1 }}>
      <FormLabel component="legend">Speed</FormLabel>
      <RadioGroup row aria-label="gender" name="row-radio-buttons-group">
        {options.map((option, index) => {
          return (
            <FormControlLabel
              key={index}
              value={option.value}
              control={<Radio />}
              label={option.label}
              name={option.name}
              checked={option.value === playSpeed}
              onChange={event => dispatch(setSpeed(Number(event.target.value)))}
            />
          );
        })}
      </RadioGroup>
    </FormControl>
  );
};

export default SpeedSelection;
