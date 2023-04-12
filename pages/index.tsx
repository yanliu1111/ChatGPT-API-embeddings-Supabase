import { Answer } from "@/components/Answer/Answer";
import { PGChunk } from "@/types";
import endent from "endent";
import Head from "next/head";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [chunk, setChunk] = useState<PGChunk[]>([]); //similarity holding
  const [loading, setLoading] = useState(false);

  const handleAnswer = async () => {
    setLoading(true);
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
    // console.log(results);

    const prompt = endent`
    Use the following text to answer the question: ${query}
    ${results.map((chunk) => chunk.content).join("\n")}
    `;
    // console.log(prompt);

    const answerResponse = await fetch("/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });
    if (!answerResponse.ok) {
      return;
    }

    const data = answerResponse.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    // when stream is done, instead return false here, it will return true in the end, the let done will be turn to true, and the while loop will be break. Wrap up, we will not get infinite loop here.
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setAnswer((pre) => pre + chunkValue);
    }
    setLoading(false);
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
        <div className="mt-4">
          {loading ? <div>Loading ... </div> : <Answer text={answer} />}
        </div>
      </div>
    </>
  );
}
