const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// Endpoint to execute the TagUI script with dynamic data
app.post("/execute-login-script", (req, res) => {
  const { username, password } = req.body;

  // Validate the input
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  // The script that you want to execute with dynamic username and password
  const taguiScript = `
    // This script is for filling all the necessary form
    // Navigate to login page
    echo "Navigating to login page"
    https://app.testim.io/#/signin

    // Wait for username field and fill
    wait for //*[@autocomplete="username"]
    echo "Filling username"
    type //*[@autocomplete="username"] as ${username}

    // Wait for password field and fill
    wait for //*[@autocomplete="current-password"]
    echo "Filling password"
    type //*[@autocomplete="current-password"] as ${password}

    // Wait for the sign-in button and click
    wait for button.cta_cta_3JDAt_50cy1jdGEt
    echo "Clicking sign-in button"
    click button.cta_cta_3JDAt_50cy1jdGEt

    // Wait a bit to let the page load after login
    wait 10

    echo "Login process completed"
  `;

  // Define the script directory and file paths
  const scriptDirectory = "C:\\TagUIScripts"; // Ensure this path is correct
  const scriptPath = path.join(scriptDirectory, "login_tagui_script.tag");

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
  const taguiExecutablePath = "C:\\TagUI\\src\\tagui.cmd"; // The .cmd file for Windows

  // Construct the command to change to the TagUI directory and then execute the script
  const command = `cd C:\\TagUI\\src && "${taguiExecutablePath}" "${scriptPath}"`;

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
