import * as SQLite from "expo-sqlite";

let db;

// Ініціалізація БД
async function ensureDb() {
    if (!db) {
        await initDatabase();
    }
}

export async function initDatabase() {
    db = await SQLite.openDatabaseAsync("books.db");
    // await db.execAsync(`DROP TABLE IF EXISTS online_books;`);
    // Локальні книги
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS local_books (
            id TEXT PRIMARY KEY,
            title TEXT,
            author TEXT,
            filePath TEXT
        );
    `);

    // Онлайн книги
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS online_books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            onlineId TEXT,
            title TEXT,
            author TEXT,
            imageUrl TEXT,
            filePath TEXT,
            format TEXT,
            base64 TEXT,
            currentPage INTEGER,
            totalPages INTEGER
        );
    `);


    // Закладки
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookId TEXT,
      chapter TEXT,
      position INTEGER,
      createdAt TEXT
    );
  `);
}

// ======================
// Local Books
// ======================
export async function addLocalBook(book) {
    await ensureDb();
    await db.runAsync(
        `INSERT INTO local_books (id, title, author, filePath) VALUES (?, ?, ?, ?);`,
        [book.id, book.title, book.author, book.filePath]
    );
}

export async function getLocalBooks() {
    await ensureDb();
    return await db.getAllAsync(`SELECT * FROM local_books;`);
}

export async function updateLocalBook(book) {
    await ensureDb();
    await db.runAsync(
        `UPDATE local_books SET title=?, author=?, filePath=? WHERE id=?;`,
        [book.title, book.author, book.filePath, book.id]
    );
}

export async function deleteLocalBook(id) {
    await ensureDb();
    await db.runAsync(`DELETE FROM local_books WHERE id=?;`, [id]);
}

// ======================
// Online Books
// ======================
export async function addOnlineBook(onlineId, title, filePath, format = 'pdf', base64 = '', imageUrl = '', author = '') {
    await ensureDb();
    try {
        await db.runAsync(
            `INSERT INTO online_books (onlineId, title, filePath, format, base64, currentPage, totalPages, imageUrl, author)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [onlineId, title, filePath, format, base64, 0, 0, imageUrl, author]
        );
    } catch (error) {
        console.error("addOnlineBook error:", error);
    }
}

export async function getOnlineBooks() {
    await ensureDb();
    return await db.getAllAsync(`SELECT * FROM online_books;`);
}

export async function getOnlineBookById(id) {
    await ensureDb();
    return await db.getFirstAsync(`SELECT * FROM online_books WHERE id=?;`, [id]);
}

export async function getOnlineBooksByOnlineId(onlineId) {
    await ensureDb();
    return await db.getFirstAsync(`SELECT * FROM online_books WHERE onlineId=?;`, [onlineId]);
}

export async function updateOnlineBook(book) {
    await ensureDb();
    await db.runAsync(
        `UPDATE online_books SET title=?, author=?, imageUrl=?, filePath=? WHERE id=?;`,
        [book.title, book.author, book.imageUrl, book.filePath, book.id]
    );
}

export async function deleteOnlineBook(id) {
    await ensureDb();
    await db.runAsync(`DELETE FROM online_books WHERE id=?;`, [id]);
}

// ======================
// Bookmarks
// ======================
export async function getBookmarks(bookId) {
    await ensureDb();
    return await db.getAllAsync(`SELECT * FROM bookmarks WHERE bookId=?;`, [bookId]);
}

export const addBookmark = async (bookId, page, chapter = null) => {
    await ensureDb();
    const createdAt = new Date().toISOString();
    await db.runAsync(
        'INSERT INTO bookmarks (bookId, chapter, position, createdAt) VALUES (?, ?, ?, ?);',
        [bookId, chapter, page, createdAt]
    );
};

export const getBookmarksByBook = async (bookId) => {
    await ensureDb();
    return await db.getAllAsync(
        'SELECT * FROM bookmarks WHERE bookId = ? ORDER BY createdAt DESC;',
        [bookId]
    );
};

export async function updateBookmark(bookmark) {
    await ensureDb();
    await db.runAsync(
        `UPDATE bookmarks SET chapter=?, position=? WHERE id=?;`,
        [bookmark.chapter, bookmark.position, bookmark.id]
    );
}

export const deleteBookmark = async (bookId, page) => {
    await ensureDb();
    await db.runAsync(
        'DELETE FROM bookmarks WHERE bookId = ? AND position = ?;',
        [bookId, page]
    );
};

export const isBookmarked = async (bookId, page) => {
    try {
        await ensureDb();
        if (!bookId || page == null) return false;
        const row = await db.getFirstAsync(
            'SELECT * FROM bookmarks WHERE bookId = ? AND position = ?;',
            [bookId, page]
        );
        return !!row;
    } catch {
        return false;
    }
};

// ======================
// Book Progress
// ======================
export const updateBookProgress = async (id, currentPage, totalPages) => {
    await ensureDb();
    await db.runAsync(
        'UPDATE online_books SET currentPage = ?, totalPages = ? WHERE id = ?;',
        [Number(currentPage) || 0, Number(totalPages) || 0, id]
    );
};

export { db };
