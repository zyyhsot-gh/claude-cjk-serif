# Claude CJK Serif

A Tampermonkey userscript that completes Anthropic's Serif/Sans/Mono typography system for CJK (Chinese/Japanese/Korean) users on [claude.ai](https://claude.ai).

## The Problem

Anthropic designed a thoughtful three-layer font system for Claude:

| Layer | Role | Font |
|-------|------|------|
| **Serif** | Claude's responses — content you *read* | Anthropic Serif |
| **Sans** | Interface, buttons, user messages — elements you *use* | Anthropic Sans |
| **Mono** | Code blocks | Anthropic Mono |

This is visible in Claude's settings, where "Interface font" and "Response font" are separate options. The design philosophy is clear: AI responses are long-form reading material, not chat bubbles, and deserve a reading-optimized typeface.

**The gap:** Anthropic Serif covers Latin characters beautifully, but the CJK fallback chain lands on system sans-serif fonts (PingFang SC on macOS, Noto Sans CJK on Linux). Chinese, Japanese, and Korean text in Claude's responses renders in a sans-serif typeface — breaking the very design intent Anthropic established.

## What This Script Does

- **Response area**: Injects [Source Han Serif](https://github.com/adobe-fonts/source-han-serif) (思源宋体) as the CJK serif fallback, so Chinese text matches the serif intent of Anthropic Serif.
- **Line height**: Adjusts from the default 1.4 to **1.7** for response paragraphs and list items, based on W3C CLREQ specifications for CJK serif typography.
- **User messages**: Locks CJK rendering to [Noto Sans CJK SC](https://fonts.google.com/noto/specimen/Noto+Sans+SC), aligning with Anthropic Sans on the interface layer.
- **Code blocks**: Untouched — Anthropic Mono is preserved.
- **Icons**: Carefully scoped selectors avoid overriding icon fonts (an earlier `*` wildcard approach broke SVG icons — see [Design Rationale](#design-rationale)).

## Installation

### 1. Install CJK Fonts

**macOS (Homebrew):**

```bash
# Serif — for Claude's response area
brew install --cask font-source-han-serif-vf

# Sans — fallback for user messages and interface
brew install --cask font-noto-sans-cjk-sc
```

**Linux:**

```bash
# Debian/Ubuntu
sudo apt install fonts-noto-serif-cjk fonts-noto-cjk

# Arch
sudo pacman -S noto-fonts-cjk
```

**Windows:**

Download and install from:
- [Source Han Serif](https://github.com/adobe-fonts/source-han-serif/releases)
- [Noto Sans CJK SC](https://fonts.google.com/noto/specimen/Noto+Sans+SC)

### 2. Install Tampermonkey

- [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

**Note for Chromium 138+:** You may need to enable "Allow User Scripts" in the extension's settings page (`chrome://extensions` → Tampermonkey → Details → Allow User Scripts toggle).

### 3. Install the Script

Click below to install directly:

**[Install Claude CJK Serif](../../raw/main/claude-cjk-serif.user.js)**

Or manually: Tampermonkey icon → Create a new script → paste the contents of `claude-cjk-serif.user.js` → Save (Ctrl/Cmd+S).

### 4. Verify

Refresh claude.ai and send a Chinese message. Open DevTools Console and run:

```javascript
// Response area
const reply = document.querySelector('.standard-markdown p');
if (reply) console.log('Response:', getComputedStyle(reply).fontFamily);

// User message
const userMsg = document.querySelector('p.whitespace-pre-wrap.break-words');
if (userMsg) console.log('User msg:', getComputedStyle(userMsg).fontFamily);

// Code block
const code = document.querySelector('.standard-markdown code');
if (code) console.log('Code:', getComputedStyle(code).fontFamily);
```

Expected output:

```
Response: "Anthropic Serif", "Source Han Serif VF", "Source Han Serif SC", "Noto Serif CJK SC", serif
User msg: "Anthropic Sans", "Noto Sans CJK SC", system-ui, sans-serif
Code: "Anthropic Mono", ui-monospace, monospace
```

## Design Rationale

### Why not use `*` wildcard selector?

The initial approach `.standard-markdown, .standard-markdown * { ... }` overrode icon fonts inside the response area, causing SVG button icons (copy, thumbs up, etc.) to render as blank squares (□). The fix: explicitly target text-bearing elements only (`p`, `li`, `td`, `h1`–`h6`, `blockquote`, `strong`, `em`, `a`) and exclude `span`, which is used by icon components.

### Why line-height 1.7?

The default line-height on claude.ai is 1.4 (21px / 15px). This was derived empirically, not assumed.

**First-principles reasoning:** Line height exists to prevent the eye's return sweep (scanning from line end back to the start of the next line) from landing on the wrong line. The error rate of return sweeps depends on three variables: sweep distance (line width), visual distinction between adjacent lines (line gap), and per-line visual density (glyph complexity).

CJK characters fill nearly 100% of their em box vertically, with stroke densities far exceeding Latin letters. At line-height 1.4, the gap between lines is only 40% of the character height — two dense rows of Chinese serif text appear as walls pressed against each other, causing frequent line-skipping during return sweeps.

**Cross-referenced sources:**

| Source | Recommendation |
|--------|---------------|
| [W3C CLREQ](https://w3c.github.io/clreq/) | Line gap = 50%–100% of font size (line-height 1.5–2.0) |
| [Element Plus](https://element-plus.org/) (China's largest UI framework) | 1.5 regular, 1.7 loose |
| [Baymard Institute](https://baymard.com/) UX research | Below 1.4 causes measurable readability degradation |
| [geoSurge AI interface typography](https://www.geosurge.ai/) | Dense AI responses: 1.4–1.7 |
| Google Material Design | 1.5 baseline for body text |

**Narrow column adjustment:** Bringhurst's *Elements of Typographic Style* states that shorter line lengths can use tighter leading. Claude's "Narrow" transcript width yields ~36–40 CJK characters per line, which is at the upper bound of W3C CLREQ's book-text range (17–40 chars), so the narrow-column discount barely applies.

**Retina display consideration:** At 254 PPI (MacBook Pro 14"), serif stroke details render with full clarity, making glyph density more visually pronounced and further justifying the higher line-height.

**Conclusion:** 1.7 provides a 70% gap-to-character-height ratio — the optimal safety margin for extended CJK serif reading sessions without return-sweep fatigue.

### Why lock user messages to Noto Sans CJK SC?

Anthropic's CSS variable for user messages is `--font-user-message: var(--font-ui)`, pointing to Anthropic Sans. This is the interface layer, not the content layer. On macOS, PingFang SC (Apple's system Chinese font) naturally takes priority in the fallback chain and works well. Explicitly locking to Noto Sans CJK SC ensures consistent rendering across platforms while respecting Anthropic's Serif/Sans separation.

## Configuration

### Adjusting line-height

If you prefer tighter or looser spacing, edit the `line-height` value in the script:

```css
/* Tighter — for very narrow columns or smaller screens */
line-height: 1.6 !important;

/* Looser — for wide columns or presentations */
line-height: 1.8 !important;
```

**Guidelines by column width:**

| Claude Setting | Characters/Line | Recommended line-height |
|----------------|----------------|------------------------|
| Narrow | ~36–40 | 1.6–1.7 |
| Medium | ~50–60 | 1.7–1.8 |
| Wide | ~70–80 | 1.8 |

### Japanese / Korean users

The font fallback chain already includes generic CJK serif/sans families. For optimal results, install the language-specific variant:

```bash
# Japanese
brew install --cask font-source-han-serif-jp

# Korean
brew install --cask font-source-han-serif-kr
```

## Compatibility

| Browser | Status |
|---------|--------|
| Chrome / Chromium 138+ | ✅ (enable "Allow User Scripts") |
| Firefox | ✅ |
| Safari | ✅ (via Userscripts extension) |
| Edge | ✅ |
| AdsPower SunBrowser | ✅ (Stylus fails; Tampermonkey works) |

**Note:** Stylus (CSS-only injection) was tested and fails on some Chromium-based browsers where the extension cannot inject into claude.ai's SPA. Tampermonkey's `GM_addStyle` with `@run-at document-start` is the reliable approach.

## License

MIT

## Acknowledgments

- [Adobe](https://github.com/adobe-fonts/source-han-serif) and [Google](https://fonts.google.com/noto) for Source Han Serif / Noto Serif CJK
- [Anthropic](https://anthropic.com) for building a typography system worth completing
- [W3C Chinese Layout Requirements](https://w3c.github.io/clreq/) for the authoritative CJK typography reference
- Robert Bringhurst, *The Elements of Typographic Style*, for the first-principles framework
