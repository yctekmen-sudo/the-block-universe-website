# PDF publishing from authoritative HTML

The `content/chapters/*.html` files and `content/chapters.json` are the **only manuscript sources**. The PDF is a generated distribution artifact; do not edit its contents in Word or another PDF editor.

## Requirements

- Node.js 22+ (24 recommended).
- Google Chrome or Chromium installed. On Windows, the builder detects common Chrome installations; to select another binary, use `--chrome "C:\\path\\to\\chrome.exe"` or set `CHROME_PATH`.
- No new npm packages are needed.

## Commands

From the repository root:

```powershell
pnpm pdf:build
pnpm pdf:check
```

The first command reads the manifest, joins each authoritative HTML article in order, validates every referenced SVG exists, and uses headless Chromium to write `public/The Block Universe.pdf`. The second validates the generated PDF's signature, size, and trailer. If Poppler tools (`pdfinfo`, `pdftotext`) are installed, it also checks page count and that every chapter title appears in extracted PDF text.

Preview the complete print layout in a browser without generating a PDF:

```powershell
pnpm pdf:preview
```

Open the localhost URL printed in the terminal. Press Ctrl+C to stop the preview server.

To override the Chrome executable or output file:

```powershell
node scripts/build-pdf.mjs --chrome "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
node scripts/build-pdf.mjs --output "out\\review.pdf"
```

## Publication procedure

1. Edit only the source HTML and SVGs, then commit the source changes.
2. Run `pnpm pdf:build` and `pnpm pdf:check` on a clean checkout of the intended commit.
3. Visually inspect the resulting PDF, especially diagrams, equations, long tables, and chapter transitions. Automated checks do not prove typography is correct.
4. Commit the regenerated `public/The Block Universe.pdf` alongside the source changes or in a separate release PR.
5. Merge and deploy; the existing download URL continues to work.

The generator never modifies the chapter HTML, SVG illustrations, chapter manifest, or website layout. The only file it writes by default is `public/The Block Universe.pdf`. Its styles are in `public/book-print.css`, separate from the website CSS.

## Print limitations

Chromium's print engine is a practical HTML-to-PDF typesetter, not a full book-publishing system. Page-break avoidance is best-effort, particularly for a figure taller than the available printable area. The automatically generated contents page links to section anchors but does not include computed chapter page numbers. PDF visual inspection is required before release.

The website's Next.js reader and comment system are unaffected.
