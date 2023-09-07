/* eslint-disable no-unused-vars */
import { createSlice } from '@reduxjs/toolkit';

// The slices are just places where we can keep some pieces of state and reducers that take in actions.

// It's place where we can define our reducers and actions. We can then import them in our store.js file and use them in our components.
const initialState = {
  userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
};

// The authSlice will be responsible for taking the data we get from our API and storing in the localStorage and also in our redux state.

// It will be  storing the user info and logging out the user. We will also store the user info in the local storage so that the user stays logged in even after refreshing the page.

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload; // action.payload is the user info we get from the API. This is what we will be storing in our redux state.
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    logout: (state, action) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
