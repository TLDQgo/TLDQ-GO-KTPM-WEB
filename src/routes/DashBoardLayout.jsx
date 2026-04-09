import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";

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
