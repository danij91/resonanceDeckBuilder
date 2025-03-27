/**
 * Utility functions for clipboard operations
 */

/**
 * Copies text to clipboard
 * @param text Text to copy
 * @returns Promise that resolves when text is copied
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error("Failed to copy text: ", err)
    throw new Error("Failed to copy to clipboard")
  }
}

/**
 * Reads text from clipboard
 * @returns Promise that resolves with clipboard text
 */
export async function readFromClipboard(): Promise<string> {
  try {
    return await navigator.clipboard.readText()
  } catch (err) {
    console.error("Failed to read text: ", err)
    throw new Error("Failed to read from clipboard")
  }
}

