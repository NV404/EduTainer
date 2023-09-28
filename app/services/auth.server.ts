import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "~/services/session.server";
import { db } from "./db.server";
import bcrypt from "bcryptjs";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
const authenticator = new Authenticator<User | Error | null>(sessionStorage, {
    sessionKey: "sessionKey", // keep in sync
  });

authenticator.use(
    new FormStrategy(async ({ form }) => {
      // Here you can use `form` to access and input values from the form.
      // and also use `context` to access more things from the server
      let email = form.get("email") as string; // or email... etc
      let password = form.get("password") as string;
  
      // You can validate the inputs however you want
      if(!email || email?.length === 0) {
        throw new AuthorizationError("Email is required");
      }
      if(!password || password?.length <= 8) {
        throw new AuthorizationError("Password should be atleast 8 charaters long");
      }
      // And finally, you can find, or create, the user
      const user = await db.user.findUnique({
        where: { email },
      }) as any;

      if (!user) throw new AuthorizationError("Invalid credentials");;
      
      const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
      delete user.passwordHash;

      if (isCorrectPassword){
        return {...user};
      } else{
        throw new AuthorizationError("Invalid credentials");
      }
    })
  );
  

//define user
export type User = {
    id: string;
    email: string;
    name: string;
}

export default authenticator;