
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col  font-serif  items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-4">Nirvana - A Complaint Management System</h1>
      <p className="text-xl text-gray-600 max-w-2xl mb-8">
        A transparent and efficient platform for citizens to report and track complaints, 
        and for officials to manage and resolve issues.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button size="lg" onClick={() => navigate("/login")}>
          Login
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate("/public")}>
          Public Dashboard
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
