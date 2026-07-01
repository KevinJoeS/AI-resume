import { GoogleGenAI } from "@google/genai";

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
  let combinedResumeText = resumeText;
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

  const cleanResume = combinedResumeText.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "");
  const cleanJD = jobDescription.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "");

  // Common IT/Developer/Professional keywords to check
  const checkKeywords = [
    "react", "node", "express", "javascript", "typescript", "mongodb", "python", "java", "sql", "git",
    "aws", "docker", "kubernetes", "agile", "scrum", "rest api", "graphql", "tailwind", "sass", "css",
    "html", "devops", "cloud", "ui", "ux", "figma", "testing", "jest", "cicd", "microservices",
    "communication", "teamwork", "leadership", "analytics", "marketing", "seo", "sales", "finance"
  ];

  const resumeWords = new Set(cleanResume.split(/\s+/));
  const jdWords = new Set(cleanJD.split(/\s+/));

  // Find matches
  const matchingSkills = [];
  const missingKeywords = [];

  checkKeywords.forEach(kw => {
    const isMatched = resumeWords.has(kw);
    const isInJD = jdWords.has(kw);

    if (isInJD) {
      if (isMatched) {
        matchingSkills.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      } else {
        missingKeywords.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    }
  });

  // Calculate score
  const totalKeywordsInJD = matchingSkills.length + missingKeywords.length;
  let matchScore = 40; // baseline
  if (totalKeywordsInJD > 0) {
    matchScore = Math.round((matchingSkills.length / totalKeywordsInJD) * 50 + 45);
  }
  matchScore = Math.min(Math.max(matchScore, 15), 98); // clamp between 15% and 98% for realistic feel

  // Generate suggestions
  const suggestions = [];

  if (matchScore < 70) {
    suggestions.push({
      field: "general",
      type: "warning",
      message: `Your resume has a matching score of ${matchScore}%. We recommend incorporating more of the key terms found in the job description to bypass ATS filters.`
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
      message: `Consider adding these missing keywords to your Skills section: ${missingKeywords.slice(0, 5).join(", ")}.`
    });
  }

  if (!resumeData.summary || resumeData.summary.length < 50) {
    suggestions.push({
      field: "summary",
      type: "warning",
      message: "Your summary is empty or too short. Write a tailored 3-4 sentence professional summary summarizing your match with this role."
    });
  } else {
    // Check if job title is in summary
    const roleWords = (resumeData.role || "").toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const hasRoleInSummary = roleWords.some(w => resumeData.summary.toLowerCase().includes(w));
    if (!hasRoleInSummary && resumeData.role) {
      suggestions.push({
        field: "summary",
        type: "info",
        message: `Tailor your Summary to explicitly mention your experience as a '${resumeData.role}' or similar target job titles.`
      });
    }
  }

  if (!resumeData.projects || resumeData.projects.length === 0) {
    suggestions.push({
      field: "projects",
      type: "warning",
      message: "Add at least 2 relevant projects showcasing the key technologies listed in the job description."
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
