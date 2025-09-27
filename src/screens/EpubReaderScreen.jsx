import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Button, StyleSheet, Alert, Text, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { ReadingBottomToolbar, ReadingSettingsModal, ReadingChaptersDrawer, ReadingTextSelectionToolbar } from '../widgets';
import {
    addBookmark,
    deleteBookmark,
    isBookmarked,
    updateBookProgress,
} from '../shared/db/database';

// import ReadingSettingsScreen from './ReadingSettingsScreen';


export default function EpubReaderScreen({ route }) {
    const insets = useSafeAreaInsets();
    const {book} = route.params;
    console.log(book);
    const webViewRef = useRef(null);

    const base64 = book.base64.replace(
        /^data:application\/epub\+zip;base64,/,
        ''
    );
    const savedPage = book.currentPage ?? 0;

    const [currentPage, setCurrentPage] = useState(savedPage);
    const [bookmarked, setBookmarked] = useState(false);
    
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [immersive, setImmersive] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    const [fontSizePercent, setFontSizePercent] = useState(120);
    const [progressPct, setProgressPct] = useState(0);
    const [settingsVisibleDrawer, setSettingsVisibleDrawer] = useState(false);
    const [chaptersVisible, setChaptersVisible] = useState(false);
    const [autoScrollVisible, setAutoScrollVisible] = useState(false);
    const [drawerTab, setDrawerTab] = useState('chapters');
    const [expandedChapterIds, setExpandedChapterIds] = useState([]);
    const [selectionVisible, setSelectionVisible] = useState(false);
    const [selectionPosition, setSelectionPosition] = useState({ x: 20, y: 180 });
    const [autoScrollSpeed, setAutoScrollSpeed] = useState(50);
    const [autoDetectSpeed, setAutoDetectSpeed] = useState(false);
    const [uiFontSize, setUiFontSize] = useState(16);
    const [selectedTheme, setSelectedTheme] = useState('#FFFFFF');
    const [spacing, setSpacing] = useState('Середні');
    const [lineSpacing, setLineSpacing] = useState('Звичайний');
    const [selectedFont, setSelectedFont] = useState('SF Pro');
    const [showFontDropdown, setShowFontDropdown] = useState(false);
    const [showSpacingDropdown, setShowSpacingDropdown] = useState(false);
    const [showLineSpacingDropdown, setShowLineSpacingDropdown] = useState(false);
    const [brightness, setBrightness] = useState(50);

    const TOOLBAR_SAFE_PADDING_PX = 120;

    const html = useMemo(() => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="https://unpkg.com/epubjs/dist/epub.min.js"></script>
    <style>
        html, body {
            margin; padding; height: 100%; background;
        }
        #viewer {
            height: 100%;
        }
    </style>
</head>
<body>
    <div id="viewer"></div>
    <script>
    window.onerror = function(message, source, lineno, colno, error) {
        window.ReactNativeWebView.postMessage("❌ ERROR: " + message + "\\\\n" + (error?.stack || ""));
    };

    const base64 = "${base64}";
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: "application/epub+zip" });
    const book = ePub(blob);
    const rendition = book.renderTo("viewer", {
        width: "100%",
        height: "100%",
        spread: "none"
    });

    rendition.themes.default({
        body: {
            "font-size": "${fontSizePercent}%",
            "line-height": "1.6",
            "text-align": "justify",
            "padding": "1em",
            "margin": "0 auto",
            "max-width": "95%",
            "padding-bottom": "${TOOLBAR_SAFE_PADDING_PX}px",
        },
        img: {
            "max-width": "100%",
            "height": "auto",
            "display": "block",
            "margin": "1em auto"
        },
        ".search-highlight": {
            "background": "yellow",
            "opacity": "0.6"
        }
    });

    let totalLocations = 0;
    let currentLocation = 0;
    const savedLocation = ${savedPage};

    // Helper to force font-size across typical text tags inside spine documents
    window.applyFontSize = function(percent) {
        try {
            var selectors = ['html','body','p','div','span','li','a','blockquote','section','article'];
            for (var i=0;i<selectors.length;i++) {
                window.rendition.themes.override('font-size', String(percent) + '% !important', selectors[i]);
            }
        } catch(e) {}
    };

    window.applyReadingSafePadding = function(px) {
        try {
            var selectors = ['html','body','p','div','span','section','article'];
            for (var i=0;i<selectors.length;i++) {
                window.rendition.themes.override('padding-bottom', String(px) + 'px !important', selectors[i]);
            }
        } catch(e) {}
    };

    book.ready.then(() => {
        return book.locations.generate(1600);
    }).then(() => {
        totalLocations = book.locations.length();

        if (savedLocation > 0 && totalLocations > 0) {
            const cfi = book.locations.cfiFromLocation(savedLocation);
            rendition.display(cfi);
        } else {
            // Try to open the first real content page (skip cover)
            if (book.loaded && book.loaded.navigation) {
                book.loaded.navigation.then((nav) => {
                    try {
                        const first = (nav && nav.toc ? nav.toc : []).find((i) => i.href && !/cover/i.test(i.href));
                        if (first && first.href) {
                            rendition.display(first.href);
                        } else {
                            rendition.display();
                        }
                    } catch (e) {
                        rendition.display();
                    }
                });
            } else {
                rendition.display();
            }
        }

        rendition.on("relocated", (location) => {
            currentLocation = book.locations.locationFromCfi(location.start.cfi);
            // Emit progress based on locations
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'progress',
                currentLocation,
                totalLocations
            }));
            // Also compute percentage using book.locations and toggle toolbar near end
            try {
                var cfi = (location && location.end && location.end.cfi) ? location.end.cfi : (location && location.start && location.start.cfi);
                var percent = book.locations.percentageFromCfi(cfi) || 0; // 0..1
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'toggleToolbar', visible: percent >= 0.85 }));
            } catch(e) {}
        });

        window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'init',
            currentLocation
        }));

        // Ensure initial font size and bottom padding applied
        window.applyFontSize(${fontSizePercent});
        window.applyReadingSafePadding(${TOOLBAR_SAFE_PADDING_PX});
    });

    window.book = book;
    window.rendition = rendition;
    window.currentFontSize = 120;

    window.searchInBook = async function(query) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'debug',
        message: '[CALL] searchInBook called with: ' + query
    }));

    const results = [];
    const spineItems = book.spine.spineItems;

    for (let i = 0; i < spineItems.length; i++) {
        const item = spineItems[i];

        try {
            await item.load(book.load.bind(book));
            const doc = item.document;
            const body = doc && doc.body;
            if (!body) continue;

            const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT, null, false);
            while (walker.nextNode()) {
                const node = walker.currentNode;
                const text = node.textContent;
                const index = text.toLowerCase().indexOf(query.toLowerCase());
                if (index !== -1) {
                    const range = doc.createRange();
                    range.setStart(node, index);
                    range.setEnd(node, index + query.length);

                    const cfi = item.cfiFromRange(range);
                    results.push({
                        cfi,
                        excerpt: node.textContent.slice(Math.max(0, index - 30), index + query.length + 30)
                    });
                }
            }

            await item.unload();
        } catch (e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'debug',
                message: '[ERROR] Failed in spineItem: ' + e.message
            }));
        }
    }

    if (results.length > 0) {
        await rendition.display(results[0].cfi);
        window.highlightSearchResults(results);
    }

    window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'searchResults',
        results
    }));
};

   window.highlightSearchResults = function(results) {
    let count = 0;
    results.forEach(result => {
        try {
            rendition.annotations.highlight(result.cfi, {}, () => {}, 'search-highlight');
            count++;
        } catch (e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'debug',
                message: '[SKIPPED] Invalid CFI: ' + e.message
            }));
        }
    });

    // Detect user scroll near bottom to show toolbar
    // Also toggle via CFI location percent if available
    rendition.on('relocated', (location) => {
        try {
            if (location && location.end && typeof location.end.percentage === 'number') {
                const p = location.end.percentage; // 0..1
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'toggleToolbar', visible: p >= 0.85 }));
            }
        } catch(e) {}
    });

    // Enforce font size/safe padding and detect scrollability/taps per injected document
    rendition.hooks.content.register(function(contents) {
        try {
            function checkScrollability() {
                try {
                    var win = contents.window; var doc = contents.document;
                    var el = doc.scrollingElement || doc.documentElement || doc.body;
                    var extra = el.scrollHeight - win.innerHeight;
                    var fullyVisible = el.clientHeight <= (win.innerHeight + 2) || extra <= 2;
                    // Якщо сторінка повністю вміщується у вікно — показати панель одразу
                    if (fullyVisible) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'toggleToolbar', visible: true }));
                    } else {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'toggleToolbar', visible: false }));
                    }
                } catch(e) {}
            }

            contents.on('rendered', function(){
                window.applyFontSize(${fontSizePercent});
                window.applyReadingSafePadding(${TOOLBAR_SAFE_PADDING_PX});
                setTimeout(checkScrollability, 200);
            });

            var win = contents.window;
            var doc = contents.document;
            var scroller = doc.scrollingElement || doc.documentElement || doc.body;

            win.addEventListener('resize', function(){ setTimeout(checkScrollability, 100); }, { passive: true });
            scroller.addEventListener('scroll', function(){
                try{
                    var el = doc.scrollingElement || doc.documentElement || doc.body;
                    var max = el.scrollHeight - win.innerHeight;
                    var ratio = max > 0 ? (el.scrollTop + win.innerHeight) / el.scrollHeight : 1;
                    // Якщо немає скролу (ratio==1) — панель видима; інакше показуємо при 85%
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'toggleToolbar', visible: ratio >= 0.85 }));
                }catch(e){}
            }, { passive: true });

            function onTap(e){
                try {
                    var y = (e && e.clientY) || (e && e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientY) || 0;
                    if (win.innerHeight && (y / win.innerHeight) >= 0.9) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'toggleToolbar', visible: true }));
                    }
                } catch(_) {}
            }
            doc.addEventListener('click', onTap, { passive: true });
            doc.addEventListener('touchend', onTap, { passive: true });
        } catch(e) {}
    });

    window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'debug',
        message: '[✅] Highlighted: ' + count + ' of ' + results.length
    }));
}
</script>
</body>
</html>
`, [base64, savedPage]);

    const sendCommand = (cmd) => {
        webViewRef.current?.injectJavaScript(`${cmd}; true;`);
    };

    const progressTimerRef = useRef(null);

    const handleMessage = async (event) => {
        const data = event.nativeEvent.data;

        if (data.startsWith('❌')) {
            Alert.alert('Помилка EPUB', data);
            return;
        }

        let parsed;
        try {
            parsed = JSON.parse(data);
        } catch (err) {
            console.error('❌ EPUB WebView parse error:', err);
            return;
        }

        if (parsed.type === 'progress' || parsed.type === 'init') {
            const { currentLocation: loc, totalLocations: total } = parsed;
            setCurrentPage(loc);
            if (total && total > 0) {
                const percentNum = Math.max(0, Math.min(100, Math.round((loc / total) * 100)));
                setProgressPct(percentNum);
                setShowToolbar(percentNum >= 85);
            }

            try {
                if (book?.id != null && Number.isFinite(loc)) {
                    const exists = await isBookmarked(String(book.id), Number(loc));
                    setBookmarked(!!exists);
                }
            } catch (e) {
                console.warn('isBookmarked failed:', e);
            }

            if (book?.id && (loc ?? 0) >= 0) {
                if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
                progressTimerRef.current = setTimeout(async () => {
                    try {
                        await updateBookProgress(book.id, loc, total);
                    } catch (e) {
                        console.warn('update progress failed:', e);
                    }
                }, 400);
            }
        }

        if (parsed.type === 'searchResults') {
            if (!parsed.results || parsed.results.length === 0) {
                Alert.alert('Нічого не знайдено');
            } else {
                setSearchResults(parsed.results);
                setShowResults(true);
                webViewRef.current?.injectJavaScript(`
            window.highlightSearchResults(${JSON.stringify(parsed.results)});
            true;
          `);
            }
        }

        if (parsed.type === 'toggleToolbar') {
            setShowToolbar(!!parsed.visible);
        }
    };

    useEffect(() => () => {
        if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    }, []);

    // Apply font size changes from Settings modal to the EPUB rendition
    useEffect(() => {
        try {
            const percent = Math.max(80, Math.min(300, Math.round((uiFontSize / 16) * 100)));
            setFontSizePercent(percent);
            webViewRef.current?.injectJavaScript(`
                if (window.rendition && window.rendition.themes) {
                    window.rendition.themes.fontSize("${percent}%");
                }
                true;
            `);
        } catch (e) {
            // no-op
        }
    }, [uiFontSize]);

    const toggleBookmark = async () => {
        if (bookmarked) {
            await deleteBookmark(book.id, currentPage);
            setBookmarked(false);
            Alert.alert('Закладка', `Видалено сторінку ${currentPage}`);
        } else {
            await addBookmark(book.id, currentPage);
            setBookmarked(true);
            Alert.alert('Закладка', `Збережено сторінку ${currentPage}`);
        }
    };

    return (
        <View style={{ flex: 1, paddingTop: immersive ? 0 : Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 0), backgroundColor: '#fff' }}>
            {!immersive && (
                <View style={styles.headerBar}>
                    <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.iconButton}>
                        <Ionicons name="settings-outline" size={22} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerBarTitle}>Розділ {book?.chapter ?? ''}</Text>
                    <TouchableOpacity onPress={toggleBookmark} style={styles.iconButton}>
                        <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color={bookmarked ? '#008655' : '#000'} />
                    </TouchableOpacity>
                </View>
            )}
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html }}
                javaScriptEnabled
                style={{ flex: 1 }}
                onMessage={handleMessage}
            />

            {/* search UI removed for full-screen reading */}

            <ReadingBottomToolbar
                progress={progressPct}
                onLeftPress={() => sendCommand('window.rendition.prev()')}
                onRightPress={() => sendCommand('window.rendition.next()')}
                onInfoPress={() => {}}
                onToggleImmersive={() => setImmersive(!immersive)}
                onAutoScrollPress={() => setAutoScrollVisible(true)}
                onChaptersPress={() => setChaptersVisible(true)}
                onSearchPress={() => {}}
            />

            {selectionVisible && (
                <ReadingTextSelectionToolbar
                    style={{ position: 'absolute', top: selectionPosition.y, left: selectionPosition.x }}
                    onTranslate={() => {}}
                    onUnderline={() => {}}
                    onCopy={() => {}}
                    onComment={() => {}}
                    onColorPicker={() => setSelectionVisible(false)}
                />
            )}

            {/* Settings Modal (minimal inline version) */}
            {settingsVisible && (
                <ReadingSettingsModal
                    visible={settingsVisible}
                    onClose={() => setSettingsVisible(false)}
                    state={{
                        isDarkTheme: false,
                        brightness,
                        fontSize: uiFontSize,
                        readingMode: 'Режим прокручування',
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
                        setReadingMode: () => {},
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

            {/* Chapters Drawer (minimal inline) */}
            {chaptersVisible && (
                <ReadingChaptersDrawer
                    visible={chaptersVisible}
                    onClose={() => setChaptersVisible(false)}
                    chapters={[]}
                    currentId={null}
                    readIds={[]}
                    expandedIds={expandedChapterIds}
                    onToggleExpand={(id) => setExpandedChapterIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))}
                    onSelectChapter={() => setChaptersVisible(false)}
                    currentIndex={1}
                    totalCount={22}
                    activeTab={drawerTab}
                    onChangeTab={setDrawerTab}
                    bookmarks={[]}
                />
            )}

            {/* Auto Scroll (minimal inline) */}
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

            {/* search results UI removed */}
    {/*        <ReadingSettingsScreen*/}
    {/*            visible={settingsVisible}*/}
    {/*            onClose={() => setSettingsVisible(false)}*/}
    {/*            settings={readerSettings}*/}
    {/*            onApply={(newSettings) => {*/}
    {/*                setReaderSettings(newSettings);*/}

    {/*                webViewRef.current?.injectJavaScript(`*/}
    {/*  window.rendition.themes.default({*/}
    {/*    body: {*/}
    {/*      'background': '${newSettings.theme === 'dark' ? '#1c1c1c' : newSettings.theme === 'sepia' ? '#f5ecd9' : '#fff'}',*/}
    {/*      'color': '${newSettings.theme === 'dark' ? '#fff' : '#000'}',*/}
    {/*      'font-size': '${newSettings.fontSize}px',*/}
    {/*      'line-height': '${newSettings.lineHeight}',*/}
    {/*    }*/}
    {/*  });*/}
    {/*  true;*/}
    {/*`);*/}
    {/*            }}*/}
    {/*        />*/}
        </View>
    );
}

const styles = StyleSheet.create({
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff'
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    iconButton: {
        padding: 6,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: '#eee',
    },
    toolbarPanel: {
        position: 'absolute',
        bottom: 60,
        left: 12,
        right: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 6,
        elevation: 3,
    },
    toolsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    toolButton: { padding: 6 },
    // bottomPanel removed for full-screen reading
    progressBar: { height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#008655' },
    progressBarWrap: {
        paddingHorizontal: 12,
        paddingBottom: 6,
    },
    progressText: {
        textAlign: 'right',
        color: '#008655',
        marginBottom: 4,
    },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    overlayFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 16 },
    sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    sheetTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
    sectionLabel: { color: '#000', fontWeight: '600', marginBottom: 8 },
    drawer: { position: 'absolute', top: 0, bottom: 0, left: 0, width: '85%', backgroundColor: '#fff', paddingTop: 12 },
    drawerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
    drawerTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
    overlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    centerCard: { width: '86%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        gap: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    resultContainer: {
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: '#fdfdfd',
    },
    resultIndex: {
        fontWeight: 'bold',
        marginBottom: 4,
        fontSize: 14,
        color: '#555',
    },
    bookmarkButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 6,
        elevation: 4,
    },
});

