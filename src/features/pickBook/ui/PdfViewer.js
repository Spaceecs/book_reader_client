import React, {
    forwardRef,
    useMemo,
    useRef,
    useImperativeHandle,
} from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const PdfViewer = forwardRef(
    ({ base64, onMessage, currentPage, searchTerm }, ref) => {
        const webViewRef = useRef(null);

        const sanitizedBase64 = useMemo(() => {
            return base64
                .replace(/^data:application\/pdf;base64,/, '')
                .replace(/\s/g, '');
        }, [base64]);

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
    html, body {
      margin; padding; height: 100%;
      background: #fff; overflow;
    }
    #viewer {
      height: 100%;
      overflow-y;
      -webkit-overflow-scrolling;
      position;
    }
    canvas {
      display;
      margin;
    }
    .textLayer {
      font-family: sans-serif;
      font-size;
      line-height: 1.4;
      position;
      top; left;
      right; bottom;
      pointer-events;
      z-index;
    }
  </style>
</head>
<body>
  <div id="viewer"></div>
  <script>
    const pdfData = atob("${sanitizedBase64}");
    const viewer = document.getElementById("viewer");
    const startPage = ${currentPage ?? 1};
    const searchTerm = ${JSON.stringify(searchTerm)};
    
    let pageOffsets = [];
    let totalPages = 0;
    let renderedCount = 0;
    let globalScale = 1;

    const highlightText = (textLayerDiv, term) => {
      const spans = textLayerDiv.querySelectorAll("span");
      spans.forEach(span => {
        if (span.textContent.toLowerCase().includes(term.toLowerCase())) {
          span.style.backgroundColor = "yellow";
        }
      });
    };

    const renderPage = (i, scale = 1) => {
      pdf.getPage(i).then(page => {
        const unscaled = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: (window.innerWidth / unscaled.width) * scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.style.marginBottom = "16px";
        wrapper.appendChild(canvas);
        viewer.appendChild(wrapper);

        page.render({ canvasContext, viewport }).promise.then(() => {
          pageOffsets[i - 1] = wrapper.offsetTop;
          renderedCount++;

          page.getTextContent().then(textContent => {
            const textLayerDiv = document.createElement("div");
            textLayerDiv.className = "textLayer";
            textLayerDiv.style.height = canvas.height + "px";
            textLayerDiv.style.width = canvas.width + "px";
            wrapper.appendChild(textLayerDiv);

            pdfjsLib.renderTextLayer({
              textContent,
              container
            }).promise.then(() => {
              if (searchTerm) {
                highlightText(textLayerDiv, searchTerm);
              }
            });
          });

          if (renderedCount === totalPages) {
            setTimeout(() => {
              const offset = pageOffsets[startPage - 1] || 0;
              viewer.scrollTop = offset;
            }, 200);
          }

          if (i === 1) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'init',
              currentPage
            }));
          }
        });
      });
    };

    let pdf;
    pdfjsLib.getDocument({ data: pdfData }).promise.then(doc => {
      pdf = doc;
      totalPages = pdf.numPages;

      for (let i = 1; i <= totalPages; i++) {
        renderPage(i, globalScale);
      }

      viewer.addEventListener('scroll', () => {
        const scrollTop = viewer.scrollTop;
        for (let i = 0; i < totalPages; i++) {
          if (scrollTop < pageOffsets[i] + 20) {
            const currentPage = i + 1;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'progress',
              currentPage,
              totalPages
            }));
            break;
          }
        }
      });
    });

    window.changeTheme = function(theme) {
      if (theme === "dark") {
        viewer.style.background = "#1c1c1c";
        document.body.style.filter = "invert(1) hue-rotate(180deg)";
      } else if (theme === "sepia") {
        viewer.style.background = "#f5ecd9";
        document.body.style.filter = "none";
      } else {
        viewer.style.background = "#fff";
        document.body.style.filter = "none";
      }
    };

    window.changeZoom = function(scale) {
      globalScale = scale;
      viewer.innerHTML = "";
      renderedCount = 0;
      for (let i = 1; i <= totalPages; i++) {
        renderPage(i, globalScale);
      }
    };

    window.changeLineHeight = function(lh) {
      const spans = document.querySelectorAll('.textLayer span');
      spans.forEach(s => { s.style.lineHeight = lh; });
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
                    renderLoading={() => (
                        <View style={styles.center}>
                            <ActivityIndicator size="large" />
                        </View>
                    )}
                    onMessage={onMessage}
                />
            </View>
        );
    }
);

export default PdfViewer;

const styles = StyleSheet.create({
    center: { flex: 'center', alignItems: 'center' },
});
