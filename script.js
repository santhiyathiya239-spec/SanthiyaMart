/* =================================================
   SHESUMA GROCERY MART
   JAVASCRIPT - PART 1
================================================= */

/* ================= PRODUCTS ================= */

let products = [
    {
        id: 1,
        name: "Fresh Tomato",
        category: "Vegetables",
        price: 40,
        unit: "1 kg",
        stock: 30,
        emoji: "🍅"
    },
    {
        id: 2,
        name: "Potato",
        category: "Vegetables",
        price: 35,
        unit: "1 kg",
        stock: 25,
        emoji: "🥔"
    },
    {
        id: 3,
        name: "Carrot",
        category: "Vegetables",
        price: 60,
        unit: "1 kg",
        stock: 20,
        emoji: "🥕"
    },
    {
        id: 4,
        name: "Broccoli",
        category: "Vegetables",
        price: 80,
        unit: "500 g",
        stock: 15,
        emoji: "🥦"
    },
    {
        id: 5,
        name: "Fresh Apple",
        category: "Fruits",
        price: 120,
        unit: "1 kg",
        stock: 20,
        emoji: "🍎"
    },
    {
        id: 6,
        name: "Banana",
        category: "Fruits",
        price: 50,
        unit: "1 dozen",
        stock: 25,
        emoji: "🍌"
    },
    {
        id: 7,
        name: "Orange",
        category: "Fruits",
        price: 90,
        unit: "1 kg",
        stock: 18,
        emoji: "🍊"
    },
    {
        id: 8,
        name: "Mango",
        category: "Fruits",
        price: 100,
        unit: "1 kg",
        stock: 12,
        emoji: "🥭"
    },
    {
        id: 9,
        name: "Milk",
        category: "Dairy",
        price: 55,
        unit: "1 litre",
        stock: 15,
        emoji: "🥛"
    },
    {
        id: 10,
        name: "Curd",
        category: "Dairy",
        price: 40,
        unit: "500 g",
        stock: 20,
        emoji: "🥣"
    },
    {
        id: 11,
        name: "Butter",
        category: "Dairy",
        price: 65,
        unit: "100 g",
        stock: 10,
        emoji: "🧈"
    },
    {
        id: 12,
        name: "Cheese",
        category: "Dairy",
        price: 110,
        unit: "200 g",
        stock: 10,
        emoji: "🧀"
    },
    {
        id: 13,
        name: "Onion",
        category: "Vegetables",
        price: 45,
        unit: "1 kg",
        stock: 30,
        emoji: "🧅"
    },
    {
        id: 14,
        name: "Cucumber",
        category: "Vegetables",
        price: 35,
        unit: "1 kg",
        stock: 20,
        emoji: "🥒"
    },
    {
        id: 15,
        name: "Grapes",
        category: "Fruits",
        price: 90,
        unit: "500 g",
        stock: 15,
        emoji: "🍇"
    },
    {
        id: 16,
        name: "Watermelon",
        category: "Fruits",
        price: 80,
        unit: "1 piece",
        stock: 10,
        emoji: "🍉"
    },
    {
        id: 17,
        name: "Paneer",
        category: "Dairy",
        price: 120,
        unit: "200 g",
        stock: 12,
        emoji: "🧀"
    },
    {
        id: 18,
        name: "Eggs",
        category: "Dairy",
        price: 90,
        unit: "12 pieces",
        stock: 20,
        emoji: "🥚"
    },
    {
        id: 19,
        name: "Spinach",
        category: "Vegetables",
        price: 30,
        unit: "1 bunch",
        stock: 15,
        emoji: "🥬"
    },
    {
        id: 20,
        name: "Pineapple",
        category: "Fruits",
        price: 70,
        unit: "1 piece",
        stock: 10,
        emoji: "🍍"
    }
];


/* ================= CART ================= */

let cart = [];


/* ================= ORDERS ================= */

let orders = [];


/* ================= FAVOURITES ================= */

let favourites = [];


/* ================= CATEGORY ================= */

let currentCategory = "All";


/* ================= REVIEWS ================= */

