
document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.getElementById("student-logout-btn");

    if (!logoutButton) return;

    logoutButton.addEventListener("click", async function () {
        if (logoutButton.disabled) return;

        logoutButton.disabled = true;
        logoutButton.textContent = "Logging out...";

        try {
            const response = await fetch(
                "http://localhost:8080/api/student/auth/logout",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Logout failed. Please try again.");
            }

            sessionStorage.removeItem("studentProfile");
            localStorage.removeItem("cart");

            window.location.replace("login.html");

        } catch (error) {
            console.error("Student logout error:", error);

            alert(
                "Unable to log out because the server could not confirm logout. Please check the backend and try again."
            );

            logoutButton.disabled = false;
            logoutButton.textContent = "Logout";
        }
    });
});
