const KEYWORD_PATTERN = /\b(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|native|new|null|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|true|try|var|void|volatile|while|record|sealed|permits|non-sealed|false)\b/g;
const NUMBER_PATTERN = /\b(0[xX][\da-fA-F_]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[dDfFlL]?)\b/g;
const ANNOTATION_PATTERN = /(^|[^\w])(@[A-Za-z_]\w*)/g;
const URL_PATTERN = /(https?:\/\/[^\s*<]+)/g;

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

let activeModal = null;
let activeModalClose = null;

document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href]');
    if (!anchor) {
        return;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
    }

    if (anchor.closest('.java-modal-overlay')) {
        return;
    }

    if (anchor.closest('[data-md-component="source"], [data-md-component="header"], .md-header, .md-content__button, .md-source-file')) {
        return;
    }

    if (anchor.target === '_blank') {
        return;
    }

    if (anchor.hasAttribute('data-no-modal')) {
        return;
    }

    let url;
    try {
        url = new URL(anchor.href, window.location.href);
    } catch (err) {
        return;
    }

    if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.hash) {
        return;
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return;
    }

    if (url.pathname.endsWith('.java')) {
        event.preventDefault();
        openFile(anchor.href, anchor.textContent.trim());
        return;
    }

    if (url.pathname.toLowerCase().endsWith('.pdf')) {
        event.preventDefault();
        openPdf(anchor.href, anchor.textContent.trim());
        return;
    }

    if (isYouTubeLink(url)) {
        event.preventDefault();
        openYouTubeVideo(anchor.href, anchor.textContent.trim());
        return;
    }

    if (url.origin !== window.location.origin) {
        event.preventDefault();
        openWebPage(anchor.href, anchor.textContent.trim());
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activeModalClose) {
        activeModalClose();
    }
});

async function openFile(link, label) {
    const modal = createModal(label || fileNameFromLink(link), link, false);
    setModalStatus(modal.body, 'Loading source...');

    try {
        const response = await fetch(link, { credentials: 'same-origin' });
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const javaCode = await response.text();
        renderJavaSource(modal.body, javaCode, modal.setZoomTarget);
    } catch (error) {
        setModalStatus(
            modal.body,
            `Unable to load this Java file. ${error.message}`,
            true
        );
    }
}

function openYouTubeVideo(link, label) {
    const embedUrl = toYouTubeEmbedUrl(link);
    if (!embedUrl) {
        openWebPage(link, label || 'YouTube Video');
        return;
    }

    const modal = createModal(label || 'YouTube Video', link, true);
    renderYouTubeVideo(modal.body, embedUrl, label || 'YouTube Video', modal.setZoomTarget);
}

function openWebPage(link, label) {
    const modal = createModal(label || hostFromLink(link), link, true);
    renderWebPage(modal.body, link, label || hostFromLink(link), modal.setZoomTarget);
}

function openPdf(link, label) {
    const modal = createModal(label || fileNameFromLink(link), toPdfViewerUrl(link), true);
    renderPdf(modal.body, toPdfViewerUrl(link), label || fileNameFromLink(link), modal.setZoomTarget);
}

function toPdfViewerUrl(link) {
    try {
        const url = new URL(link, window.location.href);
        if (url.hostname === 'github.com' && url.pathname.includes('/blob/')) {
            url.pathname = url.pathname.replace('/blob/', '/raw/');
            url.search = '';
            url.hash = '';
            return url.toString();
        }
        return link;
    } catch (err) {
        return link;
    }
}

