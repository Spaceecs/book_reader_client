import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Button, StyleSheet, Alert, Text, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { ReadingBottomToolbar, ReadingSettingsModal, ReadingChaptersDrawer, ReadingTextSelectionModal, ReadingCommentInputModal } from '../widgets';
import {
    addBookmark,
    deleteBookmark, getOnlineBookById,
    isBookmarked,
    getBookmarksByBook,
    addComment, updateLocalBookProgress, updateOnlineBookProgress, getLocalBookById,
} from '../shared';
import { getCommentsByBook } from '../shared';
import {setLastBook} from "../entities";
import {useDispatch} from "react-redux";

export default function EpubReaderScreen({ route }) {
    const { book } = route.params;
    const insets = useSafeAreaInsets();
    const webViewRef = useRef(null);
    const dispatch = useDispatch();

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
    const [readingMode, setReadingMode] = useState('Одна сторінка');

    // Preview resolver for bookmark snippet
    const previewResolverRef = useRef(null);

    // Comments state
    const [lastSelectedText, setLastSelectedText] = useState('');
    const [commentModalVisible, setCommentModalVisible] = useState(false);
    const [commentText, setCommentText] = useState('');

    // Reader UI state (search, toc, bookmarks)
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchState, setSearchState] = useState({ term: '', activeIndex: -1, total: 0 });
    const searchDebounceRef = useRef(null);
    const [chapters, setChapters] = useState([]);
    const [currentChapterIndex, setCurrentChapterIndex] = useState(null);
    const [bookmarksList, setBookmarksList] = useState([]);
    const [commentsList, setCommentsList] = useState([]);

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
            margin: 0; padding: 0; height: 100%; width: 100%; background: #fff !important;
        }
        #viewer { height: 100%; overflow-y: auto; }
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

    // Selection bridge
    window.lastSelectedText = '';
    window.postSelectedText = function(){
        try {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'selection', text: String(window.lastSelectedText || '') }));
        } catch(_) {}
    };

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
                        // Send simplified TOC to React Native
                        try {
                            function mapToc(items) {
                                return (items || []).map((i, idx) => ({
                                    id: i.id || i.href || String(idx),
                                    title: (i.label && (i.label.trim ? i.label.trim() : i.label)) || i.title || 'Розділ',
                                    href: i.href || null,
                                    children: (i.subitems && i.subitems.length ? mapToc(i.subitems) : (i.children && i.children.length ? mapToc(i.children) : []))
                                }));
                            }
                            function normalize(h){
                                if (!h) return '';
                                return String(h).split('#')[0].split('?')[0].toLowerCase().replace(/\\\\/g, '/');
                            }
                            const simpleToc = mapToc(nav.toc || []);
                            window._topTocRaw = (simpleToc || []).map(function(x){ return { title: x.title || 'Розділ', href: x.href || '' }; });
                            window._topTocTitles = window._topTocRaw.map(function(x){ return x.title; });
                            window._topChapterLocations = new Array(window._topTocRaw.length).fill(null);

                            (async function(){
                                try {
                                    var spineItems = book.spine.spineItems || [];
                                    function findSpineItemIndexByHref(rawHref){
                                        var hrefNoHash = String(rawHref||'').split('#')[0];
                                        var normTarget = normalize(hrefNoHash);
                                        for (var i=0;i<spineItems.length;i++){
                                            var sh = normalize(spineItems[i] && spineItems[i].href);
                                            if (!sh) continue;
                                            if (sh === normTarget || sh.endsWith('/'+normTarget) || normTarget.endsWith('/'+sh)) return i;
                                        }
                                        return -1;
                                    }
                                    for (var ti=0; ti<window._topTocRaw.length; ti++){
                                        var rawHref = String(window._topTocRaw[ti].href || '');
                                        var anchor = null;
                                        var hashIdx = rawHref.indexOf('#');
                                        if (hashIdx >= 0) anchor = rawHref.slice(hashIdx + 1);
                                        var spineIdx = findSpineItemIndexByHref(rawHref);
                                        if (spineIdx >= 0){
                                            var item = spineItems[spineIdx];
                                            try {
                                                await item.load(book.load.bind(book));
                                                var cfi = null;
                                                try {
                                                    var doc = item.document;
                                                    if (anchor && doc){
                                                        var el = doc.getElementById(anchor);
                                                        if (el){
                                                            try {
                                                                var r = doc.createRange();
                                                                r.setStart(el, 0); r.setEnd(el, 0);
                                                                if (item.cfiFromRange) cfi = item.cfiFromRange(r);
                                                                if (!cfi && item.cfiFromElement) cfi = item.cfiFromElement(el);
                                                            } catch(_) {}
                                                        }
                                                    }
                                                    if (!cfi && doc){
                                                        try {
                                                            var r2 = doc.createRange();
                                                            var body = doc.body;
                                                            r2.setStart(body, 0); r2.setEnd(body, 0);
                                                            if (item.cfiFromRange) cfi = item.cfiFromRange(r2);
                                                        } catch(_) {}
                                                    }
                                                } catch(_) {}
                                                try { await item.unload(); } catch(_) {}
                                                if (cfi){
                                                    try {
                                                        var loc = book.locations.locationFromCfi(cfi);
                                                        if (typeof loc === 'number') window._topChapterLocations[ti] = loc;
                                                    } catch(_) {}
                                                }
                                            } catch(_) {}
                                        }
                                    }
                                    // Ensure chapter 1 fallback at book start
                                    try {
                                        if (Array.isArray(window._topChapterLocations) && typeof window._topChapterLocations[0] !== 'number') {
                                            window._topChapterLocations[0] = 0;
                                        }
                                    } catch(_) {}
                                } catch(_) {}
                            })();

                            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'toc', toc: simpleToc }));
                        } catch (e) {}
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

            // Determine current chapter based on book.locations numeric mapping of top-level TOC CFIs
            try {
                var currLoc = 0;
                try { currLoc = book.locations.locationFromCfi(location.start.cfi) || 0; } catch(_) {}
                var idx = null; var title = '';
                if (Array.isArray(window._topChapterLocations) && Array.isArray(window._topTocTitles)){
                    var bestIdx = -1; var bestVal = -1;
                    for (var i=0;i<window._topChapterLocations.length;i++){
                        var val = window._topChapterLocations[i];
                        if (typeof val === 'number' && val >= 0 && val <= currLoc && val >= bestVal){
                            bestVal = val; bestIdx = i;
                        }
                    }
                    if (bestIdx >= 0){
                        idx = bestIdx + 1;
                        title = window._topTocTitles[bestIdx] || '';
                    } else {
                        // At very beginning of the book before first mapped CFI
                        idx = 1;
                        title = window._topTocTitles[0] || '';
                    }
                }
                var prevIdx = (typeof window._currentChapterIndex === 'number') ? window._currentChapterIndex : null;
                if (typeof idx === 'number' && idx > 0) {
                    window._currentChapterIndex = idx;
                    window._currentChapterTitle = title;
                    if (prevIdx !== idx) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'chapter', index: idx, title: title }));
                    }
                }
            } catch(e) {}
        });

        window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'init',
            totalLocations
        }));

        // Ensure initial font size and bottom padding applied
        window.applyFontSize(${fontSizePercent});
        window.applyReadingSafePadding(${TOOLBAR_SAFE_PADDING_PX});
    });

    window.book = book;
    window.rendition = rendition;
    window.currentFontSize = 120;
    // Detect if EPUB is fixed-layout (pre-paginated) → scrolling may not be supported
    window.supportsScrolledFlow = async function(){
        try {
            var meta = (book && book.packaging && book.packaging.metadata) ? book.packaging.metadata : {};
            var layout = String((meta.layout || meta["rendition:layout"] || '')).toLowerCase();
            if (layout === 'pre-paginated') return false;
            if ((meta['fixed-layout'] === true) || (meta.fixedLayout === true)) return false;
            return true;
        } catch(_) { return true; }
    };

    // Helper to re-send TOC to React Native on demand
    window.postToc = function() {
        try {
            if (book && book.loaded && book.loaded.navigation) {
                book.loaded.navigation.then(function(navigation){
                    try {
                        function mapToc(items){
                            return (items || []).map(function(i, idx){
                                return {
                                    id: i.id || i.href || String(idx),
                                    title: (i.label && (i.label.trim ? i.label.trim() : i.label)) || i.title || 'Розділ',
                                    href: i.href || null,
                                    children: (i.subitems && i.subitems.length ? mapToc(i.subitems) : (i.children && i.children.length ? mapToc(i.children) : []))
                                };
                            });
                        }
                        function normalize(h){ if (!h) return ''; return String(h).split('#')[0].split('?')[0].toLowerCase().replace(/\\\\/g, '/'); }
                        var toc = mapToc(navigation && navigation.toc ? navigation.toc : []);
                        window._topTocRaw = (toc||[]).map(function(x){ return { title: x.title || 'Розділ', href: x.href || '' }; });
                        window._topTocTitles = window._topTocRaw.map(function(x){ return x.title; });
                        window._topChapterLocations = new Array(window._topTocRaw.length).fill(null);
                        (async function(){
                            try {
                                var spineItems = book.spine.spineItems || [];
                                function findSpineItemIndexByHref(rawHref){
                                    var hrefNoHash = String(rawHref||'').split('#')[0];
                                    var normTarget = normalize(hrefNoHash);
                                    for (var i=0;i<spineItems.length;i++){
                                        var sh = normalize(spineItems[i] && spineItems[i].href);
                                        if (!sh) continue;
                                        if (sh === normTarget || sh.endsWith('/'+normTarget) || normTarget.endsWith('/'+sh)) return i;
                                    }
                                    return -1;
                                }
                                for (var ti=0; ti<window._topTocRaw.length; ti++){
                                    var rawHref = String(window._topTocRaw[ti].href || '');
                                    var anchor = null;
                                    var hashIdx = rawHref.indexOf('#');
                                    if (hashIdx >= 0) anchor = rawHref.slice(hashIdx + 1);
                                    var spineIdx = findSpineItemIndexByHref(rawHref);
                                    if (spineIdx >= 0){
                                        var item = spineItems[spineIdx];
                                        try {
                                            await item.load(book.load.bind(book));
                                            var cfi = null;
                                            try {
                                                var doc = item.document;
                                                if (anchor && doc){
                                                    var el = doc.getElementById(anchor);
                                                    if (el){
                                                        try {
                                                            var r = doc.createRange();
                                                            r.setStart(el, 0); r.setEnd(el, 0);
                                                            if (item.cfiFromRange) cfi = item.cfiFromRange(r);
                                                            if (!cfi && item.cfiFromElement) cfi = item.cfiFromElement(el);
                                                        } catch(_) {}
                                                    }
                                                }
                                                if (!cfi && doc){
                                                    try {
                                                        var r2 = doc.createRange();
                                                        var body = doc.body;
                                                        r2.setStart(body, 0); r2.setEnd(body, 0);
                                                        if (item.cfiFromRange) cfi = item.cfiFromRange(r2);
                                                    } catch(_) {}
                                                }
                                            } catch(_) {}
                                            try { await item.unload(); } catch(_) {}
                                            if (cfi){
                                                try {
                                                    var loc = book.locations.locationFromCfi(cfi);
                                                    if (typeof loc === 'number') window._topChapterLocations[ti] = loc;
                                                } catch(_) {}
                                            }
                                        } catch(_) {}
                                    }
                                }
                            } catch(_) {}
                        })();
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'toc', toc: toc }));
                    } catch(_) {}
                }).catch(function(){});
            }
        } catch(_) {}
    };

    // Return first sentence of current section as preview
    window.getPreview = function() {
        try {
            var iframe = document.querySelector('iframe');
            var doc = iframe && iframe.contentDocument;
            var body = doc && doc.body;
            var text = body ? (body.innerText || body.textContent || '') : '';
            text = String(text || '').replace(/\s+/g, ' ').trim();
            if (!text) return '';
            var m = text.match(/[^.!?\\n\\r]{20,}?[.!?]/);
            var first = (m ? m[0] : text).slice(0, 160);
            return first;
        } catch(e) { return ''; }
    };

    // Search state and helpers (match PDF behavior)
    window._search = { results: [], active: -1, term: '' };
    window.postSearchState = function(){
        try {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'searchState',
                term: String(window._search.term||''),
                activeIndex: Number(window._search.active||-1),
                total: Array.isArray(window._search.results) ? window._search.results.length : 0
            }));
        } catch(_) {}
    };

    window.searchInBook = async function(query) {
        try { window._search.term = String(query||''); } catch(_) {}
        const results = [];
        const spineItems = book.spine.spineItems;

        for (let i = 0; i < spineItems.length; i++) {
            const item = spineItems[i];
            try {
                await item.load(book.load.bind(book));
                const doc = item.document;
                const body = doc && doc.body;
                if (!body) { try{ await item.unload(); }catch(_){}; continue; }

                const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT, null, false);
                while (walker.nextNode()) {
                    const node = walker.currentNode;
                    const text = node.textContent || '';
                    const q = String(query||'');
                    const idx = text.toLowerCase().indexOf(q.toLowerCase());
                    if (idx !== -1) {
                        const range = doc.createRange();
                        range.setStart(node, idx);
                        range.setEnd(node, idx + q.length);
                        const cfi = item.cfiFromRange(range);
                        results.push({ cfi, excerpt: text.slice(Math.max(0, idx - 30), idx + q.length + 30) });
                    }
                }
                await item.unload();
            } catch (e) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'debug', message: '[ERROR] Failed in spineItem: ' + e.message }));
            }
        }

        window._search.results = results;
        window._search.active = results.length ? 0 : -1;

        if (results.length > 0) {
            try { await rendition.display(results[0].cfi); } catch(_) {}
            try { window.highlightSearchResults(results); } catch(_) {}
        }

        window.postSearchState();
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'searchResults', results }));
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
   };

   window.searchNext = function(){
       try {
           const list = Array.isArray(window._search.results) ? window._search.results : [];
           if (!list.length) return;
           window._search.active = (Number(window._search.active||0) + 1) % list.length;
           const target = list[window._search.active];
           if (target && target.cfi) { try { rendition.display(target.cfi); } catch(_) {} }
           window.postSearchState();
       } catch(_) {}
   };

   window.searchPrev = function(){
       try {
           const list = Array.isArray(window._search.results) ? window._search.results : [];
           if (!list.length) return;
           const len = list.length;
           window._search.active = (Number(window._search.active||0) - 1 + len) % len;
           const target = list[window._search.active];
           if (target && target.cfi) { try { rendition.display(target.cfi); } catch(_) {} }
           window.postSearchState();
       } catch(_) {}
   };

   window.clearSearch = function(){
       try {
           const list = Array.isArray(window._search.results) ? window._search.results : [];
           list.forEach(r => { try { rendition.annotations.remove(r.cfi, 'highlight'); } catch(_) {} });
           window._search = { results: [], active: -1, term: '' };
           window.postSearchState();
       } catch(_) {}
   };

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

            // Selection listeners per content document
            function updateSelection() {
                try {
                    var sel = (win.getSelection && win.getSelection()) || (doc.getSelection && doc.getSelection());
                    var txt = sel && sel.toString ? sel.toString() : '';
                    if (typeof txt === 'string') {
                        window.lastSelectedText = txt.trim();
                        // Post selection to React Native
                        if (txt.trim().length > 0) {
                            window.postSelectedText();
                        }
                    }
                } catch(_) {}
            }
            doc.addEventListener('selectionchange', updateSelection, { passive: true });
            doc.addEventListener('mouseup', updateSelection, { passive: true });
            doc.addEventListener('touchend', updateSelection, { passive: true });
        } catch(e) {}
    });

    
