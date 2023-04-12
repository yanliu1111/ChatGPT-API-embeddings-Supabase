import { PGChunk } from "@/types";
import Head from "next/head";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [chunk, setChunk] = useState<PGChunk[]>([]); //similarity holding
  const [loading, setLoading] = useState(false);

  const handleAnswer = async () => {
    const searchResponse = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }), // check search.ts line 9
    });
    if (!searchResponse.ok) {
      return;
    }
    const results: PGChunk[] = await searchResponse.json();
    setChunk(results);
    console.log(results);
  };

  return (
    <>
      <Head>
        <title>Paul Graham GPT</title>
        <meta
          name="description"
          content={`AI-powered search and chat for Paul Graham's essays.`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col w-[350px]">
        <input
          className="border border-gray-300 rounded-md p-2"
          type="text"
          placeholder="Ask Paul Graham a question"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleAnswer}
        >
          Submit
        </button>
      </div>
    </>
  );
}