let reviews = JSON.parse(
    localStorage.getItem("shesumaReviews") || "{}"
);
/* ================= PAGE FUNCTIONS ================= */

function hideAllPages() {

    document.querySelectorAll(".page").forEach(page => {
        page.style.display = "none";
    });

    const home = document.getElementById("home");

    if (home) {
        home.style.display = "none";
    }
}


function showHome() {

    hideAllPages();

    const home = document.getElementById("home");

    if (home) {
        home.style.display = "block";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function showProducts(category = "All") {

    currentCategory = category;

    hideAllPages();

    const productsPage =
        document.getElementById("products");

    if (productsPage) {
        productsPage.style.display = "block";
    }

    displayProducts();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function showCart() {

    hideAllPages();

    const cartPage =
        document.getElementById("cart");

    if (cartPage) {
        cartPage.style.display = "block";
    }

    displayCart();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function showOrders() {

    hideAllPages();

    const ordersPage =
        document.getElementById("orders");

    if (ordersPage) {
        ordersPage.style.display = "block";
    }

    displayOrders();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ================= DISPLAY PRODUCTS ================= */

function displayProducts(list = products) {

    const container =
        document.getElementById("productList");

    if (!container) return;

    let filteredProducts = list;

    if (currentCategory !== "All") {

        filteredProducts = list.filter(
            product =>
                product.category === currentCategory
        );
    }

    if (filteredProducts.length === 0) {

        container.innerHTML = `
            <p style="text-align:center;">
                No products found.
            </p>
        `;

        return;
    }

    container.innerHTML =
        filteredProducts.map(product => {

        const productReviews =
            reviews[product.id] || [];

        let averageRating = 0;

        if (productReviews.length > 0) {

            const total =
                productReviews.reduce(
                    (sum, review) =>
                        sum + review.rating,
                    0
                );

            averageRating =
                (
                    total /
                    productReviews.length
                ).toFixed(1);
        }

        return `
            <div class="product-card">

                <div class="product-image">
                    ${product.emoji}
                </div>

                <h3>${product.name}</h3>

                <p>${product.unit}</p>

                <h4>₹${product.price}</h4>

                <p>
                    Stock: ${product.stock}
                </p>

                ${
                    productReviews.length > 0
                    ?
                    `<p>
                        ⭐ ${averageRating}
                        (${productReviews.length} reviews)
                    </p>`
                    :
                    `<p>
                        ⭐ No reviews yet
                    </p>`
                }

                <button
                    onclick="addToCart(${product.id})">
                    🛒 Add to Cart
                </button>

                <button
                    onclick="toggleFavourite(${product.id})">
                    ${
                        favourites.includes(product.id)
                        ? "❤️"
                        : "♡"
                    }
                </button>

                <button
                    onclick="writeReview(${product.id})">
                    ⭐ Write a Review
                </button>

                ${
                    productReviews.length > 0
                    ?
                    `<button
                        onclick="viewReviews(${product.id})">
                        💬 View Reviews
                    </button>`
                    :
                    ""
                }

            </div>
        `;

    }).join("");
}
function submitReview(productId) {

    const name =
        document.getElementById("reviewName").value.trim();

    const rating =
        Number(
            document.getElementById("reviewRating").value
        );

    const comment =
        document.getElementById("reviewComment").value.trim();

    if (!name) {
        alert("Please enter your name.");
        return;
    }

    if (!rating) {
        alert("Please select a rating.");
        return;
    }

    if (!comment) {
        alert("Please write your review.");
        return;
    }

    if (!reviews[productId]) {
        reviews[productId] = [];
    }

    reviews[productId].push({
        name: name,
        rating: rating,
        comment: comment,
        date: new Date().toLocaleDateString()
    });

    localStorage.setItem(
        "shesumaReviews",
        JSON.stringify(reviews)
    );

    closeReview();

    alert("Review added successfully! ⭐");

    displayProducts();
}


function closeReview() {

    const box =
        document.getElementById("reviewBox");

    if (box) {
        box.remove();
    }
}

/* ================= ADD TO CART ================= */

function addToCart(productId) {

    const product = products.find(
        item => item.id === productId
    );

    if (!product) return;

    if (product.stock <= 0) {

        alert(
            "Sorry! This product is out of stock."
        );

        return;
    }

    const existingItem = cart.find(
        item => item.id === productId
    );

    if (existingItem) {

        if (
            existingItem.quantity >=
            product.stock
        ) {

            alert("No more stock available.");

            return;
        }

        existingItem.quantity++;

    } else {

        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            emoji: product.emoji,
            quantity: 1
        });
    }

    updateCartCount();
    displayCart();

    alert(
        `${product.name} added to cart 🛒`
    );
}


/* ================= CART COUNT ================= */

function updateCartCount() {

    const count = cart.reduce(
        (total, item) =>
            total + item.quantity,
        0
    );

    const cartCount =
        document.getElementById("cartCount");

    if (cartCount) {
        cartCount.innerText = count;
    }
}
/* ================= DISPLAY CART ================= */

function displayCart() {

    const container =
        document.getElementById("cartList");

    if (!container) return;

    if (cart.length === 0) {

        container.innerHTML = `
            <p>Your cart is empty 🛒</p>
        `;

        return;
    }

    container.innerHTML =
        cart.map(item => {

        const total =
            item.price * item.quantity;

        return `
            <div class="cart-item">

                <span>
                    ${item.emoji}
                    ${item.name}
                </span>

                <span>
                    ₹${item.price}
                </span>

                <button
                    onclick="changeQuantity(${item.id}, -1)">
                    −
                </button>

                <span>
                    ${item.quantity}
                </span>

                <button
                    onclick="changeQuantity(${item.id}, 1)">
                    +
                </button>

                <span>
                    ₹${total}
                </span>

                <button
                    onclick="removeFromCart(${item.id})">
                    ❌
                </button>

            </div>
        `;

    }).join("");

    const grandTotal =
        cart.reduce(
            (total, item) =>
                total +
                item.price * item.quantity,
            0
        );

    container.innerHTML += `
        <div class="cart-total">

            <h3>
                Total: ₹${grandTotal}
            </h3>

            <button onclick="checkout()">
                Proceed to Checkout
            </button>

        </div>
    `;
}


/* ================= CHANGE QUANTITY ================= */

function changeQuantity(productId, change) {

    const item = cart.find(
        item => item.id === productId
    );

    const product = products.find(
        product => product.id === productId
    );

    if (!item || !product) return;

    if (change === 1) {

        if (item.quantity >= product.stock) {

            alert("No more stock available.");

            return;
        }

        item.quantity++;

    } else {

        item.quantity--;

        if (item.quantity <= 0) {

            removeFromCart(productId);

            return;
        }
    }

    updateCartCount();
    displayCart();
}


/* ================= REMOVE FROM CART ================= */

function removeFromCart(productId) {

    cart = cart.filter(
        item => item.id !== productId
    );

    updateCartCount();
    displayCart();
}


/* ================= FAVOURITE ================= */

function toggleFavourite(productId) {

    if (favourites.includes(productId)) {

        favourites =
            favourites.filter(
                id => id !== productId
            );

    } else {

        favourites.push(productId);
    }

    displayProducts();
}


/* ================= SEARCH ================= */

function searchProducts() {

    const searchInput =
        document.getElementById("search");

    if (!searchInput) return;

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();

    const filtered =
        products.filter(product =>
            product.name
                .toLowerCase()
                .includes(searchText) ||

            product.category
                .toLowerCase()
                .includes(searchText)
        );

    displayProducts(filtered);
}


/* ================= WRITE REVIEW ================= */

        function writeReview(productId) {

    const product = products.find(
        item => item.id === productId
    );

    if (!product) return;

    const oldBox = document.getElementById("reviewBox");

    if (oldBox) {
        oldBox.remove();
    }

    const box = document.createElement("div");

    box.id = "reviewBox";

    box.innerHTML = `
        <div style="
            position:fixed;
            top:0;
            left:0;
            width:100%;
            height:100%;
            background:rgba(0,0,0,0.65);
            display:flex;
            align-items:center;
            justify-content:center;
            z-index:999999;
        ">

            <div style="
                background:#ffffff;
                width:350px;
                max-width:90%;
                padding:25px;
                border-radius:18px;
                box-shadow:0 10px 40px rgba(0,0,0,0.4);
                text-align:center;
            ">

                <h2>⭐ Write a Review</h2>

                <h3>${product.emoji} ${product.name}</h3>

                <input
                    id="reviewName"
                    type="text"
                    placeholder="Your name"
                    style="
                        width:100%;
                        padding:12px;
                        margin:8px 0;
                        box-sizing:border-box;
                    "
                >

                <select
                    id="reviewRating"
                    style="
                        width:100%;
                        padding:12px;
                        margin:8px 0;
                    "
                >
                    <option value="">Select Rating</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                    <option value="3">⭐⭐⭐ 3 Stars</option>
                    <option value="2">⭐⭐ 2 Stars</option>
                    <option value="1">⭐ 1 Star</option>
                </select>

                <textarea
                    id="reviewComment"
                    rows="4"
                    placeholder="Write your review..."
                    style="
                        width:100%;
                        padding:12px;
                        margin:8px 0;
                        box-sizing:border-box;
                    "
                ></textarea>

                <button
                    onclick="submitReview(${productId})"
                    style="
                        padding:12px 18px;
                        margin:5px;
                        cursor:pointer;
                    "
                >
                    Submit Review ⭐
                </button>

                <button
                    onclick="closeReview()"
                    style="
                        padding:12px 18px;
                        margin:5px;
                        cursor:pointer;
                    "
                >
                    Cancel
                </button>

            </div>
        </div>
    `;

    document.body.appendChild(box);
}
/* ================= VIEW REVIEWS ================= */

function viewReviews(productId) {

    const product = products.find(
        item => item.id === productId
    );

    if (!product) return;

    const productReviews =
        reviews[productId] || [];

    if (productReviews.length === 0) {

        alert(
            `No reviews yet for ${product.name}.`
        );

        return;
    }

    let message =
        `⭐ Reviews for ${product.name}\n\n`;

    productReviews.forEach(
        (review, index) => {

        message +=
            `${index + 1}. ${review.name}\n`;

        message +=
            `Rating: ${
                "⭐".repeat(review.rating)
            }\n`;

        message +=
            `${review.comment}\n`;

        message +=
            `Date: ${review.date}\n\n`;
    });

    alert(message);
}


/* ================= CHECKOUT ================= */

function checkout() {

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;
    }

    hideAllPages();

    const checkoutPage =
        document.getElementById("checkout");

    if (checkoutPage) {
        checkoutPage.style.display = "block";
    }

    updateCheckoutSummary();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ================= CHECKOUT SUMMARY ================= */

function updateCheckoutSummary() {

    const checkoutList =
        document.getElementById(
            "checkoutList"
        );

    const subtotalElement =
        document.getElementById(
            "subtotal"
        );

    const deliveryElement =
        document.getElementById(
            "delivery"
        );

    const totalElement =
        document.getElementById(
            "total"
        );

    const checkoutTotal =
        document.getElementById(
            "checkoutTotal"
        );

    if (cart.length === 0) return;

    const subtotal =
        cart.reduce(
            (sum, item) =>
                sum +
                item.price * item.quantity,
            0
        );

    const delivery = 30;

    const total =
        subtotal + delivery;

    if (checkoutList) {

        checkoutList.innerHTML =
            cart.map(item => `
                <p>
                    ${item.emoji}
                    ${item.name}
                    × ${item.quantity}
                    = ₹${
                        item.price *
                        item.quantity
                    }
                </p>
            `).join("");
    }

    if (subtotalElement) {
        subtotalElement.innerText =
            `₹${subtotal}`;
    }

    if (deliveryElement) {
        deliveryElement.innerText =
            `₹${delivery}`;
    }

    if (totalElement) {
        totalElement.innerText =
            `₹${total}`;
    }

    if (checkoutTotal) {
        checkoutTotal.innerText =
            `₹${total}`;
    }
}
/* ================= PLACE ORDER ================= */

function placeOrder(event) {

    if (event) {
        event.preventDefault();
    }

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;
    }

    const name =
        document.getElementById("customerName")?.value.trim();

    const address =
        document.getElementById("address")?.value.trim();

    const phone =
        document.getElementById("phone")?.value.trim();

    const payment =
        document.getElementById("payment")?.value;

    if (!name || !address || !phone || !payment) {

        alert("Please fill all checkout details.");

        return;
    }

    const orderItems = cart.map(item => ({
        ...item
    }));

    orderItems.forEach(item => {

        const product = products.find(
            product => product.id === item.id
        );

        if (product) {
            product.stock -= item.quantity;
        }
    });

    const subtotal =
        orderItems.reduce(
            (sum, item) =>
                sum +
                item.price * item.quantity,
            0
        );

    const delivery = 30;

    const total =
        subtotal + delivery;

    const order = {

        id: Date.now(),

        customerName: name,

        address: address,

        phone: phone,

        payment: payment,

        items: orderItems,

        total: total,

        date:
            new Date().toLocaleDateString(),

        status: "Placed"
    };

    orders.push(order);
    localStorage.setItem("shesumaOrders",
     JSON.stringify(orders));
    cart = [];

    updateCartCount();

    displayCart();

    displayProducts();

    displayOrders();

    alert(
        `Order placed successfully! 🎉\n\nOrder ID: ${order.id}`
    );

    showOrders();
}


/* ================= DISPLAY ORDERS ================= */

function displayOrders() {

    const container =
        document.getElementById(
            "ordersList"
        );

    if (!container) return;

    if (orders.length === 0) {

        container.innerHTML = `
            <p>No orders yet.</p>
        `;

        return;
    }

    container.innerHTML =
        orders.map(order => {

        const items =
            order.items.map(item =>
                `${item.name} × ${item.quantity}`
            ).join(", ");

        return `
            <div class="order-card">

                <h3>
                    Order #${order.id}
                </h3>

                <p>
                    ${items}
                </p>

                <p>
                    Total: ₹${order.total}
                </p>

                <p>
                    Date: ${order.date}
                </p>

                <p>
                    Status: ${order.status}
                </p>

            </div>
        `;

    }).join("");
}


/* ================= CATEGORY ================= */

function filterCategory(category) {

    currentCategory = category;

    displayProducts();
}


/* ================= CLEAR SEARCH ================= */

function clearSearch() {

    const searchInput =
        document.getElementById("search");

    if (searchInput) {
        searchInput.value = "";
    }

    currentCategory = "All";

    displayProducts();
}


/* ================= PRODUCT DETAILS ================= */

function viewProduct(productId) {

    const product = products.find(
        item => item.id === productId
    );

    if (!product) return;

    const productReviews =
        reviews[productId] || [];

    let ratingText =
        "No reviews yet";

    if (productReviews.length > 0) {

        const total =
            productReviews.reduce(
                (sum, review) =>
                    sum + review.rating,
                0
            );

        const average =
            (
                total /
                productReviews.length
            ).toFixed(1);

        ratingText =
            `⭐ ${average} (${productReviews.length} reviews)`;
    }

    alert(
        `${product.emoji} ${product.name}\n\n` +
        `Category: ${product.category}\n` +
        `Price: ₹${product.price}\n` +
        `Unit: ${product.unit}\n` +
        `Stock: ${product.stock}\n` +
        `${ratingText}`
    );
}


/* ================= LOGOUT ================= */

function logout() {

    localStorage.removeItem(
        "selectedRole"
    );

    window.location.href =
        "role.html";
}


/* ================= INITIAL LOAD ================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        displayProducts();

        displayCart();

        displayOrders();

        updateCartCount();

    }
);


/* ================= PAGE LOAD ================= */

window.addEventListener(
    "load",
    function () {

        displayProducts();

        displayCart();

        displayOrders();

        updateCartCount();

    }
);