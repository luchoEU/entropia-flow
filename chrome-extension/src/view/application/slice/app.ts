import { createSlice } from "@reduxjs/toolkit";
import { pageLoaded } from "../actions/ui";

const appSlice = createSlice({
    name: 'app',
    initialState: { isLoaded: false },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(pageLoaded.fulfilled, (state) => {
            state.isLoaded = true;
        });
    }
});

export const selectIsAppLoaded = (state: any) => state.app.isLoaded;
export default appSlice.reducer;
