// BIGSALE Fashion Website JavaScript
document.addEventListener("DOMContentLoaded", function () {
    // Mobile Menu
    const menuButton = document.querySelector(".menu-btn");
    const navigation = document.querySelector("nav");
    if (menuButton && navigation) {
        menuButton.addEventListener("click", function () {
            navigation.classList.toggle("active");
        });
    }
    // Shopping Cart
    let cart = JSON.parse(localStorage.getItem("bigsale_cart")) || [];
    function updateCart() {
        const cartCount = document.querySelector(".cart-count");
        if (cartCount) {
            cartCount.textContent = cart.reduce(
                (total, item) => total + item.quantity, 0
            );
        }
        localStorage.setItem("bigsale_cart", JSON.stringify(cart));
    }
    // Add to Cart
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", function () {
            const product = this.closest(".product");
            if (!product) return;
            const name = product.querySelector("h3")?.textContent;
            const priceText = product.querySelector(".price")?.textContent;
            const price = Number(priceText?.replace(/[^0-9.]/g, ""));
            if (!name || !Number.isFinite(price)) return;
            const existing = cart.find(item => item.name === name);
            if (existing) {
                existing.quantity++;
            } else {
                cart.push({
                    name: name,
                    price: price,
                    quantity: 1
                });
            }
            updateCart();
            alert(name + " added to your cart!");
        });
    });
    // Search Products
    const searchInput = document.querySelector("#product-search");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const search = this.value.toLowerCase();
            document.querySelectorAll(".product").forEach(product => {
                const name = product.textContent.toLowerCase();
                product.style.display =
                    name.includes(search) ? "" : "none";
            });
        });
    }
    // Newsletter
    const newsletter = document.querySelector("#newsletter-form");
    if (newsletter) {
        newsletter.addEventListener("submit", function (event) {
            event.preventDefault();
            alert("Thank you for subscribing to BIGSALE!");
            newsletter.reset();
        });
    }
    // Initialize Cart
    updateCart();
});