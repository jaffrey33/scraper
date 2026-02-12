
import Header from "@/components/header";
import MainPage from "@/components/main-page";
import ProtectedRoute from "./auth/protected-route";


export default async function Home() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/listing`, {
    // next: { revalidate: 86400 }, // Revalidate every 24 hours (86400 seconds)
  });
  const data = await res.json();
  return (
    <ProtectedRoute>
      <>
        <Header />
        <main className="container mx-auto lg:w-3/5">
          <MainPage properties={data.listings} />
        </main>
      </>
    </ProtectedRoute>
  );
}
