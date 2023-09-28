import { ActionFunction, LoaderArgs } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import Button from "~/components/Button";
import Field from "~/components/Field";
import authenticator from "~/services/auth.server";
import { db } from "~/services/db.server";

export async function loader({ request }: LoaderArgs) {
  const data = (await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  })) as any;

  const user = (await db.user.findUnique({
    where: { id: data.id },
  })) as any;

  delete user.passwordHash;

  return { user };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const old_name = formData.get("old-name") as string;

  const data = (await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  })) as any;

  if (name) {
    if (name === old_name) {
      return { error: "New name cant be same" };
    }

    if (name.length < 2) {
      return { error: "New name should be atleast 3 characters long" };
    }

    const user = await db.user.update({
      where: { id: data.id },
      data: { name },
    });
    if (user) {
      return { success: "profile updated successfully" };
    } else {
      return { error: "something went wrong" };
    }
  }

  return { error: "all fields are required" };
};

export default function Profile() {
  const { user } = useLoaderData();
  const data = useActionData();
  const transition = useNavigation();

  return (
    <div className="p-3">
      <h1 className="font-display font-bold text-2xl">Profile</h1>
      <Form method="post" className="flex flex-col gap-3 my-4">
        <Field
          className="w-full"
          type="text"
          name="name"
          id="name"
          defaultValue={user.name}
          bigLabel={true}
          label={"Name" as any}
          placeholder="Eg. John Doe"
          required
        />
        <input type="hidden" value={user.name} name="old-name" />
        <Field
          className="w-full"
          type="email"
          id="email"
          value={user.email}
          readOnly={true}
          bigLabel={true}
          disabled={true}
          label={"Email" as any}
          placeholder="Eg. example@mail.com"
          required
        />
        <Button
          className="py-2"
          disabled={
            transition.state === "loading" || transition.state === "submitting"
          }
        >
          Save
        </Button>
        {data?.error && (
          <p className="text-red-600 font-medium">{data?.error}</p>
        )}
        {data?.success && (
          <p className="text-green-600 font-medium">{data?.success}</p>
        )}
      </Form>
      <Button as={Link as any} to="/logout" theme="red">
        Logout
      </Button>
    </div>
  );
}
