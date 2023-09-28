import { LoaderArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import Button from "~/components/Button";
import authenticator from "~/services/auth.server";

export async function loader({ request }: LoaderArgs) {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
}

export default function Dash() {
  const data = useLoaderData();
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
          <Button as={Link as any} to="/profile">
            Profile
          </Button>
        </div>
      </div>
      <Outlet context={{ data }} />
    </div>
  );
}
