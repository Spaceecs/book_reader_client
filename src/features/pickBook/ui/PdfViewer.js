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
  html, body { margin:0; padding:0; height:100%; background:#fff; }
  #viewer { height:100%; overflow-y: auto; }
  canvas { display:block; margin:0 auto 16px auto; }
  .textLayer span.highlight { background: yellow; }
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
      wrapper.style.position = 'relative';
      wrapper.appendChild(canvas);
      viewer.appendChild(wrapper);

      page.render({ canvasContext: ctx, viewport }).promise.then(() => {
        page.getTextContent().then(textContent => {
          const textLayerDiv = document.createElement('div');
          textLayerDiv.className = 'textLayer';
          textLayerDiv.style.height = canvas.height + 'px';
          textLayerDiv.style.width = canvas.width + 'px';
          wrapper.appendChild(textLayerDiv);
          pdfjsLib.renderTextLayer({ textContent, container: textLayerDiv, viewport }).promise.then(() => {
            if(searchTerm) highlightText(textLayerDiv, searchTerm);
          });
        });

        pageOffsets[pageNum-1] = wrapper.offsetTop;
        renderedCount++;
        if(renderedCount === totalPages) {
          setTimeout(() => {
            viewer.scrollTop = pageOffsets[startPage-1] || 0;
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
    for(let i=1;i<=totalPages;i++) renderPage(i);

    viewer.addEventListener('scroll', () => {
      const scrollTop = viewer.scrollTop;
      for(let i=0;i<totalPages;i++){
        if(scrollTop < pageOffsets[i]+20){
          const page = i+1;
          window.ReactNativeWebView.postMessage(JSON.stringify({ type:'progress', currentPage: page, totalPages }));
          break;
        }
      }
    });
  });

  window.changeTheme = function(theme){
    if(theme==='dark'){ viewer.style.background='#1c1c1c'; document.body.style.filter='invert(1) hue-rotate(180deg)'; }
    else if(theme==='sepia'){ viewer.style.background='#f5ecd9'; document.body.style.filter='none'; }
    else { viewer.style.background='#fff'; document.body.style.filter='none'; }
  };
  window.changeZoom = function(newScale){
    scale = newScale;
    viewer.innerHTML=''; renderedCount=0;
    for(let i=1;i<=totalPages;i++) renderPage(i);
  };
  window.searchInDocument = function(term){
    const spans = document.querySelectorAll('.textLayer span');
    spans.forEach(s=>s.classList.remove('highlight'));
    spans.forEach(s=>{
      if(s.textContent.toLowerCase().includes(term.toLowerCase())){
        s.classList.add('highlight');
      }
    });
  };
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
