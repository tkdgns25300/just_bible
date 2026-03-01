import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
      <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
        페이지를 찾을 수 없습니다.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors
          hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
