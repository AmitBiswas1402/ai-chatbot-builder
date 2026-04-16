import Dashboard from "@/components/Dashboard";
import { getSession } from "@/lib/getSession"

const DashboardPage = async () => {
  const session = await getSession();

  return (
    <div>
      <Dashboard ownerId={session?.user?.id!} />      
    </div>
  )
}
export default DashboardPage