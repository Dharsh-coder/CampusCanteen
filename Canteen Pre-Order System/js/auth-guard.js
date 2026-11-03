
(() => {
    const API_BASE_URL = "http://localhost:8080/api";

    // Prevent protected page content from appearing before verification.
    document.documentElement.style.visibility = "hidden";

    async function verifyStudentSession() {
        try {
            const response = await fetch(
                `${API_BASE_URL}/student/auth/me`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            if (!response.ok) {
                redirectToLogin();
                return;
            }

            const student = await response.json();

            // Store display information only; the backend session
            // remains the source of authentication.
            sessionStorage.setItem(
                "studentProfile",
                JSON.stringify({
                    id: student.id,
                    studentName: student.studentName,
                    rollNumber: student.rollNumber,
                    email: student.email
                })
            );

            // Reveal the page only after the server confirms the session.
            document.documentElement.style.visibility = "visible";

        } catch (error) {
            console.error("Student session verification failed:", error);

            // Fail closed if authentication cannot be verified.
            redirectToLogin();
        }
    }

    function redirectToLogin() {
        sessionStorage.removeItem("studentProfile");

        const currentPage =
            window.location.pathname.split("/").pop();

        window.location.replace(
            `login.html?returnTo=${encodeURIComponent(currentPage)}`
        );
    }

    verifyStudentSession();
})();
