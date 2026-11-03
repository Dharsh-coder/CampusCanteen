
const MENU_API_URL = "http://localhost:8080/api/menu";

const menuForm = document.getElementById("menuForm");
const menuTableBody = document.getElementById("menuTableBody");
const menuMessage = document.getElementById("menuMessage");
const menuListMessage = document.getElementById("menuListMessage");

const foodId = document.getElementById("foodId");
const foodName = document.getElementById("foodName");
const foodCategory = document.getElementById("foodCategory");
const foodPrice = document.getElementById("foodPrice");
const foodAvailable = document.getElementById("foodAvailable");
const foodDescription = document.getElementById("foodDescription");

const saveFoodButton = document.getElementById("saveFoodButton");
const cancelEditButton = document.getElementById("cancelEditButton");

function getStaffCredentials() {
    const credentials = sessionStorage.getItem("staffAuth");

    if (!credentials) {
        window.location.replace("login.html");
        throw new Error("Please sign in as staff.");
    }

    return credentials;
}

async function menuRequest(url, options = {}) {
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

function showMenuMessage(text, type = "") {
    menuMessage.textContent = text;
    menuMessage.className = type;
}

function resetMenuForm() {
    menuForm.reset();
    foodId.value = "";
    document.getElementById("formTitle").textContent = "Add New Food Item";
    saveFoodButton.textContent = "Add Food Item";
    cancelEditButton.hidden = true;
    showMenuMessage("");
}

function createCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    return cell;
}

async function loadMenuItems() {
    menuListMessage.textContent = "Loading menu items...";
    menuListMessage.className = "";
    menuTableBody.replaceChildren();

    try {
        const items = await menuRequest(`${MENU_API_URL}/all`);

        if (!Array.isArray(items) || items.length === 0) {
            menuTableBody.innerHTML =
                '<tr><td colspan="5">No food items found.</td></tr>';
            menuListMessage.textContent = "";
            return;
        }

        items.forEach(item => {
            const row = document.createElement("tr");

            row.append(
                createCell(item.name),
                createCell(item.category || "—"),
                createCell(`₹${Number(item.price).toFixed(2)}`)
            );

            const availabilityCell = document.createElement("td");
            const availability = document.createElement("span");
            availability.className =
                `availability-label ${item.available ? "available" : "unavailable"}`;

            availability.textContent = !item.active
                ? "Deactivated"
                : item.available ? "Available" : "Unavailable";

            availabilityCell.appendChild(availability);
            row.appendChild(availabilityCell);

            const actionsCell = document.createElement("td");
            const actions = document.createElement("div");
            actions.className = "menu-actions";

            if (item.active) {
                const editButton = document.createElement("button");
                editButton.type = "button";
                editButton.textContent = "Edit";
                editButton.addEventListener("click", () => editFoodItem(item));

                const availabilityButton = document.createElement("button");
                availabilityButton.type = "button";
                availabilityButton.textContent =
                    item.available ? "Mark Unavailable" : "Mark Available";
                availabilityButton.addEventListener("click", () =>
                    toggleAvailability(item)
                );

                const deactivateButton = document.createElement("button");
                deactivateButton.type = "button";
                deactivateButton.className = "deactivate-button";
                deactivateButton.textContent = "Deactivate";
                deactivateButton.addEventListener("click", () =>
                    deactivateFoodItem(item)
                );

                actions.append(editButton, availabilityButton, deactivateButton);
            } else {
                actions.textContent = "No actions available";
            }

            actionsCell.appendChild(actions);
            row.appendChild(actionsCell);
            menuTableBody.appendChild(row);
        });

        menuListMessage.textContent = `${items.length} item(s) loaded.`;

    } catch (error) {
        menuTableBody.innerHTML =
            '<tr><td colspan="5">Unable to load menu items.</td></tr>';
        menuListMessage.textContent = error.message;
        menuListMessage.className = "error";
    }
}

function editFoodItem(item) {
    foodId.value = item.id;
    foodName.value = item.name || "";
    foodCategory.value = item.category || "";
    foodPrice.value = item.price;
    foodAvailable.value = String(item.available);
    foodDescription.value = item.description || "";

    document.getElementById("formTitle").textContent = "Edit Food Item";
    saveFoodButton.textContent = "Save Changes";
    cancelEditButton.hidden = false;

    showMenuMessage("");
    menuForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

menuForm.addEventListener("submit", async event => {
    event.preventDefault();

    const id = foodId.value;

    const item = {
        name: foodName.value.trim(),
        category: foodCategory.value.trim(),
        price: Number(foodPrice.value),
        available: foodAvailable.value === "true",
        description: foodDescription.value.trim()
    };

    if (!item.name || !item.category || !Number.isFinite(item.price) || item.price <= 0) {
        showMenuMessage("Enter a name, category, and valid price.", "error");
        return;
    }

    saveFoodButton.disabled = true;
    showMenuMessage(id ? "Updating food item..." : "Adding food item...");

    try {
        await menuRequest(
            id ? `${MENU_API_URL}/${encodeURIComponent(id)}` : MENU_API_URL,
            {
                method: id ? "PUT" : "POST",
                body: JSON.stringify(item)
            }
        );

        resetMenuForm();
        showMenuMessage(
            id ? "Food item updated successfully!" : "Food item added successfully!",
            "success"
        );

        await loadMenuItems();

    } catch (error) {
        showMenuMessage(error.message, "error");
    } finally {
        saveFoodButton.disabled = false;
    }
});

async function toggleAvailability(item) {
    const updatedItem = {
        name: item.name,
        category: item.category,
        price: Number(item.price),
        available: !item.available,
        active: item.active,
        description: item.description || ""
    };

    try {
        await menuRequest(`${MENU_API_URL}/${item.id}`, {
            method: "PUT",
            body: JSON.stringify(updatedItem)
        });

        await loadMenuItems();
    } catch (error) {
        menuListMessage.textContent = error.message;
        menuListMessage.className = "error";
    }
}

async function deactivateFoodItem(item) {
    if (!confirm(`Deactivate "${item.name}"? It will no longer appear in the student menu.`)) {
        return;
    }

    try {
        await menuRequest(`${MENU_API_URL}/${item.id}`, {
            method: "DELETE"
        });

        resetMenuForm();
        await loadMenuItems();
    } catch (error) {
        menuListMessage.textContent = error.message;
        menuListMessage.className = "error";
    }
}

cancelEditButton.addEventListener("click", resetMenuForm);

document.getElementById("refreshMenuButton")
    .addEventListener("click", loadMenuItems);

loadMenuItems();
