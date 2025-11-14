// scripts/importTemplesFromCSV.js

const fs = require("fs");
const csvParser = require("csv-parser");
const admin = require("firebase-admin");
const path = require("path");

// ---- REPLACE WITH YOUR ACTUAL FILE ----
const serviceAccountPath = path.resolve("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});

const db = admin.firestore();

const csvFilePath = path.resolve("./scripts/temples.csv");

async function importCSV() {
  console.log("⏳ Importing temples from CSV...");

  const results = [];

  fs.createReadStream(csvFilePath)
    .pipe(csvParser())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      console.log(`Found ${results.length} entries.`);

      for (const temple of results) {
        try {
          await db.collection("temples").add({
            name: temple.name,
            city: temple.city || "",
            state: temple.state || "",
            about: temple.about || "",
            latitude: Number(temple.latitude),
            longitude: Number(temple.longitude),
            images: temple.images ? temple.images.split("|") : [],
            subTemples: temple.subTemples ? JSON.parse(temple.subTemples) : [],
          });

          console.log(`✔ Added: ${temple.name}`);
        } catch (error) {
          console.error(`❌ Error adding ${temple.name}:`, error);
        }
      }

      console.log("🎉 CSV import complete!");
      process.exit(0);
    });
}

importCSV();
