import * as fs from "fs";
import * as path from "path";

// --- Book metadata ---

interface BookMeta {
  id: number;
  name: string;
  abbr: string;
}

const BOOKS: BookMeta[] = [
  { id: 1, name: "창세기", abbr: "창" },
  { id: 2, name: "출애굽기", abbr: "출" },
  { id: 3, name: "레위기", abbr: "레" },
  { id: 4, name: "민수기", abbr: "민" },
  { id: 5, name: "신명기", abbr: "신" },
  { id: 6, name: "여호수아", abbr: "수" },
  { id: 7, name: "사사기", abbr: "삿" },
  { id: 8, name: "룻기", abbr: "룻" },
  { id: 9, name: "사무엘상", abbr: "삼상" },
  { id: 10, name: "사무엘하", abbr: "삼하" },
  { id: 11, name: "열왕기상", abbr: "왕상" },
  { id: 12, name: "열왕기하", abbr: "왕하" },
  { id: 13, name: "역대상", abbr: "대상" },
  { id: 14, name: "역대하", abbr: "대하" },
  { id: 15, name: "에스라", abbr: "스" },
  { id: 16, name: "느헤미야", abbr: "느" },
  { id: 17, name: "에스더", abbr: "에" },
  { id: 18, name: "욥기", abbr: "욥" },
  { id: 19, name: "시편", abbr: "시" },
  { id: 20, name: "잠언", abbr: "잠" },
  { id: 21, name: "전도서", abbr: "전" },
  { id: 22, name: "아가", abbr: "아" },
  { id: 23, name: "이사야", abbr: "사" },
  { id: 24, name: "예레미야", abbr: "렘" },
  { id: 25, name: "예레미야애가", abbr: "애" },
  { id: 26, name: "에스겔", abbr: "겔" },
  { id: 27, name: "다니엘", abbr: "단" },
  { id: 28, name: "호세아", abbr: "호" },
  { id: 29, name: "요엘", abbr: "욜" },
  { id: 30, name: "아모스", abbr: "암" },
  { id: 31, name: "오바댜", abbr: "옵" },
  { id: 32, name: "요나", abbr: "욘" },
  { id: 33, name: "미가", abbr: "미" },
  { id: 34, name: "나훔", abbr: "나" },
  { id: 35, name: "하박국", abbr: "합" },
  { id: 36, name: "스바냐", abbr: "습" },
  { id: 37, name: "학개", abbr: "학" },
  { id: 38, name: "스가랴", abbr: "슥" },
  { id: 39, name: "말라기", abbr: "말" },
  { id: 40, name: "마태복음", abbr: "마" },
  { id: 41, name: "마가복음", abbr: "막" },
  { id: 42, name: "누가복음", abbr: "눅" },
  { id: 43, name: "요한복음", abbr: "요" },
  { id: 44, name: "사도행전", abbr: "행" },
  { id: 45, name: "로마서", abbr: "롬" },
  { id: 46, name: "고린도전서", abbr: "고전" },
  { id: 47, name: "고린도후서", abbr: "고후" },
  { id: 48, name: "갈라디아서", abbr: "갈" },
  { id: 49, name: "에베소서", abbr: "엡" },
  { id: 50, name: "빌립보서", abbr: "빌" },
  { id: 51, name: "골로새서", abbr: "골" },
  { id: 52, name: "데살로니가전서", abbr: "살전" },
  { id: 53, name: "데살로니가후서", abbr: "살후" },
  { id: 54, name: "디모데전서", abbr: "딤전" },
  { id: 55, name: "디모데후서", abbr: "딤후" },
  { id: 56, name: "디도서", abbr: "딛" },
  { id: 57, name: "빌레몬서", abbr: "몬" },
  { id: 58, name: "히브리서", abbr: "히" },
  { id: 59, name: "야고보서", abbr: "약" },
  { id: 60, name: "베드로전서", abbr: "벧전" },
  { id: 61, name: "베드로후서", abbr: "벧후" },
  { id: 62, name: "요한일서", abbr: "요일" },
  { id: 63, name: "요한이서", abbr: "요이" },
  { id: 64, name: "요한삼서", abbr: "요삼" },
  { id: 65, name: "유다서", abbr: "유" },
  { id: 66, name: "요한계시록", abbr: "계" },
];

