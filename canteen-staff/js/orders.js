
const ORDERS_API_URL = "http://localhost:8080/api/orders";

const ordersTableBody = document.getElementById("ordersTableBody");
const ordersMessage = document.getElementById("ordersMessage");
const statusFilter = document.getElementById("statusFilter");

let allOrders = [];

function getOrderCredentials() {
    const credentials = sessionStorage.getItem("staffAuth");

    if (!credentials) {
        window.location.replace("login.html");
        return null;
    }

    return credentials;
}

async function ordersRequest(url, options = {}) {
    const credentials = getOrderCredentials();

    if (!credentials) {
        throw new Error("Please sign in as staff.");
    }

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

function createOrderCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value ?? "—";
    return cell;
}

function updateOrderStatistics(orders) {
    document.getElementById("ordersTotal").textContent = orders.length;
    document.getElementById("ordersPending").textContent =
        orders.filter(order => order.status === "PENDING").length;
    document.getElementById("ordersCompleted").textContent =
        orders.filter(order => order.status === "COMPLETED").length;
    document.getElementById("ordersCancelled").textContent =
        orders.filter(order => order.status === "CANCELLED").length;
}

function renderOrders() {
    const selectedStatus = statusFilter.value;

    const filteredOrders = allOrders.filter(order =>
        selectedStatus === "ALL" || order.status === selectedStatus
    );

    ordersTableBody.replaceChildren();

    if (filteredOrders.length === 0) {
        ordersTableBody.innerHTML =
            '<tr><td colspan="9">No orders match this filter.</td></tr>';
        return;
    }

    filteredOrders.forEach(order => {
        const row = document.createElement("tr");

       const itemsCell = document.createElement("td");

if (Array.isArray(order.items) && order.items.length > 0) {

    const itemList = document.createElement("ul");
    itemList.className = "order-items-list";

    order.items.forEach(item => {
        const listItem = document.createElement("li");

        listItem.textContent =
            `${item.quantity} × ${item.itemName} — ₹${Number(item.subtotal || 0).toFixed(2)}`;

        itemList.appendChild(listItem);
    });

    itemsCell.appendChild(itemList);

} else {
    itemsCell.textContent = "No items found";
}

row.append(
    createOrderCell(`#${order.id}`),
    createOrderCell(order.studentName || "—"),
    createOrderCell(order.rollNumber || "—"),
    createOrderCell(order.phone || "—"),
    createOrderCell(order.pickupTime || "—"),
    itemsCell,
    createOrderCell(
        `₹${Number(order.totalAmount || 0).toFixed(2)}`
    ),
    createOrderCell(order.paymentMethod || "CASH")
);

        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");
        statusBadge.className =
            `order-status ${(order.status || "").toLowerCase()}`;
        statusBadge.textContent = order.status || "UNKNOWN";
        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        const actionsCell = document.createElement("td");

        if (order.status === "PENDING") {
            const completeButton = document.createElement("button");
            completeButton.type = "button";
            completeButton.className = "order-action";
            completeButton.textContent = "Complete";
            completeButton.addEventListener("click", () =>
                updateOrderStatus(order.id, "COMPLETED")
            );

            const cancelButton = document.createElement("button");
            cancelButton.type = "button";
            cancelButton.className = "order-action";
            cancelButton.textContent = "Cancel";
            cancelButton.addEventListener("click", () =>
                updateOrderStatus(order.id, "CANCELLED")
            );

            actionsCell.append(completeButton, cancelButton);
        } else {
            actionsCell.textContent = "No actions";
        }

        row.appendChild(actionsCell);
        ordersTableBody.appendChild(row);
    });
}

async function loadOrders() {
    ordersMessage.textContent = "Loading orders...";
    ordersMessage.className = "";

    try {
        const result = await ordersRequest(ORDERS_API_URL);

        if (!Array.isArray(result)) {
            throw new Error("The backend did not return an order list.");
        }

        allOrders = result.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        updateOrderStatistics(allOrders);
        renderOrders();

        ordersMessage.textContent = `${allOrders.length} order(s) loaded.`;
    } catch (error) {
        ordersMessage.textContent = error.message;
        ordersMessage.className = "error";

        ordersTableBody.innerHTML =
            '<tr><td colspan="9">Unable to load orders.</td></tr>';

        console.error("Order loading error:", error);
    }
}

async function updateOrderStatus(orderId, newStatus) {
    const action = newStatus === "COMPLETED" ? "complete" : "cancel";

    if (!confirm(`Are you sure you want to ${action} order #${orderId}?`)) {
        return;
    }

    try {
        await ordersRequest(`${ORDERS_API_URL}/${orderId}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status: newStatus })
        });

        ordersMessage.textContent = `Order #${orderId} updated to ${newStatus}.`;
        ordersMessage.className = "success";

        await loadOrders();
    } catch (error) {
        ordersMessage.textContent = error.message;
        ordersMessage.className = "error";
    }
}

statusFilter.addEventListener("change", renderOrders);

document.getElementById("refreshOrdersButton")
    .addEventListener("click", loadOrders);

loadOrders();