</script>
</body>
</html>
`, [base64, savedPage]);

    const sendCommand = (cmd) => {
        webViewRef.current?.injectJavaScript(`${cmd}; true;`);
    };

    const progressTimerRef = useRef(null);
    const bookmarkGuardRef = useRef({ until: 0, page: null, value: null });
    const skipBookmarkCheckRef = useRef(0);

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
                const percentNum = Math.max(0, Math.min(100, Math.round(((Number(loc)||0) / (Number(total)||1)) * 100)));
                setProgressPct(percentNum);
                setShowToolbar(percentNum >= 85);
            }

            try {
                const guard = bookmarkGuardRef.current;
                if (guard && Date.now() < (guard.until || 0) && Math.abs(Number(loc) - Number(guard.page)) <= 1) {
                    setBookmarked(!!guard.value);
                } else if (Date.now() > (skipBookmarkCheckRef.current || 0)) {
                    if (book?.id != null && Number.isFinite(loc)) {
                        const exists = await isBookmarked(String(book.id), Number(loc));
                        setBookmarked(!!exists);
                    }
                }
            } catch (e) {
                console.warn('isBookmarked failed:', e);
            }

            if (book?.id && (loc ?? 0) >= 0) {
                if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
                progressTimerRef.current = setTimeout(async () => {

                    try {
                        console.log(book.id, loc, total)
                        if (book.onlineId) {
                            await updateOnlineBookProgress(book.id, loc, total);
                            const newBook = await getOnlineBookById(book.id);
                            dispatch(setLastBook(newBook));
                        } else {
                            await updateLocalBookProgress(book.id, loc, total);
                            const newBook = await getLocalBookById(book.id);
                            dispatch(setLastBook(newBook));
                        }
                        // refresh bookmarks list and comments for drawer
                        try {
                            const list = await getBookmarksByBook(String(book.id));
                            setBookmarksList(Array.isArray(list) ? list : []);
                        } catch (e) { console.warn('bookmarks refresh failed:', e); }
                        try {
                            const clist = await getCommentsByBook(String(book.id));
                            setCommentsList(Array.isArray(clist) ? clist : []);
                        } catch (_) {}
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

        if (parsed.type === 'searchState') {
            setSearchState({
                term: String(parsed.term || ''),
                activeIndex: Number.isFinite(parsed.activeIndex) ? Number(parsed.activeIndex) : -1,
                total: Number.isFinite(parsed.total) ? Number(parsed.total) : 0,
            });
        }

        if (parsed.type === 'chapter') {
            try {
                if (typeof parsed.index === 'number' && parsed.index > 0) {
                    setCurrentChapterIndex(parsed.index);
                }
            } catch (_) {}
        }

        if (parsed.type === 'previewEcho') {
            try {
                const txt = (parsed && parsed.text) || '';
                if (previewResolverRef.current) {
                    previewResolverRef.current(String(txt || ''));
                    previewResolverRef.current = null;
                }
            } catch (_) {}
            return;
        }

        if (parsed.type === 'cfiEcho') {
            // No direct set here; CFI is saved alongside bookmark as available
            return;
        }

        if (parsed.type === 'selection') {
            const text = (parsed && parsed.text) || '';
            setLastSelectedText(text);
            if (text && text.trim().length > 0) {
                setSelectionVisible(true);
                // Position is approximated; for simplicity, keep toolbar at saved position
            }
        }

        if (parsed.type === 'toc') {
            try {
                setChapters(Array.isArray(parsed.toc) ? parsed.toc : []);
            } catch (_) {}
        }
    };

    useEffect(() => () => {
        if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    }, []);

    // Refresh lists when opening drawer or book changes
    useEffect(() => {
        if (chaptersVisible) {
            refreshLists();
            // Ask WebView to re-post TOC in case it was missed earlier
            try { webViewRef.current?.injectJavaScript('window.postToc && window.postToc(); true;'); } catch(_) {}
        }
    }, [chaptersVisible, book?.id]);

    const getPreviewText = async () => {
        try {
            return await new Promise((resolve) => {
                previewResolverRef.current = resolve;
                // Fallback timeout
                setTimeout(() => {
                    if (previewResolverRef.current) {
                        previewResolverRef.current('');
                        previewResolverRef.current = null;
                    }
                }, 400);
                webViewRef.current?.injectJavaScript(`(function(){try{var t=String(window.getPreview?window.getPreview():''); window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'previewEcho', text: t }));}catch(_){}})(); true;`);
            });
        } catch (_) {
            return '';
        }
    };

    // Apply font size changes
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
        } catch (e) {}
    }, [uiFontSize]);

    // Apply theme background and text color
    useEffect(() => {
        try {
            const bg = selectedTheme;
            const fg = (bg || '').toLowerCase() === '#2a2d3a' ? '#ffffff' : '#000000';
            webViewRef.current?.injectJavaScript(`
                try {
                    window.rendition && window.rendition.themes && window.rendition.themes.default({
                        body: {
                            'background': '${bg}',
                            'color': '${fg}',
                        }
                    });
                } catch(_) {}
                true;
            `);
        } catch (e) {}
    }, [selectedTheme]);

    // Apply reading mode changes (paginate vs scroll). Keep current location when switching.
    useEffect(() => {
        try {
            if (!webViewRef.current) return;
            const flow = readingMode === 'Режим прокручування' ? 'scrolled-continuous' : 'paginated';
            webViewRef.current.injectJavaScript(`(function(){
                try {
                    var cfi = null;
                    if (window.rendition && window.rendition.location && window.rendition.location.start) {
                        cfi = window.rendition.location.start.cfi || null;
                    }
                    if (window.rendition && window.rendition.flow) {
                        // If book is fixed-layout, keep paginated despite user choice
                        var desired = '${flow}';
                        try { if (typeof window.supportsScrolledFlow==='function') { var ok = window.supportsScrolledFlow(); if (ok && ok.then) { ok.then(function(res){ if(!res) desired='paginated'; window.rendition.flow(desired); }); } else { if(!ok) desired='paginated'; window.rendition.flow(desired); } } else { window.rendition.flow(desired); } } catch(_) { window.rendition.flow(desired); }
                        // ensure content documents are scrollable in scrolled modes
                        if (desired.indexOf('scrolled')===0) {
                          try {
                            window.rendition.hooks.content.register(function(contents){
                              try{
                                var d = contents.document; var de = d.documentElement; var b = d.body;
                                de.style.overflowY = 'auto'; b.style.overflowY = 'auto';
                                de.style.overflowX = 'hidden'; b.style.overflowX = 'hidden';
                                de.style.height = 'auto'; b.style.height = 'auto';
                                de.style.minHeight = '100vh'; b.style.minHeight = '100vh';
                                de.style.margin = '0'; b.style.margin = '0';
                                de.style.webkitOverflowScrolling = 'touch'; b.style.webkitOverflowScrolling = 'touch';
                                // force block flow for common elements to avoid page-sized containers
                                var tags = ['section','article','div'];
                                for (var i=0;i<tags.length;i++) {
                                  try { contents.window.document.querySelectorAll(tags[i]).forEach(function(el){ el.style.display='block'; el.style.height='auto'; }); } catch(_) {}
                                }
                              }catch(_){}}
                            );
                          }catch(_){}
                        }
                    }
                    if (cfi) {
                        setTimeout(function(){
                            try {
                                window.rendition.display(cfi);
                                // Re-apply reading CSS after flow change
                                if (typeof window.applyFontSize==='function') window.applyFontSize(${fontSizePercent});
                                if (typeof window.applyReadingSafePadding==='function') window.applyReadingSafePadding(${TOOLBAR_SAFE_PADDING_PX});
                                // fallback to scrolled-doc if still not scrollable
                                if (desired.indexOf('scrolled')===0) {
                                  try{
                                    var ifr = document.querySelector('iframe');
                                    var doc = ifr && ifr.contentDocument; var win = ifr && ifr.contentWindow;
                                    if (doc && win){
                                      var el = doc.scrollingElement || doc.documentElement || doc.body;
                                      var canScroll = el && (el.scrollHeight - win.innerHeight) > 8;
                                      if (!canScroll && window.rendition && window.rendition.flow){
                                        window.rendition.flow('scrolled-doc');
                                      }
                                    }
                                  }catch(_){}
                                }
                            } catch(_){ }
                        }, 0);
                    }
                } catch(_) {}
            })(); true;`);
        } catch (e) {}
    }, [readingMode]);

    const refreshLists = async () => {
        try {
            if (book?.id != null) {
                const list = await getBookmarksByBook(String(book.id));
                setBookmarksList(Array.isArray(list) ? list : []);
            }
        } catch (_) {}
        try {
            if (book?.id != null) {
                const clist = await getCommentsByBook(String(book.id));
                setCommentsList(Array.isArray(clist) ? clist : []);
            }
        } catch (_) {}
    };

    const toggleBookmark = async () => {
        try {
            if (bookmarked) {
                const pageNum = Number(currentPage) || 0;
                await deleteBookmark(String(book.id), pageNum);
                setBookmarked(false);
                // локально видаляємо з відображення
                setBookmarksList((prev) => Array.isArray(prev) ? prev.filter((b) => Number(b.position) !== pageNum) : []);
                Alert.alert('Закладка', `Видалено сторінку ${currentPage}`);
                bookmarkGuardRef.current = { until: Date.now() + 3000, page: pageNum, value: false };
            } else {
                const pageNum = Number(currentPage) || 0;
                const preview = await getPreviewText();
                // try capture CFI
                let currentCfi = null;
                try {
                    webViewRef.current?.injectJavaScript(`(function(){try{var c=null; if(window.rendition && window.rendition.location && window.rendition.location.start){ c=window.rendition.location.start.cfi||null;} window.ReactNativeWebView.postMessage(JSON.stringify({type:'cfiEcho', cfi:c}));}catch(_){}})(); true;`);
                } catch(_) {}
                await addBookmark(String(book.id), pageNum, preview || null, currentCfi, 'local');
                setBookmarked(true);
                // локально додаємо для миттєвого відображення у Drawer
                setBookmarksList((prev) => [{ id: `tmp_${Date.now()}`, bookId: String(book.id), chapter: (preview || '').trim(), position: pageNum, cfi: currentCfi, userId: 'local', createdAt: new Date().toISOString() }, ...(Array.isArray(prev) ? prev : [])]);
                Alert.alert('Закладка', `Збережено сторінку ${currentPage}`);
                bookmarkGuardRef.current = { until: Date.now() + 3000, page: pageNum, value: true };
            }
            skipBookmarkCheckRef.current = Date.now() + 1000;
        } catch (_) {}
        await refreshLists();
    };

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
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html }}
                javaScriptEnabled
                style={{ flex: 1 }}
                onMessage={handleMessage}
            />

            {/* Top search overlay bar + suggestions */}
            {searchVisible && (
                <View style={styles.topSearchBar}>
                    <TextInput
                        style={styles.topSearchInput}
                        placeholder="Пошук у книзі"
                        placeholderTextColor="#666"
                        value={searchQuery}
                        onChangeText={(t) => {
                            setSearchQuery(t);
                            try { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); } catch(_) {}
                            searchDebounceRef.current = setTimeout(() => {
                                try {
                                    const val = String(t || '').trim();
                                    if (val.length === 0) {
                                        setShowResults(false);
                                        setSearchResults([]);
                                        sendCommand('window.clearSearch()');
                                    } else {
                                        const q = JSON.stringify(val);
                                        sendCommand(`window.searchInBook(${q})`);
                                    }
                                } catch(_) {}
                            }, 250);
                        }}
                        returnKeyType="search"
                        onSubmitEditing={() => {
                            const q = JSON.stringify(String(searchQuery||'').trim());
                            sendCommand(`window.searchInBook(${q})`);
                        }}
                    />
                    <View style={styles.topSearchControls}>
                        <Text style={styles.topSearchCount}>{searchState.total > 0 ? `${(searchState.activeIndex+1)} / ${searchState.total}` : '0 / 0'}</Text>
                        <TouchableOpacity style={styles.navBtn} onPress={() => sendCommand('window.searchPrev()')}>
                            <Text style={styles.navLabel}>◀</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navBtn} onPress={() => sendCommand('window.searchNext()')}>
                            <Text style={styles.navLabel}>▶</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => { setSearchVisible(false); sendCommand('window.clearSearch()'); }}>
                            <Text style={styles.closeLabel}>✕</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {searchVisible && showResults && Array.isArray(searchResults) && searchResults.length > 0 && (
                <View style={styles.suggestionsPanel}>
                    <ScrollView style={{ maxHeight: 320 }}>
                        {searchResults.map((r, idx) => (
                            <TouchableOpacity
                                key={String(idx)}
                                style={styles.suggestionItem}
                                onPress={() => {
                                    try { const c = String(r.cfi || ''); sendCommand(`window.rendition.display(${JSON.stringify(c)})`); } catch(_) {}
                                    setShowResults(false);
                                }}
                            >
                                <Text style={styles.suggestionIndex}>Збіг {idx + 1}</Text>
                                <Text style={styles.suggestionText}>{String(r.excerpt || '').trim()}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            <ReadingBottomToolbar
                progress={progressPct}
                onLeftPress={() => sendCommand('window.rendition.prev()')}
                onRightPress={() => sendCommand('window.rendition.next()')}
                onInfoPress={() => {}}
                onToggleImmersive={() => setImmersive(!immersive)}
                onAutoScrollPress={() => setAutoScrollVisible(true)}
                onChaptersPress={() => setChaptersVisible(true)}
                onSearchPress={() => setSearchVisible(true)}
            />

            <ReadingTextSelectionModal
                visible={selectionVisible}
                onClose={() => setSelectionVisible(false)}
                onAddComment={() => {
                    setSelectionVisible(false);
                    setCommentText('');
                    setCommentModalVisible(true);
                }}
                onHighlight={(color) => {
                    // Highlight functionality - can be implemented later
                    setSelectionVisible(false);
                }}
                onCopy={async () => {
                    try {
                        if (lastSelectedText) {
                            await Clipboard.setStringAsync(lastSelectedText);
                            Alert.alert('Скопійовано!');
                        }
                    } catch (err) {
                        console.log('Copy error:', err);
                    }
                    setSelectionVisible(false);
                }}
                onDelete={() => {
                    setSelectionVisible(false);
                }}
            />

            {/* Settings Modal (minimal inline version) */}
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

            {/* Chapters Drawer (minimal inline) */}
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
                            if (ch && ch.href) {
                                const href = String(ch.href).replace(/"/g, '\\"');
                                sendCommand(`window.rendition.display("${href}")`);
                            }
                        } catch (_) {}
                        setChaptersVisible(false);
                    }}
                    currentIndex={currentChapterIndex || 1}
                    totalCount={chapters.length || 0}
                    activeTab={drawerTab}
                    onChangeTab={setDrawerTab}
                    bookmarks={(() => {
                        try {
                            const bm = Array.isArray(bookmarksList) ? bookmarksList : [];
                            const cm = Array.isArray(commentsList) ? commentsList : [];
                            const mapped = [
                                ...bm.map((b) => ({ id: `bm_${b.id}`, type: 'Закладка', meta: `Ст ${b.position}`, text: String(b.chapter || '').trim(), page: b.position, kind: 'bookmark' })),
                                ...cm.map((c) => ({ id: `cm_${c.id}`, type: 'Коментар', meta: `Сторінка ${c.page}`, text: c.selectedText || c.comment || '', page: c.page, kind: 'comment' })),
                            ];
                            return mapped.length ? mapped : [];
                        } catch(_) { return []; }
                    })()}
                    onSelectBookmark={(item) => {
                        try {
                            const page = Number(item && item.page);
                            if (Number.isFinite(page)) {
                                // For EPUB, page is a location index; use locations.cfiFromLocation if needed.
                                // Here we display by percentage of locations if possible. As a simple approach, try display by location index.
                                sendCommand(`(function(){
                                    try{
                                        var loc = Number(${page});
                                        var cfi = (window.book && window.book.locations && window.book.locations.cfiFromLocation) ? window.book.locations.cfiFromLocation(loc) : null;
                                        if (cfi) { window.rendition.display(cfi); } else { window.rendition.display(); }
                                    }catch(e){ window.rendition.display(); }
                                })()`);
                            }
                        } catch(_) {}
                        setChaptersVisible(false);
                    }}
                    onDeleteBookmark={async (bm) => {
                        try {
                            const page = Number(bm && bm.page);
                            if (book?.id != null && Number.isFinite(page)) {
                                await deleteBookmark(String(book.id), page);
                                await refreshLists();
                            }
                        } catch(_) {}
                    }}
                />
            )}

            {/* Old search modal removed – using top overlay search instead */}

            {/* Comment Input Modal */}
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
                            }
                        } catch (_) {}
                        setCommentModalVisible(false);
                    }}
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
    // Search overlay styles (same as PDF)
    topSearchBar: {
        position: 'absolute',
        top: 8,
        left: 8,
        right: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    topSearchInput: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginRight: 8,
    },
    topSearchControls: { flexDirection: 'row', alignItems: 'center' },
    topSearchCount: { color: '#111', marginRight: 8 },
    navBtn: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#ddd', marginHorizontal: 2, backgroundColor: '#f7f7f7' },
    navLabel: { color: '#111', fontWeight: '700' },
    closeBtn: { paddingHorizontal: 8, paddingVertical: 4, marginLeft: 4 },
    closeLabel: { color: '#111', fontSize: 16 },
    suggestionsPanel: {
        position: 'absolute',
        top: 52,
        left: 8,
        right: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        elevation: 3,
    },
    suggestionItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    suggestionIndex: {
        fontWeight: '700',
        color: '#555',
        marginBottom: 4,
    },
    suggestionText: {
        color: '#111',
    },
});