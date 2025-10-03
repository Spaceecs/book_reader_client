import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Modal,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
    addBookmark,
    deleteBookmark, getOnlineBookById,
    isBookmarked,
    getBookmarksByBook,
    getCommentsByBook,
    addComment, getLocalBookById, updateOnlineBookProgress, updateLocalBookProgress,
} from '../shared';
import { ReadingBottomToolbar, ReadingSettingsModal, ReadingChaptersDrawer, ReadingTextSelectionToolbar, ReadingTextSelectionModal, ReadingCommentInputModal } from '../widgets';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {PdfViewer} from "../features";
import {setLastBook} from "../entities";
import {useDispatch} from "react-redux";

export default function PdfReaderScreen({ route }) {
    const { book } = route.params;
    const viewerRef = useRef(null);
    const insets = useSafeAreaInsets();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(book.currentPage ?? 0);
    const [totalPages, setTotalPages] = useState(book.totalPages ?? 0);
    const [bookmarked, setBookmarked] = useState(false);
    const [chaptersVisible, setChaptersVisible] = useState(false);
    const [chapters, setChapters] = useState([]);
    const [expandedChapterIds, setExpandedChapterIds] = useState([]);
    const [currentChapterIndex, setCurrentChapterIndex] = useState(null);
    const [drawerTab, setDrawerTab] = useState('bookmarks');
    const [bookmarksList, setBookmarksList] = useState([]);
    const [commentsList, setCommentsList] = useState([]);

    const dispatch = useDispatch();

    // ⚙️ стан налаштувань та UI читання
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [readerSettings, setReaderSettings] = useState({
        theme: 'light',
        fontSize: 1.6,
    });
    const [immersive, setImmersive] = useState(false);
    const [uiFontSize, setUiFontSize] = useState(16);
    const [selectedTheme, setSelectedTheme] = useState('#FFFFFF');
    const [spacing, setSpacing] = useState('Середні');
    const [lineSpacing, setLineSpacing] = useState('Звичайний');
    const [selectedFont, setSelectedFont] = useState('SF Pro');
    const [showFontDropdown, setShowFontDropdown] = useState(false);
    const [showSpacingDropdown, setShowSpacingDropdown] = useState(false);
    const [showLineSpacingDropdown, setShowLineSpacingDropdown] = useState(false);
    const [brightness, setBrightness] = useState(50);
    const [readingMode, setReadingMode] = useState('Режим прокручування');

    // Вибір тексту та коментарі
    const [lastSelectedText, setLastSelectedText] = useState('');
    const [selectionVisible, setSelectionVisible] = useState(false);
    const [selectionPosition, setSelectionPosition] = useState({ x: 20, y: 180 });
    const [commentModalVisible, setCommentModalVisible] = useState(false);
    const [commentText, setCommentText] = useState('');

    // Пошук
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Автопрокрутка (мінімальна заглушка як в EPUB)
    const [autoScrollVisible, setAutoScrollVisible] = useState(false);
    const [autoScrollSpeed, setAutoScrollSpeed] = useState(50);

    const progressPct = useMemo(() => {
        if (!totalPages || totalPages <= 0) return 0;
        const pct = Math.max(0, Math.min(100, Math.round(((Number(currentPage)||0) / (Number(totalPages)||1)) * 100)));
        return pct;
    }, [currentPage, totalPages]);

    useEffect(() => {
        (async () => {
            if (book?.id && currentPage >= 0) {
                const exists = await isBookmarked(book.id, currentPage);
                setBookmarked(exists);
            }
        })();
    }, [currentPage]);

    // Ensure PDF outline is present when opening drawer
    useEffect(() => {
        if (chaptersVisible) {
            try { viewerRef.current?.injectJavaScript('window.postOutline && window.postOutline(); true;'); } catch(_) {}
            (async () => {
                try { const b = await getBookmarksByBook(String(book.id)); setBookmarksList(Array.isArray(b) ? b : []);} catch(_){ }
                try { const c = await getCommentsByBook(String(book.id)); setCommentsList(Array.isArray(c) ? c : []);} catch(_){ }
            })();
        }
    }, [chaptersVisible, book?.id]);

    // Apply PDF theme
    useEffect(() => {
        try {
            const bg = selectedTheme;
            viewerRef.current?.injectJavaScript(`(function(){
                try{ window.changeTheme && window.changeTheme('${bg === '#2A2D3A' ? 'dark' : bg === '#F7F3E9' ? 'sepia' : 'light'}'); }catch(_){}
            })(); true;`);
        } catch(_) {}
    }, [selectedTheme]);

    // Apply PDF text size via unified zoom to keep selection bounds accurate
    useEffect(() => {
        try {
            const mult = Math.max(0.75, Math.min(2.5, (uiFontSize / 16)));
            viewerRef.current?.injectJavaScript(`(function(){ try{ window.changeTextSize && window.changeTextSize(${mult}); }catch(_){} })(); true;`);
        } catch(_) {}
    }, [uiFontSize]);

    // Apply reading mode (scroll vs single page)
    useEffect(() => {
        try {
            const mode = readingMode === 'Одна сторінка' ? 'single' : 'scrolled';
            viewerRef.current?.injectJavaScript(`(function(){
                try{
                    var p = (typeof window.getCurrentPage==='function') ? window.getCurrentPage() : null;
                    if (typeof window.setRenderMode==='function') window.setRenderMode('${mode}');
                    if (p!=null) window.goToPage(p);
                }catch(_){}
            })(); true;`);
        } catch(_) {}
    }, [readingMode]);

    const handleMessage = async (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'progress' || data.type === 'init') {
                const { currentPage: page = 0, totalPages = 1 } = data;
                setCurrentPage(page);
                setTotalPages(totalPages);
                try { setCurrentChapterIndex(getChapterIndexFromPage(page, chapters)); } catch(_) {}
                if (book?.id) {
                    console.log(`📖 Прогрес: ${page} з ${totalPages} id: ${book.id}`);
                    if (book.onlineId) {
                        await updateOnlineBookProgress(book.id, page, totalPages);
                        const newBook = await getOnlineBookById(book.id);
                        dispatch(setLastBook(newBook));
                    } else {
                        await updateLocalBookProgress(book.id, page, totalPages);
                        const newBook = await getLocalBookById(book.id);
                        dispatch(setLastBook(newBook));
                    }
                }
                try {
                    const b = await getBookmarksByBook(String(book.id));
                    setBookmarksList(Array.isArray(b) ? b : []);
                } catch(_) {}
                try {
                    const c = await getCommentsByBook(String(book.id));
                    setCommentsList(Array.isArray(c) ? c : []);
                } catch(_) {}
            }
            if (data.type === 'toc') {
                try {
                    const toc = Array.isArray(data.toc) ? data.toc : [];
                    setChapters(toc);
                    try { setCurrentChapterIndex(getChapterIndexFromPage(currentPage, toc)); } catch(_) {}
                } catch(_) {}
            }
            if (data.type === 'pdfPreviewEcho') {
                // no-op here; could store for future
            }
            if (data.type === 'selection') {
                const text = (data && data.text) || '';
                setLastSelectedText(text);
                if (text && text.trim().length > 0) {
                    setSelectionVisible(true);
                }
            }
        } catch (e) {
            console.error('❌ WebView message parse error:', e);
        }
    };

    const getChapterIndexFromPage = (page, toc) => {
        try {
            const list = Array.isArray(toc) ? toc : [];
            if (!list.length) return 1;
            let idx = 1;
            for (let i = 0; i < list.length; i++) {
                const ch = list[i];
                const start = Number(ch && ch.page) || 1;
                const nextStart = Number((list[i + 1] && list[i + 1].page)) || Number.POSITIVE_INFINITY;
                if (page >= start && page < nextStart) { idx = i + 1; break; }
            }
            return idx;
        } catch(_) { return 1; }
    };

    const goToNextMatch = () => {
        viewerRef.current?.injectJavaScript(`
      window.postMessage(JSON.stringify({ type: 'next-highlight' }), '*');
    `);
    };

    const goToPrevMatch = () => {
        viewerRef.current?.injectJavaScript(`
      window.postMessage(JSON.stringify({ type: 'prev-highlight' }), '*');
    `);
    };

    const refreshLists = async () => {
        try { const b = await getBookmarksByBook(String(book.id)); setBookmarksList(Array.isArray(b)?b:[]);} catch(_){ }
        try { const c = await getCommentsByBook(String(book.id)); setCommentsList(Array.isArray(c)?c:[]);} catch(_){ }
    };

    const getPdfPreview = async (page) => {
        return await new Promise((resolve) => {
            const timer = setTimeout(() => resolve(''), 600);
            const handler = (e) => {
                try {
                    const d = JSON.parse(e.nativeEvent.data);
                    if (d.type === 'pdfPreviewEcho' && Number(d.page) === Number(page)) {
                        clearTimeout(timer);
                        resolve(String(d.text||''));
                    }
                } catch(_) {}
            };
            // temporary listener
            const orig = handleMessage;
            // We won't replace the handler; rely on main handler to run and resolve
            viewerRef.current?.injectJavaScript(`window.getPagePreview(${Number(page)||1}); true;`);
        });
    };

    const toggleBookmark = async () => {
        if (!book?.id) return;

        if (bookmarked) {
            await deleteBookmark(book.id, currentPage);
            setBookmarked(false);
            Alert.alert('Закладка', `Видалено сторінку ${currentPage}`);
        } else {
            let preview = '';
            try { preview = await getPdfPreview(currentPage); } catch(_) {}
            await addBookmark(book.id, currentPage, preview || null);
            setBookmarked(true);
            Alert.alert('Закладка', `Збережено сторінку ${currentPage}`);
        }
        await refreshLists();
    };

    if (!book?.base64) {
        return (
            <View style={styles.center}>
                <Text>⛔ Немає base64-даних для PDF</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, paddingTop: immersive ? 0 : Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 0), backgroundColor: '#fff' }}>

            {!immersive && (
                <View style={styles.headerBar}>
                    <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.iconButton}>
                        <Ionicons name="settings-outline" size={22} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerBarTitle}>Розділ {currentChapterIndex != null ? String(currentChapterIndex) : ''}</Text>
                    <TouchableOpacity onPress={toggleBookmark} style={styles.iconButton}>
                        <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color={bookmarked ? '#008655' : '#000'} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Inline search bar removed; replaced with modal via toolbar */}

            <PdfViewer
                ref={viewerRef}
                base64={book.base64}
                bookId={book.id}
                currentPage={book.currentPage}
                onMessage={handleMessage}
                searchTerm={searchTerm}
            />

            <TouchableOpacity onPress={() => setChaptersVisible(true)} style={{ position:'absolute', bottom: 16, right: 16, backgroundColor:'#fff', borderRadius: 22, padding:10, elevation:4 }}>
                <Text>Меню</Text>
            </TouchableOpacity>

            {chaptersVisible && (
                <ReadingChaptersDrawer
                    visible={chaptersVisible}
                    onClose={() => setChaptersVisible(false)}
                    chapters={chapters}
                    currentId={null}
                    readIds={[]}
                    expandedIds={expandedChapterIds}
                    onToggleExpand={(id) => setExpandedChapterIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))}
                    onSelectChapter={(ch) => {
                        try {
                            if (ch && ch.page) {
                                const p = Number(ch.page);
                                if (Number.isFinite(p)) viewerRef.current?.injectJavaScript(`window.goToPage(${p}); true;`);
                            }
                        } catch(_) {}
                        setChaptersVisible(false);
                    }}
                    currentIndex={currentChapterIndex || 1}
                    totalCount={chapters.length || 0}
                    activeTab={drawerTab}
                    onChangeTab={setDrawerTab}
                    bookmarks={[
                        ...bookmarksList.map((b) => ({ id: `bm_${b.id}`, type: 'Закладка', meta: `Ст ${b.position}`, text: (b.chapter||'').trim(), page: b.position, kind:'bookmark' })),
                        ...commentsList.map((c) => ({ id: `cm_${c.id}`, type: 'Коментар', meta: `Сторінка ${c.page}`, text: c.selectedText || c.comment || '', page: c.page, kind:'comment' })),
                    ]}
                    onSelectBookmark={(item) => {
                        const p = Number(item && item.page);
                        if (Number.isFinite(p)) {
                            viewerRef.current?.injectJavaScript(`window.goToPage(${p}); true;`);
                        }
                        setChaptersVisible(false);
                    }}
                    onDeleteBookmark={async (bm) => {
                        try {
                            const p = Number(bm && bm.page);
                            if (book?.id != null && Number.isFinite(p)) {
                                await deleteBookmark(String(book.id), p);
                                await refreshLists();
                            }
                        } catch(_) {}
                    }}
                />
            )}

    {/*        <ReadingSettingsScreen*/}
    {/*            visible={settingsVisible}*/}
    {/*            onClose={() => setSettingsVisible(false)}*/}
    {/*            settings={readerSettings}*/}
    {/*            onApply={(newSettings) => {*/}
    {/*                setReaderSettings(newSettings);*/}

    {/*                viewerRef.current?.injectJavaScript(`*/}
    {/*  window.changeTheme("${newSettings.theme}");*/}
    {/*  true;*/}
    {/*`);*/}

    {/*                const scale = newSettings.fontSize / 16;*/}
    {/*                viewerRef.current?.injectJavaScript(`*/}
    {/*  window.changeZoom(${scale});*/}
    {/*  true;*/}
    {/*`);*/}

    {/*                viewerRef.current?.injectJavaScript(`*/}
    {/*  window.changeLineHeight("${newSettings.lineHeight}");*/}
    {/*  true;*/}
    {/*`);*/}
    {/*            }}*/}
    {/*        />*/}
            <ReadingBottomToolbar
                progress={progressPct}
                onLeftPress={() => viewerRef.current?.injectJavaScript('window.goPrevPage(); true;')}
                onRightPress={() => viewerRef.current?.injectJavaScript('window.goNextPage(); true;')}
                onInfoPress={() => {}}
                onToggleImmersive={() => setImmersive(!immersive)}
                onAutoScrollPress={() => setAutoScrollVisible(true)}
                onChaptersPress={() => setChaptersVisible(true)}
                onSearchPress={() => setSearchVisible(true)}
            />

            {selectionVisible && (
                <ReadingTextSelectionModal
                    visible={selectionVisible}
                    onClose={() => setSelectionVisible(false)}
                    onAddComment={() => { setSelectionVisible(false); setCommentText(''); setCommentModalVisible(true); }}
                    onHighlight={() => { setSelectionVisible(false); }}
                    onCopy={() => { setSelectionVisible(false); }}
                    onDelete={() => { setSelectionVisible(false); }}
                />
            )}

            {settingsVisible && (
                <ReadingSettingsModal
                    visible={settingsVisible}
                    onClose={() => setSettingsVisible(false)}
                    state={{
                        isDarkTheme: false,
                        brightness,
                        fontSize: uiFontSize,
                        readingMode,
                        spacing,
                        lineSpacing,
                        selectedTheme,
                        selectedFont,
                        showFontDropdown,
                        showSpacingDropdown,
                        showLineSpacingDropdown,
                        fonts: ['SF Pro', 'Times New Roman', 'Helvetica'],
                        spacingOptions: ['Вузькі', 'Середні', 'Широкі'],
                        lineSpacingOptions: ['Щільний', 'Звичайний', 'Великий'],
                    }}
                    setters={{
                        setIsDarkTheme: () => {},
                        setFontSize: setUiFontSize,
                        setReadingMode,
                        setSpacing,
                        setLineSpacing,
                        setSelectedTheme,
                        setSelectedFont,
                        setShowFontDropdown,
                        setShowSpacingDropdown,
                        setShowLineSpacingDropdown,
                    }}
                    isDraggingBrightness={false}
                    onBrightnessStart={() => {}}
                    onBrightnessChange={setBrightness}
                    onBrightnessEnd={() => {}}
                />
            )}

            {searchVisible && (
                <Modal visible transparent animationType="fade" onRequestClose={() => setSearchVisible(false)}>
                    <View style={styles.overlayCenter}>
                        <TouchableOpacity style={styles.overlayFill} activeOpacity={1} onPress={() => setSearchVisible(false)} />
                        <View style={styles.centerCard}>
                            <Text style={styles.sheetTitle}>Пошук у книзі</Text>
                            <View style={styles.searchBar}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Введіть слово або фразу"
                                    placeholderTextColor="#999"
                                    value={searchTerm}
                                    onChangeText={setSearchTerm}
                                    returnKeyType="search"
                                    onSubmitEditing={() => {
                                        if (searchTerm && searchTerm.trim().length > 0) {
                                            const q = JSON.stringify(searchTerm.trim());
                                            viewerRef.current?.injectJavaScript(`window.searchInDocument(${q}); true;`);
                                        }
                                    }}
                                />
                                <TouchableOpacity onPress={() => {
                                    if (searchTerm && searchTerm.trim().length > 0) {
                                        const q = JSON.stringify(searchTerm.trim());
                                        viewerRef.current?.injectJavaScript(`window.searchInDocument(${q}); true;`);
                                    }
                                }}>
                                    <Text style={{ color: '#008655', fontWeight: '700' }}>Пошук</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {commentModalVisible && (
                <ReadingCommentInputModal
                    visible={commentModalVisible}
                    onClose={() => setCommentModalVisible(false)}
                    previewText={lastSelectedText}
                    value={commentText}
                    onChange={setCommentText}
                    onSave={async () => {
                        try {
                            if (book?.id != null) {
                                await addComment(String(book.id), Number(currentPage) || 0, lastSelectedText || '', commentText || '');
                                await refreshLists();
                            }
                        } catch (_) {}
                        setCommentModalVisible(false);
                    }}
                />
            )}

            {autoScrollVisible && (
                <Modal visible transparent animationType="fade" onRequestClose={() => setAutoScrollVisible(false)}>
                    <View style={styles.overlayCenter}>
                        <TouchableOpacity style={styles.overlayFill} activeOpacity={1} onPress={() => setAutoScrollVisible(false)} />
                        <View style={styles.centerCard}>
                            <Text style={styles.sheetTitle}>Авто прокрутка</Text>
                            <Text style={{ color: '#111', marginBottom: 8 }}>Швидкість: {autoScrollSpeed}</Text>
                            <Slider minimumValue={0} maximumValue={100} step={1} value={autoScrollSpeed} minimumTrackTintColor="#008655" maximumTrackTintColor="#e0e0e0" thumbTintColor="#008655" onValueChange={setAutoScrollSpeed} />
                            <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: 10 }} onPress={() => setAutoScrollVisible(false)}>
                                <Text style={{ color: '#008655', fontWeight: '700' }}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff'
    },
    headerBarTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    iconButton: {
        padding: 6,
    },
    searchContainer: {
        flexDirection: 'row',
        padding: 8,
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
    },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        borderColor: '#ccc',
        borderWidth: 1,
        marginRight: 8,
    },
    button: {
        backgroundColor: '#ddd',
        padding: 10,
        borderRadius: 6,
        marginHorizontal: 2,
    },
    // removed floating buttons (replaced by header bar)
});