function createModal(title, link, showOpenExternal) {
    if (activeModalClose) {
        activeModalClose();
    }

    const overlay = document.createElement('div');
    overlay.className = 'java-modal-overlay';

    const panel = document.createElement('div');
    panel.className = 'java-modal';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', title || 'Preview');

    const header = document.createElement('div');
    header.className = 'java-modal-header';

    const titleBlock = document.createElement('div');
    titleBlock.className = 'java-modal-title-block';

    const heading = document.createElement('div');
    heading.className = 'java-modal-title';
    heading.textContent = title || fileNameFromLink(link);

    const subtitle = document.createElement('div');
    subtitle.className = 'java-modal-subtitle';
    subtitle.textContent = link;

    titleBlock.appendChild(heading);
    titleBlock.appendChild(subtitle);

    const controls = document.createElement('div');
    controls.className = 'java-modal-controls';

    const zoomOut = document.createElement('button');
    zoomOut.type = 'button';
    zoomOut.className = 'java-modal-control-btn';
    zoomOut.setAttribute('aria-label', 'Zoom out');
    zoomOut.textContent = '−';

    const zoomLevel = document.createElement('span');
    zoomLevel.className = 'java-modal-zoom-level';
    zoomLevel.textContent = '100%';

    const zoomIn = document.createElement('button');
    zoomIn.type = 'button';
    zoomIn.className = 'java-modal-control-btn';
    zoomIn.setAttribute('aria-label', 'Zoom in');
    zoomIn.textContent = '+';

    const zoomReset = document.createElement('button');
    zoomReset.type = 'button';
    zoomReset.className = 'java-modal-control-btn java-modal-reset';
    zoomReset.setAttribute('aria-label', 'Reset zoom');
    zoomReset.textContent = 'Reset';

    controls.appendChild(zoomOut);
    controls.appendChild(zoomLevel);
    controls.appendChild(zoomIn);
    controls.appendChild(zoomReset);

    const openLink = document.createElement('a');
    openLink.className = 'java-modal-control-btn java-modal-open-link';
    openLink.href = link;
    openLink.target = '_blank';
    openLink.rel = 'noopener noreferrer';
    openLink.setAttribute('aria-label', 'Open in new tab');
    openLink.textContent = 'Open ↗';
    controls.appendChild(openLink);

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'java-modal-close';
    closeButton.setAttribute('aria-label', 'Close viewer');
    closeButton.textContent = 'Close';

    controls.appendChild(closeButton);

    header.appendChild(titleBlock);
    header.appendChild(controls);

    const body = document.createElement('div');
    body.className = 'java-modal-body';

    const grip = document.createElement('div');
    grip.className = 'java-modal-resize';
    grip.setAttribute('aria-hidden', 'true');

    panel.appendChild(header);
    panel.appendChild(body);
    panel.appendChild(grip);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    document.body.classList.add('java-modal-open');

    let zoom = 1;
    let zoomTarget = null;
    const applyZoom = () => {
        zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
        if (zoomTarget) {
            zoomTarget.style.zoom = zoom;
        }
    };
    const setZoomTarget = (el) => {
        zoomTarget = el;
        applyZoom();
    };

    zoomIn.addEventListener('click', () => {
        zoom = Math.min(MAX_ZOOM, Math.round((zoom + ZOOM_STEP) * 100) / 100);
        applyZoom();
    });
    zoomOut.addEventListener('click', () => {
        zoom = Math.max(MIN_ZOOM, Math.round((zoom - ZOOM_STEP) * 100) / 100);
        applyZoom();
    });
    zoomReset.addEventListener('click', () => {
        zoom = 1;
        applyZoom();
    });

    const closeModal = () => {
        overlay.remove();
        document.body.classList.remove('java-modal-open');
        document.body.classList.remove('java-modal-dragging');
        if (activeModal === overlay) {
            activeModal = null;
            activeModalClose = null;
        }
    };

    closeButton.addEventListener('click', closeModal);
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeModal();
        }
    });

    enableDrag(panel, overlay, header);
    enableResize(panel, overlay, grip);

    activeModal = overlay;
    activeModalClose = closeModal;
    closeButton.focus();

    return { body, closeModal, setZoomTarget };
}

function pinPanel(panel, overlay) {
    if (panel.style.position === 'fixed') {
        return;
    }
    const rect = panel.getBoundingClientRect();
    panel.style.position = 'fixed';
    panel.style.left = `${rect.left}px`;
    panel.style.top = `${rect.top}px`;
    panel.style.width = `${rect.width}px`;
    panel.style.height = `${rect.height}px`;
    panel.style.margin = '0';
    overlay.style.justifyContent = 'flex-start';
    overlay.style.alignItems = 'flex-start';
}

function enableDrag(panel, overlay, handle) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    handle.addEventListener('pointerdown', (event) => {
        if (event.target.closest('button, a')) {
            return;
        }
        dragging = true;
        startX = event.clientX;
        startY = event.clientY;
        const rect = panel.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        pinPanel(panel, overlay);
        try {
            handle.setPointerCapture(event.pointerId);
        } catch (err) {
            // ignore
        }
        document.body.classList.add('java-modal-dragging');
        event.preventDefault();
    });

    handle.addEventListener('pointermove', (event) => {
        if (!dragging) {
            return;
        }
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const w = panel.offsetWidth;
        const h = panel.offsetHeight;
        const nextLeft = Math.min(Math.max(startLeft + dx, -w + 80), vw - 80);
        const nextTop = Math.min(Math.max(startTop + dy, 0), vh - 40);
        panel.style.left = `${nextLeft}px`;
        panel.style.top = `${nextTop}px`;
    });

    const end = () => {
        if (!dragging) {
            return;
        }
        dragging = false;
        document.body.classList.remove('java-modal-dragging');
    };

    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
}

