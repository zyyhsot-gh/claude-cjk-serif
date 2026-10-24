// ==UserScript==
// @name         Claude CJK Serif
// @namespace    claude-cjk-serif
// @version      1.4
// @description  Align Claude.ai's CJK typography with Anthropic's Serif/Sans/Mono design system — Source Han Serif for responses, Noto Sans CJK SC for user messages, proper line-height for extended reading.
// @author       zyyhsot-gh
// @match        https://claude.ai/*
// @grant        GM_addStyle
// @run-at       document-start
// @license      MIT
// @homepageURL  https://github.com/zyyhsot-gh/claude-cjk-serif
// @supportURL   https://github.com/zyyhsot-gh/claude-cjk-serif/issues
// ==/UserScript==

GM_addStyle(`
    /* =============================================
       Claude Response Area — Serif + Line Height
       ============================================= */
    .standard-markdown p,
    .standard-markdown li,
    .standard-markdown td,
    .standard-markdown th,
    .standard-markdown h1, .standard-markdown h2, .standard-markdown h3,
    .standard-markdown h4, .standard-markdown h5, .standard-markdown h6,
    .standard-markdown blockquote,
    .standard-markdown figcaption,
    .standard-markdown strong, .standard-markdown em, .standard-markdown a {
        font-family: "Anthropic Serif", "Source Han Serif VF", "Source Han Serif SC", "Noto Serif CJK SC", serif !important;
    }

    .standard-markdown p,
    .standard-markdown li {
        line-height: 1.7 !important;
    }

    /* =============================================
       Code Blocks — Monospace (preserve)
       ============================================= */
    .standard-markdown code, .standard-markdown pre, .standard-markdown [class*="code"] {
        font-family: "Anthropic Mono", ui-monospace, monospace !important;
    }

    /* =============================================
       User Messages — Sans-serif, lock to Noto Sans CJK SC
       ============================================= */
    p.whitespace-pre-wrap.break-words:not(.standard-markdown *) {
        font-family: "Anthropic Sans", "Noto Sans CJK SC", system-ui, sans-serif !important;
    }
`);
