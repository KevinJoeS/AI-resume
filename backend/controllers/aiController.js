import { GoogleGenAI } from "@google/genai";
import multer from "multer";
import mammoth from "mammoth";
import path from "path";
import { PDFParse } from "pdf-parse";

// ─── Multer config (memory storage, 5 MB limit) ───────────────────────────────
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".docx", ".txt"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only PDF, DOCX, and TXT files are supported."));
  },
});

// Standard action verbs for fallback polisher
const ACTION_VERBS = ["Spearheaded", "orchestrated", "engineered", "optimized", "leveraged", "pioneered", "accelerated", "maximized", "formulated", "revamped"];

// Enhanced fallback logic for text enhancement
const localEnhanceText = (text, instruction) => {
  if (!text) return "Please provide some text to enhance.";
  
  const cleanInstruction = instruction ? instruction.toLowerCase() : "";
  let enhanced = text;

  // Let's perform a realistic local transformation based on the instruction
  if (cleanInstruction.includes("professional") || cleanInstruction.includes("polish")) {
    enhanced = text
      .replace(/\b(managed|led|ran)\b/gi, () => ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)])
      .replace(/\b(helped|assisted)\b/gi, "collaborated with team members to support")
      .replace(/\b(made|created)\b/gi, "engineered and implemented")
      .replace(/\b(good|great|nice)\b/gi, "exceptionally high-performing")
      .replace(/\b(work on|did)\b/gi, "drove development of");
    
    // Add a professional opening if not present
    if (!enhanced.match(/(spearheaded|engineered|orchestrated|pioneered|highly)/i)) {
      enhanced = `Leveraged deep industry expertise to ${enhanced.charAt(0).toLowerCase() + enhanced.slice(1)}`;
    }
  } else if (cleanInstruction.includes("shorten") || cleanInstruction.includes("concise")) {
    // Trim extra spaces, shorten sentences
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    if (sentences.length > 2) {
      enhanced = sentences.slice(0, Math.min(2, sentences.length)).join(". ") + ".";
    } else {
      enhanced = text.substring(0, Math.min(text.length, 120)) + "...";
    }
  } else if (cleanInstruction.includes("action") || cleanInstruction.includes("verbs")) {
    enhanced = text.replace(/\b(worked on|built|developed|did)\b/gi, () => ACTION_VERBS[Math.floor(Math.random() * 3)]);
  } else if (cleanInstruction.includes("technical") || cleanInstruction.includes("skills")) {
    enhanced = `${text} utilizing modern software design architectures, robust testing protocols, and scalable deployment pipelines.`;
  }

  // Ensure it looks polished
  if (!enhanced.endsWith(".")) enhanced += ".";
  return enhanced;
};

// A solid list of English stop words to filter out non-skills/non-keywords
const STOP_WORDS = new Set([
  "the", "and", "a", "of", "to", "in", "for", "with", "on", "at", "by", "from", "an", "is", "are", 
  "was", "were", "be", "been", "have", "has", "had", "do", "does", "did", "but", "if", "or", 
  "because", "as", "until", "while", "about", "against", "between", "into", "through", "during", 
  "before", "after", "above", "below", "up", "down", "out", "off", "over", "under", "again", 
  "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", 
  "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", 
  "own", "same", "so", "than", "too", "very", "can", "will", "just", "should", "now",
  "please", "you", "your", "we", "our", "us", "they", "them", "their", "he", "him", "his", "she", 
  "her", "it", "its", "i", "me", "my", "myself", "yourself", "himself", "herself", "itself",
  "who", "whom", "this", "that", "these", "those", "am", "being", "must", "shall", "would"
]);

