import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mdPath = path.resolve(__dirname, '../../AI-200-complete-study-guide.md');
const content = fs.readFileSync(mdPath, 'utf8');

console.log(`Loaded markdown file with ${content.length} characters, ${content.split('\n').length} lines.`);

// Preamble before first '##'
const firstH2 = content.indexOf('\n## ');
const preamble = firstH2 > -1 ? content.slice(0, firstH2).trim() : '';

// 1. Extract vocabulary from Section 3
function extractVocabulary(text) {
  const vocabMatch = text.match(/## 3\. Core vocabulary([\s\S]*?)---/);
  if (!vocabMatch) return [];
  const vocabText = vocabMatch[1];
  const items = [];
  let currentCategory = 'General';

  const lines = vocabText.split('\n');
  for (const line of lines) {
    const catMatch = line.match(/^###\s+(.*)/);
    if (catMatch) {
      currentCategory = catMatch[1].trim();
      continue;
    }
    const itemMatch = line.match(/^-\s+\*\*(.*?):\*\*\s+(.*)/);
    if (itemMatch) {
      items.push({
        term: itemMatch[1].trim(),
        definition: itemMatch[2].trim(),
        category: currentCategory
      });
    }
  }
  return items;
}

// 2. Parse answer keys
function parseAnswerKey(rawKeyText) {
  const map = {};
  const lines = rawKeyText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const m = trimmed.match(/^([A-Za-z0-9]+)\.\s+([A-D])\s*[-–:]\s*(.*)$/);
    if (m) {
      map[m[1]] = {
        correct: m[2],
        explanation: m[3].trim()
      };
    }
  }
  return map;
}

const testAKeyMatch = content.match(/### Practice Test A answer key\s*```text([\s\S]*?)```/);
const testAKeys = testAKeyMatch ? parseAnswerKey(testAKeyMatch[1]) : {};

const testBKeyMatch = content.match(/### Practice Test B answer key\s*```text([\s\S]*?)```/);
const testBKeys = testBKeyMatch ? parseAnswerKey(testBKeyMatch[1]) : {};

const simKeyMatch = content.match(/### Full simulation answer key\s*```text([\s\S]*?)```/);
const simKeys = simKeyMatch ? parseAnswerKey(simKeyMatch[1]) : {};

function inferDomain(text, qNum) {
  const lower = text.toLowerCase();
  if (lower.includes('domain 1') || lower.includes('container') || lower.includes('acr') || lower.includes('aks') || lower.includes('keda')) return 'Domain 1';
  if (lower.includes('domain 2') || lower.includes('cosmos') || lower.includes('vector') || lower.includes('pgvector') || lower.includes('redis') || lower.includes('embedding')) return 'Domain 2';
  if (lower.includes('domain 3') || lower.includes('service bus') || lower.includes('event grid') || lower.includes('function') || lower.includes('event hub')) return 'Domain 3';
  if (lower.includes('domain 4') || lower.includes('key vault') || lower.includes('kql') || lower.includes('application insights') || lower.includes('rbac') || lower.includes('monitor') || lower.includes('app configuration')) return 'Domain 4';
  
  if (typeof qNum === 'string' && qNum.startsWith('F')) {
    const n = parseInt(qNum.replace('F', ''), 10);
    if (n >= 1 && n <= 15) return 'Domain 1';
    if (n >= 16 && n <= 33) return 'Domain 2';
    if (n >= 34 && n <= 47) return 'Domain 3';
    if (n >= 48 && n <= 60) return 'Domain 4';
  }
  return 'Domain 1';
}

// 4. Parse all questions
const allQuestions = [];

// Parse Section 12 drills (1-24)
const drillsMatch = content.match(/## 12\. Original scenario drills([\s\S]*?)(?=## Additional sample question bank)/);
if (drillsMatch) {
  const drillsText = drillsMatch[1];
  const qBlocks = drillsText.split(/####\s+/);
  let currentDomain = 'Domain 1';
  for (let i = 1; i < qBlocks.length; i++) {
    const block = qBlocks[i];
    const headerLine = block.split('\n')[0].trim();
    const titleMatch = headerLine.match(/^(\d+)\.\s*(.*)/);
    if (!titleMatch) continue;
    const qNum = titleMatch[1];
    const title = titleMatch[2];
    
    const numInt = parseInt(qNum, 10);
    if (numInt <= 5) currentDomain = 'Domain 1';
    else if (numInt <= 11) currentDomain = 'Domain 2';
    else if (numInt <= 17) currentDomain = 'Domain 3';
    else currentDomain = 'Domain 4';

    const answerSplit = block.split(/\*\*Answer:\*\*/);
    const scenario = answerSplit[0].replace(headerLine, '').trim();
    const answer = answerSplit[1] ? answerSplit[1].trim() : '';

    allQuestions.push({
      id: `drill-${qNum}`,
      num: qNum,
      title: title,
      category: 'drills',
      set: 'Original Scenario Drills',
      domain: currentDomain,
      type: 'drill',
      question: scenario,
      options: [],
      correctAnswer: '',
      explanation: answer
    });
  }
}

// Parse Section "Additional sample question bank"
const sampleBankMatch = content.match(/## Additional sample question bank([\s\S]*?)(?=## Full 120-minute simulation)/);
if (sampleBankMatch) {
  const bankText = sampleBankMatch[1];
  const qBlocks = bankText.split(/####\s+/);
  let currentDomain = 'Domain 1';
  for (let i = 1; i < qBlocks.length; i++) {
    const block = qBlocks[i];
    const headerLine = block.split('\n')[0].trim();
    const titleMatch = headerLine.match(/^(\d+)\.\s*(.*)/);
    if (!titleMatch) continue;
    const qNum = titleMatch[1];
    const title = titleMatch[2];
    const numInt = parseInt(qNum, 10);

    let qSet = 'Domain Sample Questions';
    let qType = 'mcq';
    let correct = '';
    let explanation = '';

    if (numInt >= 31 && numInt <= 40) currentDomain = 'Domain 1';
    else if (numInt >= 41 && numInt <= 52) currentDomain = 'Domain 2';
    else if (numInt >= 53 && numInt <= 60) currentDomain = 'Domain 3';
    else if (numInt >= 61 && numInt <= 66) currentDomain = 'Domain 4';
    else if (numInt >= 67 && numInt <= 78) {
      if (numInt <= 69) currentDomain = 'Domain 1';
      else if (numInt <= 72) currentDomain = 'Domain 2';
      else if (numInt <= 75) currentDomain = 'Domain 3';
      else currentDomain = 'Domain 4';
      qSet = 'Deep-Audit Scenario Drills';
      qType = 'drill';
    } else if (numInt >= 79 && numInt <= 98) {
      currentDomain = inferDomain(block, qNum);
      qSet = 'Practice Test A';
      if (testAKeys[qNum]) {
        correct = testAKeys[qNum].correct;
        explanation = testAKeys[qNum].explanation;
      }
    } else if (numInt >= 99 && numInt <= 118) {
      currentDomain = inferDomain(block, qNum);
      qSet = 'Practice Test B';
      if (testBKeys[qNum]) {
        correct = testBKeys[qNum].correct;
        explanation = testBKeys[qNum].explanation;
      }
    }

    if (qType === 'drill') {
      const answerSplit = block.split(/\*\*Answer:\*\*/);
      const scenario = answerSplit[0].replace(headerLine, '').trim();
      const ans = answerSplit[1] ? answerSplit[1].trim() : '';
      allQuestions.push({
        id: `q-${qNum}`,
        num: qNum,
        title: title,
        category: 'deep_audit',
        set: qSet,
        domain: currentDomain,
        type: 'drill',
        question: scenario,
        options: [],
        correctAnswer: '',
        explanation: ans
      });
    } else {
      const lines = block.split('\n').slice(1);
      const questionLines = [];
      const options = [];

      for (let j = 0; j < lines.length; j++) {
        const line = lines[j].trim();
        const optMatch = line.match(/^([A-D])\.\s+(.*)/);
        const ansMatch = line.match(/^\*\*Answer:\*\*\s+([A-D])\.\s*(.*)/);

        if (ansMatch) {
          correct = ansMatch[1];
          explanation = ansMatch[2].trim();
        } else if (optMatch) {
          options.push({
            key: optMatch[1],
            text: optMatch[2].trim()
          });
        } else if (!line.startsWith('**Answer:**') && !line.startsWith('###')) {
          if (options.length === 0) {
            questionLines.push(lines[j]);
          }
        }
      }

      allQuestions.push({
        id: `q-${qNum}`,
        num: qNum,
        title: title,
        category: numInt <= 66 ? 'domain_sample' : (numInt <= 98 ? 'test_a' : 'test_b'),
        set: qSet,
        domain: currentDomain,
        type: 'mcq',
        question: questionLines.join('\n').trim(),
        options: options,
        correctAnswer: correct,
        explanation: explanation
      });
    }
  }
}

// Parse Section "Full 120-minute simulation"
const simMatch = content.match(/## Full 120-minute simulation([\s\S]*?)(?=## 13\. Study plan)/);
if (simMatch) {
  const simText = simMatch[1];
  const qBlocks = simText.split(/####\s+/);
  for (let i = 1; i < qBlocks.length; i++) {
    const block = qBlocks[i];
    const headerLine = block.split('\n')[0].trim();
    const titleMatch = headerLine.match(/^(F\d+)\.\s*(.*)/);
    if (!titleMatch) continue;
    const qNum = titleMatch[1];
    const title = titleMatch[2];

    const lines = block.split('\n').slice(1);
    const questionLines = [];
    const options = [];

    for (let j = 0; j < lines.length; j++) {
      const line = lines[j].trim();
      const optMatch = line.match(/^([A-D])\.\s+(.*)/);
      if (optMatch) {
        options.push({
          key: optMatch[1],
          text: optMatch[2].trim()
        });
      } else if (!line.startsWith('###')) {
        if (options.length === 0) {
          questionLines.push(lines[j]);
        }
      }
    }

    const keyInfo = simKeys[qNum] || { correct: '', explanation: '' };

    allQuestions.push({
      id: `sim-${qNum}`,
      num: qNum,
      title: title,
      category: 'simulation',
      set: 'Full 120-minute simulation',
      domain: inferDomain('', qNum),
      type: 'mcq',
      question: questionLines.join('\n').trim(),
      options: options,
      correctAnswer: keyInfo.correct,
      explanation: keyInfo.explanation
    });
  }
}

// 5. Parse Markdown Sections
const mainSections = [];
if (preamble) {
  mainSections.push({
    id: 'overview-introduction',
    title: 'Overview & Guide Scope',
    domain: 'General',
    content: preamble
  });
}

const secRegex = /^##\s+([^\r\n]+)/gm;
let match;
const sectionIndices = [];

while ((match = secRegex.exec(content)) !== null) {
  sectionIndices.push({
    title: match[1].trim(),
    index: match.index
  });
}

for (let i = 0; i < sectionIndices.length; i++) {
  const cur = sectionIndices[i];
  const next = sectionIndices[i + 1];
  const secContent = next ? content.slice(cur.index, next.index) : content.slice(cur.index);
  
  let cleanId = cur.title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

  let domain = 'General';
  if (cur.title.includes('Domain 1')) domain = 'Domain 1';
  else if (cur.title.includes('Domain 2')) domain = 'Domain 2';
  else if (cur.title.includes('Domain 3')) domain = 'Domain 3';
  else if (cur.title.includes('Domain 4')) domain = 'Domain 4';
  else if (cur.title.includes('Cross-domain')) domain = 'Cross-domain';
  else if (cur.title.includes('Decision tables') || cur.title.includes('CLI') || cur.title.includes('Labs') || cur.title.includes('simulation') || cur.title.includes('drills') || cur.title.includes('question bank')) domain = 'Practice & Labs';

  mainSections.push({
    id: cleanId,
    title: cur.title,
    domain: domain,
    content: secContent.trim()
  });
}

// 6. Extract Decision Tables
function extractDecisionTables(text) {
  const match = text.match(/## 9\. Decision tables([\s\S]*?)## 10\. Practical labs/);
  if (!match) return [];
  const secText = match[1];
  const tables = [];
  const blocks = secText.split(/###\s+/);
  
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].trim();
    const lines = block.split('\n');
    const title = lines[0].trim();
    
    // Find table
    const tableLines = lines.filter(l => l.trim().startsWith('|'));
    if (tableLines.length >= 3) {
      const headers = tableLines[0].split('|').map(s => s.trim()).filter(Boolean);
      const rows = [];
      for (let r = 2; r < tableLines.length; r++) {
        const cells = tableLines[r].split('|').map(s => s.trim()).filter(Boolean);
        if (cells.length > 0) {
          rows.push(cells);
        }
      }
      tables.push({
        title,
        headers,
        rows
      });
    }
  }
  return tables;
}

// 7. Extract Code Cheatsheets (Section 11 & 11.1)
function extractCheatsheets(text) {
  const match = text.match(/## 11\. CLI, SDK, SQL, and KQL patterns([\s\S]*?)## 12\. Original scenario drills/);
  if (!match) return [];
  const secText = match[1];
  const items = [];

  const subheads = secText.split(/###[#]?\s+/);
  for (let i = 1; i < subheads.length; i++) {
    const part = subheads[i];
    const lines = part.split('\n');
    const title = lines[0].trim();

    const codeBlocks = [...part.matchAll(/```(\w+)\r?\n([\s\S]*?)```/g)];
    const descLines = lines.slice(1).filter(l => !l.startsWith('```') && l.trim().length > 0 && !l.startsWith('|'));
    const desc = descLines.slice(0, 3).join(' ').trim();

    for (const cb of codeBlocks) {
      items.push({
        title: title,
        language: cb[1],
        code: cb[2].trim(),
        description: desc
      });
    }
  }
  return items;
}

// 8. Parse Mastery Checklists from Domains + Readiness Gate
function extractAllChecklists(text) {
  const lists = [];

  // Match all ### ... mastery checklist
  const masteries = [...text.matchAll(/###\s+(Domain\s+\d+\s+mastery checklist)([\s\S]*?)---/gi)];
  for (const m of masteries) {
    const title = m[1].trim();
    const body = m[2];
    const items = [];
    for (const line of body.split('\n')) {
      const trimmed = line.trim();
      const itemMatch = trimmed.match(/^-\s+\[\s*\]\s+(.*)/);
      if (itemMatch) {
        items.push(itemMatch[1].trim());
      }
    }
    if (items.length > 0) {
      lists.push({
        id: title.toLowerCase().replace(/[^\w]/g, '-'),
        title: title,
        domain: title.split(' ')[0] + ' ' + title.split(' ')[1],
        items: items
      });
    }
  }

  // Section 14 items
  const gateMatch = text.match(/## 14\. 95% readiness gate([\s\S]*?)## 15\. Exam-day strategy/);
  if (gateMatch) {
    const gateText = gateMatch[1];
    const subheads = gateText.split(/###\s+/);
    for (let i = 1; i < subheads.length; i++) {
      const lines = subheads[i].split('\n');
      const groupTitle = lines[0].trim();
      const items = [];
      for (let j = 1; j < lines.length; j++) {
        const line = lines[j].trim();
        const m = line.match(/^-\s+\[\s*\]\s+(.*)/) || line.match(/^-\s+(.*)/);
        if (m && !line.startsWith('###') && !line.startsWith('|') && !line.startsWith('```')) {
          items.push(m[1].trim());
        }
      }
      if (items.length > 0) {
        lists.push({
          id: groupTitle.toLowerCase().replace(/[^\w]/g, '-'),
          title: groupTitle,
          domain: 'Readiness Gate',
          items: items
        });
      }
    }
  }

  return lists;
}

// 9. Parse Study Plan
function extractStudyPlan(text) {
  const match = text.match(/## 13\. Study plan([\s\S]*?)(?=## 14\. 95% readiness gate)/);
  if (!match) return [];
  const planText = match[1];
  const weeks = [];
  const subheads = planText.split(/###\s+/);
  for (let i = 1; i < subheads.length; i++) {
    const lines = subheads[i].split('\n');
    const weekTitle = lines[0].trim();
    const tasks = [];
    for (let j = 1; j < lines.length; j++) {
      const line = lines[j].trim();
      const m = line.match(/^-\s+\*\*(.*?):\*\*\s+(.*)/) || line.match(/^-\s+(.*)/);
      if (m) {
        tasks.push({
          topic: m[2] ? m[1] : '',
          details: m[2] ? m[2] : m[1]
        });
      }
    }
    weeks.push({
      title: weekTitle,
      tasks: tasks
    });
  }
  return weeks;
}

const vocabulary = extractVocabulary(content);
const readiness = extractAllChecklists(content);
const studyPlan = extractStudyPlan(content);
const decisionTables = extractDecisionTables(content);
const cheatsheets = extractCheatsheets(content);

const outDir = path.resolve(__dirname, '../src/data');
fs.writeFileSync(path.join(outDir, 'vocabulary.json'), JSON.stringify(vocabulary, null, 2));
fs.writeFileSync(path.join(outDir, 'questions.json'), JSON.stringify(allQuestions, null, 2));
fs.writeFileSync(path.join(outDir, 'sections.json'), JSON.stringify(mainSections, null, 2));
fs.writeFileSync(path.join(outDir, 'readiness.json'), JSON.stringify(readiness, null, 2));
fs.writeFileSync(path.join(outDir, 'study-plan.json'), JSON.stringify(studyPlan, null, 2));
fs.writeFileSync(path.join(outDir, 'decision-tables.json'), JSON.stringify(decisionTables, null, 2));
fs.writeFileSync(path.join(outDir, 'cheatsheets.json'), JSON.stringify(cheatsheets, null, 2));

console.log(`Generated:
- Vocabulary: ${vocabulary.length}
- Questions: ${allQuestions.length}
- Sections: ${mainSections.length}
- Readiness Checklists: ${readiness.length}
- Study Plan Weeks: ${studyPlan.length}
- Decision Tables: ${decisionTables.length}
- Cheatsheets: ${cheatsheets.length}
`);
