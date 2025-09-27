import React, { useRef, useState } from 'react';
import {
    View,
    Button,
    StyleSheet,
    Alert,
    TextInput,
    FlatList,
    Text,
    TouchableOpacity,
    Modal
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import {
    addBookmark,
    deleteBookmark,
    isBookmarked,
    updateBookProgress,
} from '../shared';

export default function EpubReaderScreen({ route }) {
    const { book } = route.params;
    const webViewRef = useRef(null);

    const base64 = book.base64.replace(
        /^data:application\/epub\+zip;base64,/,
        ''
    );
    const savedPage = book.currentPage ?? 0;

    const [currentPage, setCurrentPage] = useState(savedPage);
    const [bookmarked, setBookmarked] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [restored, setRestored] = useState(false);

    const html = `
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
            "font-size": "120%",
            "line-height": "1.6",
            "text-align": "justify",
            "padding": "1em",
            "margin": "0 auto",
            "max-width": "95%",
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

    book.ready.then(() => {
        return book.locations.generate(1600);
    }).then(() => {
        totalLocations = book.locations.length();
        rendition.display();

        rendition.on("relocated", (location) => {
            currentLocation = book.locations.locationFromCfi(location.start.cfi);
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'progress',
                currentLocation,
                totalLocations
            }));
        });

        window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'init',
            totalLocations
        }));
    });

    window.book = book;
    window.rendition = rendition;
    window.currentFontSize = 120;

    window.searchInBook = async function(query) {
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
        results.forEach(result => {
            try {
                rendition.annotations.highlight(result.cfi, {}, () => {}, 'search-highlight');
            } catch (e) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'debug',
                    message: '[SKIPPED] Invalid CFI: ' + e.message
                }));
            }
        });
    }
</script>
</body>
</html>
`;

    const sendCommand = (cmd) => {
        webViewRef.current?.injectJavaScript(`${cmd}; true;`);
    };

    const handleMessage = async (event) => {
        const data = event.nativeEvent.data;

        if (data.startsWith('❌')) {
            Alert.alert('Помилка EPUB', data);
            return;
        }

        try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'init') {
                if (!restored && savedPage > 0) {
                    webViewRef.current?.injectJavaScript(`
                        (function(){
                          const cfi = window.book.locations.cfiFromLocation(${savedPage});
                          window.rendition.display(cfi);
                        })();
                        true;
                    `);
                    setRestored(true);
                }
            }

            if (parsed.type === 'progress') {
                const { currentLocation, totalLocations } = parsed;
                setCurrentPage(currentLocation);

                const exists = await isBookmarked(book.id, currentLocation);
                setBookmarked(exists);

                if (book?.id && currentLocation) {
                    await updateBookProgress(book.id, currentLocation, totalLocations);
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
        } catch (err) {
            console.error('❌ EPUB WebView parse error:', err);
        }
    };

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
        <View style={{ flex: 1, marginTop: 45 }}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html }}
                javaScriptEnabled
                style={{ flex: 1 }}
                onMessage={handleMessage}
            />

            <TouchableOpacity
                onPress={toggleBookmark}
                style={styles.bookmarkButton}
            >
                <MaterialIcons
                    name={bookmarked ? 'bookmark' : 'bookmark-border'}
                    size={28}
                    color="black"
                />
            </TouchableOpacity>

            <View style={styles.bottomPanel}>
                <View style={styles.controls}>
                    <Button title="⬅️ Назад" onPress={() => sendCommand('window.rendition.prev()')} />
                    <Button title="➡️ Вперед" onPress={() => sendCommand('window.rendition.next()')} />
                    <Button title="🔎+" onPress={() => sendCommand('window.currentFontSize += 20; window.rendition.themes.fontSize(window.currentFontSize + "%")')} />
                    <Button title="🔎−" onPress={() => sendCommand('window.currentFontSize = Math.max(80, window.currentFontSize - 20); window.rendition.themes.fontSize(window.currentFontSize + "%")')} />
                </View>
                <View style={styles.searchBar}>
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="🔍 Введіть слово для пошуку"
                        style={styles.input}
                    />
                    <Button
                        title="ЗНАЙТИ"
                        onPress={() => {
                            const queryEscaped = searchQuery.replace(/"/g, '\\"');
                            webViewRef.current?.injectJavaScript(`
                                window.searchInBook("${queryEscaped}");
                                true;
                            `);
                        }}
                    />
                </View>
            </View>

            <Modal visible={showResults} animationType="slide">
                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 10,
                        backgroundColor: '#ccc',
                    }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Результати пошуку</Text>
                        <Button title="Закрити" onPress={() => setShowResults(false)} />
                    </View>

                    <FlatList
                        data={searchResults}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => {
                            const highlighted = item.excerpt.replace(
                                new RegExp(searchQuery, 'gi'),
                                match => `<mark>${match}</mark>`
                            );
                            return (
                                <TouchableOpacity
                                    onPress={() => {
                                        webViewRef.current?.injectJavaScript(`
                                            window.rendition.display(${JSON.stringify(item.cfi)});
                                            true;
                                        `);
                                        setShowResults(false);
                                    }}
                                    style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                                >
                                    <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
                                        Результат №{index + 1}
                                    </Text>
                                    <WebView
                                        originWhitelist={['*']}
                                        source={{ html: `<div style="padding:5px;font-size:14px;">${highlighted}</div>` }}
                                        style={{ height: 60 }}
                                        scrollEnabled={false}
                                    />
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: '#eee',
    },
    bottomPanel: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#eee',
        paddingBottom: 10,
        paddingTop: 5,
        zIndex: 1,
    },
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
