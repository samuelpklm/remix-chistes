import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();

async function seed() {
  const name = "samuelpush";

   // cleanup the existing database
   await db.user.delete({ where: { username: name } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("samisami", 10);

  const user = await db.user.create({
    data: {
      username: name,
      passwordHash: hashedPassword,
    },
  });


  await Promise.all(
    getJokes().map((joke) => {
      // return db.joke.create({ data: joke });
      const data = { jokesterId: user.id, ...joke };
      return db.joke.create({ data });
    })
  );
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

function getJokes() {
  // shout-out to https://icanhazdadjoke.com/

  return [
    {
      name: "Trabajador vial",
      content: `Nunca quise creer que mi papá estaba robando en su trabajo, como trabajador de caminos. Pero cuando llegué a casa, todas las señales estaban allí.`,
    },
    {
      name: "Disco volador",
      content: `Me preguntaba por qué el frisbee se estaba haciendo más grande, entonces me di cuenta.`,
    },
    {
      name: "Esqueletos",
      content: `¿Por qué los esqueletos no montan montañas rusas?. Porque no tienen estómago para eso.`,
    },
    {
      name: "Cena",
      content: `¿Qué le dijo un plato a otro plato? ¡La cena corre por mi cuenta!`,
    },
    {
      name: "Ascensor",
      content: `La primera vez que usé un ascensor fue una experiencia edificante. La segunda vez me defraudó.`,
    },
  ];
}
