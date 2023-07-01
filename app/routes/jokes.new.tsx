import type { ActionArgs,LoaderArgs} from "@remix-run/node";
import { redirect, json } from "@remix-run/node";

import { createJoke } from "~/models/jokes.server";
import type {ZodError } from 'zod';
import { z } from 'zod';
import { zx } from 'zodix';

import {
  Form, 
  isRouteErrorResponse,  
  Link,  
  useActionData, 
  useNavigation, 
  useRouteError } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getUserId, requireUserId } from "~/utils/session.server";

import { JokeDisplay } from "~/components/joke";

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return "That joke is too short";
  }
}

function validateJokeName(name: string) {
  if (name.length < 3) {
    return "That joke's name is too short";
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return json({});
};

export function ErrorBoundary() {
    const error = useRouteError();
    console.error(error);

    if (isRouteErrorResponse(error) && error.status === 401) {
      return (
        <div className="error-container">
          <p>You must be logged in to create a joke.</p>
          <Link to="/login">Login</Link>
        </div>
      );
    }
  return (
    <div className="error-container">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}

function errorAtPath(error: ZodError, path: string) {
  return error.issues.find((issue) => issue.path[0] === path)?.message;
}

export const action = async ({ request }: ActionArgs) => {
  const results = await zx.parseFormSafe(request,{
    name: z.string().min(3, { message: "name muy corto" }),
    content: z.string().min(10, { message: "contenido muy corto" }),
  });
  
   const jokesterId = await requireUserId(request);

   const formData = await request.formData();
   const name = formData.get("name");
   const content = formData.get("content");

   invariant(
    typeof name === "string",
    "name must be a string"
  );
  invariant(
    typeof content === "string",
    "content must be a string"
  );

if (results.success) {

   const joke = await createJoke({ name , content, jokesterId });
  
     return redirect(`/jokes/${joke.id}`);

}
  
return json(
  {
    success: false,
    nameError: errorAtPath(results.error, 'name'),
    contentError: errorAtPath(results.error, 'content'),
    nombre: name,
    contenido: content,
  });
};


type Props = {}

const JokesNew = (props: Props) => {
  const data = useActionData<typeof action>();
  const navigation = useNavigation();

  if (navigation.formData) {
    const content = navigation.formData.get("content");
    const name = navigation.formData.get("name");
    if (
      typeof content === "string" &&
      typeof name === "string" &&
      !validateJokeContent(content) &&
      !validateJokeName(name)
    ) {
      return (
        <JokeDisplay
          canDelete={false}
          isOwner={true}
          joke={{ name, content }}
        />
      );
    }
  }

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <Form method="post">
        <div>
          <label>
            
            Name: 
            {data?.nameError && <div className="error">{data.nameError}</div>}
            <input 
              type="text" 
              name="name" 
              defaultValue={data?.nombre ? data?.nombre : ''}
              aria-invalid={data?.nameError ? true : undefined}
              aria-errormessage={
                data?.nameError ? "name-error" : undefined
            }
            />
            
          </label>
        </div>
        <div>
          <label>
          
            Content: 
            {data?.contentError && <div className="error">{data.contentError}</div>}
            <textarea 
              name="content" 
              defaultValue={data?.contenido ? data?.contenido : ''}
              // defaultValue={data?.nombre ? data?.nombre : ''}
              aria-invalid={data?.contentError ? true : undefined}
              aria-errormessage={
                data?.contentError ? "contenido-error" : undefined
            }
            />
          </label>
        </div>
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </Form>
    </div>
  )
}

export default JokesNew