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

export async function addOnlineBook(
    onlineId,
    title,
    path,
    format = 'pdf',
    base64 = '',
    imageUrl = '',
    author = ''
) {
    await ensureDb();
    console.log(onlineId, title, path, format, imageUrl, author);
    try {


        await db.runAsync(
            `INSERT INTO online_books (onlineId, title, path, format, base64, currentPage, totalPages, imageUrl, author)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [onlineId, title, path, format, base64, 0, 0, imageUrl, author]
        );
    } catch (error) {
        console.error(error);
    }
    console.log("book added");
}



export async function getOnlineBooks() {
    await ensureDb();
    return await db.getAllAsync(`SELECT * FROM online_books;`);
}

export async function getOnlineBookById(id) {
    await ensureDb();
    try {
        return await db.getFirstAsync(
            `SELECT *
             FROM online_books
             WHERE id = ?;`,
            [id]
        );
    } catch (error) {
        console.error(error);
    }
}

export async function getOnlineBooksByOnlineId(id) {
    await ensureDb();
    try {
        return await db.getFirstAsync(
            `SELECT * FROM online_books WHERE onlineId=?;`,
            [id]
        );
    } catch (e) {
        console.error('getOnlineBooksByOnlineId error:', e);
        return null;
    }
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
        if (id == null) return;
        await ensureDb();

        await db.runAsync(
            'UPDATE online_books SET currentPage = ?, totalPages = ? WHERE id = ?;',
            [Number(currentPage) || 0, Number(totalPages) || 0, id]
        );
    } catch (e) {
        console.warn('updateBookProgress failed:', e);
    }
};

export { db };
