import React, { useRef } from 'react';
import { WebView } from 'react-native-webview';
import { updateBookProgress } from '../../../shared';
export function EpubViewer({ path, bookId }) {
    const webViewRef = useRef(null);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <script src="https://unpkg.com/epubjs/dist/epub.min.js"></script>
  <style>
    html, body { margin; padding; height: 100%; background; }
    #viewer { height: 100%; }
  </style>
</head>
<body>
  <div id="viewer"></div>
  <script>
    const book = ePub("${path}");
    const rendition = book.renderTo("viewer", {
      width: "100%",
      height: "100%",
      spread: "none"
    });

    book.ready.then(() => book.locations.generate(1600)).then(() => {
      const totalPages = book.locations.length();
      const currentPage = book.rendition.location ?
        book.locations.locationFromCfi(book.rendition.location.start.cfi) ;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'init',
        currentPage,
        totalPages
      }));
    });

    rendition.display();

    rendition.on("relocated", (location) => {
      const totalPages = book.locations.length();
      const currentPage = book.locations.locationFromCfi(location.start.cfi);
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'progress',
        currentPage,
        totalPages
      }));
    });

    window.book = book;
    window.rendition = rendition;
    window.currentFontSize = 100;

    // Optional: search clearing helpers for consistency with Reader screen
    window.clearSearch = function(){
      try {
        if (window._search && Array.isArray(window._search.results)) {
          window._search.results.forEach(function(r){ try { rendition.annotations.remove(r.cfi, 'highlight'); } catch(_){} });
        }
        window._search = { results: [], active: -1, term: '' };
        try { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'searchResults', results: [] })); } catch(_) {}
        try { if (typeof window.clearDomSelections === 'function') window.clearDomSelections(); } catch(_) {}
      } catch(_) {}
    };
    window.clearSearchHard = function(){
      try {
        if (rendition && rendition.annotations && rendition.annotations._annotations) {
          var list = Array.isArray(rendition.annotations._annotations) ? rendition.annotations._annotations.slice() : [];
          list.forEach(function(a){
            try { if (a && a.cfiRange) { rendition.annotations.remove(a.cfiRange, 'highlight'); } } catch(_){}
          });
        }
        try { if (typeof window.clearDomSelections === 'function') window.clearDomSelections(); } catch(_) {}
      } catch(_) {}
    };

    window.clearDomSelections = function(){
      try {
        var ifr = document.querySelector('iframe');
        if (ifr) {
          try {
            var w = ifr.contentWindow; var d = ifr.contentDocument;
            if (w && w.getSelection) { var sel = w.getSelection(); if (sel && sel.removeAllRanges) sel.removeAllRanges(); }
            if (d) { try { d.querySelectorAll('.epubjs-hl').forEach(function(el){ try { el.parentNode && el.parentNode.removeChild(el); } catch(_){} }); } catch(_){} }
          } catch(_) {}
        }
        try { var s = window.getSelection && window.getSelection(); if (s && s.removeAllRanges) s.removeAllRanges(); } catch(_) {}
      } catch(_) {}
    };
  </script>
</body>
</html>
`;

    const handleMessage = (event) => {
        const data = event.nativeEvent.data;
        try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'init' || parsed.type === 'progress') {
                console.log('📘 EPUB Viewer Progress:', parsed);
                if (bookId && parsed.currentPage) {
                    updateBookProgress(bookId, parsed.currentPage, parsed.totalPages);
                }
            }
        } catch (e) {
            console.warn('❌ JSON parse error:', e);
        }
    };

    return (
        <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html }}
            javaScriptEnabled
            style={{ flex: 1 }}
            onMessage={handleMessage}
        />
    );
}
