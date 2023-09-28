import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import Button from "~/components/Button";
import Field from "~/components/Field";
import authenticator from "~/services/auth.server";
import { db } from "~/services/db.server";
import Loader from "~/components/Loader";
import { getChatCompletionOutput, getCompletionOutput } from "~/modules/openai";
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const subject = formData.get("subject") as string;
  const topic = formData.get("topic") as string;
  const level = formData.get("level") as string;
  const style = formData.get("style") as string;
  const internet = formData.get("internet") == "internet" ? true : false;
  
  if (subject && level && style) {
    const user = (await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    })) as any;

    const url =
      "https://api.bing.microsoft.com/v7.0/search?q=" +
      encodeURIComponent(`learn ${subject} ${topic ? `in ${topic}` : ""}`);
    const headers = {
      "Ocp-Apim-Subscription-Key": process.env.BING_API_KEY,
    };

    const searchResults = internet ? await fetch(url, { headers } as any)
      .then((res) => res.json())
      .catch((error) => {
        console.log("Error: " + error.message);
        return error;
      }) : null;

    const searchResultStrings = searchResults ? searchResults.webPages.value.map(
      (result: any) => {
        const { url, name, snippet } = result;
        return `URL: ${url}\nName: ${name}\nSnippet: ${snippet}\n`;
      }
    ): null;

    const resultString = searchResultStrings? searchResultStrings.join("\n") : null;

    let response = await getChatCompletionOutput([], `I want to learn:
    Subject: ${subject}
    topic: ${topic} in ${subject}
    Level: ${level}
    Learning Style: ${style}
    Internet serches: ${
      resultString
        ? `search results ----------- ${searchResults} -----------`
        : null
    }
    `) as any

    if (response?.error) {
      return { error: response?.error };
    }

    const space = (await db.spaces.create({
      data: {
        user: { connect: { id: user.id } },
        subject,
        ...(topic ? { topic } : {}),
        level,
        style,
        chatHistory: JSON.stringify(response.chatHistory),
        recentAnswer: response.answer
      },
    })) as any;

    if (space) {
      return redirect(`/s/${space.id}`);
    } else {
      return { error: "something went wrong, try again!" };
    }
  } else {
    return { error: "subject, level, style, fields are required" };
  }
};

