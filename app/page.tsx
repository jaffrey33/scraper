
import Header from "@/components/header";
import MainPage from "@/components/main-page";
import ProtectedRoute from "./auth/protected-route";
import { Listing } from "@/types/data-types";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
export default async function Home() {

  const fetchListings = async (dateStr: string) => {
    const urls = [
      `${baseUrl}/api/listing?date=${dateStr}`,
      `${baseUrl}/api/realestate-listing?date=${dateStr}`,
    ];

    const responses = await Promise.all(
      urls.map((url) => fetch(url, { method: "GET", next: { revalidate: 3600 } }))
    );

    const data = await Promise.all(responses.map((r) => r.json()));
    return [...(data[0].listings ?? []), ...(data[1].listings ?? [])] as Listing[];
  };

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  let dataMerge = await fetchListings(todayStr);

  // Fallback to yesterday if today is empty
  if (dataMerge.length === 0) {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    dataMerge = await fetchListings(yesterdayStr);
  }

  return (
    <ProtectedRoute>
      <>
        <Header />
        <main className="container mx-auto  2xl:w-1/2 ">
          <MainPage properties={dataMerge} />
        </main>
      </>
    </ProtectedRoute>
  );
}
