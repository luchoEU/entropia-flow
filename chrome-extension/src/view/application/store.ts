import middleware from "./middleware";
import reducers from "./reducers";
import { configureStore } from '@reduxjs/toolkit';

export const setupStore = (services) => {
    return configureStore({
        reducer: reducers, // Pass your reducers here
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredPaths: ['tabular'],
                }
            }).concat(middleware.map((f) => f(services))),
    });
};
