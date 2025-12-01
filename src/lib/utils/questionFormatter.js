export function cleanQuestionText(value) {
  if (value === undefined || value === null) return "";
  let text = String(value).trim();

  if (!text) return "";

  if (text.startsWith("{") && text.endsWith("}")) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.question === "string") {
        text = parsed.question.trim();
      }
    } catch {
      // ignore parse errors
    }
  }

  const hintMatch = /["']?hint["']?\s*:\s*/i.exec(text);
  if (hintMatch) {
    text = text.slice(0, hintMatch.index).trim();
  }

  text = text.replace(/^[\s"'`({\[]+/, "");
  text = text.replace(/[\s"'`)}\]]+$/, "");

  return text.trim();
}
