import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const filePath = path.join(root, "lib", "questionBank.ts");
const source = fs.readFileSync(filePath, "utf8");

const requiredFields = ["topic", "difficulty", "prompt", "options", "correctAnswer", "explanation"];
const allowedSubjects = new Set(["russian", "math", "social"]);
const allowedModes = new Set(["diagnosis", "session", "both"]);
const allowedDifficulties = new Set(["easy", "medium", "hard"]);
const allowedExamLabels = new Set(["Формат ЕГЭ", "Типовое задание", "По структуре экзамена"]);

function fail(message) {
  throw new Error(message);
}

function skipString(text, index) {
  const quote = text[index];
  index += 1;

  while (index < text.length) {
    const char = text[index];

    if (char === "\\") {
      index += 2;
      continue;
    }

    if (char === quote) return index + 1;
    index += 1;
  }

  fail(`Unclosed string starting with ${quote}`);
}

function skipTemplate(text, index) {
  index += 1;

  while (index < text.length) {
    const char = text[index];

    if (char === "\\") {
      index += 2;
      continue;
    }

    if (char === "`") return index + 1;
    index += 1;
  }

  fail("Unclosed template string");
}

function skipComment(text, index) {
  if (text[index] === "/" && text[index + 1] === "/") {
    const end = text.indexOf("\n", index + 2);
    return end === -1 ? text.length : end + 1;
  }

  if (text[index] === "/" && text[index + 1] === "*") {
    const end = text.indexOf("*/", index + 2);
    if (end === -1) fail("Unclosed block comment");
    return end + 2;
  }

  return index;
}

