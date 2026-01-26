import prisma from "@/lib/prisma";

export default async function Home() {
  const users = await prisma.user.findMany();

  return (
    <main style={{ padding: 20 }}>
      <h1>Users</h1>

      <ul>
        {users.map((u) => (
          <li key={u.id}>
            <strong>{u.email}</strong>
          </li>
        ))}
      </ul>
    </main>
  );
}
