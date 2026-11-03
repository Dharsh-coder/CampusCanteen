// ================= CART =================

// Get existing cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];


// ================= ADD TO CART =================


const foodContainer = document.getElementById("food-container");

function addToCart(food) {
    const existingItem = cart.find(function(item) {
        return Number(item.id) === Number(food.id);
    });

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
    showNotification(food.name + " added to cart!");
}

async function loadMenuFromBackend() {
    if (!foodContainer) return;

    const loadingMessage = document.getElementById("menu-loading");

    try {
        const response = await fetch("http://localhost:8080/api/menu");

        if (!response.ok) {
            throw new Error("Could not load menu (HTTP " + response.status + ").");
        }

        const foods = await response.json();
        foodContainer.replaceChildren();

        if (!Array.isArray(foods) || foods.length === 0) {
            foodContainer.textContent = "No food items are currently available.";
            return;
        }

        foods.forEach(function(food) {
            const card = document.createElement("div");
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
            price.textContent = "₹" + Number(food.price).toFixed(2);

            const button = document.createElement("button");
            button.className = "add-btn";
            button.textContent = "Add to Cart";
            button.addEventListener("click", function() {
                addToCart(food);
            });

            card.append(image, name, description, price, button);
            foodContainer.appendChild(card);
        });

        applyCategoryFilter("All");

    } catch (error) {
        console.error("Menu loading error:", error);

        foodContainer.textContent =
            "Unable to load the menu. Please check that the canteen server is running and try again.";
    }
}

if (foodContainer) {
    loadMenuFromBackend();
}


// ================= DISPLAY CART =================

const cartItems = document.getElementById("cart-items");

if (cartItems) {

    displayCart();

}


function displayCart() {

    cartItems.innerHTML = "";

    let totalItems = 0;
    let totalPrice = 0;


    // Empty cart
    if (cart.length === 0) {

    cartItems.innerHTML = `
        <p style="text-align:center;">
            Your cart is empty 🛒<br>
            To place an order, please select food items from the menu!
        </p>
    `;

}


    // Display each item
    cart.forEach(function(item, index) {

        totalItems += item.quantity;

        totalPrice += item.price * item.quantity;


        const cartItem = document.createElement("div");

        cartItem.className = "cart-item";

        cartItem.innerHTML = `

            <div>

                <h3>${item.name}</h3>

                <p>₹${item.price} × ${item.quantity}</p>

            </div>


            <div class="quantity-controls">

                <button onclick="decreaseQuantity(${index})">
                    −
                </button>

                <span>${item.quantity}</span>

                <button onclick="increaseQuantity(${index})">
                    +
                </button>

                <button onclick="removeItem(${index})">
                    🗑️
                </button>

            </div>

        `;


        cartItems.appendChild(cartItem);

    });


    // Update summary

    document.getElementById("total-items").textContent = totalItems;

    document.getElementById("total-price").textContent = totalPrice;

    const placeOrderButton = document.getElementById("place-order-btn");

    if (placeOrderButton) {
    placeOrderButton.disabled = cart.length === 0;
    }

}


// ================= INCREASE QUANTITY =================

function increaseQuantity(index) {

    cart[index].quantity++;

    saveCart();

}


// ================= DECREASE QUANTITY =================

function decreaseQuantity(index) {

    if (cart[index].quantity > 1) {

        cart[index].quantity--;

    } else {

        cart.splice(index, 1);

    }

    saveCart();

}


// ================= REMOVE ITEM =================

function removeItem(index) {

    cart.splice(index, 1);

    saveCart();

}


// ================= SAVE CART =================

function saveCart() {

    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();

}

 // ================= CATEGORY FILTER =================


const categoryButtons = document.querySelectorAll(".categories button");

function applyCategoryFilter(selectedCategory) {
    const foodCards = document.querySelectorAll(
        "#food-container .food-card"
    );

    foodCards.forEach(function(card) {
        const foodCategory = card.dataset.category;

        card.style.display =
            selectedCategory === "All" ||
            selectedCategory === foodCategory
                ? ""
                : "none";
    });

    categoryButtons.forEach(function(button) {
        button.classList.toggle(
            "active",
            button.textContent.trim() === selectedCategory
        );
    });
}

categoryButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        applyCategoryFilter(button.textContent.trim());
    });
});


// ================= PLACE ORDER =================

const orderButton = document.getElementById("place-order-btn");

if (orderButton) {

    orderButton.addEventListener("click", function() {

        if (cart.length > 0) {
            window.location.href = "checkout.html";
        } else {
            alert("Your cart is empty! Please select food items from the menu.");
        }

    });

}

function showNotification(message) {
    let notification = document.getElementById("cart-notification");

    if (!notification) {
        notification = document.createElement("div");
        notification.id = "cart-notification";

        notification.style.position = "fixed";
        notification.style.top = "20px";
        notification.style.right = "20px";
        notification.style.background = "#28a745";
        notification.style.color = "white";
        notification.style.padding = "14px 22px";
        notification.style.borderRadius = "8px";
        notification.style.zIndex = "9999";
        notification.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";

        document.body.appendChild(notification);
    }

    notification.textContent = "✓ " + message;
    notification.style.display = "block";

    clearTimeout(notification.timer);

    notification.timer = setTimeout(function() {
        notification.style.display = "none";
    }, 1000);
}