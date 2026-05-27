import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const googleApiKey = "AIzaSyBfJXU8rnLS1btLvUrmY8UwEcOoP5Ac1-A";

console.log("Testing ChatGoogleGenerativeAI instantiation...");
try {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    apiKey: googleApiKey,
  });

  console.log("Model instantiated. Attempting invoke...");
  const response = await model.invoke("Hello, who are you?");
  console.log("Response:", response);
} catch (e: any) {
  console.error("Error during invoke:", e);
}
