
var express = require("express");
var bodyParser = require("body-parser");
var app = express();

const fs = require("fs").promises;
const path = require("path");

const PORT = process.env.PORT || 5050;
var startPage = "index.html";

const RESOURCES_FILE = path.join(__dirname, "utils", "resources.json");

// Import functions
const { addResource } = require("./utils/AddResourceUtil");
const { viewResources } = require("./utils/ViewResourceUtil");

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", startPage));
});

// Add Resource
app.post("/add-resource", addResource);

// View Resources
app.get("/view-resources", viewResources);

// Modify Resource
app.put("/resources/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const { name, location, description, owner } = req.body;

        // Check if all fields are filled
        if (!name || !location || !description || !owner) {
            return res.status(400).json({
                message: "Please fill in all fields"
            });
        }

        // Read resources.json
        const data = await fs.readFile(RESOURCES_FILE, "utf8");

        let resources = JSON.parse(data);

        // Find resource using ID
        const resourceIndex = resources.findIndex(
            (resource) => String(resource.id) === String(id)
        );

        // Check if resource exists
        if (resourceIndex === -1) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        // Update resource details
        resources[resourceIndex] = {
            ...resources[resourceIndex],
            name,
            location,
            description,
            owner
        };

        // Save updated resources
        await fs.writeFile(
            RESOURCES_FILE,
            JSON.stringify(resources, null, 2)
        );

        res.json({
            message: "Resource updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error updating resource"
        });
    }
});

// Start server
const server = app.listen(PORT, function () {
    const address = server.address();

    const baseUrl = `http://${
        address.address == "::" ? "localhost" : address.address
    }:${address.port}`;

    console.log(`Demo project at: ${baseUrl}`);
});

module.exports = { app, server };
