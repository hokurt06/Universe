const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Read the input JSON file
const inputFile = "Universities.json";
const outputFile = "universities_with_ids.json";

fs.readFile(inputFile, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading input file:", err);
    return;
  }

  let universities;
  try {
    universities = JSON.parse(data);
  } catch (parseErr) {
    console.error("Invalid JSON format:", parseErr);
    return;
  }

  // Add a UUIDv4 to each university
  const updated = universities.map((univ) => ({
    id: uuidv4(),
    ...univ,
  }));

  // Write to a new file
  fs.writeFile(
    outputFile,
    JSON.stringify(updated, null, 2),
    "utf8",
    (writeErr) => {
      if (writeErr) {
        console.error("Error writing output file:", writeErr);
      } else {
        console.log(`Successfully created ${outputFile} with UUIDs.`);
      }
    }
  );
});
