const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Endpoint to execute the TagUI script with dynamic data
app.post("/execute-tagUI-script", (req, res) => {
  const { firstname, surname, contactNumber, email } = req.body;

  // Validate the input
  if (!firstname || !surname || !contactNumber || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // The script that you want to execute with dynamic username and password
  const taguiScript = `
    // This script is for filling all the necessary form
    // Navigate to test site
    echo "Navigating to test site"
    http://localhost:9091/

    // Wait for firstname field and fill
    wait for //*[@ng-model="$mdAutocompleteCtrl.scope.searchText" and @aria-label="First name"]
    echo "Filling firstname"
    type //*[@ng-model="$mdAutocompleteCtrl.scope.searchText" and @aria-label="First name"] as ${firstname}

    // Wait for surname field and fill
    wait for //*[@ng-model="$ctrl.contact.familyName"]
    echo "Filling surname"
    type //*[@ng-model="$ctrl.contact.familyName"] as ${surname}

    // Wait for contact number field and fill
    wait for //*[@ng-model="$ctrl.contact.phone"]
    echo "Filling contact number"
    type //*[@ng-model="$ctrl.contact.phone"] as ${contactNumber}

    // Wait for email field and fill
    wait for //*[@ng-model="$ctrl.contact.email"]
    echo "Filling email"
    type //*[@ng-model="$ctrl.contact.email"] as ${email}

    // Wait a bit to let the page load after login
    wait 10

    echo "Fill process completed"
  `;

  // Define the script directory and file paths
  const scriptDirectory = "C:\\TagUIScripts"; // Ensure this path is correct
  const scriptPath = path.join(scriptDirectory, "documentForm.tag");

  // Verify if the script directory exists, create if not
  if (!fs.existsSync(scriptDirectory)) {
    fs.mkdirSync(scriptDirectory, { recursive: true });
  }

  // Write the TagUI script to a file
  try {
    fs.writeFileSync(scriptPath, taguiScript);
  } catch (fileError) {
    console.error(`Failed to write TagUI script to file: ${fileError.message}`);
    return res.status(500).json({ error: "Failed to write TagUI script" });
  }

  // Use the correct path for the TagUI executable
  // command for not admin
  // const command = `tagui C:\\TagUIScripts\\documentForm.tag`;
  // Construct the command to run as administrator
  const command = `powershell -Command "Start-Process 'C:\\TagUI\\src\\tagui.cmd' -ArgumentList 'C:\\TagUIScripts\\documentForm.tag' -Verb RunAs"`;

  // Execute the command
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing TagUI script: ${error.message}`);
      return res.status(500).json({ error: "Failed to execute TagUI script" });
    }
    if (stderr) {
      console.error(`TagUI script error: ${stderr}`);
      return res
        .status(500)
        .json({ error: "Error in TagUI script execution", details: stderr });
    }

    console.log(`TagUI script executed successfully: ${stdout}`);
    res.json({
      message: "TagUI script executed successfully",
      output: stdout,
    });
  });
});

// Start the server
const PORT = process.env.PORT || 9090;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
