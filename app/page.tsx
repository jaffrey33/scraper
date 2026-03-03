
import Header from "@/components/header";
import MainPage from "@/components/main-page";
import ProtectedRoute from "./auth/protected-route";


export default async function Home() {
  // const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/listing`, {
  //   // next: { revalidate: 86400 }, // Revalidate every 24 hours (86400 seconds)
  // });
  const urls = [
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/listing`,
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/realestate-listing`
  ]
  const responses = await Promise.all(urls.map(url => fetch(url, {
    next: { revalidate: 86400 }, 
  })));
  const data = await Promise.all(responses.map(response => response.json()));
  const dataMerge = [ ...data[0].listings, ...data[1].listings ]
  return (
    <ProtectedRoute>
      <>
        <Header />
        <main className="container mx-auto xl:w-1/2">
          <MainPage properties={dataMerge} />
        </main>
      </>
    </ProtectedRoute>
  );
}