// Local fallback logic for Job Description Optimization
const localOptimizeResume = (resumeData, jobDescription, resumeText = "") => {
  if (!jobDescription) {
    return {
      matchScore: 0,
      matchingSkills: [],
      missingKeywords: [],
      suggestions: [{ field: "general", type: "warning", message: "Please provide a target job description to run the optimizer." }]
    };
  }

  // Extract skills from resume
  let combinedResumeText = resumeText || "";
  if (resumeData.skills && Array.isArray(resumeData.skills)) {
    combinedResumeText += " " + resumeData.skills.join(" ");
  }
  if (resumeData.summary) combinedResumeText += " " + resumeData.summary;
  if (resumeData.role) combinedResumeText += " " + resumeData.role;
  if (resumeData.experience) {
    resumeData.experience.forEach(exp => {
      combinedResumeText += ` ${exp.role} ${exp.company} ${exp.description}`;
    });
  }
  if (resumeData.projects) {
    resumeData.projects.forEach(proj => {
      combinedResumeText += ` ${proj.name} ${proj.description} ${proj.technologies}`;
    });
  }

  // Clean and split texts
  const cleanText = (text) => {
    return text.toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, " ") // keep hyphens for words
      .split(/[\s,]+/)
      .map(w => w.trim())
      .filter(w => w.length >= 3 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
  };

  const resumeWords = new Set(cleanText(combinedResumeText));
  const jdWordsArray = cleanText(jobDescription);
  
  // Use unique words from JD to match
  const jdWordsUnique = Array.from(new Set(jdWordsArray));

  const matchingSkills = [];
  const missingKeywords = [];

  jdWordsUnique.forEach(word => {
    // If the word matches a word in the resume, it's matching
    if (resumeWords.has(word)) {
      matchingSkills.push(word.charAt(0).toUpperCase() + word.slice(1));
    } else {
      missingKeywords.push(word.charAt(0).toUpperCase() + word.slice(1));
    }
  });

  // Calculate score based on actual keyword overlap
  let matchScore = 0;
  if (jdWordsUnique.length > 0) {
    matchScore = Math.round((matchingSkills.length / jdWordsUnique.length) * 100);
  }
  
  // Clamp score: max 98%
  matchScore = Math.min(matchScore, 98);

  // Generate suggestions
  const suggestions = [];

  if (matchScore < 30) {
    suggestions.push({
      field: "general",
      type: "warning",
      message: `Critically low match score of ${matchScore}%. This resume is highly incompatible with the target job description. Consider a complete rewrite or tailoring.`
    });
  } else if (matchScore < 70) {
    suggestions.push({
      field: "general",
      type: "warning",
      message: `Your resume has a moderate matching score of ${matchScore}%. We recommend incorporating more of the key terms found in the job description to bypass ATS filters.`
    });
  } else {
    suggestions.push({
      field: "general",
      type: "success",
      message: `Excellent! Your resume has a high matching score of ${matchScore}%. You are in a good position for standard ATS screeners.`
    });
  }

  if (missingKeywords.length > 0) {
    suggestions.push({
      field: "skills",
      type: "info",
      message: `Consider adding these missing keywords from the job description: ${missingKeywords.slice(0, 8).join(", ")}.`
    });
  }

  if (!resumeText && (!resumeData.summary || resumeData.summary.length < 50)) {
    suggestions.push({
      field: "summary",
      type: "warning",
      message: "Your summary is empty or too short. Write a tailored 3-4 sentence professional summary summarizing your match with this role."
    });
  }

  return {
    matchScore,
    matchingSkills,
    missingKeywords,
    suggestions
  };
};

export const enhanceTextController = async (req, res) => {
  const { text, instruction } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Text content is required for enhancement." });
  }

  // Check if API Key is available
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("YOUR_API_KEY") || process.env.GEMINI_API_KEY === "") {
    // Fallback to local simulator
    const result = localEnhanceText(text, instruction);
    return res.status(200).json({ enhancedText: result, fallback: true });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are an expert resume writer and career coach. Optimize the following resume text based on this instruction: '${instruction}'. 
Return ONLY the enhanced text. Do not include any introductory remarks, conversational preambles, or markdown formatting (like quotes or backticks) unless standard formatting inside the text itself is needed.

Text to enhance: '${text}'`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = response.text || "";
    // Clean up any potential markdown wraps
    const cleanText = responseText.trim().replace(/^["'`\s]+|["'`\s]+$/g, "");

    res.status(200).json({ enhancedText: cleanText, fallback: false });
  } catch (error) {
    console.error("Gemini API Error in enhanceTextController:", error);
    // Silent fallback to local if API error occurs
    const result = localEnhanceText(text, instruction);
    res.status(200).json({ enhancedText: result, fallback: true, error: error.message });
  }
};

