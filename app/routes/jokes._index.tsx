import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";

import { getJokeRamdon } from "~/models/jokes.server";
import {
  isRouteErrorResponse, 
  Link, 
  useLoaderData,  
  useRouteError } from "@remix-run/react";

export function ErrorBoundary() {
   const error = useRouteError();
   console.error(error);

   if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="error-container">
        <p>There are no jokes to display.</p>
        <Link to="new">Add your own</Link>
      </div>
    );
  }
  return (
    <div className="error-container">
      I did a whoopsies.
    </div>
  );
}

export const loader = async ({ request }: LoaderArgs) => {
  const randomJoke = await getJokeRamdon();

  if (!randomJoke) {
    throw new Response("No random joke found", {
      status: 404,
    });
  }

  return json({ jokes: randomJoke });
};


type Props = {}

const JokesIndex = (props: Props) => {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
        <p>Aquí hay una broma al azar:</p>
        <p>{data.jokes.content}</p>
        <Link to={data.jokes.id}>
          "{data.jokes.name}" Enlace permanente
        </Link>
  </div>
  )
}

export default JokesIndex