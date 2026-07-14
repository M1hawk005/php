const VISITOR_KEY = 'php_forum_visitor_id';
const OWNERSHIP_KEY = 'php_forum_owned_items';

export function getForumVisitorId() {
  let value = localStorage.getItem(VISITOR_KEY);
  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, value);
  }
  return value;
}

function ownedItems(): Record<string, true> {
  try {
    return JSON.parse(localStorage.getItem(OWNERSHIP_KEY) || '{}') as Record<string, true>;
  } catch {
    return {};
  }
}

export function rememberForumItem(id: string) {
  const items = ownedItems();
  items[id] = true;
  localStorage.setItem(OWNERSHIP_KEY, JSON.stringify(items));
}

export function forgetForumItem(id: string) {
  const items = ownedItems();
  delete items[id];
  localStorage.setItem(OWNERSHIP_KEY, JSON.stringify(items));
}

export function ownsForumItem(id: string) {
  return Boolean(ownedItems()[id]);
}
