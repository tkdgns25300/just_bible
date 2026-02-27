import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용약관 - Just Bible",
  description: "Just Bible 이용약관",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <Link href="/" className="mb-8 inline-block text-sm text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300">
        ← 홈으로
      </Link>
      <h1 className="mb-8 text-3xl font-bold">이용약관</h1>

      <div className="space-y-6 text-gray-700 leading-relaxed dark:text-gray-300">
        <p className="text-sm text-gray-400 dark:text-gray-500">시행일: 2025년 2월 27일</p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">제1조 (목적)</h2>
        <p>
          이 약관은 Just Bible(이하 &ldquo;서비스&rdquo;)의 이용과 관련하여 서비스 제공자와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">제2조 (서비스의 내용)</h2>
        <p>서비스는 다음의 기능을 무료로 제공합니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>성경 본문 검색 및 열람</li>
          <li>성경 본문 복사</li>
          <li>역본 비교</li>
          <li>기타 부가 기능</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">제3조 (서비스 이용)</h2>
        <p>
          서비스는 별도의 회원가입 없이 누구나 이용할 수 있습니다.
          이용자는 서비스를 법령과 이 약관이 허용하는 범위 내에서 이용할 수 있습니다.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">제4조 (지적재산권)</h2>
        <p>
          서비스에 수록된 성경 본문의 저작권은 각 역본의 저작권자에게 있습니다.
          서비스의 디자인, 소프트웨어 및 기타 콘텐츠에 대한 권리는 서비스 제공자에게 있습니다.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">제5조 (면책)</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>서비스는 현재 상태(as-is)로 제공되며, 정확성이나 완전성을 보증하지 않습니다.</li>
          <li>서비스 이용으로 발생하는 직접적 또는 간접적 손해에 대해 책임지지 않습니다.</li>
          <li>서비스는 사전 고지 없이 변경, 중단될 수 있습니다.</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">제6조 (약관의 변경)</h2>
        <p>
          이 약관은 필요한 경우 변경될 수 있으며, 변경 시 서비스 내 공지를 통해 알립니다.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">제7조 (연락처)</h2>
        <p>
          서비스 관련 문의:{" "}
          <a href="mailto:tkdgns25300@naver.com" className="text-blue-600 underline dark:text-blue-400">
            tkdgns25300@naver.com
          </a>
        </p>
      </div>
    </main>
  );
}
