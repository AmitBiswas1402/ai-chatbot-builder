import { cookies } from "next/headers";
import { scalekit } from "./scalekit";

export async function getSession() {
  const session = await cookies();
  const token = session.get("access_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const result: any = await scalekit.validateToken(token);
    return await scalekit.user.getUser(result.sub);
  } catch (error) {
    console.log(error);
    return null;
  }
}