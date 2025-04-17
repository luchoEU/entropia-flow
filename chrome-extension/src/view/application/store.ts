import { useDispatch } from "react-redux";
import services from "../services";
import middleware from "./middleware";
import reducers from "./reducers";
import { configureStore } from '@reduxjs/toolkit';

const DISABLE_CHECKS_FOR_PERFORMANCE = true
const defaultMiddlewareOptions = DISABLE_CHECKS_FOR_PERFORMANCE ?
{
    immutableCheck: false,
    serializableCheck: false
} : {
    serializableCheck: {
        // Ignore tabular state since there is a function in the state for general sorting
        ignoredPaths: ['tabular'],
    },
}

const setupStore = (services: any) => {
    return configureStore({
        reducer: reducers,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                ...defaultMiddlewareOptions,
                thunk: { extraArgument: services }
            }).concat(middleware.map((f) => f(services))),
    });
};
export const store = setupStore(services);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<AppDispatch>();
