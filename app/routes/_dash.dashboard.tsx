import { LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import Button from "~/components/Button";
import Plus from "~/icons/plus";
import authenticator from "~/services/auth.server";
import { db } from "~/services/db.server";

export async function loader({ request }: LoaderArgs) {
  const user = (await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  })) as any;

  const data = await db.user.findUnique({
    where: { id: user?.id },
    select: {
      email: true,
      name: true,
      spaces: true,
    },
  });

  return { data };
}

export default function Dashboard() {
  const { data } = useLoaderData();
  const [tab, setTab] = useState("spaces");

  return (
    <div className="p-3">
      <div className="flex gap-3">
        <Button
          theme={tab === "spaces" ? "primary" : "outline"}
          onClick={() => setTab("spaces")}
        >
          Spaces
        </Button>
        <Button
          theme={tab === "tools" ? "primary" : "outline"}
          onClick={() => setTab("tools")}
        >
          Tools
        </Button>
      </div>
      {tab === "spaces" && <Spaces spaces={data.spaces} />}
      {tab === "tools" && <Tools />}
    </div>
  );
}

const Spaces = ({ spaces }: any) => {
  return (
    <div className="p-3">
      <div className="flex gap-3 items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Spaces</h1>
        <Button as={Link as any} to="/create" theme="yellow">
          <p>Create new space</p> <Plus />{" "}
        </Button>
      </div>

      {spaces?.length <= 0 ? (
        <div className="h-96 flex w-full justify-center items-center gap-5 flex-col">
          <p className="max-w-2xl font-medium text-2xl text-center">
            Ready to learn? First, let's get cozy. Create your own learning
            space to get started!
          </p>
          <Button as={Link as any} to="/create" theme="yellow">
            <p>Create new space</p> <Plus />{" "}
          </Button>
        </div>
      ) : (
        <div className="grid w-full gap-3 md:grid-cols-3 mt-4">
          {spaces?.map((space: any) => (
            <Link
            key={space.id}
              to={`/s/${space.id}`}
              className="rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white transition-all duration-300"
            >
              <div className="block w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100">
                <div className="flex gap-2 items-center">
                  <div className="p-2 rounded-lg border">👩‍🔬</div>
                  <h5 className="text-2xl font-bold tracking-tight text-gray-900">
                    {space.subject}
                  </h5>
                </div>
                <p className="font-normal text-gray-700">
                  {space.topic ? space.topic : space.subject}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <p className="py-1 px-3 text-white rounded-full bg-blue-400 border border-blue-700 text-sm">
                    {space.level}
                  </p>
                  <p className="py-1 px-3 text-white rounded-full bg-red-400 border border-red-700 text-sm">
                    {space.style} style
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Tools = () => {
  return (
    <div className="p-3">
      <h1 className="font-display font-bold text-2xl">Tools</h1>
      <div className="grid w-full gap-3 md:grid-cols-2 mt-4">
        <Link
          to="/resource"
          className="rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white transition-all duration-300"
        >
          <div className="block w-full h-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100">
            <div className="flex gap-2 items-center">
              <div className="p-2 rounded-lg border">👩‍🔬</div>
              <h5 className="text-xl font-bold tracking-tight text-gray-900">
                Resource Suggestions
              </h5>
            </div>
            <p className="text-gray-500 mt-2">
              Get personalized recommendations for learning materials, articles,
              tutorials, and other resources based on your specific interests
              and learning goals. Discover new sources of knowledge and enhance
              your learning experience.
            </p>
          </div>
        </Link>
        <Link
          to="/yt-notes"
          className="rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white transition-all duration-300"
        >
          <div className="block w-full h-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100">
            <div className="flex gap-2 items-center">
              <div className="p-2 rounded-lg border">👩‍🔬</div>
              <h5 className="text-xl font-bold tracking-tight text-gray-900">
                YouTube Notes
              </h5>
            </div>
            <p className="text-gray-500 mt-2">
              Take insightful notes while watching YouTube videos. Capture key
              points and timestamps to enhance your learning experience. Easily
              save and access your notes for future reference, making it simple
              to review and retain valuable information. Elevate your
              video-watching experience with personalized annotations using
              YouTube Notes.
            </p>
          </div>
        </Link>
        <Link
          to="/essay"
          className="rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white transition-all duration-300"
        >
          <div className="block w-full h-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100">
            <div className="flex gap-2 items-center">
              <div className="p-2 rounded-lg border">👩‍🔬</div>
              <h5 className="text-xl font-bold tracking-tight text-gray-900">
                Essay Writer
              </h5>
            </div>
            <p className="text-gray-500 mt-2">
              Overcome writer's block and simplify the process of writing
              essays. This tool assists you in generating well-structured and
              coherent essays on various topics. It offers topic suggestions,
              helps organize your thoughts, and even provides grammar and style
              suggestions to refine your writing.
            </p>
          </div>
        </Link>
        <Link
          to="/code-writer"
          className="rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white transition-all duration-300"
        >
          <div className="block w-full h-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100">
            <div className="flex gap-2 items-center">
              <div className="p-2 rounded-lg border">👩‍🔬</div>
              <h5 className="text-xl font-bold tracking-tight text-gray-900">
                Code Writer
              </h5>
            </div>
            <p className="text-gray-500 mt-2">
              Write code effortlessly in different programming languages, such
              as JavaScript, Python, and more. This tool offers a user-friendly
              coding environment with autocomplete, syntax highlighting, and
              error detection, enabling you to write efficient and error-free
              code quickly.
            </p>
          </div>
        </Link>
        <Link
          to="/code-explain"
          className="rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white transition-all duration-300"
        >
          <div className="block w-full p-6 h-full bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100">
            <div className="flex gap-2 items-center">
              <div className="p-2 rounded-lg border">👩‍🔬</div>
              <h5 className="text-xl font-bold tracking-tight text-gray-900">
                Explain Code
              </h5>
            </div>
            <p className="text-gray-500 mt-2">
              Gain a deeper understanding of existing code by using this tool to
              explain complex sections or functions. It provides detailed
              explanations, step-by-step breakdowns, and visualizations, helping
              you comprehend the code's functionality and facilitating easier
              collaboration among developers.
            </p>
          </div>
        </Link>
        <Link
          to="/math"
          className="rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white transition-all duration-300"
        >
          <div className="block w-full p-6 h-full bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100">
            <div className="flex gap-2 items-center">
              <div className="p-2 rounded-lg border">👩‍🔬</div>
              <h5 className="text-xl font-bold tracking-tight text-gray-900">
                Math Problem Solver
              </h5>
            </div>
            <p className="text-gray-500 mt-2">
              Solve mathematical problems ranging from basic arithmetic to
              complex equations. Simply input the problem, and the tool will
              provide a step-by-step solution, making math concepts more
              accessible and aiding in learning, homework, or problem-solving
              scenarios.
            </p>
          </div>
        </Link>
        <Link
          to="/sql"
          className="rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white transition-all duration-300"
        >
          <div className="block w-full p-6 h-full bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100">
            <div className="flex gap-2 items-center">
              <div className="p-2 rounded-lg border">👩‍🔬</div>
              <h5 className="text-xl font-bold tracking-tight text-gray-900">
                SQL Writer
              </h5>
            </div>
            <p className="text-gray-500 mt-2">
              Simplify the process of writing SQL queries with this tool.
              Whether you're a beginner or an experienced programmer, it assists
              in generating accurate SQL queries by offering syntax suggestions,
              highlighting potential errors, and providing real-time feedback,
              thus streamlining database interactions.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};
