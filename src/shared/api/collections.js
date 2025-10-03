import { myApi } from './axios';

export async function getCollections() {
  const { data } = await myApi.get('/collections', {
    headers: { 'Cache-Control': 'no-cache' },
    params: { t: Date.now() },
  });
  return data;
}


export async function createCollection(payloadOrName) {
    const body = typeof payloadOrName === 'string'
        ? { name: payloadOrName }
        : {
            name: String(payloadOrName?.name || '').trim(),
            icon: payloadOrName?.icon || undefined,
            color: payloadOrName?.color || undefined,
            pinned: Boolean(payloadOrName?.pinned),
        };
    const { data } = await myApi.post('/collections', body);
  return data;
}

export async function deleteCollection(id) {
  await myApi.delete(`/collections/${id}`);
}

export async function getCollection(id) {
  const { data } = await myApi.get(`/collections/${id}`, {
    headers: { 'Cache-Control': 'no-cache' },
    params: { t: Date.now() },
  });
  return data;
}

export async function addBookToCollection(collectionId, bookId) {
  await myApi.post(`/collections/${collectionId}/books/${bookId}`);
}

export async function removeBookFromCollection(collectionId, bookId) {
  await myApi.delete(`/collections/${collectionId}/books/${bookId}`);
}


