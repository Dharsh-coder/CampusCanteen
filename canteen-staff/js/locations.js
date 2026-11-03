
const LOCATION_API_URL = "http://localhost:8080/api/locations";

const locationForm = document.getElementById("locationForm");
const locationId = document.getElementById("locationId");
const locationName = document.getElementById("locationName");
const locationActive = document.getElementById("locationActive");

const locationMessage = document.getElementById("locationMessage");
const locationListMessage = document.getElementById("locationListMessage");
const locationsTableBody = document.getElementById("locationsTableBody");

const saveLocationButton = document.getElementById("saveLocationButton");
const cancelLocationEditButton =
    document.getElementById("cancelLocationEditButton");

function getStaffCredentials() {
    const credentials = sessionStorage.getItem("staffAuth");

    if (!credentials) {
        window.location.replace("login.html");
        throw new Error("Please sign in as staff.");
    }

    return credentials;
}

async function locationRequest(url, options = {}) {
    const credentials = getStaffCredentials();

    const response = await fetch(url, {
        ...options,
        headers: {
            "Authorization": `Basic ${credentials}`,
            "Accept": "application/json",
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers
        }
    });

    if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("staffAuth");
        sessionStorage.removeItem("staffUsername");
        window.location.replace("login.html");
        throw new Error("Staff authentication failed. Please sign in again.");
    }

    if (!response.ok) {
        const body = await response.text();
        throw new Error(body || `Request failed (HTTP ${response.status}).`);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

function showLocationMessage(message, type = "") {
    locationMessage.textContent = message;
    locationMessage.className = type;
}

function resetLocationForm() {
    locationForm.reset();
    locationId.value = "";

    document.getElementById("locationFormTitle").textContent =
        "Add New Location";

    saveLocationButton.textContent = "Add Location";
    cancelLocationEditButton.hidden = true;

    document.getElementById("locationStatusField").hidden = true;

    showLocationMessage("");
}

function createCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    return cell;
}

async function loadLocations() {
    locationListMessage.textContent = "Loading locations...";
    locationListMessage.className = "";
    locationsTableBody.replaceChildren();

    try {
        const locations = await locationRequest(
            `${LOCATION_API_URL}/all`
        );

        if (!Array.isArray(locations) || locations.length === 0) {
            locationsTableBody.innerHTML =
                '<tr><td colspan="3">No campus locations found.</td></tr>';

            locationListMessage.textContent = "";
            return;
        }

        locations.forEach(location => {
            const row = document.createElement("tr");

            row.appendChild(createCell(location.name));

            const statusCell = document.createElement("td");
            const statusLabel = document.createElement("span");

            statusLabel.className =
                `availability-label ${location.active ? "available" : "unavailable"}`;

            statusLabel.textContent =
                location.active ? "Active" : "Inactive";

            statusCell.appendChild(statusLabel);
            row.appendChild(statusCell);

            const actionsCell = document.createElement("td");
            const actions = document.createElement("div");
            actions.className = "menu-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () =>
                editLocation(location)
            );

            const toggleButton = document.createElement("button");
            toggleButton.type = "button";
            toggleButton.textContent =
                location.active ? "Deactivate" : "Activate";

            toggleButton.addEventListener("click", () =>
                toggleLocation(location)
            );

            actions.append(editButton, toggleButton);
            actionsCell.appendChild(actions);
            row.appendChild(actionsCell);

            locationsTableBody.appendChild(row);
        });

        locationListMessage.textContent =
            `${locations.length} location(s) loaded.`;

    } catch (error) {
        locationsTableBody.innerHTML =
            '<tr><td colspan="3">Unable to load locations.</td></tr>';

        locationListMessage.textContent = error.message;
        locationListMessage.className = "error";
    }
}

function editLocation(location) {
    locationId.value = location.id;
    locationName.value = location.name;
    locationActive.value = String(location.active);

    document.getElementById("locationFormTitle").textContent =
        "Edit Campus Location";

    saveLocationButton.textContent = "Save Changes";
    cancelLocationEditButton.hidden = false;

    document.getElementById("locationStatusField").hidden = false;

    showLocationMessage("");

    locationForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

locationForm.addEventListener("submit", async event => {
    event.preventDefault();

    const id = locationId.value;
    const name = locationName.value.trim();

    if (!name) {
        showLocationMessage("Enter a location name.", "error");
        return;
    }

    const location = {
        name: name,
        active: id ? locationActive.value === "true" : true
    };

    saveLocationButton.disabled = true;

    showLocationMessage(
        id ? "Updating location..." : "Adding location..."
    );

    try {
        await locationRequest(
            id
                ? `${LOCATION_API_URL}/${encodeURIComponent(id)}`
                : LOCATION_API_URL,
            {
                method: id ? "PUT" : "POST",
                body: JSON.stringify(location)
            }
        );

        resetLocationForm();

        showLocationMessage(
            id
                ? "Location updated successfully!"
                : "Location added successfully!",
            "success"
        );

        await loadLocations();

    } catch (error) {
        showLocationMessage(error.message, "error");
    } finally {
        saveLocationButton.disabled = false;
    }
});

async function toggleLocation(location) {
    const action = location.active ? "deactivate" : "activate";

    if (!confirm(`Are you sure you want to ${action} "${location.name}"?`)) {
        return;
    }

    try {
        await locationRequest(
            `${LOCATION_API_URL}/${location.id}`,
            {
                method: "PUT",
                body: JSON.stringify({
                    name: location.name,
                    active: !location.active
                })
            }
        );

        await loadLocations();

    } catch (error) {
        locationListMessage.textContent = error.message;
        locationListMessage.className = "error";
    }
}

cancelLocationEditButton.addEventListener("click", resetLocationForm);

document.getElementById("refreshLocationsButton")
    .addEventListener("click", loadLocations);

loadLocations();
