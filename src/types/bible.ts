export interface Footnote {
  marker: string;
  word: string;
  content: string;
}

export interface Verse {
  verse: number;
  text: string;
  heading?: string;
  footnotes?: Footnote[];
}

export interface Chapter {
  chapter: number;
  verses: Verse[];
}

export interface Book {
  id: number;
  name: string;
  abbr: string;
  chapters: Chapter[];
}

export interface BibleTranslation {
  translation: string;
  code: string;
  books: Book[];
}
