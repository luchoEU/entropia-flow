import { useDispatch } from "react-redux";
import services from "../services";
import middleware from "./middleware";
import reducers from "./reducers";
import { configureStore, Middleware } from '@reduxjs/toolkit';
import logger from 'redux-logger'
import { AppAction } from "./slice/app";
import { ENABLE_REDUX_ACTION_LOGGER } from "../../config";

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

let loggerEnabled = false;
export const conditionalLogger: Middleware = (storeAPI) => (next) => (action: any) => {
    if (loggerEnabled) {
        return logger(storeAPI)(next)(action);
    }

    if (action.type === AppAction.LOADED) {
        loggerEnabled = true;
        console.log('[Logger Enabled]');
    }

    return next(action);
};

const setupStore = (services: any) => {
    return configureStore({
        reducer: reducers,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                ...defaultMiddlewareOptions,
                thunk: { extraArgument: services }
            })
            .concat(middleware.map((f) => f(services)))
            .concat(ENABLE_REDUX_ACTION_LOGGER ? [conditionalLogger] : []),
    });
};
export const store = setupStore(services);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<AppDispatch>();
