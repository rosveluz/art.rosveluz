const MANIFEST_URL = "/content/manifest.json";

// normalize slugs/categories for case-insensitive matching
function norm(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function getManifest() {
  const r = await fetch(MANIFEST_URL, { cache: "no-store" });
  if (!r.ok) throw new Error("manifest load failed");
  return r.json();
}

export async function getCategory(slug) {
  const m = await getManifest();
  const key = norm(slug);
  return m.categories.find(c => norm(c.slug) === key);
}

export async function listItemsByCategory(slug) {
  const m = await getManifest();
  const key = norm(slug);
  return m.items
    .filter(i => norm(i.category) === key)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export async function getItem(slug) {
  const m = await getManifest();
  const it = m.items.find(i => i.slug === slug);
  if (!it) throw new Error("item not found");
  return it;
}

export async function loadMarkdown(url) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error("md load failed");
  return r.text();
}
