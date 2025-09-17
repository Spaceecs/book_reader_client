import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    id: null,
    login: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            const { id, login } = action.payload;
            state.id = id;
            state.login = login;
        },
        clearUser: (state) => {
            state.id = null;
            state.login = null;
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
