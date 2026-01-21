// src/features/campusAI/utils/messageProcessor.js

export const processYawasResponse = (fullText, userProfile) => {
  const cleanText = fullText.replace(/\[\[SAVE:.*?\]\]/g, "").trim();
  const saveMatches = fullText.match(/\[\[SAVE:\s*(.*?)\s*\]\]/g);

  let newNotes = [];

  if (saveMatches && userProfile) {
    newNotes = saveMatches.map((m) =>
      m.replace("[[SAVE:", "").replace("]]", "").trim()
    );
  }

  return { cleanText, newNotes };
};