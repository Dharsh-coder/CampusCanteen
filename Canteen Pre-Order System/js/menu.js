
const MENU_API_URL = "http://localhost:8080/api/menu";

let availableFoods = [];

async function loadMenuFromBackend() {
    const foodContainer = document.getElementById("food-container");

    if (!foodContainer) return;

    foodContainer.textContent = "Loading today's menu...";

    try {
        const response = await fetch(MENU_API_URL);

        if (!response.ok) {
            throw new Error(`Menu request failed: ${response.status}`);
        }

        availableFoods = await response.json();

        // Remove cart items that are no longer available.
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        const availableIds = new Set(
            availableFoods.map(food => Number(food.id))
        );

        const updatedCart = cart.filter(item =>
            availableIds.has(Number(item.id))
        );

        localStorage.setItem("cart", JSON.stringify(updatedCart));

        // Build menu cards using database data.
        foodContainer.replaceChildren();

        if (availableFoods.length === 0) {
            foodContainer.textContent =
                "No food items are currently available.";
            return;
        }

        availableFoods.forEach(food => {
            const card = document.createElement("article");
            card.className = "food-card";
            card.dataset.category = food.category || "Other";

            const image = document.createElement("div");
            image.className = "food-image";
            image.textContent = "🍽️";

            const name = document.createElement("h2");
            name.textContent = food.name;

            const description = document.createElement("p");
            description.textContent = food.description || "";

            const price = document.createElement("h3");
            price.textContent = `₹${Number(food.price).toFixed(2)}`;

            const button = document.createElement("button");
            button.className = "add-btn";
            button.textContent = "Add to Cart";

            button.addEventListener("click", function() {
                addFoodToCart(food);
            });

            card.append(image, name, description, price, button);
            foodContainer.appendChild(card);
        });

        applyCategoryFilter("All");

    } catch (error) {
        console.error("Menu loading error:", error);

        foodContainer.textContent =
            "Unable to load the menu. Please check the server and refresh.";
    }
}

function addFoodToCart(food) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingItem = cart.find(item =>
        Number(item.id) === Number(food.id)
    );

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: food.id,
            name: food.name,
            price: Number(food.price),
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    showMenuNotification(`${food.name} added to cart!`);
}

function applyCategoryFilter(category) {
    document.querySelectorAll("#food-container .food-card")
        .forEach(card => {
            card.style.display =
                category === "All" || card.dataset.category === category
                    ? ""
                    : "none";
        });

    document.querySelectorAll(".categories button")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.textContent.trim() === category
            );
        });
}

function showMenuNotification(message) {
    let notification = document.getElementById("cart-notification");

    if (!notification) {
        notification = document.createElement("div");
        notification.id = "cart-notification";

        Object.assign(notification.style, {
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#28a745",
            color: "white",
            padding: "14px 22px",
            borderRadius: "8px",
            zIndex: "9999",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
        });

        document.body.appendChild(notification);
    }

    notification.textContent = `✓ ${message}`;
    notification.style.display = "block";

    clearTimeout(notification.timer);

    notification.timer = setTimeout(() => {
        notification.style.display = "none";
    }, 1500);
}

document.querySelectorAll(".categories button")
    .forEach(button => {
        button.addEventListener("click", () => {
            applyCategoryFilter(button.textContent.trim());
        });
    });

if (document.getElementById("food-container")) {
    loadMenuFromBackend();
}
