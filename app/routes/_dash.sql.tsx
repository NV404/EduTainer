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
        const answer = await getCompletionOutput(`You are a SQL query generator, generate query for ${question}. only provide the relevant SQL query without explanation, any text or message. give answer in markdown formate only`);
        return { answer: answer.output, question }
    }
    if (action == "explain") {
        const answer = await getCompletionOutput(`You explain SQL queries, my question was: ${question} and its query is: ${prevAnswer}. explain this query how it is working while defining all the keywords and function used in this query. give answer in markdown formate only`);
        return { answer: prevAnswer + "\n" + answer.output, question, isExplained: true }
    }

    return ""
}

export default function Sql() {
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
                    SQL Writer
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
                    label={"Problem you are facing" as any}
                    placeholder="Eg. Select all employees in employees table whose salary is higher then 30,000"
                    required
                />

                <Button theme="yellow" type="submit" disabled={
                    transition.state === "loading" || transition.state === "submitting"
                }>
                    <p>Start querying 🔮</p>
                    {isAdding ? (
                        <Loader className="h-4 w-4" />
                    ) : null}
                </Button>
            </Form>
            {actionData?.answer && <div className="block w-full py-4 px-6 bg-white border border-gray-200 rounded-lg shadow">
                <Markdown content={actionData.answer} />
                {actionData?.isExplained == true ? null : <Form replace method="post">
                    <input type="hidden" name="action" defaultValue="explain" />
                    <input type="hidden" name="question" defaultValue={actionData.question} />
                    <input type="hidden" name="prevAnswer" defaultValue={actionData.answer} />
                    <Button className="mt-2" disabled={
                        transition.state === "loading" || transition.state === "submitting"
                    }>
                        <p>Explain please  😭</p>
                        {isAdding ? (
                            <Loader className="h-4 w-4" />
                        ) : null}
                    </Button>
                </Form>}
            </div>}
        </div>
    )
}