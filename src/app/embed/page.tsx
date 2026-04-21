import Embed from "@/components/Embed";
import { getSession } from "@/lib/getSession";

const EmbedPage = async () => {
  const session = await getSession();

  return (
    <>
      <Embed ownerId={session?.user?.id!} />
    </>
  );
};
export default EmbedPage;
