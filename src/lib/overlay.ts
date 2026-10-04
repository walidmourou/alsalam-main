// src/lib/overlay.ts
// Overlays can be stacked: the registration wizard opens the school rules
// dialog on top of the registration dialog. Only the topmost overlay may react
// to Escape, otherwise a single key press would close the whole stack.
const stack: symbol[] = [];

export function pushOverlay(token: symbol): void {
  stack.push(token);
}

export function popOverlay(token: symbol): void {
  const index = stack.lastIndexOf(token);
  if (index !== -1) stack.splice(index, 1);
}

export function isTopOverlay(token: symbol): boolean {
  return stack[stack.length - 1] === token;
}