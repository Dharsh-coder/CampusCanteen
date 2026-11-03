
const API_BASE_URL = "http://localhost:8080/api";

async function loadDashboard() {
    const message = document.getElementById("dashboardMessage");
    const tableBody = document.getElementById("recentOrdersBody");

    const credentials = sessionStorage.getItem("staffAuth");

    // Prevent the dashboard from loading without a login attempt.
    if (!credentials) {
        window.location.replace("login.html");
        return;
    }

    try {
        message.textContent = "Loading dashboard data...";

        const response = await fetch(`${API_BASE_URL}/orders`, {
            headers: {
                "Authorization": `Basic ${credentials}`,
                "Accept": "application/json"
            }
        });

        if (response.status === 401 || response.status === 403) {
            sessionStorage.removeItem("staffAuth");
            sessionStorage.removeItem("staffUsername");
            window.location.replace("login.html");
            return;
        }

        if (!response.ok) {
            throw new Error(`Could not load orders (HTTP ${response.status}).`);
        }

        const orders = await response.json();

        const pending = orders.filter(order => order.status === "PENDING");
        const completed = orders.filter(order => order.status === "COMPLETED");

        const today = new Date().toLocaleDateString("en-CA");
        const todayOrders = orders.filter(order => {
            if (!order.createdAt) return false;
            const orderDate = new Date(order.createdAt);

            return !Number.isNaN(orderDate.getTime()) &&
                orderDate.toLocaleDateString("en-CA") === today;
        });

        document.getElementById("totalOrders").textContent = orders.length;
        document.getElementById("pendingOrders").textContent = pending.length;
        document.getElementById("completedOrders").textContent = completed.length;
        document.getElementById("todayOrders").textContent = todayOrders.length;

        const recentOrders = [...orders]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        tableBody.replaceChildren();

        if (recentOrders.length === 0) {
            tableBody.innerHTML =
                '<tr><td colspan="5">No orders have been placed yet.</td></tr>';
        } else {
            recentOrders.forEach(order => {
                const row = document.createElement("tr");

                [
                    `#${order.id}`,
                    order.studentName || "Student",
                    order.pickupTime || "—",
                    `₹${Number(order.totalAmount || 0).toFixed(2)}`,
                    order.status || "UNKNOWN"
                ].forEach(value => {
                    const cell = document.createElement("td");
                    cell.textContent = value;
                    row.appendChild(cell);
                });

                tableBody.appendChild(row);
            });
        }

        message.textContent = "Dashboard data loaded successfully.";

    } catch (error) {
        message.textContent = "Unable to load dashboard data. " + error.message;
        tableBody.innerHTML =
            '<tr><td colspan="5">Unable to load orders.</td></tr>';
        console.error("Dashboard loading error:", error);
    }
}

loadDashboard();
