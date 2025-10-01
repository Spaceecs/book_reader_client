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
    // await db.execAsync(`DROP TABLE IF EXISTS local_books`);
    // Локальні книги
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS local_books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            filePath TEXT,
            format TEXT,
            base64 TEXT,
            currentPage INTEGER,
            totalPages INTEGER,
            isDeleted BOOLEAN,
            deletedAt TEXT
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
            totalPages INTEGER,
            isDeleted BOOLEAN,
            deletedAt TEXT
        );
    `);


    // Закладки
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookId TEXT,
      chapter TEXT,
      position INTEGER,
      page INTEGER,
      cfi TEXT,
      userId TEXT,
      createdAt TEXT
    );
  `);

    // Try to ensure required bookmark columns exist even if table was created earlier
    const safeAlter = async (table, column, type) => {
        try {
            await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
        } catch (e) {
            const msg = String(e?.message || e);
            if (/duplicate column|already exists/i.test(msg)) {
                // ok
            }
        }
    };
    await safeAlter('bookmarks', 'chapter', 'TEXT');
    await safeAlter('bookmarks', 'position', 'INTEGER');
    await safeAlter('bookmarks', 'page', 'INTEGER');
    await safeAlter('bookmarks', 'cfi', 'TEXT');
    await safeAlter('bookmarks', 'userId', 'TEXT');
    await safeAlter('bookmarks', 'createdAt', 'TEXT');
    await safeAlter('local_books', 'deletedAt', 'TEXT');
    await safeAlter('online_books', 'deletedAt', 'TEXT');



}

// ======================
// Local Books
// ======================
export async function addLocalBook(book) {
    await ensureDb();
    const result = await db.runAsync(
        'INSERT INTO local_books (title, filePath, format, base64, currentPage, totalPages, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [book.title, book.filePath, book.format, book.base64, 0, 0, 0]
    );
    return { ...book, id: result.lastInsertRowId };
}