function findMatchingBracket(text, openIndex) {
  let depth = 0;

  for (let index = openIndex; index < text.length; index += 1) {
    const skippedCommentIndex = skipComment(text, index);
    if (skippedCommentIndex !== index) {
      index = skippedCommentIndex - 1;
      continue;
    }

    const char = text[index];

    if (char === "\"" || char === "'") {
      index = skipString(text, index) - 1;
      continue;
    }

    if (char === "`") {
      index = skipTemplate(text, index) - 1;
      continue;
    }

    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  fail(`Could not find matching ] for index ${openIndex}`);
}

function extractArrayAfter(startIndex) {
  const openIndex = source.indexOf("[", startIndex);
  if (openIndex === -1) fail(`Could not find array after index ${startIndex}`);
  const closeIndex = findMatchingBracket(source, openIndex);
  return source.slice(openIndex, closeIndex + 1);
}

function evaluateArray(arrayText, sandbox, label) {
  try {
    const context = vm.createContext(sandbox);
    return vm.runInContext(`(${arrayText})`, context, { timeout: 1000 });
  } catch (error) {
    fail(`Could not parse ${label}: ${error.message}`);
  }
}

const sandbox = {};
const simpleArrayRegex = /const\s+(\w+)\s*:\s*QuestionInput\[\]\s*=\s*\[/g;
let match;

while ((match = simpleArrayRegex.exec(source)) !== null) {
  const [, name] = match;
  const arrayText = extractArrayAfter(match.index);
  sandbox[name] = evaluateArray(arrayText, sandbox, name);
}

const questions = [];
const createRegex = /const\s+(\w+)\s*=\s*createQuestions\(\s*["'](\w+)["']\s*,\s*["'](\w+)["']\s*,\s*\[/g;

while ((match = createRegex.exec(source)) !== null) {
  const [, name, subject, mode] = match;
  const arrayText = extractArrayAfter(match.index);
  const entries = evaluateArray(arrayText, sandbox, name);

  entries.forEach((entry, index) => {
    questions.push({
      ...entry,
      id: `${subject}-${mode}-${index + 1}`,
      subject,
      mode,
      sourceArray: name,
      sourceIndex: index + 1,
    });
  });
}

function normalize(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function formatRef(question) {
  return `${question.sourceArray}[${question.sourceIndex}] (${question.subject}/${question.mode})`;
}

const errors = [];
const warnings = [];
const promptMap = new Map();
const idMap = new Map();

if (questions.length === 0) {
  errors.push("No questions found. Check parser patterns in scripts/check-question-bank.mjs.");
}

for (const question of questions) {
  const ref = question && typeof question === "object" ? formatRef(question) : "unknown question";

  if (!question || typeof question !== "object") {
    errors.push(`${ref}: question entry is empty or not an object`);
    continue;
  }

  for (const field of requiredFields) {
    if (!(field in question)) {
      errors.push(`${ref}: missing required field '${field}'`);
    }
  }

  if (!allowedSubjects.has(question.subject)) {
    errors.push(`${ref}: invalid subject '${question.subject}'`);
  }

  if (!allowedModes.has(question.mode)) {
    errors.push(`${ref}: invalid mode '${question.mode}'`);
  }

  if (!allowedDifficulties.has(question.difficulty)) {
    errors.push(`${ref}: invalid difficulty '${question.difficulty}'`);
  }

  if (question.examLabel && !allowedExamLabels.has(question.examLabel)) {
    errors.push(`${ref}: unexpected examLabel '${question.examLabel}'`);
  }

  if (typeof question.prompt !== "string" || question.prompt.trim().length < 8) {
    errors.push(`${ref}: prompt is empty or too short`);
  }

  if (typeof question.correctAnswer !== "string" || question.correctAnswer.trim() === "") {
    errors.push(`${ref}: correctAnswer is empty`);
  }

  if (typeof question.explanation !== "string" || question.explanation.trim().length < 15) {
    warnings.push(`${ref}: explanation looks too short`);
  }

  if (!Array.isArray(question.options)) {
    errors.push(`${ref}: options must be an array`);
    continue;
  }

  if (question.options.length < 4) {
    errors.push(`${ref}: expected at least 4 options, got ${question.options.length}`);
  }

  const emptyOptions = question.options
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => typeof option !== "string" || option.trim() === "");

  for (const { index } of emptyOptions) {
    errors.push(`${ref}: option ${index + 1} is empty`);
  }

  const normalizedOptions = question.options.map(normalize);
  const optionSet = new Set(normalizedOptions);

  if (optionSet.size !== normalizedOptions.length) {
    errors.push(`${ref}: duplicate options found: ${JSON.stringify(question.options)}`);
  }

  const exactMatches = question.options.filter((option) => option === question.correctAnswer);
  const normalizedMatches = normalizedOptions.filter((option) => option === normalize(question.correctAnswer));

  if (exactMatches.length !== 1) {
    if (normalizedMatches.length === 1) {
      errors.push(`${ref}: correctAnswer must match option exactly. correctAnswer='${question.correctAnswer}', options=${JSON.stringify(question.options)}`);
    } else {
      errors.push(`${ref}: correctAnswer must match exactly one option. correctAnswer='${question.correctAnswer}', options=${JSON.stringify(question.options)}`);
    }
  }

  if (question.options.some((option) => typeof option === "string" && option.length > 140)) {
    warnings.push(`${ref}: one of the options is very long`);
  }

  const promptKey = normalize(question.prompt);
  if (promptMap.has(promptKey)) {
    warnings.push(`${ref}: duplicate or near-duplicate prompt also found in ${promptMap.get(promptKey)}`);
  } else {
    promptMap.set(promptKey, ref);
  }

  if (idMap.has(question.id)) {
    errors.push(`${ref}: duplicate generated id '${question.id}' also found in ${idMap.get(question.id)}`);
  } else {
    idMap.set(question.id, ref);
  }
}

const bySubject = questions.reduce((acc, question) => {
  if (question && question.subject) acc[question.subject] = (acc[question.subject] ?? 0) + 1;
  return acc;
}, {});

console.log(`Checked ${questions.length} questions.`);
console.log(`By subject: russian=${bySubject.russian ?? 0}, math=${bySubject.math ?? 0}, social=${bySubject.social ?? 0}.`);

if (warnings.length > 0) {
  console.log("\nWarnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length > 0) {
  console.error("\nErrors:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Question bank check passed.");
