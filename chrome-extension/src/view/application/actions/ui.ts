import { createAsyncThunk } from "@reduxjs/toolkit";
import middleware from "../middleware";
import { AppDispatch, RootState } from "../store";

const PAGE_LOADED = "[ui] page loaded"

const pageLoaded = createAsyncThunk<Promise<boolean>, void, { dispatch: AppDispatch, getState: () => RootState, extra: { api: any } }>(
    'app/pageLoaded',
    async (_, { dispatch, getState, extra }) => {
        const fakeNext = () => {}; // acts as `next(action)` to satisfy middleware

        await Promise.all(
            middleware.map((mw) => {
                const maybeAsync = mw(extra)({ dispatch, getState })(fakeNext);
                return maybeAsync({ type: PAGE_LOADED }); // simulate the action
            })
        );

        return true;
    }
  );

export {
    PAGE_LOADED,
    pageLoaded
}
