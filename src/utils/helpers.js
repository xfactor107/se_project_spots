/**
 * Small shared utilities used by more than one component.
 */

/**
 * Shows a loading state on a button while a request is in flight, e.g.
 * "Save" -> "Saving..." (disabled) -> back to "Save".
 *
 * Disabling the button also prevents double submissions if the user clicks
 * again while waiting. The original label is stashed in a data attribute
 * (`data-default-text`) so it can be restored afterwards.
 *
 * @param {HTMLButtonElement} button
 * @param {boolean} isLoading - true to start loading, false to restore
 * @param {string} [loadingText="Saving..."]
 */
export function renderLoading(button, isLoading, loadingText = "Saving...") {
  if (isLoading) {
    button.dataset.defaultText = button.textContent.trim();
    button.textContent = loadingText;
  } else if (button.dataset.defaultText) {
    button.textContent = button.dataset.defaultText;
  }
  button.disabled = isLoading;
}
