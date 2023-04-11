import { PGEssay, PGJSON } from "@/types";
import { loadEnvConfig } from "@next/env";
import fs from "fs";
import { Configuration, OpenAIApi } from "openai";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig("");

const generateEmbeddings = async (essays: PGEssay[]) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  for (let i = 0; i < essays.length; i++) {
    const essay = essays[i];

    for (let j = 0; j < essay.chunks.length; j++) {
      const chunk = essay.chunks[j];

      const embeddingResponse = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: chunk.content,
      });
      const [{ embedding }] = embeddingResponse.data.data;
      const { data, error } = await supabase
        .from("paul_graham")
        .insert({
          essay_title: chunk.essay_title,
          essay_url: chunk.essay_url,
          essay_date: chunk.essay_date,
          content: chunk.content,
          content_tokens: chunk.content_tokens,
          embedding: embedding,
        })
        .select("*");

      if (error) {
        console.log("error");
      } else {
        console.log("saved", i, j);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // promise works for it has error when you embedding stuff, might be read limited thing. it will wait 1 second and try again
    }
  }
};

(async () => {
  const json: PGJSON = JSON.parse(fs.readFileSync("scripts/pg.json", "utf8"));

  await generateEmbeddings(json.essays);
})();
