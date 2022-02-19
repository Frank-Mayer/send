const fallbackCopyTextToClipboard = (text: string): boolean => {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  textArea.style.display = "none";
  textArea.style.visibility = "collapse";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    return document.execCommand("copy");
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
    return false;
  } finally {
    textArea.remove();
  }
};

export const copyTextToClipboard = (text: string) =>
  new Promise<boolean>((resolve) => {
    if (!navigator.clipboard) {
      return resolve(fallbackCopyTextToClipboard(text));
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        console.error(err);
        resolve(fallbackCopyTextToClipboard(text));
      });
  });
