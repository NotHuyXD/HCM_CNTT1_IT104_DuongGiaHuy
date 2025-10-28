/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Apis } from "../../apis";

const userSlice = createSlice({
  name: "user",
  initialState: {
    data: null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUserData.pending, (state, action) => {
      state.loading = true;
      console.log("pending:", state.data);
    });
    builder.addCase(fetchUserData.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      console.log("fulfilled:", state.data);
    });
    builder.addCase(fetchUserData.rejected, (state, action) => {
      state.loading = false;
    });
  },
});

const fetchUserData = createAsyncThunk("user/fetchUserData", async () => {
  let result = (await Apis.user.me(localStorage.getItem("token"))) as any;
  return result;
});

export const userReducer = userSlice.reducer;
export const userAction = {...userSlice.actions,fetchUserData};
