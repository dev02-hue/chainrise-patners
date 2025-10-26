 import { getUserSession } from "@/lib/auth";
import CryptoCurrencyTicker1 from "../component/home/CryptoCurrencyTicker1";
import Navbar from "../component/user/layout/Navbar";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: ReactNode }) {
   const { isAuthenticated  } = await getUserSession();


   if (!isAuthenticated) {
    redirect('/signin');
  }

  return (
    <>
      <Navbar />
      <CryptoCurrencyTicker1 />
      <main>{children}</main>
    </>
  );
}
