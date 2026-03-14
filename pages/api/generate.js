const BANNED_KEYWORDS = [
  "iPad","PC","mobile","sorry","apologize","didn't mean to","didn't know",
  "unaware","regret","please","pls","plz","money","law","suing","sue",
  "hate","kill","suicide","termination","ban","enforcement action","avoid",
  "bypass","evasion","alt account","another account","multiple account",
  "shared device","shared hardware","same hardware","same network",
  "misunderstanding","misinterpretation","misread","mistake","error",
  "confusion","intent","not my intention","not intentional","sibling",
  "family member","household","already banned","activity detected",
  "appeal","request review","reconsider","spent so much","long time",
  "value account","want account back","brother","sister","mom","dad",
  "parent","guardian"
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, banReason, context, tone } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY not found in .env.local" });
  }

  const bannedList = BANNED_KEYWORDS.join(", ");

  const toneDesc = tone === "formal"
    ? "very formal and professional"
    : tone === "neutral"
    ? "neutral and factual"
    : "polite and straightforward";

  const prompt = `You are an expert at writing Roblox account appeal messages. Write a professional appeal message.

RULES - follow every single one:
1. NEVER use these flagged words: ${bannedList}
2. Do NOT mention devices, networks, or family
3. Do NOT apologize or admit wrongdoing
4. No begging or emotional language
5. Tone: ${toneDesc}
6. Length: 150-250 words
7. No bullet points - write paragraphs only
8. Start with "Hello Roblox Team," and end with the username as sign-off
9. Sound human and unique, not like a template
10. Ask for a manual review of account records

Username: ${username}
Ban reason: ${banReason}
${context ? `Extra context (rewrite safely without flagged words): ${context}` : ""}

Write ONLY the appeal message. Nothing else.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        max_tokens: 600
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      const msg = errData?.error?.message || "Groq API error";
      return res.status(500).json({ error: msg });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(500).json({ error: "Empty response from Groq. Try again." });
    }

    const found = BANNED_KEYWORDS.filter(kw =>
      text.toLowerCase().includes(kw.toLowerCase())
    );

    return res.status(200).json({ appeal: text.trim(), flaggedWords: found });

  } catch (err) {
    return res.status(500).json({ error: "Network error: " + err.message });
  }
}
