import { compose, applyMiddleware, createStore } from "redux";
import middleware from "./middleware";
import reducers from "./reducers";

export const configureStore = (services) => createStore(
    reducers,
    compose(applyMiddleware(...middleware.map(f => f(services))))
)