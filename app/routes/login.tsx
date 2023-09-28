import {
  ActionFunction,
  LoaderFunction,
  V2_MetaFunction,
} from "@remix-run/node";
import { AuthorizationError } from "remix-auth";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import Button from "~/components/Button";
import Field from "~/components/Field";
import authenticator from "~/services/auth.server";

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
};

export const loader: LoaderFunction = async ({ request }) => {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/dashboard",
  });
};

export const action: ActionFunction = async ({ request, context }) => {
  // call my authenticator
  try {
    return await authenticator.authenticate("form", request, {
      successRedirect: "/dashboard",
      throwOnError: true,
      context,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof AuthorizationError) {
      return { error: error.message };
    }
  }
};

export default function Login() {
  const data = useActionData();
  const transition = useNavigation();

  return (
    <div className="h-screen flex flex-col">
      <div className="p-3 flex justify-between items-center">
        <Link to="/">
          <img src="/logo-full.png" className="h-10" />
        </Link>
        <div className="flex gap-2">
          <Button as={Link as any} to="/register">
            <p>Register</p>
          </Button>
        </div>
      </div>
      <div className="h-full w-full mb-4 flex justify-center items-center">
        <Form
          method="post"
          className="flex flex-col items-center gap-4 bg-white lg:shadow-2xl lg:border-2 rounded-2xl w-full max-w-2xl py-8 px-4 md:px-28"
        >
          <h1 className="font-display font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight max-w-2xl text-center w-full">
            Login
          </h1>
          <Button theme="outline" className="w-full">
            <p>Continue with Google</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="24"
              height="24"
              viewBox="0 0 48 48"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              ></path>
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              ></path>
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
            </svg>
          </Button>
          <div className="border-b-2 w-full" />
          <Field
            widthFull={true}
            className="w-full"
            type="email"
            name="email"
            id="email"
            label={"Email" as any}
            placeholder="Eg. example@email.com"
            required
          />
          <Field
            widthFull={true}
            type="password"
            name="password"
            id="password"
            label={"Password" as any}
            placeholder="********"
            required
          />
          {data?.error && (
            <p className="text-red-600 font-medium">{data?.error}</p>
          )}
          <Button
            disabled={
              transition.state === "loading" ||
              transition.state === "submitting"
            }
            type="submit"
            className="w-full py-2"
          >
            <p>Login</p>
          </Button>
          <Link to="/register" className="hover:underline">
            Don't have a account?{" "}
            <span className="font-medium">Register here</span>
          </Link>
        </Form>
      </div>
    </div>
  );
}
