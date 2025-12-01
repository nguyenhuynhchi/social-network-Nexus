import Navbar from "../components/cpn_home/Navbar";
import SidebarLeft from "../components/cpn_home/SidebarLeft";
import Feed from "../components/cpn_home/Feed";
import SidebarRight from "../components/cpn_home/SidebarRight";

export default function Home() {
 return (
    <div className="w-full h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden w-full">
        <SidebarLeft className="w-[250px]"/>

        <div className="flex-1 w-full min-w-0 overflow-auto">
          <Feed />
        </div>

        <SidebarRight className="w-[300px]"/>
      </div>
    </div>
  );
}