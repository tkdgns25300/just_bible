import SearchBar from "@/components/search-bar";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center pb-32">
      <h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl">
        Just Bible
      </h1>
      <SearchBar />
    </main>
  );
}
