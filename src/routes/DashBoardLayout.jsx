import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import HeaderSeller from "../components/layout/HeaderSeller";
import SidebarSeller from "../components/layout/SidebarSeller";
import HeaderAdmin from "../components/layout/HeaderAdmin";
import SidebarAdmin from "../components/layout/SidebarAdmin";

const UserLayout = ({ children }) => {
  return (
    <>
      <div className="bg-white shadow">
        <Header />
      </div>
      <div className="px-[100px]">
        <main>{children}</main>
      </div>
      <div className="bg-white shadow">
        <Footer />
      </div>
    </>
  );
};
export { UserLayout };

const SellerLayout = ({ children }) => {
  return (
    <>
      <div className="min-h-screen bg-gray-100">
        {/* HEADER */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <HeaderSeller />
        </div>

        {/* BODY */}
        <div className="flex pt-[60px]">
          {/* SIDEBAR */}
          <SidebarSeller />

          {/* MAIN */}
          <div className="flex-1 ml-[260px] p-6">
            <main className="min-h-[calc(100vh-120px)]">{children}</main>

            {/* FOOTER */}
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};
export { SellerLayout };

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderAdmin />
      </div>
      <div className="flex pt-[56px]">
        <SidebarAdmin />
        <div className="flex-1 ml-[240px] p-6">
          <main className="min-h-[calc(100vh-100px)]">{children}</main>
        </div>
      </div>
    </div>
  );
};
export { AdminLayout };
