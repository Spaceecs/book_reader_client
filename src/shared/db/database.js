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
            path TEXT,
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

    // Try to add missing createdAt column if the table existed without it
    try {
        await db.execAsync(`ALTER TABLE bookmarks ADD COLUMN createdAt TEXT;`);
    } catch (e) {
        // ignore if column already exists
    }

    return db;
}

export async function addLocalBook(book) {
    await ensureDb();
    await db.execAsync(
        `INSERT INTO local_books (id, title, author, filePath) VALUES (?, ?, ?, ?);`,
        [book.id, book.title, book.author, book.filePath]
    );
}

export async function getLocalBooks() {
    await ensureDb();
    const result = await db.execAsync(`SELECT * FROM local_books;`);
    return result[0].rows._array;
}

export async function updateLocalBook(book) {
    await ensureDb();
    await db.execAsync(
        `UPDATE local_books SET title=?, author=?, filePath=? WHERE id=?;`,
        [book.title, book.author, book.filePath, book.id]
    );
}

export async function deleteLocalBook(id) {
    await ensureDb();
    await db.execAsync(`DELETE FROM local_books WHERE id=?;`, [id]);
}

export async function addOnlineBook(onlineId, title, path, format = 'pdf', base64 = '') {
    await ensureDb();
    console.log(onlineId, title, path, format);
    await db.runAsync(
        `INSERT INTO online_books (onlineId, title, path, format, base64, currentPage, totalPages) VALUES (?, ?, ?, ?, ?, ?, ?)`, [onlineId, title, path, format, base64, 0, 0]
    );
    console.log("book added");
}


export async function getOnlineBooks() {
    await ensureDb();
    const result = await db.execAsync(`SELECT * FROM online_books;`);
    return result[0].rows._array;
}

export async function getOnlineBookById(id) {
    await ensureDb();
    const result = await db.execAsync(
        `SELECT * FROM online_books WHERE id=?;`,
        [id]
    );
    return result[0].rows._array[0] || null;
}

export async function getOnlineBooksByOnlineId(id) {
    await ensureDb();
    const result = await db.execAsync(
        `SELECT * FROM online_books WHERE onlineId=?;`,
        [id]
    );
    return result[0].rows._array?.[0] || null;
}

export async function updateOnlineBook(book) {
    await ensureDb();
    await db.execAsync(
        `UPDATE online_books SET title=?, author=?, cover=?, filePath=? WHERE id=?;`,
        [book.title, book.author, book.cover, book.filePath, book.id]
    );
}

export async function deleteOnlineBook(id) {
    await ensureDb();
    await db.execAsync(`DELETE FROM online_books WHERE id=?;`, [id]);
}

export async function getBookmarks(bookId) {
    await ensureDb();
    const result = await db.execAsync(`SELECT * FROM bookmarks WHERE bookId=?;`, [bookId]);
    return result[0].rows._array;
}

export async function updateBookmark(bookmark) {
    await ensureDb();
    await db.execAsync(
        `UPDATE bookmarks SET chapter=?, position=? WHERE id=?;`,
        [bookmark.chapter, bookmark.position, bookmark.id]
    );
}

export const addBookmark = async (bookId, page) => {
    await ensureDb();
    const createdAt = new Date().toISOString();
    await db.execAsync(
        'INSERT INTO bookmarks (bookId, chapter, position, createdAt) VALUES (?, ?, ?, ?);',
        [bookId, null, page, createdAt] // якщо у твоїй таблиці є `chapter`, передаємо null
    );
};

export const getBookmarksByBook = async (bookId) => {
    await ensureDb();
    const result = await db.execAsync(
        'SELECT * FROM bookmarks WHERE bookId = ? ORDER BY createdAt DESC;',
        [bookId]
    );
    return result[0].rows._array;
};

export const deleteBookmark = async (bookId, page) => {
    await ensureDb();
    await db.execAsync(
        'DELETE FROM bookmarks WHERE bookId = ? AND position = ?;',
        [bookId, page]
    );
};

export const isBookmarked = async (bookId, page) => {
    try {
        await ensureDb();
        if (bookId == null || page == null) return false;
        const bookIdStr = String(bookId);
        const pageNum = Number(page);
        if (!Number.isFinite(pageNum) || pageNum < 0) return false;

        const result = await db.execAsync(
            'SELECT * FROM bookmarks WHERE bookId = ? AND position = ?;',
            [bookIdStr, pageNum]
        );
        const first = Array.isArray(result) ? result[0] : undefined;
        const rows = first && first.rows && first.rows._array ? first.rows._array : [];
        return rows.length > 0;
    } catch (e) {
        // fail closed: if anything goes wrong, just report not bookmarked to avoid noisy warnings
        return false;
    }
};

export const updateBookProgress = async (id, currentPage, totalPages) => {
    try {
        await ensureDb();
        if (id == null) return;
        await db.execAsync(
            'UPDATE online_books SET currentPage = ?, totalPages = ? WHERE onlineId = ?;',
            [Number(currentPage) || 0, Number(totalPages) || 0, String(id)]
        );
    } catch (e) {
        console.warn('updateBookProgress failed:', e);
        // swallow to avoid crashing the UI
    }
};

export { db };
