import {myApi} from "../../../shared";

export async function getHomePageBooks(params = {}) {
    try {
        const response = await myApi.get('/books/home', {
            params,
        });
        return response.data;
    } catch (error) {
        console.error('Помилка при отриманні публічних книг:', error);
        throw error;
    }
}
