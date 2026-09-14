import Dashboard from "@/components/Dashboard";
import { getSession } from "@/lib/getSession";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/");
  }

  return (
    <div>
      <Dashboard ownerId={session.user.id} />      
    </div>
  );
};

export default DashboardPage;