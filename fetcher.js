// Import necessary modules
const request = require('request');
const fs = require('fs');
const readline = require('readline');

// Initialize the readline interface for user prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ensure correct number of command-line arguments
if (process.argv.length !== 4) {
  console.log("Please provide a URL and a file path.");
  process.exit();
}

// Extract the URL and file path from the command line arguments
const url = process.argv[2];
const filePath = process.argv[3];

// Edge Case 1: Check if the file already exists
if (fs.existsSync(filePath)) {
  // If the file exists, ask the user for confirmation to overwrite
  rl.question(`${filePath} already exists. Do you want to overwrite it? (Type Y and press Enter to confirm) `, (answer) => {
    // If the user does not confirm, abort the operation
    if (answer.toLowerCase() !== 'y') {
      console.log("Operation aborted.");
      rl.close();
      process.exit();
    }
    // If the user confirms, check for the next edge case (invalid path)
    checkInvalidPathAndFetch();
  });
} else {
  // If the file doesn't exist, check for the edge case (invalid path)
  checkInvalidPathAndFetch();
}

// Edge Case 2: Validate the file path
function checkInvalidPathAndFetch() {  
  // If the file path is invalid, abort the operation with an error message
  if (filePath.includes('\0') || !filePath.trim()) {
    console.error("The provided file path is invalid.");
    rl.close();
    process.exit(1);
  }
  // If the file path is valid, proceed to fetch and save the content
  fetchAndSave();
}

// Fetch the content from the given URL and save it to the specified file path
function fetchAndSave() {
  // Make an HTTP request to the provided URL
  request(url, (error, body) => {
    // Edge Case 3: If there's an error (e.g., invalid URL), show an error message
    if (error) {
      console.error("Failed to fetch the URL. Please ensure it's valid:", error.message);
      rl.close();
      return;
    }

    // Save the fetched content to the specified file path
    fs.writeFile(filePath, body, (err) => {
      // If there's an error in saving the file, show an error message
      if (err) {
        console.error("Failed to write to file:", err.message);
        rl.close();
        return;
      }

      // Display a success message indicating the number of bytes written to the file
      const size = body.length; // 1 character = 1 byte
      console.log(`Downloaded and saved ${size} bytes to ${filePath}`);
      rl.close();  // Close the readline interface
    });
  });
}
