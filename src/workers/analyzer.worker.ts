import Papa from "papaparse";
import Fuse from "fuse.js";

// Define types locally to avoid import issues
interface ICD10Item {
  code: string;
  description: string;
  category: string;
}

interface Entity {
  term: string;
  start: number;
  end: number;
  icd10: string;
  description: string;
  confidence: number;
}

let fuse: Fuse<ICD10Item> | null = null;
let isInitialized = false;

const fallbackData: ICD10Item[] = [
  { code: "E11.9", description: "Type 2 diabetes mellitus without complications", category: "Endocrine" },
  { code: "I10", description: "Essential (primary) hypertension", category: "Circulatory" },
];

// Initialize the worker: Load data and build index
const initialize = async () => {
  if (isInitialized) return;

  try {
    const response = await fetch("/icd10-2023.csv");
    let data: ICD10Item[] = [];

    if (!response.ok) {
      console.warn("Worker: icd10-2023.csv not found, using fallback");
      data = fallbackData;
    } else {
      const csvText = await response.text();
      await new Promise<void>((resolve) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            data = results.data.map((row: any) => ({
              code: row.ICDCode || row.code || row.Code || row.CODE || "???",
              description: row.Description || row.description || row.DESCRIPTION || "No description",
              category: "General"
            })).filter((item: any) => item.code !== "???");
            resolve();
          },
          error: () => {
            data = fallbackData;
            resolve();
          }
        });
      });
    }

    fuse = new Fuse(data, {
      keys: ["description", "code"],
      includeScore: true,
      threshold: 0.3,
      ignoreLocation: true,
    });

    isInitialized = true;
    self.postMessage({ type: 'READY' });
  } catch (error) {
    console.error("Worker initialization failed:", error);
    self.postMessage({ type: 'ERROR', error: 'Failed to load ICD-10 database' });
  }
};

// Analyze text logic (moved from main thread)
const analyzeText = async (text: string) => {
  if (!fuse) {
    await initialize();
  }
  
  if (!fuse) return; // Should not happen

  const tokens: { text: string; start: number; end: number }[] = [];
  const regex = /[a-zA-Z0-9]+/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (match[0].length > 2 && !/^(and|the|but|for|with|was|were|that|this|have|from|are|has|had|not)$/i.test(match[0])) {
      tokens.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length
      });
    }
  }

  const foundEntities: Entity[] = [];
  const coveredIndices = new Set<number>();
  
  const totalTokens = tokens.length;
  const BATCH_SIZE = 50; // Larger batch size since we are in a worker
  const MAX_PHRASE_LENGTH = 6;

  for (let i = 0; i < totalTokens; i += BATCH_SIZE) {
    const batchEnd = Math.min(i + BATCH_SIZE, totalTokens);
    
    // Report progress
    self.postMessage({ type: 'PROGRESS', value: Math.round((i / totalTokens) * 100) });
    
    // Yield to event loop to allow messages to process
    await new Promise(resolve => setTimeout(resolve, 0));

    for (let j = i; j < batchEnd; j++) {
      if (coveredIndices.has(j)) continue;

      let bestPhraseMatch = null;
      let bestPhraseLength = 0;

      for (let len = MAX_PHRASE_LENGTH; len >= 1; len--) {
        if (j + len > totalTokens) continue;

        const phraseTokens = tokens.slice(j, j + len);
        
        let isBlocked = false;
        for (let k = 0; k < len; k++) {
          if (coveredIndices.has(j + k)) {
            isBlocked = true;
            break;
          }
        }
        if (isBlocked) continue;

        const query = phraseTokens.map(t => t.text).join(" ");
        
        // Optimization: Don't search if query is just a common word that wasn't filtered
        if (len === 1 && query.length < 4) continue;

        const results = fuse.search(query);
        
        if (results.length > 0) {
          const match = results[0];
          // Stricter threshold for single words
          const threshold = len === 1 ? 0.15 : 0.25;
          
          if (match.score !== undefined && match.score < threshold) {
            bestPhraseMatch = match;
            bestPhraseLength = len;
            break; 
          }
        }
      }

      if (bestPhraseMatch) {
        const startToken = tokens[j];
        const endToken = tokens[j + bestPhraseLength - 1];
        
        foundEntities.push({
          term: text.slice(startToken.start, endToken.end),
          start: startToken.start,
          end: endToken.end,
          icd10: bestPhraseMatch.item.code,
          description: bestPhraseMatch.item.description,
          confidence: 1 - (bestPhraseMatch.score || 0)
        });

        for (let k = 0; k < bestPhraseLength; k++) {
          coveredIndices.add(j + k);
        }
      }
    }
  }

  self.postMessage({ type: 'RESULT', entities: foundEntities });
};

self.onmessage = (e) => {
  const { type, text } = e.data;
  
  if (type === 'INIT') {
    initialize();
  } else if (type === 'ANALYZE') {
    analyzeText(text);
  }
};
