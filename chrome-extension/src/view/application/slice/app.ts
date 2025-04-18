import { createAsyncThunk, createSlice, Middleware } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";
import middleware from "../middleware";
import { Component, traceError } from "../../../common/trace";

// Actions
enum AppAction {
    INITIALIZE = "[app] initialize",
    LOADED = "[app] loaded"
};

const appAction = {
    loaded: { type: AppAction.LOADED }
};

// State
interface AppState {
    isLoaded: boolean;
}

// Initial state
const initialState: AppState = {
    isLoaded: false,
};

// Reducers
const setLoaded = (state: AppState): AppState => ({ ...state, isLoaded: true });

// Thunk to initialize the app and run all middleware with AppAction.INITIALIZE
const initialize = createAsyncThunk<
    boolean,
    void,
    { dispatch: AppDispatch; getState: () => RootState; extra: { api: any } }
>(
    "app/initialize",
    async (_, { dispatch, getState, extra }) => {
        let next = (action: any) => {};
    
        // Chain middlewares from last to first
        for (let i = middleware.length - 1; i >= 0; i--) {
            const mw = middleware[i];
            next = mw(extra)({ dispatch, getState })(next);
        }
        
        try {
            await next({ type: AppAction.INITIALIZE });
        } catch (error) {
            traceError(Component.AppLoader, 'Error during middleware execution', error);
        }

        return true;
    }
);

// Slice
const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(initialize.fulfilled, setLoaded);
    },
});

// Selectors
const isAppLoaded = (state: RootState) => state.app.isLoaded;

export default appSlice.reducer;
export {
    initialize,
    isAppLoaded,
    appAction,
    AppAction
}
