// YouTube helpers — accepts watch?v=, youtu.be/, /embed/, /shorts/ and /live/ links.
export function getYouTubeId(url = "") {
  const s = String(url).trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m =
    s.match(/[?&]v=([\w-]{11})/) ||
    s.match(/youtu\.be\/([\w-]{11})/) ||
    s.match(/youtube(?:-nocookie)?\.com\/(?:embed|shorts|live|v)\/([\w-]{11})/);
  return m ? m[1] : null;
}

/** Privacy-friendly embed URL with related videos limited to the same channel. */
export function getYouTubeEmbedUrl(url, { autoplay = false } = {}) {
  const id = getYouTubeId(url);
  if (!id) return null;
  const p = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1" });
  if (autoplay) p.set("autoplay", "1");
  return `https://www.youtube-nocookie.com/embed/${id}?${p.toString()}`;
}

export function getYouTubeThumb(url) {
  const id = getYouTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export const isValidYouTubeUrl = (url) => !!getYouTubeId(url);
