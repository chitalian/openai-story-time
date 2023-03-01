import type { NextApiRequest, NextApiResponse } from "next";
import { getHistory } from "./history";
const { OPENAI_API_KEY } = process.env;

const oaiBase = "https://oai.valyrai.com/v1";
const oaiURL = (endpoint: string, model: string) =>
  `${oaiBase}/engines/${model}/${endpoint}`;

export async function getOpenAICompletion(
  prompt: string
): Promise<string | undefined> {
  let response = await fetch(oaiURL("completions", "text-davinci-003"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "User-ID": "1",
    },
    body: JSON.stringify({
      prompt,
      max_tokens: 256,
      temperature: 0.7,
      frequency_penalty: 1.0,
      presence_penalty: 1.0,
      logprobs: 1,
    }),
  });

  if (response.status === 200) {
    let json = await response.json();
    if (json.error) {
      console.log(json.error);
      return undefined;
    }
    console.log(json);
    return json.choices[0].text;
  }

  return undefined;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    message: string;
  }>
) {
  console.log("HELLO");
  const { input } = req.body;
  console.log(req.body);
  if (typeof input !== "string") {
    res.status(400).json({ message: "Bad Request" });
    return;
  }

  const completion = await getOpenAICompletion(input);
  if (completion) {
    res.status(200).json({ message: input + completion });
  } else {
    res.status(500).json({ message: "Internal Server Error" });
  }
}
