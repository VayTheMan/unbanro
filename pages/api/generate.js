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

// Whole-word match only — won't flag "issue" for "sue" or "unban" for "ban"
function containsWholeWord(text, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(?<![a-zA-Z])${escaped}(?![a-zA-Z])`, 'i');
  return regex.test(text);
}

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

  const toneDesc = tone === "formal"
    ? "very formal and professional"
    : tone === "neutral"
    ? "neutral and factual"
    : "polite and straightforward";

  const prompt = `You are writing a Roblox account reinstatement letter. You must follow every rule below with zero exceptions.

FORBIDDEN WORDS — do NOT use any of these exact words or phrases anywhere in the message:
sorry, apologize, apology, regret, mistake, error, my fault, didn't know, unaware, didn't mean to, please, pls, plz, sue, suing, law, money, hate, kill, suicide, ban, banned, termination, terminated, enforcement, avoid, bypass, evasion, alt, alt account, another account, multiple accounts, shared device, shared hardware, same hardware, same network, PC, iPad, mobile, phone, tablet, computer, misunderstanding, misinterpretation, confusion, intent, intentional, sibling, brother, sister, mom, dad, parent, guardian, family member, household, appeal, appeals, request review, reconsider, spent so much, long time, value account, want account back, activity detected

RULES:
- Tone: ${toneDesc}
- Length: 150 to 250 words
- Write in natural paragraphs only — no bullet points, no lists
- Start with exactly: "Hello Roblox Team,"
- End with only the username as the sign-off: ${username}
- Do NOT apologize or admit wrongdoing at any point
- Do NOT mention devices, networks, family, or sharing anything
- Do NOT use emotional or begging language
- Focus on requesting a manual review of the account activity records
- Sound like a real unique human wrote it — not a template

Account info:
- Username: ${username}
- Restriction reason shown: ${banReason}
${context ? `- User's situation (rewrite this completely in safe language, avoiding ALL forbidden words above): ${context}` : ""}

Output the letter only. No intro, no explanation, no notes before or after.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
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

    // Use whole-word matching so "issue" doesn't flag "sue"
    const found = BANNED_KEYWORDS.filter(kw => containsWholeWord(text, kw));

    return res.status(200).json({ appeal: text.trim(), flaggedWords: found });

  } catch (err) {
    return res.status(500).json({ error: "Network error: " + err.message });
  }
}
