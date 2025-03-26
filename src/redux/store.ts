import { configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import persistStore from 'redux-persist/es/persistStore';
import storage from 'redux-persist/lib/storage';
import { baseApi } from './api/baseApi';
import authReducer from './features/auth/authSlice';
import profileReducer from './features/profile/profileSlice';
import usersReducer from './features/users/usersSlice';
import marketplaceReducer from './features/marketplace/marketplaceSlice';
import creditsReducer from './features/credits/creditsSlice';
import { lessonsReducer } from './features/lessons/lessonsSlice'; // Update this import

const persistConfig = {
  key: 'auth',
  storage,
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    profile: profileReducer,
    users: usersReducer,
    auth: persistedAuthReducer,
    marketplace: marketplaceReducer,
    credits: creditsReducer,
    lessons: lessonsReducer,
  },
  middleware: (getDefaultMiddlewares) =>
      getDefaultMiddlewares({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(baseApi.middleware),
});

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);