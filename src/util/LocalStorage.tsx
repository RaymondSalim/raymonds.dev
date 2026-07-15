export function setItemInLocalStorage(key: string, item: any) {
  localStorage.setItem(key, JSON.stringify(item));
}

export function getItemFromLocalStorage(key: string): any {
  const item = localStorage.getItem(key);
  return JSON.parse(item as string);
}
