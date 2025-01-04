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

export const setupStore = (services) => {
    return configureStore({
        reducer: reducers, // Pass your reducers here
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware(defaultMiddlewareOptions).concat(middleware.map((f) => f(services))),
    });
};
