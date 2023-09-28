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
    const language = formData.get("language") as string;
    const prevAnswer = formData.get("prevAnswer") as string;
    const action = formData.get("action") as string;

    if (action == "generate") {
        const answer = await getCompletionOutput(`Suggest me some resources and their links from where i can learn: ${question}. and only suggest ${language} type of content to me. also add apropriate emoji according to content type in front the link of suggestion. give answer in markdown formate only add links and bold the names`);
        return { answer: answer.output, question, language }
    }

    return ""
}

export default function Resource() {
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
                Resource Suggestions
                </h5>
            </div>
            <Form method="post" replace className="flex flex-col gap-2" ref={formRef}>
                <input type="hidden" name="action" defaultValue="generate" />
                <label htmlFor="countries" className="block mb-2 text-sm font-medium text-gray-900">Select an option</label>
<select id="countries" name="language" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5">
  <option value="video">Videos</option>
  <option value="Book">Books</option>
  <option value="Blog">Blogs</option>
</select>
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
                    label={"You want resource for?" as any}
                    placeholder="Eg. learning javascript"
                    required
                />

                <Button theme="yellow" type="submit" disabled={
                    transition.state === "loading" || transition.state === "submitting"
                }>
                    <p>Start Suggesting 🔮</p>
                    {isAdding ? (
                        <Loader className="h-4 w-4" />
                    ) : null}
                </Button>
            </Form>
            {actionData?.answer && <div className="block w-full py-4 px-6 bg-white border border-gray-200 rounded-lg shadow">
                <Markdown content={actionData.answer} />
            </div>}
        </div>
    )
}