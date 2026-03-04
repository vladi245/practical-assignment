import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <h1 className="text-4xl text-black font-semibold mb-4">Practical Assignment</h1>

      <p className="max-w-md text-gray-600 mb-8">
        This is a simple starter page for the assignment. You can register a new account or log in to continue.
      </p>

      <div className="flex gap-4">
        <Link href="/login" className="px-6 py-2 rounded-full bg-black text-white text-sm hover:opacity-80 transition">
          Login
        </Link>

        <Link href="/register" className="px-6 py-2 rounded-full text-black bg-white border text-sm hover:bg-gray-100 transition">
          Register
        </Link>
      </div>
    </main>
  );
}
