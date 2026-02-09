import ChatInterface from "@/components/chat-interface";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            @duyetbot
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            A virtual version of Duyet. Ask about blog, CV, GitHub activity, or analytics.
          </p>
        </div>
        <ChatInterface />
      </div>
    </main>
  );
}
