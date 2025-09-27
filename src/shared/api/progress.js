import { myApi } from './axios';

export async function getReadingProgress() {
  const res = await myApi.get('/mobile/progress');
  return res.data; // [{ book: {id,title,author}, progress }]
}

export async function setReadingProgress(bookId, progress, position) {
  const res = await myApi.post('/mobile/sync-progress', { bookId, progress, position });
  return res.data;
}


