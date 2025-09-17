import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    lastBook: null,
};

const booksSlice = createSlice({
    name: 'books',
    initialState,
    reducers: {
        setLastBook(state, action) {
            state.lastBook = action.payload;
        },
        clearLastBook(state) {
            state.lastBook = null;
        }
    },
});

export const { setLastBook, clearLastBook } = booksSlice.actions;
export default booksSlice.reducer;