export async function getLocalBookById(id) {
    await ensureDb();
    return await db.getFirstAsync(
        `SELECT * FROM local_books WHERE id = ?;`,
        [id]
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

export async function markIsDeletedLocalBook(id, isDeleted) {
    await ensureDb();
    await db.runAsync(
        `UPDATE local_books SET isDeleted = ? WHERE id = ?;`,
        [isDeleted, id]
    );
}

export async function cleanupExpiredLocalBooks() {
    await ensureDb();
    const now = Date.now();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    const rows = await db.getAllAsync(`SELECT id, deletedAt FROM local_books WHERE isDeleted = 1;`);

    for (const row of rows) {
        if (row.deletedAt) {
            const deletedAt = new Date(row.deletedAt).getTime();
            if (now - deletedAt >= THIRTY_DAYS) {
                await db.runAsync(`DELETE FROM local_books WHERE id = ?;`, [row.id]);
            }
        }
    }
}


// ======================
// Online Books
// ======================
export async function addOnlineBook(onlineId, title, filePath, format = 'pdf', base64 = '', imageUrl = '', author = '') {
    await ensureDb();
    try {
        await db.runAsync(
            `INSERT INTO online_books (onlineId, title, filePath, format, base64, currentPage, totalPages, imageUrl, author, isDeleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [onlineId, title, filePath, format, base64, 0, 0, imageUrl, author, 0]
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

export async function markIsDeletedOnlineBook(id, isDeleted) {
    await ensureDb();
    await db.runAsync(`UPDATE online_books SET isDeleted=? WHERE id=?;`, [isDeleted, id]);
}

export async function cleanupExpiredOnlineBooks() {
    await ensureDb();
    const now = Date.now();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    const rows = await db.getAllAsync(`SELECT id, deletedAt FROM online_books WHERE isDeleted = 1;`);

    for (const row of rows) {
        if (row.deletedAt) {
            const deletedAt = new Date(row.deletedAt).getTime();
            if (now - deletedAt >= THIRTY_DAYS) {
                await db.runAsync(`DELETE FROM online_books WHERE id = ?;`, [row.id]);
            }
        }
    }
}


// ======================
// Bookmarks
// ======================
export async function getBookmarks(bookId) {
    await ensureDb();
    return await db.getAllAsync(`SELECT * FROM bookmarks WHERE bookId=?;`, [bookId]);
}

export const addBookmark = async (bookId, page, chapter = null, cfi = null, userId = 'local') => {
    await ensureDb();
    const createdAt = new Date().toISOString();
    try {
        await db.runAsync(
            'INSERT INTO bookmarks (bookId, chapter, position, cfi, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?);',
            [String(bookId), chapter, Number(page) || 0, cfi, userId, createdAt]
        );
    } catch (e) {
        // Fallback for legacy schema with `page` column
        await db.runAsync(
            'INSERT INTO bookmarks (bookId, chapter, page, cfi, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?);',
            [String(bookId), chapter, Number(page) || 0, cfi, userId, createdAt]
        );
    }
};

export const getBookmarksByBook = async (bookId) => {
    await ensureDb();
    return await db.getAllAsync(
        'SELECT id, bookId, chapter, COALESCE(position, page) AS position, cfi, userId, createdAt FROM bookmarks WHERE CAST(bookId AS TEXT) = CAST(? AS TEXT) ORDER BY datetime(createdAt) DESC;',
        [String(bookId)]
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
        'DELETE FROM bookmarks WHERE CAST(bookId AS TEXT) = CAST(? AS TEXT) AND COALESCE(position, page) BETWEEN ? AND ?;',
        [String(bookId), Math.max(0, (Number(page) || 0) - 1), (Number(page) || 0) + 1]
    );
};

export const isBookmarked = async (bookId, page) => {
    try {
        await ensureDb();
        if (!bookId || page == null) return false;
        const row = await db.getFirstAsync(
            'SELECT * FROM bookmarks WHERE CAST(bookId AS TEXT) = CAST(? AS TEXT) AND COALESCE(position, page) BETWEEN ? AND ? LIMIT 1;',
            [String(bookId), Math.max(0, (Number(page) || 0) - 1), (Number(page) || 0) + 1]
        );
        return !!row;
    } catch {
        return false;
    }
};

// ======================
// Comments (Bookzy parity)
// ======================
// Ensure table exists (id, bookId, page, selectedText, comment)
// We create the table lazily here in case an older DB was initialized before this code landed
async function ensureCommentsTable() {
    await ensureDb();
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bookId TEXT,
            page INTEGER,
            selectedText TEXT,
            comment TEXT,
            createdAt TEXT
        );
    `);
}

export async function addComment(bookId, page, selectedText = '', comment = '') {
    await ensureCommentsTable();
    const createdAt = new Date().toISOString();
    await db.runAsync(
        'INSERT INTO comments (bookId, page, selectedText, comment, createdAt) VALUES (?, ?, ?, ?, ?);',
        [bookId, Number(page) || 0, String(selectedText || ''), String(comment || ''), createdAt]
    );
}

export async function getCommentsByBook(bookId) {
    await ensureCommentsTable();
    return await db.getAllAsync(
        'SELECT * FROM comments WHERE bookId = ? ORDER BY createdAt DESC;',
        [bookId]
    );
}

export async function deleteComment(id) {
    await ensureCommentsTable();
    await db.runAsync('DELETE FROM comments WHERE id = ?;', [id]);
}

// ======================
// Book Progress
// ======================
export const updateOnlineBookProgress = async (id, currentPage, totalPages) => {
    await ensureDb();
    await db.runAsync(
        'UPDATE online_books SET currentPage = ?, totalPages = ? WHERE id = ?;',
        [Number(currentPage) || 0, Number(totalPages) || 0, id]
    );
};

export const updateLocalBookProgress = async (id, currentPage, totalPages) => {
    await ensureDb();
    await db.runAsync(
        'UPDATE local_books SET currentPage = ?, totalPages = ? WHERE id = ?;',
        [Number(currentPage) || 0, Number(totalPages) || 0, id]
    );
};

export { db };
