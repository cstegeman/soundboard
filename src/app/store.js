import { configureStore } from '@reduxjs/toolkit';
import reverseReducer from '../features/reverseSlice';
import delayReducer from '../features/delaySlice';
import speedReducer from '../features/speedSlice';
import monoReducer from '../features/monoSlice';

export default configureStore({
  reducer: {
    reverse: reverseReducer,
    delay: delayReducer,
    speed: speedReducer,
    mono: monoReducer
  }
});
