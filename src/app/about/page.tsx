import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";

export const metadata: Metadata = {
  title: "소개 - Just Bible",
  description: "Just Bible 서비스 소개",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "소개 - Just Bible",
    description: "Just Bible 서비스 소개",
    url: "https://justbible.life/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader />
      <main className="mx-auto max-w-2xl px-6 pt-20 pb-16">
        <Link href="/" className="mb-8 inline-block text-sm text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300">
          ← 홈으로
        </Link>
        <h1 className="mb-8 text-3xl font-bold dark:text-gray-100">소개</h1>

        <div className="space-y-6 leading-relaxed text-gray-700 dark:text-gray-300">
          <p>
            <strong className="dark:text-gray-100">Just Bible</strong>은 성경 본문을 빠르게 검색하고, 읽고, 복사할 수 있는 웹 서비스입니다.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">만든 이유</h2>
          <p>
            예배, 묵상, 소그룹 등에서 성경 구절을 찾고 공유하는 과정이 더 간편했으면 좋겠다는 생각에서 시작했습니다.
            복잡한 기능 없이, 필요한 말씀을 빠르게 찾고 바로 복사할 수 있는 도구를 목표로 합니다.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">주요 기능</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>구절 주소 검색 (예: 창 1:1, 요 3:16)</li>
            <li>초성 검색 (예: ㅊㅅㄱ → 창세기)</li>
            <li>키워드 검색 (예: 사랑, 소망)</li>
            <li>성경 읽기 (책/장/절 탐색)</li>
            <li>역본 비교 (개역개정, 개역한글, 표준새번역)</li>
            <li>다양한 복사 형식 지원</li>
            <li>다크 모드, 글자 크기/두께 조절</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">수록 역본</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>개역개정 (KRV)</li>
            <li>개역한글 (KOV)</li>
            <li>표준새번역 (NKRV)</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">연락처</h2>
          <p>
            문의 및 의견은{" "}
            <a href="mailto:tkdgns25300@naver.com" className="text-blue-600 underline dark:text-blue-400">
              tkdgns25300@naver.com
            </a>
            으로 보내주세요.
          </p>
        </div>
      </main>
    </>
  );
}