// --- Types ---

interface Footnote {
  marker: string;
  word: string;
  content: string;
}

interface Verse {
  verse: number;
  text: string;
  heading?: string;
  footnotes?: Footnote[];
}

interface Chapter {
  chapter: number;
  verses: Verse[];
}

interface Book {
  id: number;
  name: string;
  abbr: string;
  chapters: Chapter[];
}

interface BibleTranslation {
  translation: string;
  code: string;
  books: Book[];
}

// --- Line parsing ---

interface ParsedLine {
  abbr: string;
  chapter: number;
  verse: number;
  rawText: string;
}

function parseLine(line: string): ParsedLine | null {
  const match = line.match(/^([가-힣]+)(\d+):(\d+)\s(.+)$/);
  if (!match) return null;

  return {
    abbr: match[1],
    chapter: parseInt(match[2], 10),
    verse: parseInt(match[3], 10),
    rawText: match[4],
  };
}

// --- 표준새번역 annotation parsing ---

function parseNkrvVerse(rawText: string): {
  text: string;
  heading?: string;
  footnotes?: Footnote[];
} {
  let text = rawText;
  let heading: string | undefined;
  const footnotes: Footnote[] = [];
  const footnoteContents = new Map<string, string>();

  // Step 1: Extract ALL headings (can be multiple: <사무엘의 죽음> ... <다윗과 아비가일>)
  // Headings appear at start or mid-text inside < >
  const headings: string[] = [];
  text = text.replace(/<([^>]+)>/g, (_match, h) => {
    headings.push(h);
    return "";
  });
  if (headings.length > 0) {
    heading = headings[headings.length - 1];
  }

  // Step 2: Extract footnote content from the END of the line
  // The footnote block is typically a parenthesized section at the end
  // Patterns:
  //   (a. content)
  //   (a. content. b) extra)          — mixed marker inside parens
  //   (c. content) a. content)        — broken: second has no opening paren
  //   (a. 창2:7(70인역))              — nested parens in content

  // Strategy: find the footnote block at the end of the line
  // Footnote blocks start with (letter. or (letter + reference like (a레25:8...)
  // We search for the FIRST opening paren that starts a footnote
  const footnoteBlockRegex =
    /\s*\(([a-m])\.[\s\S]*$/;
  const blockMatch = text.match(footnoteBlockRegex);

  // Also handle dotless format: (a레25:8-27절을 볼 것.)
  if (!blockMatch) {
    const dotlessRegex = /\s*\(([a-m])([가-힣])[\s\S]*\)\s*$/;
    const dotlessMatch = text.match(dotlessRegex);
    if (dotlessMatch && dotlessMatch.index !== undefined) {
      const marker = dotlessMatch[1];
      let content = text.slice(dotlessMatch.index).trim();
      text = text.slice(0, dotlessMatch.index).trim();
      // Clean parens and extract content after the marker letter
      content = content.replace(/^\(/, "").replace(/\)$/, "").trim();
      content = content.slice(1); // remove the marker letter
      footnoteContents.set(marker, content.trim());
    }
  }

  if (blockMatch && blockMatch.index !== undefined) {
    const footnoteBlock = text.slice(blockMatch.index).trim();
    text = text.slice(0, blockMatch.index).trim();

    // Parse individual footnote entries from the block
    // The block may look like:
    //   (a. 또는 태초에...)
    //   (c. 히> 아다마) a. 히> 아담)
    //   (a. 또는 메시아. b) 나심은)
    //   (b.히> 이쉬 c.히> 잇샤)
    //   (a. 창2:7(70인역))

    // Split by footnote marker pattern: letter followed by dot
    const segmentRegex = /([a-m])\.\s*/g;
    const segments: { marker: string; startIdx: number }[] = [];
    let segMatch;

    while ((segMatch = segmentRegex.exec(footnoteBlock)) !== null) {
      segments.push({
        marker: segMatch[1],
        startIdx: segMatch.index + segMatch[0].length,
      });
    }

    for (let i = 0; i < segments.length; i++) {
      const start = segments[i].startIdx;
      const end =
        i + 1 < segments.length ? segments[i + 1].startIdx - segments[i + 1].marker.length - 2 : footnoteBlock.length;
      let content = footnoteBlock.slice(start, end).trim();

      // Clean up trailing/leading parens and whitespace
      content = content.replace(/^\(+/, "").replace(/\)+$/, "").trim();
      // Remove trailing periods
      content = content.replace(/\.\s*$/, "").trim();

      if (content) {
        footnoteContents.set(segments[i].marker, content);
      }
    }
  }

  // Step 3: Extract footnote markers and their target words from the body text
  // Pattern: "a) word" where marker is right before the word
  // Also handle markers inside headings that we already extracted

  // First, handle markers in headings (e.g., <지휘자를 따라 a) 팔현금에 맞추어...>)
  if (heading) {
    const cleanedHeading = heading.replace(/\s*[a-m]\)\s*/g, " ").replace(/\s{2,}/g, " ").trim();
    // Extract markers from heading
    const headingMarkerRegex = /([a-m])\)\s*/g;
    let hMatch;
    while ((hMatch = headingMarkerRegex.exec(heading)) !== null) {
      const marker = hMatch[1];
      const afterIdx = hMatch.index + hMatch[0].length;
      const afterText = heading.slice(afterIdx);
      const wordMatch = afterText.match(/^([^\s,."'!?;:)]+)/);
      const word = wordMatch ? wordMatch[1] : "";
      const content = footnoteContents.get(marker) || "";

      if (word && content) {
        footnotes.push({ marker, word, content });
      }
    }
    heading = cleanedHeading;
  }

  // Now extract markers from body text
  const bodyMarkerRegex = /([a-m])\)\s*/g;
  let bMatch;
  // Collect all markers first to avoid index issues during replacement
  const bodyMarkers: { marker: string; fullMatch: string; index: number }[] =
    [];
  while ((bMatch = bodyMarkerRegex.exec(text)) !== null) {
    bodyMarkers.push({
      marker: bMatch[1],
      fullMatch: bMatch[0],
      index: bMatch.index,
    });
  }

  for (const { marker, fullMatch, index } of bodyMarkers) {
    const afterMarker = text.slice(index + fullMatch.length);
    const wordMatch = afterMarker.match(/^([^\s,."'!?;:)]+)/);
    const word = wordMatch ? wordMatch[1] : "";
    const content = footnoteContents.get(marker) || "";

    if (word && content) {
      footnotes.push({ marker, word, content });
    }
  }

  // Remove all markers from body text
  text = text.replace(/\s*[a-m]\)\s*/g, " ");

  // Final cleanup
  text = text.replace(/\s{2,}/g, " ").trim();

  const result: { text: string; heading?: string; footnotes?: Footnote[] } = {
    text,
  };
  if (heading) result.heading = heading;
  if (footnotes.length > 0) result.footnotes = footnotes;

  return result;
}

// --- Main conversion ---

function convertFile(
  filePath: string,
  translationName: string,
  code: string,
  isNkrv: boolean
): BibleTranslation {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim() !== "");

  const booksMap = new Map<string, { chapters: Map<number, Verse[]> }>();

  for (const line of lines) {
    const parsed = parseLine(line);
    if (!parsed) {
      console.warn(`Skipped unparseable line: ${line.slice(0, 50)}...`);
      continue;
    }

    const { abbr, chapter, verse, rawText } = parsed;

    if (!booksMap.has(abbr)) {
      booksMap.set(abbr, { chapters: new Map() });
    }

    const book = booksMap.get(abbr)!;
    if (!book.chapters.has(chapter)) {
      book.chapters.set(chapter, []);
    }

    let verseObj: Verse;

    if (isNkrv) {
      const { text, heading, footnotes } = parseNkrvVerse(rawText);
      verseObj = { verse, text };
      if (heading) verseObj.heading = heading;
      if (footnotes) verseObj.footnotes = footnotes;
    } else {
      verseObj = { verse, text: rawText };
    }

    book.chapters.get(chapter)!.push(verseObj);
  }

  // Assemble books in canonical order
  const books: Book[] = [];

  for (const bookMeta of BOOKS) {
    const bookData = booksMap.get(bookMeta.abbr);
    if (!bookData) {
      console.warn(`Missing book: ${bookMeta.name} (${bookMeta.abbr})`);
      continue;
    }

    const chapters: Chapter[] = [];
    const sortedChapterNums = [...bookData.chapters.keys()].sort(
      (a, b) => a - b
    );

    for (const chapterNum of sortedChapterNums) {
      chapters.push({
        chapter: chapterNum,
        verses: bookData.chapters.get(chapterNum)!,
      });
    }

    books.push({
      id: bookMeta.id,
      name: bookMeta.name,
      abbr: bookMeta.abbr,
      chapters,
    });
  }

  return { translation: translationName, code, books };
}

// --- Validation ---

function validateNkrv(data: BibleTranslation): void {
  let unbalancedParens = 0;
  let angleBrackets = 0;
  let markersInText = 0;

  for (const book of data.books) {
    for (const chapter of book.chapters) {
      for (const verse of chapter.verses) {
        const openCount = (verse.text.match(/\(/g) || []).length;
        const closeCount = (verse.text.match(/\)/g) || []).length;
        if (openCount !== closeCount) {
          unbalancedParens++;
          if (unbalancedParens <= 5) {
            console.warn(
              `  ⚠ Unbalanced parens: ${book.abbr}${chapter.chapter}:${verse.verse} → "${verse.text.slice(-60)}"`
            );
          }
        }

        if (/<[^>]+>/.test(verse.text)) {
          angleBrackets++;
          if (angleBrackets <= 3) {
            console.warn(
              `  ⚠ Angle brackets in text: ${book.abbr}${chapter.chapter}:${verse.verse}`
            );
          }
        }

        if (/[a-m]\)/.test(verse.text)) {
          markersInText++;
          if (markersInText <= 3) {
            console.warn(
              `  ⚠ Marker in text: ${book.abbr}${chapter.chapter}:${verse.verse} → "${verse.text.slice(0, 80)}"`
            );
          }
        }

        // Check heading too
        if (verse.heading && /[a-m]\)/.test(verse.heading)) {
          console.warn(
            `  ⚠ Marker in heading: ${book.abbr}${chapter.chapter}:${verse.verse} → "${verse.heading}"`
          );
        }
      }
    }
  }

  console.log(
    `  Validation: ${unbalancedParens} unbalanced parens, ${angleBrackets} angle brackets, ${markersInText} markers in text`
  );
}

