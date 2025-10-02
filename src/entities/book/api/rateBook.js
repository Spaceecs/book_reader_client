import { myApi } from "../../../shared";

export async function rateBook(bookId, value) {
    if (!bookId || !value) throw new Error('Missing bookId or value');
    const id = Number(bookId);
    const v = Number(value);
    if (!id || v < 1 || v > 5) throw new Error('Invalid rating payload');
    const res = await myApi.post(`/books/${id}/rate`, { value: v });
    return res.data;
}


