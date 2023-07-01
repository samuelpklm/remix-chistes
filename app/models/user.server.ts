import { db } from "~/utils/db.server";
import type { User } from "@prisma/client";

export async function checkUser(userId: string) {
    return db.user.findFirst({
        where: { id: userId },
        });
    }

export async function getUserById(id: User["id"]) {
    return db.user.findUnique({ where: { id } });
    }

export async function getUserByName(username: User["username"]) {
    return db.user.findUnique({
        where: { username: username },
        });
    }

