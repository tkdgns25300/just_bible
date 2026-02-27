import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";

export const metadata: Metadata = {
  title: "개인정보처리방침 - Just Bible",
  description: "Just Bible 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader />
      <main className="mx-auto max-w-2xl px-6 pt-20 pb-16">
        <Link href="/" className="mb-8 inline-block text-sm text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300">
          ← 홈으로
        </Link>
        <h1 className="mb-8 text-3xl font-bold dark:text-gray-100">개인정보처리방침</h1>

        <div className="space-y-6 leading-relaxed text-gray-700 dark:text-gray-300">
          <p className="text-sm text-gray-400 dark:text-gray-500">시행일: 2025년 2월 27일</p>

          <p>
            Just Bible(이하 &ldquo;서비스&rdquo;)은 이용자의 개인정보를 중요하게 생각하며,
            관련 법령을 준수합니다. 이 방침은 서비스가 어떤 정보를 수집하고 어떻게 활용하는지 설명합니다.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">1. 수집하는 정보</h2>
          <p>서비스는 별도의 회원가입을 요구하지 않으며, 이용자의 개인정보를 직접 수집하지 않습니다.</p>
          <p>다만, 서비스 이용 과정에서 다음 정보가 자동으로 처리될 수 있습니다.</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="dark:text-gray-100">브라우저 저장소(localStorage)</strong>: 테마 설정, 역본 선택, 글자 크기 등 사용자 환경설정을 브라우저에 저장합니다. 이 정보는 이용자의 기기에만 저장되며, 서버로 전송되지 않습니다.
            </li>
            <li>
              <strong className="dark:text-gray-100">쿠키(Cookie)</strong>: 서비스에 포함된 제3자 광고 서비스(Google AdSense 등)가 광고 제공 및 성과 측정을 위해 쿠키를 사용할 수 있습니다.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">2. 제3자 서비스</h2>
          <p>서비스는 다음의 제3자 서비스를 포함할 수 있으며, 각 서비스의 개인정보처리방침이 적용됩니다.</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="dark:text-gray-100">Google AdSense</strong>: 맞춤 광고 제공을 위해 쿠키를 사용합니다.{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
                className="text-blue-600 underline dark:text-blue-400">
                Google 개인정보처리방침
              </a>
            </li>
            <li>
              <strong className="dark:text-gray-100">Google Fonts</strong>: 웹 폰트 제공을 위해 Google 서버에 접속합니다.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">3. 정보의 보관 및 삭제</h2>
          <p>
            브라우저 저장소의 데이터는 이용자가 직접 브라우저 데이터를 삭제하여 언제든지 제거할 수 있습니다.
            서비스는 서버에 이용자의 개인정보를 별도로 저장하지 않습니다.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">4. 광고 설정</h2>
          <p>
            Google의 맞춤 광고를 원하지 않는 경우,{" "}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer"
              className="text-blue-600 underline dark:text-blue-400">
              Google 광고 설정
            </a>
            에서 비활성화할 수 있습니다.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">5. 방침의 변경</h2>
          <p>
            이 방침은 필요에 따라 변경될 수 있으며, 변경 시 서비스 내 공지를 통해 알립니다.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">6. 연락처</h2>
          <p>
            개인정보 관련 문의:{" "}
            <a href="mailto:tkdgns25300@naver.com" className="text-blue-600 underline dark:text-blue-400">
              tkdgns25300@naver.com
            </a>
          </p>
        </div>
      </main>
    </>
  );
}
