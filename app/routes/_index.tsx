import type { V2_MetaFunction } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import Button from "~/components/Button";
import Field from "~/components/Field";
import Cap from "~/icons/cap";

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
};

export default function Index() {
  return (
    <div>
      <div className="p-3 flex justify-between items-center">
        <img src="/logo-full.png" className="h-10" />
        <div className="flex gap-2">
          <Button as={Link as any} to="/privacy" theme="outline">
            Privacy
          </Button>
          <Button as={Link as any} to="/terms" theme="outline">
            Terms & condition
          </Button>
          {/* <Button
            as={Link as any}
            to="/register"
            theme="outline"
            className="hidden md:block"
          >
            <p>Register</p>
          </Button>
          <Button as={Link as any} to="/login">
            <p>Start Learning</p>
            <Cap color="#ffffff" />
          </Button> */}
        </div>
      </div>
      <div className="p-3 flex flex-col gap-5 my-6 relative">
        <div className="w-40 h-40 rounded-full blur-2xl opacity-30 -z-10 bg-purple-600 absolute -top-10" />
        <div className="w-40 h-40 rounded-full blur-2xl opacity-30 -z-10 bg-yellow-400 absolute top-10 left-40" />
        <h1 className="text-[26px] leading-[32px] sm:text-3xl md:text-5xl md:leading-[55px] font-bold text-black font-display">
          AI-powered learning <br /> for a smarter future.
        </h1>
        <p className="text-base md:text-lg lg:text-xl font-medium text-gray-500 lg:max-w-2xl">
          Experience personalized learning like never before. Our AI-powered
          platform tailors study materials to your unique learning style,
          helping you achieve your goals faster and more efficiently.
        </p>
        <Button as={Link as any} to="/login" className="w-max">
          <p>Start Learning</p>
          <Cap color="#ffffff" />
        </Button>
      </div>
      {/* <div className="flex w-full my-5 justify-center items-center relative">
        <div className="w-40 h-40 rounded-full blur-2xl opacity-30 -z-10 bg-yellow-400 absolute top-16 right-40" />
        <div className="max-w-xl p-3 bg-white md:rounded-2xl bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-20 border border-gray-100">
          <div className="bg-white flex flex-col gap-3 lg:border-2 rounded-2xl w-full py-8 px-4 md:px-16">
            <h1 className="text-xl font-display text-center">
              Unlock Your Learning Potential: <br /> Join Our Waitlist for{" "}
              <span className="text-yellow-400">Early Access! ✨</span>
            </h1>
            <Form className="flex items-center gap-3">
              <Field
                className="w-full"
                type="email"
                name="email"
                id="email"
                widthFull={true}
                placeholder="Eg. example@email.com"
                required
              />
              <Button type="submit" className="w-max">
                Join✨
              </Button>
            </Form>
          </div>
        </div>
      </div> */}
      <div></div>
    </div>
  );
}
