export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable ||
    target.contentEditable === "true" ||
    target.closest('[contenteditable]:not([contenteditable="false"])') !== null
  );
}

type KeyboardIntent = Pick<KeyboardEvent, "key" | "altKey" | "ctrlKey" | "metaKey" | "target">;

export function shouldCycleDisplayMode(event: KeyboardIntent): boolean {
  return (
    event.key.toLowerCase() === "n" &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !isEditableTarget(event.target)
  );
}
