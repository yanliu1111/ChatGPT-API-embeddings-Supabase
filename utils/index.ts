import { createClient } from "@supabase/supabase-js";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const OpenAIstream = async (prompt: string) => {
  const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that answers queries about Paul Graham' essay. Response in 3-5 sentences.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.0, // 0.0 is no randomness, 1.0 is most randomness, 0.0 means it will always give the same answer everttime. 0.9 response will be different everytime
      stream: true,
    }),
  });

  if (response.status !== 200) {
    throw new Error("Error");
  }
  const encoder = new TextEncoder(); //TextEncoder means we can encode text into a stream
  const decoder = new TextDecoder(); //TextDecoder means we can decode text from a stream

  //create a stream
  const stream = new ReadableStream({
    async start(controller) {
      // why use start instead of constructor? https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/ReadableStream
      // eventsource-parser
      //parser function is for parsing the response from openai
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;

          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            //choices is an array of objects. We want the first object in the array. delta is an object. content is a string
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };
      const parser = createParser(onParse);

      for await (const chunk of response.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });
  return stream;
};
// this stream handle function is basic level, just handle each token comes in and create a streamer we can use in the client side
// response API and stream handles we can get UI going on
