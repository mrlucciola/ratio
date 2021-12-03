// modules
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
// redux
import reducer, { initState } from './reducer';

const middleware = [thunk];

const store = createStore(
  reducer,
  initState,
  applyMiddleware(...middleware),
);
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// export
export default store;
