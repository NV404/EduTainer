import List from "~/icons/list";
import { Markdown } from "~/components/Markdown";
import Button from "~/components/Button";
import Enter from "~/icons/enter";
import { useEffect, useRef, useState } from "react";
import Field from "~/components/Field";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { ActionFunction, LoaderArgs } from "@remix-run/node";
import authenticator from "~/services/auth.server";
import { db } from "~/services/db.server";
import { getChatCompletionOutput, getCompletionOutput } from "~/modules/openai";
import Loader from "~/components/Loader";

export async function loader({ request, params }: LoaderArgs) {
  const user = (await authenticator.isAuthenticated(request, {})) as any;
  const spaceId = params.id;

  const data = await db.spaces.findUnique({
    where: { id: spaceId },
  });

  if (data) {
    return { data, isAdmin: data.userId === user?.id, isCollabEnabled: data.allowCollab, spaceId };
  } else {
    return { error: "Space not found!" };
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const question = formData.get("question") as string;
  const chatHistory = formData.get("chatHistory") as string;
  const recentAnswer = formData.get("recentAnswer") as string;
  const recentQuestion = formData.get("recentQuestion") as string;
  const spaceId = formData.get("spaceId") as string;
  const action = formData.get("action") as string;
  const collab = formData.get("collab") == "collab" ? true : false;

  if(action == "collab"){
    const space = (await db.spaces.update({
      data: {
        allowCollab: collab
      },
      where: {
        id: spaceId
      }
    })) as any;

    return {collabEnabled: true}
  }

  if (action == "quiz") {
    const quizRes = await getCompletionOutput(`Here is a chat between user and ai where ai is teaching user about ${JSON.parse(chatHistory)?.map((item: any) => item.content).join('\n')}. all the option should be different, there should be 3 wrong options and only 1 right option, ask questions from user about those topic discussed above.to test his knowledge change questions but stick with JSON formate, dont make any changes to the formate give questions in this json formate: {
      "question": "question here",
      "option1": "option 1 here",
      "option2": "option 2 here",
      "option3": "option 3 here",
      "option4": "option 4 here",
      "answer": "right option key like option1"
    }. give a valid JSON. which should be parsable in javascript`);

    const cleanedJsonString = quizRes.output?.trim().replace(/\n\s+/g, '') as any;
    return { quize: cleanedJsonString, chatHistory }
  }

  const newChatHistory = [...JSON.parse(chatHistory), ...[{
    role: 'user',
    content: recentQuestion,
  },
  {
    role: 'assistant',
    content: recentAnswer,
  }]]

  // console.log(JSON.stringify(newChatHistory), question, "yoooo mannn")

  if (question) {
    const newChat = await getChatCompletionOutput(newChatHistory, question) as any;

    if (newChat?.error) {
      return { error: newChat?.error };
    }

    // console.log(newChat, "newChatnewChat")

    const space = (await db.spaces.update({
      data: {
        chatHistory: JSON.stringify(newChat?.chatHistory),
        recentQuestion: newChat.message,
        recentAnswer: newChat.answer,

      },
      where: {
        id: spaceId
      }
    })) as any;

    return { data: space };
  }

  return { error: "This field is required" }
}

export default function Dash() {
  const loaderData = useLoaderData();
  const actionData = useActionData();

  const mainData = actionData?.data ? actionData?.data : loaderData?.data;

  const [tab, setTab] = useState("notes");

  if (loaderData.error) {
    return (
      <div className="p-3 flex justify-center items-center h-96">
        <p className="text-xl font-semibold">{loaderData.error}</p>
      </div>
    );
  }

  const noteData = JSON.parse(mainData.chatHistory)?.map((item: any) => item.role != "user" ? item.content : "").join('\n');

  return (
    <div>
      <div className="p-3 flex justify-between items-center">
        <Link to="/dashboard">
          <img src="/logo-full.png" className="h-10" />
        </Link>
        <div className="flex gap-2">
          {/* <Button as={Link as any} to="/register" theme="plain">
            <p>@Twitter</p>
          </Button> */}
          {loaderData.isAdmin ? (
            <Button as={Link as any} to="/profile">
              Profile
            </Button>
          ) : (
            <Button as={Link as any} to="/login">
              Login
            </Button>
          )}
        </div>
      </div>
      <div className="p-3 flex flex-col gap-3 pb-20">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="p-3 text-2xl rounded-lg border">👩‍🔬</div>
            <div className="flex flex-col">
              <h5 className="text-2xl font-bold tracking-tight text-gray-900">
                {mainData.topic
                  ? mainData.topic
                  : mainData.subject}
              </h5>
              <p className="font-normal text-gray-700">
                {mainData.subject}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setTab("notes")}
              theme={tab === "notes" ? "primary" : "outline"}
            >
              Notes
            </Button>
            {loaderData?.isAdmin? <Form replace method="post">
            <input type="hidden" name="chatHistory" defaultValue={mainData.chatHistory} />
              <Button
                type="submit"
                name="action"
                value="quiz"
                theme={tab === "quizes" ? "primary" : "outline"}
                onClick={() => setTab("quizes")}
              >
                Quiz's
              </Button>
            </Form> : null}
            
          </div>
        </div>

        {tab === "notes" && (
          <Notes data={noteData + `\n` + mainData.recentAnswer} isAdmin={loaderData.isAdmin} isCollabEnabled={loaderData.isCollabEnabled} spaceId={loaderData.spaceId} mainData={mainData} />
        )}
        {tab === "quizes" && <Quizes actionData={actionData} />}
      </div>
    </div>
  );
}