function enableResize(panel, overlay, grip) {
    let resizing = false;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;

    grip.addEventListener('pointerdown', (event) => {
        resizing = true;
        startX = event.clientX;
        startY = event.clientY;
        startWidth = panel.offsetWidth;
        startHeight = panel.offsetHeight;
        pinPanel(panel, overlay);
        try {
            grip.setPointerCapture(event.pointerId);
        } catch (err) {
            // ignore
        }
        document.body.classList.add('java-modal-dragging');
        event.preventDefault();
        event.stopPropagation();
    });

    grip.addEventListener('pointermove', (event) => {
        if (!resizing) {
            return;
        }
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const nextWidth = Math.min(Math.max(startWidth + (event.clientX - startX), 320), vw - 16);
        const nextHeight = Math.min(Math.max(startHeight + (event.clientY - startY), 220), vh - 16);
        panel.style.width = `${nextWidth}px`;
        panel.style.height = `${nextHeight}px`;
    });

    const end = (event) => {
        if (!resizing) {
            return;
        }
        resizing = false;
        document.body.classList.remove('java-modal-dragging');
        if (event) {
            event.stopPropagation();
        }
    };

    grip.addEventListener('pointerup', end);
    grip.addEventListener('pointercancel', end);
}

function setModalStatus(container, message, isError) {
    container.innerHTML = '';

    const status = document.createElement('div');
    status.className = isError ? 'java-modal-status java-modal-status-error' : 'java-modal-status';
    status.textContent = message;

    container.appendChild(status);
}

function renderJavaSource(container, javaCode, setZoomTarget) {
    container.innerHTML = '';

    const pre = document.createElement('pre');
    pre.className = 'java-source-viewer';

    const code = document.createElement('code');
    code.className = 'language-java';
    code.innerHTML = beautifyCode(javaCode);

    pre.appendChild(code);
    container.appendChild(pre);
    if (setZoomTarget) {
        setZoomTarget(pre);
    }
}

function renderYouTubeVideo(container, embedUrl, title, setZoomTarget) {
    container.innerHTML = '';

    const frameWrap = document.createElement('div');
    frameWrap.className = 'video-modal-frame-wrap';

    const iframe = document.createElement('iframe');
    iframe.className = 'video-modal-frame';
    iframe.src = embedUrl;
    iframe.title = title || 'YouTube video player';
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

    frameWrap.appendChild(iframe);
    container.appendChild(frameWrap);
    if (setZoomTarget) {
        setZoomTarget(iframe);
    }
}

const FRAME_BLOCKING_HOSTS = [
    'medium.com',
    'blog.devgenius.io',
    'itnext.io',
    'towardsdatascience.com',
    'betterprogramming.pub',
    'levelup.gitconnected.com',
    'ai.plainenglish.io',
    'javascript.plainenglish.io',
    'python.plainenglish.io',
];

function isFrameBlockingHost(url) {
    const host = url.hostname.toLowerCase();
    return FRAME_BLOCKING_HOSTS.some(
        (blocked) => host === blocked || host.endsWith(`.${blocked}`)
    );
}

function renderFrameBlocked(container, link, title) {
    container.innerHTML = '';

    const blocked = document.createElement('div');
    blocked.className = 'web-modal-blocked';

    const icon = document.createElement('div');
    icon.className = 'web-modal-blocked-icon';
    icon.textContent = '⛔';

    const headingEl = document.createElement('div');
    headingEl.className = 'web-modal-blocked-title';
    headingEl.textContent = 'This site blocks embedding';

    const detail = document.createElement('div');
    detail.className = 'web-modal-blocked-text';
    detail.textContent = `${hostFromLink(link)} refuses to load inside a frame (X-Frame-Options / CSP). Open it in a new tab instead — your reading position here is preserved.`;

    const actions = document.createElement('div');
    actions.className = 'web-modal-blocked-actions';

    const openBtn = document.createElement('a');
    openBtn.className = 'java-modal-control-btn web-modal-blocked-open';
    openBtn.href = link;
    openBtn.target = '_blank';
    openBtn.rel = 'noopener noreferrer';
    openBtn.textContent = 'Open in new tab ↗';

    actions.appendChild(openBtn);

    blocked.appendChild(icon);
    blocked.appendChild(headingEl);
    blocked.appendChild(detail);
    blocked.appendChild(actions);
    container.appendChild(blocked);
}

