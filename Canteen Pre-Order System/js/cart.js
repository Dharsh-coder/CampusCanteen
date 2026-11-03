
const CART_API_URL = "http://localhost:8080/api";

// Load the cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

// Save the cart to localStorage
function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Display cart items and calculate totals
function displayCart() {
    const cart = getCart();
    const cartContainer = document.getElementById("cart-items");
    const totalItemsElement = document.getElementById("total-items");
    const totalPriceElement = document.getElementById("total-price");
    const placeOrderButton = document.getElementById("place-order-btn");

    if (!cartContainer) return;

    cartContainer.replaceChildren();

    let totalItems = 0;
    let totalPrice = 0;

    if (cart.length === 0) {
        const message = document.createElement("p");
        message.textContent = "Your cart is empty. Please add some food!";
        cartContainer.appendChild(message);

        if (placeOrderButton) placeOrderButton.disabled = true;
    } else {
        cart.forEach((item, index) => {
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;

            totalItems += quantity;
            totalPrice += price * quantity;

            const itemCard = document.createElement("div");
            itemCard.className = "cart-item";

            const details = document.createElement("div");
            details.className = "cart-item-details";

            const name = document.createElement("h3");
            name.textContent = item.name;

            const priceText = document.createElement("p");
            priceText.textContent = `₹${price.toFixed(2)} each`;

            const subtotal = document.createElement("p");
            subtotal.textContent = `Subtotal: ₹${(price * quantity).toFixed(2)}`;

            details.append(name, priceText, subtotal);

            const controls = document.createElement("div");
            controls.className = "quantity-controls";

            const decreaseButton = document.createElement("button");
            decreaseButton.type = "button";
            decreaseButton.textContent = "−";
            decreaseButton.dataset.action = "decrease";
            decreaseButton.dataset.index = index;
            decreaseButton.setAttribute("aria-label", `Decrease ${item.name}`);

            const quantityText = document.createElement("span");
            quantityText.textContent = quantity;

            const increaseButton = document.createElement("button");
            increaseButton.type = "button";
            increaseButton.textContent = "+";
            increaseButton.dataset.action = "increase";
            increaseButton.dataset.index = index;
            increaseButton.setAttribute("aria-label", `Increase ${item.name}`);

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.textContent = "Remove";
            removeButton.dataset.action = "remove";
            removeButton.dataset.index = index;

            controls.append(
                decreaseButton,
                quantityText,
                increaseButton,
                removeButton
            );

            itemCard.append(details, controls);
            cartContainer.appendChild(itemCard);
        });

        if (placeOrderButton) placeOrderButton.disabled = false;
    }

    if (totalItemsElement) {
        totalItemsElement.textContent = totalItems;
    }

    if (totalPriceElement) {
        totalPriceElement.textContent = `₹${totalPrice.toFixed(2)}`;
    }
}

// Handle quantity and remove buttons
document.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const index = Number(button.dataset.index);
    const action = button.dataset.action;
    const cart = getCart();

    if (!Number.isInteger(index) || !cart[index]) return;

    if (action === "increase") {
        if (cart[index].quantity < 100) {
            cart[index].quantity++;
        }
    } else if (action === "decrease") {
        cart[index].quantity--;

        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
    } else if (action === "remove") {
        cart.splice(index, 1);
    } else {
        return;
    }

    saveCart(cart);
    displayCart();
});

// Continue to checkout
document.addEventListener("DOMContentLoaded", function () {
    const placeOrderButton = document.getElementById("place-order-btn");

    if (placeOrderButton) {
        placeOrderButton.addEventListener("click", function () {
            const cart = getCart();

            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            window.location.href = "checkout.html";
        });
    }

    displayCart();
});
