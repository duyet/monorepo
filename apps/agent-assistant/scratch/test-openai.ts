import { ChatOpenAI } from "@langchain/openai";

const openaiApiKey = process.env.OPENAI_API_KEY;

console.log("Testing ChatOpenAI instantiation...");
console.log(
  "Using API Key:",
  openaiApiKey ? `${openaiApiKey.substring(0, 10)}...` : "undefined"
);
try {
  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: openaiApiKey,
  });

  console.log("Model instantiated. Attempting invoke...");
  const response = await model.invoke("Hello, who are you?");
  console.log("Response:", response);
} catch (e: any) {
  console.error("Error during invoke:", e);
}
