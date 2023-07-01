import type { User } from "@prisma/client";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { getUserById } from "~/models/user.server";

import { db } from "~/utils/db.server";
export type { User } from "@prisma/client";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const USER_SESSION_KEY = "userId";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getUserId(
  request: Request
): Promise<User["id"] | undefined> {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  return userId;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function login(userId: User["username"], password: User["passwordHash"]) {
  const userWithPassword = await db.user.findUnique({
    where: { username: userId },
    select: { id: true,  username: true, passwordHash: true },
  });

  if (!userWithPassword || !userWithPassword.passwordHash) {
    return null;
  } 
  

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.passwordHash
  );

  if (!isValid) {
    return null;
  }

  return { id: userWithPassword.id, userId };
  
}

export async function createUser(username: User["username"], passwordHash: User["passwordHash"]) {
  const hashedPassword = await bcrypt.hash(passwordHash, 10);

  return db.user.create({
    data: {
      username: username,
      passwordHash: hashedPassword,
    },
  });
}

export async function createUserSession({
  request,
  userId,
  redirectTo,
}: {
  request: Request;
  userId: string;
  redirectTo: string;
}) {
   const session = await getSession(request);
   session.set(USER_SESSION_KEY, userId);
   return redirect(redirectTo, {
     headers: {
       "Set-Cookie": await sessionStorage.commitSession(session, {
         maxAge: undefined,
       }),
     },
   });
}

const DEFAULT_REDIRECT = "/";

export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (userId === undefined) return null;

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
