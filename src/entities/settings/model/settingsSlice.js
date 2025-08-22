import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    theme: 'light',
    fontSize: 'medium',
    language: 'en',
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setTheme(state, action) {
            state.theme = action.payload;
        },
        setFontSize(state, action) {
            state.fontSize = action.payload;
        },
        setLanguage(state, action) {
            state.language = action.payload;
        },
        clearSettings(state, action) {
            state = initialState;
        }
    },
});

export const { setTheme, setFontSize, setLanguage , clearSettings} = settingsSlice.actions;
export default settingsSlice.reducer;
