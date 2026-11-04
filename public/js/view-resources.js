// View all resources
async function viewResources() {
  try {
    const response = await fetch("/resources");

    if (!response.ok) {
      throw new Error("Failed to retrieve resources");
    }

    const resources = await response.json();

    let html = "";

    resources.forEach((resource) => {
      html += `
                <tr>
                    <td>${resource.id}</td>
                    <td>${escapeHTML(resource.name)}</td>
                    <td>${escapeHTML(resource.location)}</td>
                    <td>${escapeHTML(resource.description)}</td>
                    <td>${escapeHTML(resource.owner)}</td>

                    <td>
                        <button class="btn btn-warning btn-sm"
                            onclick="editResource('${encodeURIComponent(String(resource.id))}')">
                            Modify
                        </button>
                    </td>
                </tr>
            `;
    });

    document.getElementById("tableContent").innerHTML = html;
  } catch (error) {
    console.error("Error loading resources:", error);

    document.getElementById("tableContent").innerHTML =
      `<tr><td colspan="6">Unable to load resources.</td></tr>`;
  }
}

// Escape resource text before displaying it in the table
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (character) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

// Get selected resource and display its details
async function editResource(id) {
  try {
    const response = await fetch("/resources");

    const resources = await response.json();

    const resource = resources.find(
      (item) => String(item.id) === decodeURIComponent(id),
    );

    if (!resource) {
      alert("Resource not found!");

      return;
    }

    document.getElementById("modifyId").value = resource.id;
    document.getElementById("modifyName").value = resource.name;
    document.getElementById("modifyLocation").value = resource.location;
    document.getElementById("modifyDescription").value = resource.description;
    document.getElementById("modifyOwner").value = resource.owner;

    $("#modifyResourceModal").modal("show");
  } catch (error) {
    console.error("Error retrieving resource:", error);

    alert("Unable to retrieve resource details.");
  }
}

// Update resource
async function updateResource() {
  const id = document.getElementById("modifyId").value;

  const updatedResource = {
    name: document.getElementById("modifyName").value.trim(),

    location: document.getElementById("modifyLocation").value.trim(),

    description: document.getElementById("modifyDescription").value.trim(),

    owner: document.getElementById("modifyOwner").value.trim(),
  };

  // Check if all fields are filled
  if (
    !updatedResource.name ||
    !updatedResource.location ||
    !updatedResource.description ||
    !updatedResource.owner
  ) {
    alert("Please fill in all fields.");

    return;
  }

  try {
    const response = await fetch(`/resources/${encodeURIComponent(id)}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(updatedResource),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Resource updated successfully!");

      $("#modifyResourceModal").modal("hide");

      viewResources();
    } else {
      alert(result.message || "Failed to update resource.");
    }
  } catch (error) {
    console.error("Error updating resource:", error);

    alert("Unable to update resource.");
  }
}
