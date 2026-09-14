import { currentUser } from "@clerk/nextjs/server";

export async function getSession() {
  try {
    const user = await currentUser();
    if (!user) return null;

    return {
      user: {
        id: user.id,
        email:
          user.primaryEmailAddress?.emailAddress ||
          user.emailAddresses[0]?.emailAddress ||
          "",
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  } catch (error) {
    console.error("Error retrieving Clerk session:", error);
    return null;
  }
}