// --- Execute ---

const SOURCE_DIR = "/Users/hun/Desktop/hun/development";
const OUTPUT_DIR = path.resolve(__dirname, "../src/data");

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const translations = [
  {
    file: "개역한글.txt",
    name: "개역한글",
    code: "kov",
    isNkrv: false,
  },
  {
    file: "개역개정.txt",
    name: "개역개정",
    code: "krv",
    isNkrv: false,
  },
  {
    file: "표준새번역.txt",
    name: "표준새번역",
    code: "nkrv",
    isNkrv: true,
  },
];

for (const t of translations) {
  const inputPath = path.join(SOURCE_DIR, t.file);
  console.log(`Converting: ${t.name} (${inputPath})`);

  const result = convertFile(inputPath, t.name, t.code, t.isNkrv);

  const bookCount = result.books.length;
  const chapterCount = result.books.reduce(
    (sum, b) => sum + b.chapters.length,
    0
  );
  const verseCount = result.books.reduce(
    (sum, b) => sum + b.chapters.reduce((s, c) => s + c.verses.length, 0),
    0
  );

  console.log(
    `  → ${bookCount} books, ${chapterCount} chapters, ${verseCount} verses`
  );

  if (t.isNkrv) {
    validateNkrv(result);
  }

  const outputPath = path.join(OUTPUT_DIR, `${t.code}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
  console.log(`  → Saved: ${outputPath}\n`);
}

console.log("Done!");