function renderPdf(container, link, title, setZoomTarget) {
    container.innerHTML = '';

    const notice = document.createElement('div');
    notice.className = 'web-modal-notice';
    notice.textContent = 'If the PDF does not load here, use Open ↗ to view it in a new tab.';

    const status = document.createElement('div');
    status.className = 'java-modal-status';
    status.textContent = 'Loading PDF...';

    const frameWrap = document.createElement('div');
    frameWrap.className = 'web-modal-frame-wrap web-modal-pdf-wrap';

    const iframe = document.createElement('iframe');
    iframe.className = 'web-modal-frame';
    iframe.src = link;
    iframe.title = title || 'Embedded PDF';
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.addEventListener('load', () => {
        status.remove();
    });

    frameWrap.appendChild(iframe);
    container.appendChild(notice);
    container.appendChild(status);
    container.appendChild(frameWrap);
    if (setZoomTarget) {
        setZoomTarget(iframe);
    }
}

function renderWebPage(container, link, title, setZoomTarget) {
    container.innerHTML = '';

    let pageUrl;
    try {
        pageUrl = new URL(link, window.location.href);
    } catch (err) {
        pageUrl = null;
    }

    if (pageUrl && isFrameBlockingHost(pageUrl)) {
        renderFrameBlocked(container, link, title);
        return;
    }

    const notice = document.createElement('div');
    notice.className = 'web-modal-notice';
    notice.textContent = 'If the site blocks embedding, use Open ↗ to view it in a new tab.';

    const status = document.createElement('div');
    status.className = 'java-modal-status';
    status.textContent = 'Loading page...';

    const frameWrap = document.createElement('div');
    frameWrap.className = 'web-modal-frame-wrap';

    const iframe = document.createElement('iframe');
    iframe.className = 'web-modal-frame';
    iframe.src = link;
    iframe.title = title || 'Embedded page';
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals allow-presentation');
    iframe.addEventListener('load', () => {
        status.remove();
    });

    frameWrap.appendChild(iframe);
    container.appendChild(notice);
    container.appendChild(status);
    container.appendChild(frameWrap);
    if (setZoomTarget) {
        setZoomTarget(iframe);
    }
}

function beautifyCode(javaCode) {
    let highlightedCode = escapeHtml(javaCode).replace(/\t/g, '    ');
    const tokens = [];

    highlightedCode = preserveTokens(highlightedCode, /\/\*[\s\S]*?\*\//g, 'comment', tokens);
    highlightedCode = preserveTokens(highlightedCode, /\/\/.*$/gm, 'comment', tokens);
    highlightedCode = preserveTokens(highlightedCode, /"(?:\\.|[^"\\])*"/g, 'string', tokens);
    highlightedCode = preserveTokens(highlightedCode, /'(?:\\.|[^'\\])'/g, 'string', tokens);

    highlightedCode = highlightedCode.replace(ANNOTATION_PATTERN, '$1<span class="annotation">$2</span>');
    highlightedCode = highlightedCode.replace(KEYWORD_PATTERN, '<span class="keyword">$1</span>');
    highlightedCode = highlightedCode.replace(NUMBER_PATTERN, '<span class="number">$1</span>');

    return restoreTokens(highlightedCode, tokens);
}

function preserveTokens(source, pattern, className, tokens) {
    return source.replace(pattern, (match) => {
        const placeholder = `__JAVA_TOKEN_${tokens.length}__`;
        const tokenText = className === 'comment' ? linkifyCommentUrls(match) : match;
        tokens.push(`<span class="${className}">${tokenText}</span>`);
        return placeholder;
    });
}

function linkifyCommentUrls(text) {
    return text.replace(URL_PATTERN, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
}

function restoreTokens(source, tokens) {
    return source.replace(/__JAVA_TOKEN_(\d+)__/g, (_, index) => tokens[Number(index)]);
}

function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function fileNameFromLink(link) {
    const pathname = new URL(link, window.location.href).pathname;
    return pathname.split('/').pop() || 'Java source';
}

function hostFromLink(link) {
    try {
        return new URL(link, window.location.href).hostname || 'Embedded page';
    } catch (err) {
        return 'Embedded page';
    }
}

function isYouTubeLink(url) {
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    return host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be';
}

function toYouTubeEmbedUrl(link) {
    const url = new URL(link, window.location.href);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    let videoId = '';
    const listId = url.searchParams.get('list') || '';

    if (host === 'youtu.be') {
        videoId = url.pathname.slice(1).split('/')[0];
    } else if (host === 'youtube.com' || host === 'm.youtube.com') {
        if (url.pathname === '/watch') {
            videoId = url.searchParams.get('v') || '';
        } else if (url.pathname === '/playlist') {
            if (listId) {
                return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(listId)}`;
            }
        } else if (url.pathname.startsWith('/shorts/')) {
            videoId = url.pathname.split('/')[2] || '';
        } else if (url.pathname.startsWith('/embed/')) {
            videoId = url.pathname.split('/')[2] || '';
        }
    }

    if (!videoId && listId) {
        return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(listId)}`;
    }

    if (!videoId) {
        return '';
    }

    return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
}
