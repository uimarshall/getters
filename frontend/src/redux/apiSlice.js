/* eslint-disable no-unused-vars */
// This is similar to redux thunk used for making async requests in redux. It is used to make async requests in redux toolkit to APIs.
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({ baseUrl: '' }); //because we are using proxy in vite.config.js, we don't need to specify the base url(string) here

// This is the Parent slice
export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({}),
});
