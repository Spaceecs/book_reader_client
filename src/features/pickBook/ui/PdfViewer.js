import React, { forwardRef, useRef, useImperativeHandle, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export const PdfViewer = forwardRef(({ base64, currentPage = 1, searchTerm = '', onMessage }, ref) => {
    const webViewRef = useRef(null);

    const sanitizedBase64 = useMemo(
        () => base64.replace(/^data:application\/pdf;base64,/, ''),
        [base64]
    );

    useImperativeHandle(ref, () => ({
        injectJavaScript: (script) => {
            webViewRef.current?.injectJavaScript(script);
        },
    }));

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css" />
<style>
  :root { --page-bg:#fff; --text-color:#000; --canvas-filter:none; --canvas-blend:normal; }
  html, body { margin:0; padding:0; height:100%; background:#fff; }
  #viewer { height:100%; overflow-y: auto; }
  .pageWrapper { position: relative; background: var(--page-bg); }
  canvas { display:block; margin:0 auto 16px auto; filter: var(--canvas-filter); mix-blend-mode: var(--canvas-blend); }
  .textLayer { color: var(--text-color); }
  .textLayer span.highlight { background: yellow; }
  .textLayer span.active-highlight { background: #ffcc00; outline: 2px solid #ffcc00; }
</style>
</head>
<body>
<div id="viewer"></div>
<script>
  const pdfData = atob("${sanitizedBase64}");
  const viewer = document.getElementById("viewer");
  const startPage = ${currentPage};
  const searchTerm = ${JSON.stringify(searchTerm)};
  let pdfDoc = null;
  let pageOffsets = [];
  let totalPages = 0;
  let renderedCount = 0;
  let scale = 1;
  let currentVisiblePage = startPage;
  let renderMode = 'scrolled'; // 'scrolled' | 'single'
  let initialTargetPage = startPage;
  // Search state
  window._search = { term: '', indices: [], active: -1 };

  function postSearchState(){
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'searchState',
        term: window._search.term,
        activeIndex: window._search.active,
        total: (window._search.indices||[]).length
      }));
    } catch(_) {}
  }
  function applyRenderMode(){
    try {
      const wrappers = Array.from(viewer.children);
      if (renderMode === 'single') {
        wrappers.forEach((w, i) => { w.style.display = (i === (currentVisiblePage-1)) ? 'block' : 'none'; });
        window.ReactNativeWebView.postMessage(JSON.stringify({ type:'progress', currentPage: currentVisiblePage, totalPages }));
      } else {
        wrappers.forEach((w) => { w.style.display = 'block'; });
        viewer.scrollTop = pageOffsets[currentVisiblePage-1] || 0;
        window.ReactNativeWebView.postMessage(JSON.stringify({ type:'progress', currentPage: currentVisiblePage, totalPages }));
      }
    } catch(_) {}
  }

  function highlightText(textLayerDiv, term) {
    const spans = textLayerDiv.querySelectorAll('span');
    spans.forEach(span => {
      if(span.textContent.toLowerCase().includes(term.toLowerCase())) {
        span.classList.add('highlight');
      }
    });
  }

  function renderPage(pageNum) {
    pdfDoc.getPage(pageNum).then(page => {
      const viewport = page.getViewport({ scale: (window.innerWidth / page.getViewport({ scale:1 }).width) * scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      const wrapper = document.createElement('div');
      wrapper.className = 'pageWrapper';
      if (renderMode === 'single') {
        wrapper.style.display = 'none'; // only currently visible page is shown
      }
      wrapper.appendChild(canvas);
      viewer.appendChild(wrapper);

      page.render({ canvasContext: ctx, viewport }).promise.then(() => {
        page.getTextContent().then(textContent => {
          const textLayerDiv = document.createElement('div');
          textLayerDiv.className = 'textLayer';
          textLayerDiv.style.height = canvas.height + 'px';
          textLayerDiv.style.width = canvas.width + 'px';
          textLayerDiv.style.fontSize = (16) + 'px';
          wrapper.appendChild(textLayerDiv);
          pdfjsLib.renderTextLayer({ textContent, container: textLayerDiv, viewport }).promise.then(() => {
            if(searchTerm) highlightText(textLayerDiv, searchTerm);
          });
        });

        pageOffsets[pageNum-1] = wrapper.offsetTop;
        renderedCount++;
        if(renderedCount === totalPages) {
          setTimeout(() => {
            const target = initialTargetPage || startPage;
            if (renderMode === 'scrolled') {
              viewer.scrollTop = pageOffsets[target-1] || 0;
            } else {
              currentVisiblePage = target;
              applyRenderMode();
              window.ReactNativeWebView.postMessage(JSON.stringify({ type:'progress', currentPage: target, totalPages }));
            }
          }, 200);
        }

        if(pageNum === 1){
          window.ReactNativeWebView.postMessage(JSON.stringify({ type:'init', currentPage: startPage }));
        }
      });
    });
  }

  pdfjsLib.getDocument({ data: pdfData }).promise.then(doc => {
    pdfDoc = doc;
    totalPages = pdfDoc.numPages;
    try { window._totalPages = totalPages; } catch(_) {}
    for(let i=1;i<=totalPages;i++) renderPage(i);

    viewer.addEventListener('scroll', () => {
      const scrollTop = viewer.scrollTop;
      if (renderMode === 'scrolled') {
        for(let i=0;i<totalPages;i++){
          if(scrollTop < pageOffsets[i]+20){
            const page = i+1;
            currentVisiblePage = page;
            window.ReactNativeWebView.postMessage(JSON.stringify({ type:'progress', currentPage: page, totalPages }));
            break;
          }
        }
      }
    });

    // Build TOC (outline) and send to RN
    (async function(){
      try {
        const outline = await pdfDoc.getOutline();
        async function toSimple(items){
          const out = [];
          for (let i=0;i<(items||[]).length;i++){
            const it = items[i];
            const node = { id: String(i) + '_' + (it.title||'').slice(0,16), title: it.title || 'Розділ', page: null, children: [] };
            try {
              let destArr = null;
              if (typeof it.dest === 'string') {
                destArr = await pdfDoc.getDestination(it.dest);
              } else if (Array.isArray(it.dest)) {
                destArr = it.dest;
              }
              if (Array.isArray(destArr) && destArr[0]){
                const pageIndex = await pdfDoc.getPageIndex(destArr[0]);
                node.page = Number(pageIndex) + 1;
              }
            } catch(_) {}
            if (Array.isArray(it.items) && it.items.length){
              node.children = await toSimple(it.items);
            }
            out.push(node);
          }
          return out;
        }
        let toc = await toSimple(outline || []);
        if (!toc || toc.length === 0) {
          // Fallback: synthetic TOC per page (uses page labels if provided)
          let labels = null;
          try { labels = await pdfDoc.getPageLabels(); } catch(_) {}
          toc = Array.from({ length: totalPages }, (_, i) => ({
            id: 'p' + (i + 1),
            title: (labels && labels[i]) ? String(labels[i]) : ('Сторінка ' + (i + 1)),
            page: i + 1,
            children: []
          }));
        }
        window._lastToc = toc;
        window.ReactNativeWebView.postMessage(JSON.stringify({ type:'toc', toc }));
      } catch(_) {}
    })();
  });

  // Allow RN to re-request TOC at any time
  window.postOutline = function(){
    try {
      var toc = Array.isArray(window._lastToc) ? window._lastToc : [];
      if (!toc.length && typeof window._totalPages === 'number' && window._totalPages > 0) {
        toc = Array.from({ length: window._totalPages }, (_, i) => ({ id: 'p'+(i+1), title: 'Сторінка ' + (i + 1), page: i + 1, children: [] }));
        window._lastToc = toc;
      }
      window.ReactNativeWebView.postMessage(JSON.stringify({ type:'toc', toc }));
    } catch(_) {}
  };

  window.changeTheme = function(theme){
    try {
      if(theme==='dark'){
        document.documentElement.style.setProperty('--page-bg', '#1c1c1c');
        document.documentElement.style.setProperty('--text-color', '#ffffff');
        document.documentElement.style.setProperty('--canvas-filter', 'invert(1) hue-rotate(180deg)');
        document.documentElement.style.setProperty('--canvas-blend', 'normal');
        viewer.style.background = '#1c1c1c';
      } else if(theme==='sepia'){
        document.documentElement.style.setProperty('--page-bg', '#f5ecd9');
        document.documentElement.style.setProperty('--text-color', '#3b2f24');
        // Tint page content towards paper-like color
        document.documentElement.style.setProperty('--canvas-filter', 'sepia(0.35) saturate(1.1) hue-rotate(-10deg) brightness(0.98)');
        // Multiply with background to colorize white areas
        document.documentElement.style.setProperty('--canvas-blend', 'multiply');
        viewer.style.background = '#f5ecd9';
      } else {
        document.documentElement.style.setProperty('--page-bg', '#ffffff');
        document.documentElement.style.setProperty('--text-color', '#000000');
        document.documentElement.style.setProperty('--canvas-filter', 'none');
        document.documentElement.style.setProperty('--canvas-blend', 'normal');
        viewer.style.background = '#ffffff';
      }
    } catch(_) {}
  };
  window.changeZoom = function(newScale){
    scale = newScale;
    initialTargetPage = currentVisiblePage || 1;
    viewer.innerHTML=''; renderedCount=0; pageOffsets=[];
    for(let i=1;i<=totalPages;i++) renderPage(i);
  };
  window.changeTextSize = function(mult){
    // For PDFs коректне виділення можливе лише при однаковому масштабі canvas і textLayer → використовуємо загальний zoom
    var m = Math.max(0.75, Math.min(2.5, Number(mult)||1));
    window.changeZoom(m);
  };
  window.goToPage = function(p){
    const n = Math.max(1, Math.min(totalPages, Number(p)||1));
    if (renderMode === 'scrolled') {
      viewer.scrollTop = pageOffsets[n-1] || 0;
    } else {
      const wrappers = Array.from(viewer.children);
      wrappers.forEach((w, i) => { w.style.display = (i === (n-1)) ? 'block' : 'none'; });
      currentVisiblePage = n;
      window.ReactNativeWebView.postMessage(JSON.stringify({ type:'progress', currentPage: n, totalPages }));
    }
  };
  window.goNextPage = function(){ window.goToPage(currentVisiblePage + 1); };
  window.goPrevPage = function(){ window.goToPage(currentVisiblePage - 1); };
  window.getCurrentPage = function(){ return currentVisiblePage; };
  window.setRenderMode = function(mode){ renderMode = (mode === 'single') ? 'single' : 'scrolled'; applyRenderMode(); };
  window.getPagePreview = function(p){
    const n = Math.max(1, Math.min(totalPages, Number(p)||1));
    pdfDoc.getPage(n).then(page => page.getTextContent()).then(tc => {
      const txt = (tc.items||[]).map(it=>it.str).join(' ').replace(/\s+/g,' ').trim();
      const snippet = txt ? txt.slice(0,160) : '';
      window.ReactNativeWebView.postMessage(JSON.stringify({ type:'pdfPreviewEcho', page:n, text: snippet }));
    }).catch(()=>{
      window.ReactNativeWebView.postMessage(JSON.stringify({ type:'pdfPreviewEcho', page:n, text: '' }));
    });
  };
  window.searchInDocument = function(term){
    const spans = document.querySelectorAll('.textLayer span');
    spans.forEach(s=>s.classList.remove('highlight'));
    spans.forEach(s=>{
      if(s.textContent.toLowerCase().includes(String(term||'').toLowerCase())){
        s.classList.add('highlight');
      }
    });
  };

  // Full search with results list (index + excerpt) similar to Bookzy app
  window.searchInPdf = function(query){
    try {
      const term = String(query || '').trim();
      const spans = document.querySelectorAll('.textLayer span');
      const results = [];
      // reset highlights
      spans.forEach(s=>{ s.classList.remove('highlight'); s.classList.remove('active-highlight'); });
      if (!term) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'searchResults', results: [] }));
        window._search = { term: '', indices: [], active: -1 };
        postSearchState();
        return;
      }
      const matchIndices = [];
      spans.forEach((span, index) => {
        const text = span.textContent || '';
        const lower = text.toLowerCase();
        const q = term.toLowerCase();
        const pos = lower.indexOf(q);
        if (pos !== -1) {
          const excerpt = text.slice(Math.max(0, pos - 30), pos + q.length + 30);
          results.push({ index, excerpt });
          matchIndices.push(index);
          span.classList.add('highlight');
        }
      });
      // set active to first result
      if (matchIndices.length > 0) {
        try {
          const spansAll = document.querySelectorAll('.textLayer span');
          const activeSpan = spansAll[matchIndices[0]];
          if (activeSpan) { activeSpan.classList.add('active-highlight'); activeSpan.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        } catch(_) {}
      }
      window._search = { term, indices: matchIndices, active: matchIndices.length ? 0 : -1 };
      postSearchState();
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'searchResults', results }));
    } catch(_) {
      try { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'searchResults', results: [] })); } catch(__) {}
    }
  };

  window.scrollToResult = function(index){
    try {
      const spans = document.querySelectorAll('.textLayer span');
      if (spans && spans[index]) {
        // move active marker
        document.querySelectorAll('.textLayer span.active-highlight').forEach(s=>s.classList.remove('active-highlight'));
        spans[index].classList.add('active-highlight');
        spans[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        // update active if index belongs to current results
        const pos = (window._search.indices||[]).indexOf(index);
        if (pos >= 0) { window._search.active = pos; postSearchState(); }
      }
    } catch(_) {}
  };

  window.searchNext = function(){
    try {
      const list = window._search.indices || [];
      if (!list.length) return;
      window._search.active = (window._search.active + 1) % list.length;
      const spans = document.querySelectorAll('.textLayer span');
      document.querySelectorAll('.textLayer span.active-highlight').forEach(s=>s.classList.remove('active-highlight'));
      const idx = list[window._search.active];
      const el = spans[idx];
      if (el) { el.classList.add('active-highlight'); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      postSearchState();
    } catch(_) {}
  };

  window.searchPrev = function(){
    try {
      const list = window._search.indices || [];
      if (!list.length) return;
      window._search.active = (window._search.active - 1 + list.length) % list.length;
      const spans = document.querySelectorAll('.textLayer span');
      document.querySelectorAll('.textLayer span.active-highlight').forEach(s=>s.classList.remove('active-highlight'));
      const idx = list[window._search.active];
      const el = spans[idx];
      if (el) { el.classList.add('active-highlight'); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      postSearchState();
    } catch(_) {}
  };

  window.clearSearch = function(){
    try {
      document.querySelectorAll('.textLayer span.highlight').forEach(s=>s.classList.remove('highlight'));
      document.querySelectorAll('.textLayer span.active-highlight').forEach(s=>s.classList.remove('active-highlight'));
      window._search = { term: '', indices: [], active: -1 };
      postSearchState();
    } catch(_) {}
  };

  // Selection bridge for comments
  function postSelection(){
    try{
      const sel = window.getSelection && window.getSelection();
      const txt = sel && sel.toString ? sel.toString() : '';
      const value = String(txt || '').trim();
      if (value) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'selection', text: value }));
      }
    }catch(e){}
  }
  document.addEventListener('mouseup', postSelection, { passive: true });
  document.addEventListener('touchend', postSelection, { passive: true });
</script>
</body>
</html>
`;

    return (
        <View style={{ flex: 1 }}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html }}
                javaScriptEnabled
                domStorageEnabled
                style={{ flex: 1 }}
                startInLoadingState
                onMessage={onMessage}
                renderLoading={() => (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" />
                    </View>
                )}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
