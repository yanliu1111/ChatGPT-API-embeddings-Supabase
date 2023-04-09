export type PGEssay = {
  title: string;
  url: string;
  date: string;
  content: string;
  tokens: number;
  chunks: PGChunk[]; //chunk is a list of tokens, save in database
};
export type PGChunk = {
  eassy_title: string;
  eassy_url: string;
  eassy_date: string;
  content: string;
  content_tokens: number;
  embedding: number[];
};
export type PGJSON = {
  tokens: number;
  essays: PGEssay[];
};
