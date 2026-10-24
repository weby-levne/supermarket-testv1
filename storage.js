const KEY = "store-empire-save-v1";
export function saveGame(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error("Save failed", error);
    return false;
  }
}
export function loadGame() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Load failed", error);
    return null;
  }
}
export function clearGame() {
  localStorage.removeItem(KEY);
}