const Notes = ({ data, isAdmin, isCollabEnabled, spaceId, mainData }: any) => {
  const [isAsking, setIsAsking] = useState(false);
  const [isSettingOpen, setSetting] = useState(false);
  const transition = useNavigation();
  let isAdding = transition.state == "submitting";
  let formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isAdding) {
      formRef.current?.reset();
    }
  }, [isAdding]);

  function findHeadings(markdown: any) {
    const regex = /^\s*#+\s(.+)/gm;
    const headings = [];
    let match;

    while ((match = regex.exec(markdown)) !== null) {
      headings.push(match[1]);
    }

    return headings;
  }

  const scrollToDataTypes = (heading: any) => {
    const elements = document.querySelectorAll(":is(h1, h2, h3, h4, h5, h6)");
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].textContent === heading) {
        elements[i].scrollIntoView({ behavior: "smooth" });
        break;
      }
    }
  };

  return (
    <>
      <div className="block w-full p-6 bg-white border border-gray-200 rounded-lg shadow ">
        <div className="flex gap-2 items-center mb-3">
          <List size={28} strokeWidth={2} />
          <p className="font-display font-bold text-2xl">Index</p>
        </div>
        <ul className="space-y-1 text-black list-disc list-inside">
          {findHeadings(data).map((heading: any) => (
            <li
              key={heading}
              className="font-medium text-lg hover:underline cursor-pointer"
              onClick={() => scrollToDataTypes(heading)}
            >
              {heading}
            </li>
          ))}
        </ul>
      </div>

      <div className="block w-full p-6 bg-white border border-gray-200 rounded-lg shadow ">
        <Markdown content={data} />
      </div>
      {isCollabEnabled || isAdmin ? (
        <>
          <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-3">
            <Button theme="yellow" onClick={() => setIsAsking(!isAsking)}>
              <Enter />
              <p>Ask follow up question</p>
            </Button>

            {isAdmin && (
              <Button theme="red" onClick={() => setSetting(!isSettingOpen)}>
              <p>Settings</p>
            </Button>
            )}
          </div>
          </div>
          {isSettingOpen && (
            <Form method="post" className="p-3 rounded-lg bg-white shadow-md mt-3 flex gap-2 items-center" replace>
<label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            defaultChecked={isCollabEnabled}
            value="collab"
            name="collab"
            onChange={(e) => console.log(e.currentTarget.checked)}
            className="sr-only peer"
          />
          <input type="hidden" name="spaceId" defaultValue={spaceId} />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-3 font-medium text-gray-900">
            Enable Collab
          </span>
        </label>
        <Button name="action" value="collab" type="submit">
          <p>Save</p>
          {isAdding ? (
                    <Loader className="h-4 w-4" />
                  ) : null}
        </Button>
            </Form>
          )}
          {isAsking && (
            <Form method="post" replace ref={formRef}>
              <Field
                as="textarea"
                rows={3}
                className="w-full"
                type="text"
                name="question"
                id="question"
                label={"Ask" as any}
                placeholder="Eg. What is the difference between var and let?"
                required
              />
              <input type="hidden" name="chatHistory" defaultValue={mainData.chatHistory} />
              <input type="hidden" name="recentAnswer" defaultValue={mainData.recentAnswer} />
              <input type="hidden" name="recentQuestion" defaultValue={mainData.recentQuestion} />
              <input type="hidden" name="spaceId" defaultValue={spaceId} />

              <div className="flex gap-3 mt-3">
                <Button theme="yellow" type="submit">
                  <p>Ask 🔮</p>
                  {isAdding ? (
                    <Loader className="h-4 w-4" />
                  ) : null}
                </Button>
                <Button type="button" onClick={() => setIsAsking(false)}>
                  Cancle
                </Button>
              </div>
            </Form>
          )}
        </>
      ) : null}
    </>
  );
};

