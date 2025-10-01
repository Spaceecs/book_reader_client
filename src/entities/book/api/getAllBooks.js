import {myApi} from "../../../shared";

export async function getAllBooks(params = {}) {
    try {
        const normalized = { ...params };
        // Support arrays for filters by converting to comma-separated lists
        ['languages','formats','publishers','genres','authors','tags'].forEach(k => {
            if (Array.isArray(normalized[k])) {
                const joined = normalized[k].filter(Boolean).join(',');
                if (joined) normalized[k] = joined; else delete normalized[k];
            }
        });
        // drop empty string params to avoid confusing the backend
        Object.keys(normalized).forEach(k => {
            const v = normalized[k];
            if (typeof v === 'string' && v.trim() === '') delete normalized[k];
        });
        const response = await myApi.get('/books/filter', { params: normalized });
        return response.data;
    } catch (error) {
        console.error('Помилка при отриманні публічних книг:', error);
        throw error;
    }
}
