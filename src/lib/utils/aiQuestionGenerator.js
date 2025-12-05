export async function requestAiQuestions({
  subject,
  material,
  instructions,
  numQuestions,
  fileName,
  topic
}) {
  const payload = {
    subject,
    material,
    instructions,
    numQuestions
  };

  if (fileName) {
    payload.fileName = fileName;
  }
  if (topic) {
    payload.topic = topic;
  }

  const res = await fetch("/api/generate-questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const json = await res.json();

  if (!res.ok || json.error) {
    throw new Error(json.error || "");
  }

  const list = json.questions ?? [];
  if (!list.length) {
    throw new Error("");
  }

  return list;
}
