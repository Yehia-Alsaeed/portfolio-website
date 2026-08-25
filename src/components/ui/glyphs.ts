/**
 * North-east arrow, pinned to its text presentation.
 *
 * U+2197 on its own is an emoji-capable character. Desktop browsers resolve it
 * to the monochrome text glyph, but iOS Safari falls through to Apple Color
 * Emoji and renders a blue-and-white tile that ignores the surrounding font
 * size and color. U+FE0E (variation selector-15) pins it to the text form, so
 * every viewport gets the same arrow.
 *
 * Written as escapes rather than literal characters because U+FE0E is
 * invisible in an editor - pasted literally it looks like a bare arrow and is
 * trivially lost to a reformat, a copy-paste, or a well-meaning cleanup.
 */
export const EXTERNAL_ARROW = "\u2197\uFE0E";
