import { configureStore,combineReducers } from "@reduxjs/toolkit";
import { userReducer,userAction } from "../stores/slices/user.slice";
const rootReducer=combineReducers({
    user:userReducer
})

export const store=configureStore({
    reducer:rootReducer
})

export type StoreType=ReturnType<typeof rootReducer>

store.dispatch(userAction.fetchUserData())
