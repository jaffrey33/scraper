
import Header from "@/components/header";
import MainPage from "@/components/main-page";
import ProtectedRoute from "./auth/protected-route";


export default async function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const urls = [`${baseUrl}/api/listing`, `${baseUrl}/api/realestate-listing`];

  const responses = await Promise.all(
    urls.map((url) =>
      fetch(url, {
        method: "GET",
        next: { revalidate: 3600 },
      })
    )
  );

  const data = await Promise.all(responses.map((response) => response.json()));
  const dataMerge = [...data[0].listings, ...data[1].listings];

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
