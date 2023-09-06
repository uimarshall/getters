/* eslint-disable no-unused-vars */

// Slices represent a group of related data - users are related to each other, so they are grouped together in a slice.

// Slices for user actions, reducers, and selectors for Redux store state management of users data in the frontend.

// Slices represents a collection of Redux actions and reducers for a specific feature of the application. In this case, the userSlices.js file contains actions and reducers for users data in the Redux store. The userSlices.js file contains the following code:

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
// import { apiCallBegan } from '../api';

const INITIAL_STATE = {
  loading: false,
  lastFetch: null,
  error: null,
  users: [],
  user: null,
  isUpdated: false,
  isDeleted: false,
  isEmailSent: false,
  isPasswordReset: false,
  userAuth: {
    error: null,
    userInfo: {},
  },
};

export const registerUser = createAsyncThunk('users/registerUser', async (user, { dispatch, getState }) => {
  try {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    const data = await response.json();
    if (response.ok) {
      dispatch(userAdded(data));
      return data;
    } else {
      dispatch(usersRequestFailed(data));
      return data;
    }
  } catch (error) {
    dispatch(usersRequestFailed(error.message));
  }
});

// Login Action using axios

// createAsyncThunk is a function that takes two arguments: a string that is used as the prefix for the generated action types, and a function that returns a promise containing the value to be dispatched when the promise is resolved. The function is called with two arguments: the first is the payload value, and the second is an object containing the dispatch and getState functions.

// The loginUserAction function is an async function that takes two arguments: a user object and a dispatch function. The loginUserAction function uses the axios library to make a POST request to the /api/users/login endpoint. The loginUserAction function then dispatches the userAdded action with the response data as the payload. The loginUserAction function also dispatches the usersRequestFailed action with the error message as the payload if the request fails.

export const loginUserAction = createAsyncThunk(
  'users/loginUser',
  async (payload, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await axios.post('/api/users/login', payload);
      const data = await response.data;
      if (response.ok) {
        dispatch(userAdded(data));
        return data;
      } else {
        dispatch(usersRequestFailed(data));
        return data;
      }
    } catch (error) {
      return rejectWithValue(error?.response?.data);
      // dispatch(usersRequestFailed(error.message));
    }
  }
);

// When we eventually dispatch the action, we will use the following code:

// dispatch(loginUserAction({ email, password }));, where email and password are the values of the email and password fields in the login form.

// By doing, we're able to keep track of the state of the store, If it has been updated for instance. And we can then use the state to update the UI.

// This is where we need the slices

// When dispatch is called, the Redux store calls the reducer function with the current state and the action object as arguments. The reducer function then returns a new state object that is used to update the Redux store.

const slice = createSlice({
  name: 'users', // name of the slice
  initialState: INITIAL_STATE, // initial state of the slice

  // The purpose/essence of the 'reducers' is to handle all the action that is coming into the slices and to update the initial state of the Redux store.
  reducers: (builder) => {
    // The builder is what updates the individual state of the store.
    // Login
    builder.addCase(loginUserAction.pending, (state, action) => {
      state.loading = true;
    });
  },

  // usersRequested: (users, action) => {
  //   users.loading = true;
  // },
  // usersReceived: (users, action) => {
  //   users.list = action.payload;
  //   users.loading = false;
  //   users.lastFetch = Date.now();
  // },
  // usersRequestFailed: (users, action) => {
  //   users.loading = false;
  //   users.error = action.payload;
  // },
  // userAdded: (users, action) => {
  //   users.list.push(action.payload);
  // },
  // userRemoved: (users, action) => {
  //   users.list.splice(users.list.indexOf(action.payload), 1);
  // },
  // userUpdated: (users, action) => {
  //   const index = users.list.findIndex((user) => user.id === action.payload.id);
  //   users.list[index] = action.payload;
  // },
});

export const { userAdded, userRemoved, userUpdated, usersReceived, usersRequested, usersRequestFailed } = slice.actions;
export default slice.reducer;
