import { OpenAIstream } from "@/utils";

export const config = {
  runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { prompt } = (await req.json()) as { prompt: string };
    const stream = await OpenAIstream(prompt);
    return new Response(stream, { status: 200 });
  } catch (e) {
    return new Response("Error", { status: 500 });
  }
};

export default handler;
