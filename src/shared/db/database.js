import * as SQLite from 'expo-sqlite';

let db;

//TODO

export async function initDatabase() {
    db = await SQLite.openDatabaseAsync('books.db');

    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS local_books (
      id TEXT PRIMARY KEY,
      title TEXT,
      author TEXT,
      filePath TEXT
    );
  `);

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS online_books (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             onlineId TEXT,
                                             title TEXT,
                                             path TEXT,
                                             format TEXT,
                                             base64 TEXT,
                                             currentPage INTEGER,
                                             totalPages INTEGER
        );
    `);

    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookId TEXT,
      chapter TEXT,
      position INTEGER
    );
  `);

    return db;
}

export async function addLocalBook(book) {
    await db.execAsync(
        `INSERT INTO local_books (id, title, author, filePath) VALUES (?, ?, ?, ?);`,
        [book.id, book.title, book.author, book.filePath]
    );
}

export async function getLocalBooks() {
    const result = await db.execAsync(`SELECT * FROM local_books;`);
    return result[0].rows._array;
}

export async function updateLocalBook(book) {
    await db.execAsync(
        `UPDATE local_books SET title=?, author=?, filePath=? WHERE id=?;`,
        [book.title, book.author, book.filePath, book.id]
    );
}

export async function deleteLocalBook(id) {
    await db.execAsync(`DELETE FROM local_books WHERE id=?;`, [id]);
}

export async function addOnlineBook(onlineId, title, path, format = 'pdf', base64 = '') {
    console.log(onlineId, title, path, format);
    await db.runAsync(
        `INSERT INTO online_books (onlineId, title, path, format, base64, currentPage, totalPages) VALUES (?, ?, ?, ?, ?, ?, ?)`, [onlineId, title, path, format, base64, 0, 0]
    );
    console.log("book added");
}


export async function getOnlineBooks() {
    const result = await db.execAsync(`SELECT * FROM online_books;`);
    return result[0].rows._array;
}

export async function getOnlineBookById(id) {
    const result = await db.execAsync(
        `SELECT * FROM online_books WHERE id=?;`,
        [id]
    );
    return result[0].rows._array[0] || null;
}

export async function getOnlineBooksByOnlineId(id) {
    const result = await db.runAsync(
        `SELECT * FROM online_books WHERE online_id=?;`,
        [id]
    );
    return result[0].rows._array[0] || null;
}

export async function updateOnlineBook(book) {
    await db.execAsync(
        `UPDATE online_books SET title=?, author=?, cover=?, filePath=? WHERE id=?;`,
        [book.title, book.author, book.cover, book.filePath, book.id]
    );
}

export async function deleteOnlineBook(id) {
    await db.execAsync(`DELETE FROM online_books WHERE id=?;`, [id]);
}

export async function getBookmarks(bookId) {
    const result = await db.execAsync(`SELECT * FROM bookmarks WHERE bookId=?;`, [bookId]);
    return result[0].rows._array;
}

export async function updateBookmark(bookmark) {
    await db.execAsync(
        `UPDATE bookmarks SET chapter=?, position=? WHERE id=?;`,
        [bookmark.chapter, bookmark.position, bookmark.id]
    );
}

export const addBookmark = async (bookId, page) => {
    const createdAt = new Date().toISOString();
    await db.execAsync(
        'INSERT INTO bookmarks (bookId, chapter, position, createdAt) VALUES (?, ?, ?, ?);',
        [bookId, null, page, createdAt] // якщо у твоїй таблиці є `chapter`, передаємо null
    );
};

export const getBookmarksByBook = async (bookId) => {
    const result = await db.execAsync(
        'SELECT * FROM bookmarks WHERE bookId = ? ORDER BY createdAt DESC;',
        [bookId]
    );
    return result[0].rows._array;
};

export const deleteBookmark = async (bookId, page) => {
    await db.execAsync(
        'DELETE FROM bookmarks WHERE bookId = ? AND position = ?;',
        [bookId, page]
    );
};

export const isBookmarked = async (bookId, page) => {
    const result = await db.execAsync(
        'SELECT * FROM bookmarks WHERE bookId = ? AND position = ?;',
        [bookId, page]
    );
    return result[0].rows._array.length > 0;
};

export const updateBookProgress = async (id, currentPage, totalPages) => {
    await db.execAsync(
        'UPDATE books SET currentPage = ?, totalPages = ? WHERE id = ?;',
        [currentPage, totalPages, id]
    );
};

export { db };
