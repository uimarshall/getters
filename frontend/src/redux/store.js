// configure redux toolkit store

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/users/authSlice';
import { apiSlice } from './apiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

export default store;
