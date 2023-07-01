import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Link, Outlet } from '@remix-run/react'

import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno
import styles from '~/styles/jokes.css'

import { getJokes } from "~/models/jokes.server";
import { getUser } from "~/utils/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request);
  const jokes = await getJokes();
  return json({ jokes , user });
};

export const links: LinksFunction = () => {
  return [

    {
      rel: "stylesheet",
      href: styles,
    },

  ];
};


type Props = {}

const Jokes = (props: Props) => {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link
              to="/"
              title="Remix Jokes"
              aria-label="Remix Jokes"
            >
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          {data.user ? (
            <div className="user-info">
              <span>{`Hi ${data.user.username}`}</span>
              <Form action="/logout" method="post">
                <button type="submit" className="button">
                  Logout
                </button>
              </Form>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">Chiste aleatorio</Link>
            <p>Aquí hay algunos chistes más para ver::</p>
            <ul>
              {
                data.jokes.map((joke) => (
                <li key={joke.id}>
                  <Link prefetch="intent" to={joke.id}>
                    {joke.name}
                  </Link>
                </li>
                ))
              }
              
            </ul>
            <Link to="new" className="button">
              Añade el tuyo
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
      <footer className="jokes-footer">
        <div className="container">
          <Link reloadDocument to="/jokes.rss">
            RSS
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default Jokes