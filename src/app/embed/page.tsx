import Embed from "@/components/Embed";
import { getSession } from "@/lib/getSession";
import { redirect } from "next/navigation";

const EmbedPage = async () => {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/");
  }

  return (
    <>
      <Embed ownerId={session.user.id} />
    </>
  );
};

export default EmbedPage;
