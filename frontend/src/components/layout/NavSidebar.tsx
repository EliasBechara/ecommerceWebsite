import { Link } from "react-router-dom";
import { Button } from "../button/Button";
import { CATEGORIES, ROUTES } from "../../routes";
import { SidePanel } from "../sidePanel/SidePanel";

type SidebarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
};

export const NavSidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
}: SidebarProps) => {
  return (
    <>
      <SidePanel
        isSidePanelOpen={isSidebarOpen}
        setIsSidePanelOpen={setIsSidebarOpen}
        position="left"
      >
        <div className="flex justify-between items-center mb-8"></div>

        <nav className="flex flex-col gap-6 text-black pt-10">
          <Button variant={"sidebar"}>
            <Link to={ROUTES.category(CATEGORIES.GPU)}>Home</Link>
          </Button>
          <Button variant={"sidebar"}>
            <Link to={ROUTES.category(CATEGORIES.GPU)}>GPU</Link>
          </Button>
          <Button variant={"sidebar"}>
            <Link to={ROUTES.category(CATEGORIES.CPU)}>CPU</Link>
          </Button>
          <Button variant={"sidebar"}>Search</Button>
          <Button variant={"sidebar"}>Settings</Button>
        </nav>
      </SidePanel>
    </>
  );
};