const Quizes = ({ actionData }: any) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const transition = useNavigation();
  let isAdding = transition.state == "submitting";

  const quizData = actionData?.quize ? JSON.parse(actionData?.quize) : [];

  const handleOptionSelect = (option: any) => {
    setSelectedOption(option);
    setShowResult(true);
  };

  return (
    <div className="flex flex-col gap-2">
      {actionData?.quize ?
        <div className="flex flex-col gap-2">
          <p className="font-bold text-lg">{quizData.question}</p>
          <ul className="grid w-full gap-3 md:grid-cols-2">
            <li onClick={() => handleOptionSelect("option1")}>
              <input
                type="radio"
                id="option1"
                name="quiz"
                value="option1"
                className="hidden peer"
              />
              <label
                htmlFor="descriptive"
                className={`inline-flex items-center justify-between w-full p-5 bg-white border border-gray-200 rounded-lg cursor-pointer ${showResult ? selectedOption == "option1" ? selectedOption === quizData.answer ? `border-green-600 text-green-600` : `border-red-600 text-red-600` : null : null} hover:text-gray-600 hover:bg-gray-100`}
              >
                <div className="block"><p className="w-full text-lg font-semibold">{quizData.option1}</p></div>
              </label>
            </li>

            <li onClick={() => handleOptionSelect("option2")}>
              <input
                type="radio"
                id="option2"
                name="quiz"
                value="option2"
                className="hidden peer"
              />
              <label
                htmlFor="descriptive"
                className={`inline-flex items-center justify-between w-full p-5 bg-white border border-gray-200 rounded-lg cursor-pointer ${showResult ? selectedOption == "option2" ? selectedOption === quizData.answer ? `border-green-600 text-green-600` : `border-red-600 text-red-600` : null : null} hover:text-gray-600 hover:bg-gray-100`}
              >
                <div className="block"><p className="w-full text-lg font-semibold">{quizData.option2}</p></div>
              </label>
            </li>

            <li onClick={() => handleOptionSelect("option3")}>
              <input
                type="radio"
                id="option3"
                name="quiz"
                value="option3"
                className="hidden peer"
              />
              <label
                htmlFor="descriptive"
                className={`inline-flex items-center justify-between w-full p-5 bg-white border border-gray-200 rounded-lg cursor-pointer ${showResult ? selectedOption == "option3" ? selectedOption === quizData.answer ? `border-green-600 text-green-600` : `border-red-600 text-red-600` : null : null} hover:text-gray-600 hover:bg-gray-100`}
              >
                <div className="block"><p className="w-full text-lg font-semibold">{quizData.option3}</p></div>
              </label>
            </li>

            <li onClick={() => handleOptionSelect("option4")}>
              <input
                type="radio"
                id="option4"
                name="quiz"
                value="option4"
                className="hidden peer"
              />
              <label
                htmlFor="descriptive"
                className={`inline-flex items-center justify-between w-full p-5 bg-white border border-gray-200 rounded-lg cursor-pointer ${showResult ? selectedOption == "option4" ? selectedOption === quizData.answer ? `border-green-600 text-green-600` : `border-red-600 text-red-600` : null : null} hover:text-gray-600 hover:bg-gray-100`}
              >
                <div className="block"><p className="w-full text-lg font-semibold">{quizData.option4}</p></div>
              </label>
            </li>
          </ul>
          {showResult && (
            <div>
              {selectedOption === quizData.answer ? (
                <p className="text-green-500 font-semibold text-lg">The answer is correct!</p>
              ) : (
                <p className="text-red-500 font-semibold text-lg">The answer is incorrect.</p>
              )}
            </div>
          )}
          <div className="flex gap-2 items-center">
            <Button theme="outline" onClick={() => setShowCorrect(true)}>
              Show Correct Answer
            </Button>
            <Form replace method="post">
            <input type="hidden" name="chatHistory" defaultValue={actionData.chatHistory} />
              <Button type="submit"
                name="action"
                value="quiz"
                onClick={() => {
                  setSelectedOption(null)
                  setShowResult(false)
                  setShowCorrect(false)
                }}
                >
                <p>Next</p>
                {isAdding ? <Loader /> : null}
              </Button>
            </Form>
          </div>
          {showCorrect && <p className="text-green-500 font-semibold text-lg">The correct answer is: ${quizData.answer}</p>}
        </div>
        : <div className="flex justify-center items-center p-5">
          <Loader className="h-8 w-8" />
        </div>}
    </div>
  );
};
