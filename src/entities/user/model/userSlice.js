import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    id: null,
    login: null,
    token: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            const { id, login, token } = action.payload;
            state.id = id;
            state.login = login;
            state.token = token;
        },
        clearUser: (state) => {
            state.id = null;
            state.login = null;
            state.token = null;
        },
        setToken: (state, action) => {
            state.token = action.payload;
        }
    },
});

export const { setUser, clearUser, setToken } = userSlice.actions;
export default userSlice.reducer;
