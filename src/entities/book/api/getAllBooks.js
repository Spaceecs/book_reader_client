import {myApi} from "../../../shared";

export async function getAllBooks(params = {}) {
    try {
        const response = await myApi.get('/books/filter', {
            params,
        });
        return response.data;
    } catch (error) {
        console.error('Помилка при отриманні публічних книг:', error);
        throw error;
    }
}
