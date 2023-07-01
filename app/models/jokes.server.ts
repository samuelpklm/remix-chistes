import { db } from "~/utils/db.server";

import type { Joke, User } from "@prisma/client";

export async function getJokes() {
    return db.joke.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true },
        take: 5,
      });
  }

export async function getJoke(jokeId: string) {
return db.joke.findUnique({
    where: { id: jokeId },
    });
}

export async function deleteJoke(jokeId: string) {
  return db.joke.delete({
      where: { id: jokeId },
      });
  }

export async function getJokeRamdon() {
    const count = await db.joke.count();
    const randomRowNumber = Math.floor(Math.random() * count);
    const [randomJoke] = await db.joke.findMany({
        skip: randomRowNumber,
        take: 1,
      });
return randomJoke
}

export async function createJoke({
    name,
    content,
    jokesterId,
  }: Pick<Joke, "name" | "content"> & {
    jokesterId: User["id"];
}) {
    // const [name, content, user] = joke;
   
    return db.joke.create({ 
        data: {
            name,
            content,
            jokesterId,
          },
        });
    }