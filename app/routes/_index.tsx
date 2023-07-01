import React from 'react'
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno
import styles from '../styles/index.css'
import { Link } from '@remix-run/react';

export const links: LinksFunction = () => {
  return [

    {
      rel: "stylesheet",
      href: styles,
    },

  ];
};


type Props = {}

const Index = (props: Props) => {
  return (
    <div className="container">
      <div className="content">
        <h1>
          Remix <span>Jokes!</span>
        </h1>
        <nav>
          <ul>
            <li>
              <Link to="jokes">Read Jokes</Link>
            </li> 
            <li>
              <Link reloadDocument to="/jokes.rss">
                RSS
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Index