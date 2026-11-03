window.CANTEEN_API_BASE_URL = "http://localhost:8080/api";

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const message = document.getElementById("loginMessage");
        const button = document.getElementById("loginButton");

        message.textContent = "";
        button.disabled = true;
        button.textContent = "Signing in...";

        try {
            const credentials = btoa(`${username}:${password}`);

            // Verify the credentials against a protected staff API.
            const response = await fetch(`${window.CANTEEN_API_BASE_URL}/orders`, {
                headers: {
                    "Authorization": `Basic ${credentials}`,
                    "Accept": "application/json"
                }
            });

            if (response.status === 401 || response.status === 403) {
                throw new Error("Invalid staff username or password.");
            }

            if (!response.ok) {
                throw new Error(`Login check failed (HTTP ${response.status}).`);
            }

            // Local-demo approach; this is not a production login system.
            sessionStorage.setItem("staffAuth", credentials);
            sessionStorage.setItem("staffUsername", username);

            window.location.href = "dashboard.html";

        } catch (error) {
            message.textContent =
                error instanceof TypeError
                    ? "Cannot connect to the server. Check that Spring Boot is running."
                    : error.message;
        } finally {
            button.disabled = false;
            button.textContent = "Sign In";
        }
    });
}

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        sessionStorage.removeItem("staffAuth");
        sessionStorage.removeItem("staffUsername");
        window.location.href = "../Canteen%20Pre-Order%20System/index.html";
    });
}
