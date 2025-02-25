import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export type TSkill = {
  name: string;
  description: string;
  proficiencyLevel: "beginner" | "intermediate" | "advanced";
};

export type TDesiredSkill = {
  name: string;
  description: string;
  desiredProficiencyLevel: "beginner" | "intermediate" | "advanced";
};

export type TUser = {
  _id: string;
  email: string;
  roles: string[];
  permissions: string[];
  skills?: TSkill[];
  desiredSkills?: TDesiredSkill[];
};

export type TAuthState = {
  user: null | TUser;
  token: null | string;
};

const initialState: TAuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
    updateUserSkills: (state, action) => {
      if (state.user) {
        state.user.skills = action.payload;
      }
    },
    updateDesiredSkills: (state, action) => {
      if (state.user) {
        state.user.desiredSkills = action.payload;
      }
    },
  },
});

export const useCurrentUser = (state: RootState) => state.auth.user;
export const useCurrentToken = (state: RootState) => state.auth.token;
export const useUserRoles = (state: RootState) => state.auth.user?.roles || [];
export const useUserPermissions = (state: RootState) =>
  state.auth.user?.permissions || [];

export const { setUser, logout, updateUserSkills, updateDesiredSkills } =
  authSlice.actions;

export const logoutAndClearStorage = () => (dispatch: any) => {
  dispatch(logout());

  localStorage.removeItem("persist:auth");
  localStorage.removeItem("persist:root");
  
};

export default authSlice.reducer;
