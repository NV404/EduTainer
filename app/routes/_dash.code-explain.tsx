import { ActionFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useEffect, useRef } from "react";
import Button from "~/components/Button";
import Field from "~/components/Field";
import Loader from "~/components/Loader";
import { Markdown } from "~/components/Markdown";
import { getCompletionOutput } from "~/modules/openai";

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const question = formData.get("question") as string;
    const prevAnswer = formData.get("prevAnswer") as string;
    const action = formData.get("action") as string;

    if (action == "generate") {
        const answer = await getCompletionOutput(`You are a coder. here is a question: ${question}. explain this code in details, how it is working while defining all the keywords and function used in this. give answer in markdown formate only and put the "Explained" as # heading on the top `);
        return { answer: answer.output, question }
    }
    if (action == "summarize") {
        const answer = await getCompletionOutput(`You are a coder, my question was: ${question} and the explanation of this code is: ${prevAnswer}. summarize this explanation in points so i can get context and learn. give answer in markdown formate only and put the "Summarized" as # heading on the top`);
        return { answer: prevAnswer + "\n" + answer.output, question, isSummarized: true }
    }

    return ""
}

export default function CodeExplain() {
    const transition = useNavigation();
    let isAdding = transition.state == "submitting";
    let formRef = useRef<HTMLFormElement>(null);
    const actionData = useActionData();

    useEffect(() => {
        if (!isAdding) {
            formRef.current?.reset();
        }
    }, [isAdding]);

    return (
        <div className="flex flex-col gap-2 p-3">
            <div className="flex gap-2 items-center">
                <div className="p-2 rounded-lg border">👩‍🔬</div>
                <h5 className="text-xl font-bold tracking-tight text-gray-900">
                    Explain Code
                </h5>
            </div>
            <Form method="post" replace className="flex flex-col gap-2" ref={formRef}>
                <input type="hidden" name="action" defaultValue="generate" />
                <Field
                    disabled={
                        transition.state === "loading" || transition.state === "submitting"
                    }
                    as="textarea"
                    rows={3}
                    className="w-full"
                    type="text"
                    name="question"
                    id="question"
                    label={"Enter your copied code here" as any}
                    placeholder="Eg. <p>hello world</p> Really?"
                    required
                />

                <Button theme="yellow" type="submit" disabled={
                    transition.state === "loading" || transition.state === "submitting"
                }>
                    <p>Explain 🔮</p>
                    {isAdding ? (
                        <Loader className="h-4 w-4" />
                    ) : null}
                </Button>
            </Form>
            {actionData?.answer && <div className="block w-full py-4 px-6 bg-white border border-gray-200 rounded-lg shadow">
                <Markdown content={actionData.answer} />
                {actionData?.isSummarized == true ? null : <Form replace method="post">
                    <input type="hidden" name="action" defaultValue="summarize" />
                    <input type="hidden" name="question" defaultValue={actionData.question} />
                    <input type="hidden" name="prevAnswer" defaultValue={actionData.answer} />
                    <Button className="mt-2" disabled={
                        transition.state === "loading" || transition.state === "submitting"
                    }>
                        <p>Summarize please  😭</p>
                        {isAdding ? (
                            <Loader className="h-4 w-4" />
                        ) : null}
                    </Button>
                </Form>}
            </div>}
        </div>
    )
}