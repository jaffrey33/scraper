import { db } from "@/lib/firebase";
import { listings } from "@/types/dummy-data";
import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore";

/**
 * Uploads all Ruapehu rental listings to Firestore (client-side).
 * Uses the numeric listing ID from siteURL as the document ID (idempotent).
 * Writes in batches of 500 (Firestore limit).
 *
 * @param {string} [collectionName="listings"]
 * @returns {Promise<void>}
 */
export async function uploadListingsToFirestore(collectionName = "realestate_property_listings") {
  const BATCH_SIZE = 500;

  for (let i = 0; i < listings.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = listings.slice(i, i + BATCH_SIZE);

    chunk.forEach((listing) => {
      const listingId =
        listing.siteURL.match(/\/(\d+)\//)?.[1] ??
        doc(collection(db, collectionName)).id;

      const docRef = doc(db, collectionName, listingId);

      batch.set(docRef, {
        ...listing,
        createdAt: serverTimestamp(),
        scrapeFrom: "realestate.co.nz",
      });
    });

    await batch.commit();
    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} committed`);
  }

  console.log(`✅ ${listings.length} listings uploaded to "${collectionName}"`);
}