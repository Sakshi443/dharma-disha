// scripts/importTemplesFromCSV.cjs

const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");
const admin = require("firebase-admin");

// -------------------------
// Load Service Account Key
// -------------------------
const serviceAccountPath = path.resolve("serviceAccountKey.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ ERROR: serviceAccountKey.json not found!");
  console.error("Make sure the file exists in the project root.");
  process.exit(1);
}

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

// -------------------------
// Initialize Firebase Admin
// -------------------------
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// -------------------------
// CSV File Path
// -------------------------
const csvFilePath = path.resolve("scripts/temples.csv");

if (!fs.existsSync(csvFilePath)) {
  console.error("❌ ERROR: temples.csv not found in /scripts folder!");
  process.exit(1);
}

// -------------------------
// Main Import Function
// -------------------------
async function importCSV() {
  console.log("⏳ Importing temples from CSV...");

  const results = [];

  fs.createReadStream(csvFilePath)
    .pipe(csvParser())
    .on("data", (row) => results.push(row))
    .on("end", async () => {
      console.log(`📌 Found ${results.length} entries in CSV.`);

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
            subTemples: temple.subTemples
              ? JSON.parse(temple.subTemples)
              : [],
          });

          console.log(`✔ Successfully added: ${temple.name}`);
        } catch (error) {
          console.error(`❌ Error adding ${temple.name}:`, error.message);
        }
      }

      console.log("🎉 CSV import complete!");
      process.exit(0);
    });
}

importCSV();
