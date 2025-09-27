import * as SQLite from "expo-sqlite";

let db;

// Ініціалізація БД
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
                                                    totalPages INTEGER,
                                                    imageUrl TEXT
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

    return db;
}

export { db };

//
// === LOCAL BOOKS ===
//
export async function addLocalBook(book) {
    await db.runAsync(
        `INSERT INTO local_books (id, title, author, filePath) VALUES (?, ?, ?, ?);`,
        [book.id, book.title, book.author, book.filePath]
    );
}

export async function getLocalBooks() {
    return await db.getAllAsync(`SELECT * FROM local_books;`);
}

export async function updateLocalBook(book) {
    await db.runAsync(
        `UPDATE local_books SET title=?, author=?, filePath=? WHERE id=?;`,
        [book.title, book.author, book.filePath, book.id]
    );
}

export async function deleteLocalBook(id) {
    await db.runAsync(`DELETE FROM local_books WHERE id=?;`, [id]);
}

//
// === ONLINE BOOKS ===
//

export async function addOnlineBook(onlineId, title, path, format = "pdf", base64 = "", imageUrl="") {
    try {
        await db.runAsync(
            `INSERT INTO online_books (onlineId, title, path, format, base64, currentPage, totalPages, imageUrl)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [onlineId, title, path, format, base64, 0, 0, imageUrl]
        );
        console.log("✅ Online book added");
    } catch (err) {
        console.error("❌ DB insert error:", err);
    }
}

export async function getOnlineBooks() {
    return await db.getAllAsync(`SELECT * FROM online_books;`);
}

export async function getOnlineBookById(id) {
    return await db.getFirstAsync(`SELECT * FROM online_books WHERE id=?;`, [id]);
}

export async function getOnlineBookByOnlineId(onlineId) {
    return await db.getFirstAsync(`SELECT * FROM online_books WHERE onlineId=?;`, [onlineId]);
}

export async function updateOnlineBook(book) {
    await db.runAsync(
        `UPDATE online_books
         SET title=?, path=?, format=?, base64=?, currentPage=?, totalPages=?
         WHERE id=?;`,
        [book.title, book.path, book.format, book.base64, book.currentPage, book.totalPages, book.id]
    );
}

export async function deleteOnlineBook(id) {
    await db.runAsync(`DELETE FROM online_books WHERE id=?;`, [id]);
}

export async function updateBookProgress(id, currentPage, totalPages) {
    await db.runAsync(
        `UPDATE online_books SET currentPage=?, totalPages=? WHERE id=?;`,
        [currentPage, totalPages, id]
    );
}

//
// === BOOKMARKS ===
//
export async function addBookmark(bookId, page, chapter = null) {
    const createdAt = new Date().toISOString();
    await db.runAsync(
        `INSERT INTO bookmarks (bookId, chapter, position, createdAt) VALUES (?, ?, ?, ?);`,
        [bookId, chapter, page, createdAt]
    );
}

export async function getBookmarks(bookId) {
    return await db.getAllAsync(`SELECT * FROM bookmarks WHERE bookId=? ORDER BY createdAt DESC;`, [bookId]);
}

export async function updateBookmark(bookmark) {
    await db.runAsync(`UPDATE bookmarks SET chapter=?, position=? WHERE id=?;`, [
        bookmark.chapter,
        bookmark.position,
        bookmark.id,
    ]);
}

export async function deleteBookmark(bookId, page) {
    await db.runAsync(`DELETE FROM bookmarks WHERE bookId=? AND position=?;`, [bookId, page]);
}

export async function isBookmarked(bookId, page) {
    const row = await db.getFirstAsync(`SELECT * FROM bookmarks WHERE bookId=? AND position=?;`, [bookId, page]);
    return !!row;
}