export default function Create() {
  const data = useActionData();
  const transition = useNavigation();

  return (
    <div className="p-3">
      <h1 className="font-display font-bold text-2xl">Create Space</h1>
      <Form method="post" className="flex flex-col gap-3 my-4">
        <Field
          widthFull={true}
          className="w-full"
          type="text"
          name="subject"
          id="subject"
          bigLabel={true}
          disabled={
            transition.state === "loading" || transition.state === "submitting"
          }
          label={"What subject you want to learn" as any}
          placeholder="Eg. Math, Science, JavaScript etc."
          required
        />
        <Field
          widthFull={true}
          className="w-full"
          type="text"
          name="topic"
          disabled={
            transition.state === "loading" || transition.state === "submitting"
          }
          id="topic"
          bigLabel={true}
          label={
            (
              <p>
                Is their any specific topic are you looking for{" "}
                <span className="text-sm align-top">(optional)</span>
              </p>
            ) as any
          }
          placeholder="Eg. pythagoras theorem, DOM, Hooks etc."
        />

        {/* level */}
        <div>
          <h3 className="font-bold text-lg">Select level of content</h3>
          <ul className="grid w-full gap-3 md:grid-cols-3">
            <li>
              <input
                type="radio"
                id="beginner"
                name="level"
                value="beginner"
                className="hidden peer"
              />
              <label
                htmlFor="beginner"
                className="inline-flex items-center justify-between w-full p-5 bg-white border border-gray-200 rounded-lg cursor-pointer peer-checked:border-yellow-500 peer-checked:text-yellow-500 hover:text-gray-600 hover:bg-gray-100"
              >
                <div className="block">
                  <div className="w-full text-lg font-medium">Beginner</div>
                </div>
              </label>
            </li>
            <li>
              <input
                type="radio"
                id="intermediate"
                name="level"
                value="intermediate"
                className="hidden peer"
              />
              <label
                htmlFor="intermediate"
                className="inline-flex items-center justify-between w-full p-5 bg-white border border-gray-200 rounded-lg cursor-pointer peer-checked:border-yellow-500 peer-checked:text-yellow-500 hover:text-gray-600 hover:bg-gray-100"
              >
                <div className="block">
                  <div className="w-full text-lg font-medium">Intermediate</div>
                </div>
              </label>
            </li>
            <li>
              <input
                type="radio"
                id="advance"
                name="level"
                value="advance"
                className="hidden peer"
              />
              <label
                htmlFor="advance"
                className="inline-flex items-center justify-between w-full p-5 bg-white border border-gray-200 rounded-lg cursor-pointer peer-checked:border-yellow-500 peer-checked:text-yellow-500 hover:text-gray-600 hover:bg-gray-100"
              >
                <div className="block">
                  <div className="w-full text-lg font-medium">Advance</div>
                </div>
              </label>
            </li>
          </ul>
        </div>

        {/* style */}
        <div>
          <h3 className="font-bold text-lg">Choose your learning style</h3>
          <ul className="grid w-full gap-3 md:grid-cols-2">
            <li>
              <input
                type="radio"
                id="descriptive"
                name="style"
                value="descriptive"
                className="hidden peer"
              />
              <label
                htmlFor="descriptive"
                className="inline-flex items-center justify-between w-full p-5 bg-white border border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100"
              >
                <div className="block">
                  <div className="w-full text-lg font-semibold">
                    {Object.keys(styles)[0]}
                  </div>
                  <div className="w-full text-gray-500">
                    {styles["Descriptive learners"]}
                  </div>
                </div>
              </label>
            </li>
            <li>
              <input
                type="radio"
                id="funny"
                name="style"
                value="funny"
                className="hidden peer"
              />
              <label
                htmlFor="funny"
                className="inline-flex items-center justify-between w-full p-5 bg-white border border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100"
              >
                <div className="block">
                  <div className="w-full text-lg font-semibold">
                    {Object.keys(styles)[1]}
                  </div>
                  <div className="w-full text-gray-500">
                    {styles["Funny learners"]}
                  </div>
                </div>
              </label>
            </li>
            <li>
              <input
                type="radio"
                id="examples"
                name="style"
                value="examples"
                className="hidden peer"
              />
              <label
                htmlFor="examples"
                className="inline-flex items-center justify-between w-full p-5 bg-white border border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100"
              >
                <div className="block">
                  <div className="w-full text-lg font-semibold">
                    {Object.keys(styles)[2]}
                  </div>
                  <div className="w-full text-gray-500">
                    {styles["More examples learners"]}
                  </div>
                </div>
              </label>
            </li>
            <li>
              <input
                type="radio"
                id="summarized"
                name="style"
                value="summarized"
                className="hidden peer"
              />
              <label
                htmlFor="summarized"
                className="inline-flex items-center justify-between w-full p-5 bg-white border border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100"
              >
                <div className="block">
                  <div className="w-full text-lg font-semibold">
                    {Object.keys(styles)[3]}
                  </div>
                  <div className="w-full text-gray-500">
                    {styles["Summarized learners"]}
                  </div>
                </div>
              </label>
            </li>
          </ul>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            value="internet"
            name="internet"
            onChange={(e) => console.log(e.currentTarget.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-3 font-medium text-gray-900">
            Connect With Internet{" "}
            <span className="text-gray-500">(makes it little slower)</span>
          </span>
        </label>

        {data?.error && (
          <p className="text-red-600 font-medium">{data?.error}</p>
        )}
        <Button
          className="py-2"
          disabled={
            transition.state === "loading" || transition.state === "submitting"
          }
        >
          <p>Create Space✨</p>
          {transition.state === "loading" ||
          transition.state === "submitting" ? (
            <Loader className="h-4 w-4" />
          ) : null}
        </Button>
      </Form>
    </div>
  );
}

export const styles = {
  "Descriptive learners":
    "These learners prefer detailed explanations and descriptions of concepts. They may find it easier to understand information when it is presented in a step-by-step or sequential manner.",
  "Funny learners":
    "These learners enjoy learning in a lighthearted and humorous way. They may find it easier to remember information when it is presented in a funny or entertaining way.",
  "More examples learners":
    "These learners benefit from having multiple examples of a concept to help them understand it fully. They may find it easier to grasp a concept when they see it applied in different contexts or scenarios.",
  "Summarized learners":
    "These learners prefer to have information presented to them in a concise and summarized way. They may find it overwhelming to process large amounts of information and may benefit from having key points or summaries presented to them.",
};