export const optimizeResumeController = async (req, res) => {
  const { resumeData, jobDescription, resumeText = "" } = req.body;

  if ((!resumeData && !resumeText) || !jobDescription) {
    return res.status(400).json({ message: "Resume data or imported resume text and target job description are required." });
  }

  // Check if API Key is available
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("YOUR_API_KEY") || process.env.GEMINI_API_KEY === "") {
    // Fallback to local simulator
    const result = localOptimizeResume(resumeData || {}, jobDescription, resumeText);
    return res.status(200).json({ ...result, fallback: true });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are an expert ATS (Applicant Tracking System) optimizer. Analyze the following resume details and the target Job Description.

Resume details:
${JSON.stringify(resumeData, null, 2)}

Imported resume text:
${resumeText || "(none)"}

Job Description:
${jobDescription}

Evaluate the compatibility of the resume with the job description.
Return a valid JSON object matching the following structure. Do NOT include markdown code fences (like \`\`\`json) or any explanation. Output ONLY raw JSON:
{
  "matchScore": <number between 0 and 100>,
  "matchingSkills": [<string list of overlapping skills/keywords>],
  "missingKeywords": [<string list of important keywords/skills in the Job Description that are missing in the resume>],
  "suggestions": [
    {
      "field": "<section name: 'summary' | 'skills' | 'experience' | 'projects' | 'general'>",
      "type": "<'warning' | 'info' | 'success'>",
      "message": "<actionable recommendation on how to tailer this section>"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text || "{}";
    const result = JSON.parse(responseText.trim());

    res.status(200).json({ ...result, fallback: false });
  } catch (error) {
    console.error("Gemini API Error in optimizeResumeController:", error);
    // Silent fallback to local if API error occurs
    const result = localOptimizeResume(resumeData || {}, jobDescription, resumeText);
    res.status(200).json({ ...result, fallback: true, error: error.message });
  }
};

// ─── Match Uploaded Resume Controller ────────────────────────────────────────
export const matchUploadController = async (req, res) => {
  const { jobDescription } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "Please upload a resume file (PDF, DOCX, or TXT)." });
  }
  if (!jobDescription || !jobDescription.trim()) {
    return res.status(400).json({ message: "Please provide a job description to match against." });
  }

  // ── Extract plain text from the uploaded file ──────────────────────────────
  let extractedText = "";
  const ext = path.extname(file.originalname).toLowerCase();

  try {
    if (ext === ".pdf") {
      // Try pdf-parse first (text-based PDFs)
      try {
        const parser = new PDFParse({ data: file.buffer });
        const parsed = await parser.getText();
        await parser.destroy();
        extractedText = parsed.text || "";
      } catch (pdfErr) {
        console.error("PDF parse error:", pdfErr);
        return res.status(422).json({
          message:
            "The uploaded PDF does not contain extractable text (it may be a scanned image). Please upload a searchable PDF, or use DOCX/TXT instead."
        });
      }
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      extractedText = result.value || "";
    } else {
      // Plain text
      extractedText = file.buffer.toString("utf-8");
    }
  } catch (parseError) {
    console.error("File parse error:", parseError);
    return res.status(422).json({ message: "Could not extract text from the uploaded file. Please try a different format." });
  }

  if (!extractedText.trim()) {
    return res.status(422).json({ message: "The uploaded file appears to be empty or could not be read." });
  }

  // ── Run optimizer (Gemini or local fallback) ──────────────────────────────
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("YOUR_API_KEY") || process.env.GEMINI_API_KEY === "") {
    const result = localOptimizeResume({}, jobDescription, extractedText);
    return res.status(200).json({ ...result, fallback: true });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are an expert ATS (Applicant Tracking System) optimizer.
Analyze the following resume text and match it against the target Job Description.

Resume text:
${extractedText}

Job Description:
${jobDescription}

Evaluate the compatibility. Return ONLY a valid raw JSON object (no markdown fences) with this structure:
{
  "matchScore": <number 0-100>,
  "matchingSkills": [<overlapping skill/keyword strings>],
  "missingKeywords": [<important JD keywords missing from resume>],
  "suggestions": [
    {
      "field": "<summary | skills | experience | projects | general>",
      "type": "<warning | info | success>",
      "message": "<actionable recommendation>"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const responseText = response.text || "{}";
    const result = JSON.parse(responseText.trim());
    res.status(200).json({ ...result, fallback: false });
  } catch (error) {
    console.error("Gemini API Error in matchUploadController:", error);
    const result = localOptimizeResume({}, jobDescription, extractedText);
    res.status(200).json({ ...result, fallback: true, error: error.message });
  }
};
