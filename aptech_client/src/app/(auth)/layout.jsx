import Footer from "@/components/sheard/Footer";
import Navbar from "@/components/sheard/Navbar";
import TopHeader from "@/components/sheard/TopHeader";

export const metadata = {
  title: "Authentication | BraveTalk Bangladesh",
  description: "Login or Register to access your BraveTalk Bangladesh account.",
};

export default function AuthLayout({ children }) {
  return (
    <>
      <TopHeader />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
