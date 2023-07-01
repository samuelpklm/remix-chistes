import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";

import type { ActionArgs, LinksFunction,  V2_MetaFunction,} from "@remix-run/node";
// import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";

import type {ZodError } from 'zod';
import { z } from 'zod';
import { zx } from 'zodix';

import stylesUrl from "~/styles/login.css";
import { getUserByName } from "~/models/user.server";
import invariant from "tiny-invariant";
import { safeRedirect, createUserSession, login, createUser } from "~/utils/session.server";

function errorAtPath(error: ZodError, path: string) {
  return error.issues.find((issue) => issue.path[0] === path)?.message;
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export const meta: V2_MetaFunction = () => {
  const description =
    "Login to submit your own jokes to Remix Jokes!";

  return [
    { name: "description", content: description },
    { name: "twitter:description", content: description },
    { title: "Remix Jokes | Login" },
  ];
};


export const action = async ({ request }: ActionArgs) => {
    const results = await zx.parseFormSafe(request,{
      loginType: z.string(),
      username: z.string().min(3, { message: "nombre muy corto" }),
      password: z.string().min(6, { message: "contraseña muy corta"}),
    });
      const form = await request.formData();
      const loginType = form.get("loginType");
      const username = form.get("username");    
      const password = form.get("password");
      const redirectTo = safeRedirect(form.get("redirectTo"), "/jokes");
  
      invariant(
        typeof username === "string",
        "username must be a string"
      );

      invariant(
        typeof password === "string",
        "password must be a string"
      );
  
  if (results.success) {
  
    switch (loginType) {
      case "login": {
        const validaUser = await login(username, password);
        
        if(!validaUser){
         
          return json(
            {
              success: false,
              nombreError: "Usuario o contraseña equivocados",
              passwordError: null,
              nombre: username,
              passwd: password,
              loginType: loginType,
            });
        }
        return createUserSession({
          request,
          userId: validaUser.id,
          redirectTo,
        });

        // if there is a user, create their session and redirect to /jokes
        
    }
    case "register": {
      const userExists = await getUserByName(username);
      if (userExists) {
        return json(
          {
            success: false,
            nombreError:` ${username} ya existente en la base de datos`,
            passwordError: null,
            nombre: username,
            passwd: password,
            loginType: loginType,
          });
      }
      const userNew = await createUser(username, password);
      // create their session and redirect to /jokes
      
      return createUserSession({
        request,
        userId: userNew.id,
        redirectTo,
      });
    }
    default: {
      return json(
        {
          success: false,
          nombreError: "No especificado el login o register",
          passwordError: null,
          nombre: username,
          passwd: password,
          loginType: loginType,
        });
    }
  }
}
    
  return json(
    {
      success: false,
      nombreError: errorAtPath(results.error, 'username'),
      passwordError: errorAtPath(results.error, 'password'),
      nombre: username,
      passwd: password,
      loginType: loginType,
    });
  };

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/jokes";
  // console.log(actionData);

  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>Login</h1>
        <Form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={
              searchParams.get("redirectTo") ?? undefined
            }
          />
          <fieldset>
            <legend className="sr-only">
              Login or Register?
            </legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                checked
                defaultChecked={actionData?.loginType === 'login'}
              />{" "}
              Login
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
                defaultChecked={actionData?.loginType === 'register'}
              />{" "}
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input">Username</label>
            <input
              type="text"
              id="username-input"
              name="username"
              defaultValue={actionData?.nombre}
              aria-invalid={actionData?.nombreError ? true : undefined}
              aria-errormessage={
                actionData?.nombreError
                ? "username-error"
                : undefined
              }
              />
            {actionData?.nombreError && <div className="error">{actionData.nombreError}</div>}
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              name="password"
              type="password"
              defaultValue={actionData?.passwd}
              aria-invalid={actionData?.passwordError ? true : undefined}
              aria-errormessage={
                actionData?.passwordError
                ? "username-error"
                : undefined
              }
            />
            {actionData?.passwordError && <div className="error">{actionData.passwordError}</div>}
          </div>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button type="submit" className="button">
            Submit
          </button>
        </Form>
      </div>
      <div className="links">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/jokes">Jokes</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
