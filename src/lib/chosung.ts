const CHOSUNG_LIST = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

const CHOSUNG_SET = new Set(CHOSUNG_LIST);

export function getChosung(text: string): string {
  return Array.from(text)
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code < 0xac00 || code > 0xd7a3) return char;
      const index = Math.floor((code - 0xac00) / (21 * 28));
      return CHOSUNG_LIST[index];
    })
    .join("");
}

export function isChosung(text: string): boolean {
  if (text.length === 0) return false;
  return Array.from(text).every((char) => CHOSUNG_SET.has(char));
}
