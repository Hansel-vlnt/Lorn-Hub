import fs from 'fs';

const b = JSON.parse(fs.readFileSync('d:/Project/Lorn-Hub/.ua/intermediate/batches.json', 'utf-8'));
for (const batch of b.batches) {
  const prompt = [
    'Analyze these files and produce GraphNode and GraphEdge objects.',
    'Project root: d:/Project/Lorn-Hub',
    'Project: Lorn-Hub — Asisten & Kompilasi Hukum Indonesia (PWA Offline-First)',
    'Languages: typescript, javascript, json, html, css, markdown',
    'Batch: ' + batch.batchIndex + '/5',
    'Skill directory: C:/Users/harla/.gemini/config/plugins/understand-anything-plugin/skills/understand',
    'Output: write to d:/Project/Lorn-Hub/.ua/intermediate/batch-' + batch.batchIndex + '.json',
    '',
    '> **Language directive**: Generate all textual content (summaries, descriptions, tags, titles, languageNotes, languageLesson) in **Indonesian** (Bahasa Indonesia). Maintain technical accuracy while using natural, native-level phrasing in Indonesian. Keep technical terms in English when no standard translation exists (e.g., "middleware", "hook", "barrel", "state", "props").',
    '',
    'Pre-resolved import data for this batch:',
    JSON.stringify(batch.batchImportData || {}),
    '',
    'Cross-batch neighbors with their exported symbols:',
    JSON.stringify(batch.neighborMap || {}),
    '',
    'Files to analyze in this batch:',
    ...batch.files.map((f, i) => `${i + 1}. ${f.path} (${f.sizeLines} lines, language: ${f.language}, fileCategory: ${f.fileCategory})`)
  ].join('\n');
  fs.writeFileSync(`d:/Project/Lorn-Hub/.ua/intermediate/prompt-batch-${batch.batchIndex}.txt`, prompt, 'utf-8');
}
console.log('Prompts created.');
