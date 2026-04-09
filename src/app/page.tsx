import HomePage from "@/components/Home"
import { getSession } from "@/lib/getSession";

const Home = async () => {
  const session = await getSession();
  return (
    <>
      <HomePage email={session?.user?.email!} />
    </>
  )
}
export default Home