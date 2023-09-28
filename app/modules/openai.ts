import { Configuration, OpenAIApi } from "openai";
import context from "../context"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function getCompletionOutput(prompt: string) {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      temperature: 0.4,
      max_tokens: 900,
    });

    return { output: response.data.choices[0].text };
  } catch (error) {
    console.error(error);

    return { error: `Error: Something wrong with OpenAI! Please try again. 😓💔` };
  }
}

export async function getChatCompletionOutput( chatHistory: any, message: string) {
  try {
    const chat = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [...context, ...chatHistory,
      {
        role: 'user',
        content: message,
      },],
      max_tokens: 500,
    })

    let answer = chat.data.choices[0].message?.content;
    return {
      message,
      answer: answer as string,
      chatHistory
    }

  } catch (error) {
    console.error(error)
  }
}