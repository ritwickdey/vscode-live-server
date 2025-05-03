<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8" />

<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

<title>Delivery App</title>

<style>

  /* Reset & base */

  * {

    box-sizing: border-box;

  }

  body, html {

    margin:0;

    padding:0;

    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

    background: #f9fafb;

    color: #222;

    -webkit-font-smoothing: antialiased;

    -moz-osx-font-smoothing: grayscale;

    height: 100vh;

    overflow: hidden;

  }

  #app {

    max-width: 420px;

    margin: 0 auto;

    height: 100vh;

    display: flex;

    flex-direction: column;

    background: white;

    border-left: 1px solid #ddd;

    border-right: 1px solid #ddd;

  }

  header {

    display: flex;

    align-items: center;

    padding: 8px 10px;

    background: #007bff;

    color: white;

  }

  header .back-button {

    background: transparent;

    border: none;

    font-size: 18px;

    font-weight: 600;

    color: white;

    cursor: pointer;

    padding: 6px 10px 6px 0;

    user-select: none;

    visibility: hidden;

  }

  header .back-button.visible {

    visibility: visible;

  }

  header input[type="search"] {

    flex: 1;

    margin-left: 10px;

    padding: 8px 12px;

    font-size: 16px;

    border-radius: 6px;

    border: none;

    outline: none;

  }

  main {

    flex: 1;

    overflow-y: auto;

    padding: 10px 16px 60px; /* bottom padding for footer */

    background: #f9fafb;

  }

  h2.section-title {

    margin: 16px 0 10px 0;

    font-weight: 700;

    font-size: 20px;

    color: #444;

    border-bottom: 2px solid #007bff;

    padding-bottom: 4px;

  }

  /* Categories */

  .categories {

    display: flex;

    flex-wrap: wrap;

    justify-content: center;

    gap: 22px 18px;

    margin-top: 10px;

  }

  .category {

    display: flex;

    flex-direction: column;

    align-items: center;

    width: 90px;

    cursor: pointer;

    color: #444;

    user-select: none;

    transition: color 0.2s ease;

  }

  .category:hover {

    color: #007bff;

  }

  .category img {

    width: 48px;

    height: 48px;

    object-fit: contain;

    margin-bottom: 8px;

  }

  .category p {

    font-size: 14px;

    font-weight: 600;

    text-align: center;

  }

  /* Daily offers bar */

  .daily-offers-bar {

    background: #007bff;

    color: white;

    padding: 12px 16px;

    border-radius: 8px;

    font-weight: 600;

    font-size: 16px;

    margin: 8px 0 14px;

    user-select: none;

  }

  /* Past orders bar */

  .past-orders-bar {

    background: #e9ecef;

    padding: 12px 16px;

    border-radius: 8px;

    font-weight: 600;

    font-size: 16px;

    margin: 18px 0 10px;

    user-select: none;

  }

  .order-list, .orders-in-process-list, .offers-list {

    list-style: none;

    margin: 0;

    padding: 0;

  }

  .order-item, .offer-item, .order-process-item {

    background: white;

    border-radius: 8px;

    box-shadow: 0 1px 4px rgb(0 0 0 / 0.05);

    padding: 10px 14px;

    margin-bottom: 12px;

  }

  .order-item .name, .order-process-item .name, .offer-item .name {

    font-weight: 700;

    font-size: 16px;

    color: #222;

    margin-bottom: 6px;

  }

  .order-item .details, .order-process-item .details, .offer-item .details {

    font-size: 14px;

    color: #555;

  }

  /* Footer navigation */

  footer {

    display: flex;

    justify-content: space-around;

    align-items: center;

    background: white;

    border-top: 1px solid #ddd;

    height: 52px;

    position: fixed;

    bottom: 0;

    left: 50%;

    transform: translateX(-50%);

    width: 100%;

    max-width: 420px;

    user-select: none;

    z-index: 10;

  }

  footer button {

    border: none;

    background: none;

    outline: none;

    color: #777;

    font-weight: 700;

    font-size: 13px;

    cursor: pointer;

    display: flex;

    flex-direction: column;

    align-items: center;

    gap: 2px;

    padding: 4px 0;

    transition: color 0.2s;

  }

  footer button.active, footer button:hover {

    color: #007bff;

  }

  footer button svg {

    width: 22px;

    height: 22px;

    fill: currentColor;

  }

  /* Profile form */

  form.profile-form {

    display: flex;

    flex-direction: column;

    gap: 14px;

    margin-top: 14px;

  }

  form label {

    font-size: 14px;

    font-weight: 600;

    color: #444;

  }

  form input[type="text"],

  form input[type="email"],

  form input[type="tel"],

  form input[type="date"] {

    width: 100%;

    padding: 10px 12px;

    font-size: 14px;

    border-radius: 6px;

    border: 1px solid #cccccc;

    outline: none;

    transition: border-color 0.2s ease;

  }

  form input[type="text"]:focus,

  form input[type="email"]:focus,

  form input[type="tel"]:focus,

  form input[type="date"]:focus {

    border-color: #007bff;

  }

  /* Gender buttons */

  .gender-buttons {

    display: flex;

    gap: 12px;

  }

  .gender-buttons button {

    flex: 1;

    background: #e9ecef;

    border: 1.8px solid transparent;

    padding: 10px 0;

    font-weight: 700;

    font-size: 14px;

    border-radius: 6px;

    cursor: pointer;

    user-select: none;

    transition: all 0.25s ease;

  }

  .gender-buttons button.selected {

    background: #007bff;

    color: white;

    border-color: #0056b3;

  }

  /* Profile action buttons */

  .profile-actions {

    display: flex;

    gap: 12px;

    margin-top: 10px;

  }

  .profile-actions button {

    flex: 1;

    padding: 12px 0;

    background: #007bff;

    border: none;

    color: white;

    font-weight: 700;

    font-size: 16px;

    border-radius: 8px;

    cursor: pointer;

    user-select: none;

    transition: background-color 0.2s ease;

  }

  .profile-actions button.signout {

    background: #dc3545;

  }

  .profile-actions button:hover {

    filter: brightness(0.9);

  }

  /* Scrollbar for main */

  main::-webkit-scrollbar {

    width: 7px;

  }

  main::-webkit-scrollbar-thumb {

    background-color: #ccc;

    border-radius: 6px;

  }

  main::-webkit-scrollbar-track {

    background: transparent;

  }

  /* Responsive fixes for small screen */

  @media (max-width: 380px) {

    .categories {

      gap: 16px 12px;

    }

    .category {

      width: 75px;

    }

    header input[type="search"] {

      font-size: 15px;

    }

    .gender-buttons button, .profile-actions button {

      font-size: 13px;

    }

    footer button {

      font-size: 11px;

    }

  }

</style>

</head>

<body>

<div id="app">

  <header>

    <button class="back-button" id="backButton" onclick="goBack()">&#8592; Back</button>

    <input

      type="search"

      id="searchInput"

      placeholder="Search restaurants, markets, cafes..."

      autocomplete="off"

      aria-label="Search"

      oninput="handleSearchInput()"

    />

  </header>


  <main id="mainContent" tabindex="0">

    <!-- Home Screen -->

    <section id="homeScreen" class="screen">

      <div class="daily-offers-bar" aria-live="polite">🔥 Today's Daily Offers: 10% off at all restaurants! Use code OFFER10</div>


      <div class="categories" role="list" aria-label="Categories">

        <div class="category" role="listitem" tabindex="0" onclick="openCategory('restaurants')" aria-label="Restaurants category">

          <img src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="Restaurants icon" />

          <p>Restaurants</p>

        </div>

        <div class="category" role="listitem" tabindex="0" onclick="openCategory('markets')" aria-label="Markets category">

          <img src="https://cdn-icons-png.flaticon.com/512/3075/3076012.png" alt="Markets icon" />

          <p>Markets</p>

        </div>

        <div class="category" role="listitem" tabindex="0" onclick="openCategory('coffee')" aria-label="Coffee and Sweets category">

          <img src="https://cdn-icons-png.flaticon.com/512/4383/4383672.png" alt="Coffee and Sweets icon" />

          <p>Coffee & Sweets</p>

        </div>

        <div class="category" role="listitem" tabindex="0" onclick="openCategory('pharmacies')" aria-label="Pharmacies category">

          <img src="https://cdn-icons-png.flaticon.com/512/929/929596.png" alt="Pharmacies icon" />

          <p>Pharmacies</p>

        </div>

        <div class="category" role="listitem" tabindex="0" onclick="openCategory('self_pickup')" aria-label="Self Pick-Up category">

          <img src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png" alt="Self Pickup icon" />

          <p>Self Pick-Up</p>

        </div>

        <div class="category" role="listitem" tabindex="0" onclick="openCategory('flowers')" aria-label="Flowers category">

          <img src="https://cdn-icons-png.flaticon.com/512/616/616408.png" alt="Flowers icon" />

          <p>Flowers</p>

        </div>

      </div>


      <div class="past-orders-bar" aria-label="Past orders summary" tabindex="0">You have <strong>0</strong> past orders</div>

    </section>


    <!-- Category Screen -->

    <section id="categoryScreen" class="screen" hidden>

      <h2 class="section-title" id="categoryTitle"></h2>

      <div id="categoryContent">

        <p>Loading content...</p>

      </div>

    </section>


    <!-- Orders Screen -->

    <section id="ordersScreen" class="screen" hidden>

      <h2 class="section-title">Orders in Process</h2>

      <ul class="orders-in-process-list" id="ordersInProcessList" aria-live="polite" aria-relevant="additions"></ul>


      <h2 class="section-title">Past Orders</h2>

      <ul class="order-list" id="pastOrdersList" aria-live="polite" aria-relevant="additions"></ul>

    </section>


    <!-- Offers Screen -->

    <section id="offersScreen" class="screen" hidden>

      <h2 class="section-title">All Offers</h2>

      <ul class="offers-list" id="offersList" aria-live="polite" aria-relevant="additions"></ul>

    </section>


    <!-- Profile Screen -->

    <section id="profileScreen" class="screen" hidden>

      <h2 class="section-title">Profile</h2>

      <form class="profile-form" id="profileForm" novalidate>

        <label for="nameInput">Name</label>

        <input type="text" id="nameInput" placeholder="Your name" required />


        <label for="phoneInput">Phone Number</label>

        <input type="tel" id="phoneInput" placeholder="+1234567890" pattern="^\\+?[0-9\\-\\s]{7,15}$" required />


        <label for="emailInput">Email</label>

        <input type="email" id="emailInput" placeholder="example@email.com" required />


        <label for="dobInput">Date of Birth</label>

        <input type="date" id="dobInput" max="" />


        <label>Gender</label>

        <div class="gender-buttons" role="group" aria-label="Gender selection">

          <button type="button" id="maleBtn" aria-pressed="false">Male</button>

          <button type="button" id="femaleBtn" aria-pressed="false">Female</button>

        </div>


        <div class="profile-actions">

          <button type="button" id="updateProfileBtn">Update</button>

          <button type="button" id="signOutBtn" class="signout">Sign Out</button>

        </div>

      </form>

    </section>

  </main>


  <footer>

    <button id="btnHome" aria-label="Go to Home" aria-pressed="true" class="active" title="Home" onclick="navigateTo('homeScreen')">

      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>

      Home

    </button>

    <button id="btnOrders" aria-label="Go to Orders" aria-pressed="false" title="Orders" onclick="navigateTo('ordersScreen')">

      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14l7-3 7 3V5c0-1.1-.9-2-2-2zm0 11l-5-2-5 2V5h10v9z"/></svg>

      Orders

    </button>

    <button id="btnOffers" aria-label="Go to Offers" aria-pressed="false" title="Offers" onclick="navigateTo('offersScreen')">

      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 6h-8l-2-3H4a2 2 0 0 0-2 2v11a3 3 0 0 0 3 3h12a4 4 0 0 0 4-4v-6a2 2 0 0 0-1-1.73zM5 7h3v3H5V7zm7 11H6a1 1 0 0 1-1-1v-6h4v7zm8-3v4a2 2 0 0 1-2 2h-5v-7h7z"/></svg>

      Offers

    </button>

    <button id="btnProfile" aria-label="Go to Profile" aria-pressed="false" title="Profile" onclick="navigateTo('profileScreen')">

      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm-1.9 8c-2.7 0-5 1.3-5 3v1h12v-1c0-1.7-2.3-3-5-3z"/></svg>

      Profile

    </button>

  </footer>

</div>


<script>

  // Data Simulation


  // Each category could load actual data, here simple sample approach

  const categoriesData = {

    restaurants: [

      { id: 1, name: "Joe's Diner", offer: "15% off today", priceFrom: 10 },

      { id: 2, name: "Pizza Palace", offer: "Free drink on order", priceFrom: 12 },

    ],

    markets: [

      { id: 1, name: "Green Grocers", offer: "10% off on veggies", priceFrom: 5 },

      { id: 2, name: "Fresh Market", offer: "Buy 2 get 1 free", priceFrom: 8 },

    ],

    coffee: [

      { id: 1, name: "Sweet Coffee", offer: "20% discount on sweets", priceFrom: 4 },

      { id: 2, name: "Cafe Bliss", offer: "Free cookie with coffee", priceFrom: 6 },

    ],

    pharmacies: [

      { id: 1, name: "Health Pharmacy", offer: "10% on vitamins", priceFrom: 15 },

      { id: 2, name: "City Medicine", offer: "Free delivery", priceFrom: 10 },

    ],

    self_pickup: [

      { id: 1, name: "Click & Collect Pizza", offer: "No delivery fee", priceFrom: 9 },

      { id: 2, name: "Grab & Go Market", offer: "Quick self pickup", priceFrom: 6 },

    ],

    flowers: [

      { id: 1, name: "Bloom Florist", offer: "10% off bouquets", priceFrom: 20 },

      { id: 2, name: "Petal Paradise", offer: "Free vase", priceFrom: 25 },

    ]

  };


  const ordersInProcess = [

    { id: 101, name: "Joe's Diner", price: 20, datetime: "2024-06-10T14:30", status: "Preparing" },

    { id: 102, name: "Sweet Coffee", price: 8, datetime: "2024-06-11T09:15", status: "Out for delivery" }

  ];

  const pastOrders = [

    { id: 201, name: "Pizza Palace", price: 15, datetime: "2024-05-30T19:45" },

    { id: 202, name: "Green Grocers", price: 32, datetime: "2024-06-01T11:30" }

  ];

  const offers = [

    { id: 1, name: "Joe's Diner", description: "15% off today" },

    { id: 2, name: "Pizza Palace", description: "Free drink on order" },

    { id: 3, name: "Green Grocers", description: "10% off on veggies" },

    { id: 4, name: "Sweet Coffee", description: "20% discount on sweets" }

  ];


  // Profile Data (loaded from local storage if exists)

  const storageKey = "deliveryAppProfile";

  let profileData = JSON.parse(localStorage.getItem(storageKey)) || {

    name: '',

    phone: '',

    email: '',

    dob: '',

    gender: ''

  };


  // State Variables

  let currentScreen = 'homeScreen';

  let historyStack = [];


  // DOM Elements

  const backButton = document.getElementById('backButton');

  const mainContent = document.getElementById('mainContent');


  function showScreen(screenId) {

    // Hide all screens

    document.querySelectorAll('.screen').forEach(s => {

      s.hidden = true;

    });

    // Show desired screen

    const screen = document.getElementById(screenId);

    if (!screen) return;

    screen.hidden = false;

    currentScreen = screenId;


    // Back button visibility control

    if (screenId === 'homeScreen') {

      backButton.classList.remove('visible');

      historyStack = [];

    } else {

      backButton.classList.add('visible');

    }


    // Update footer buttons active state

    document.querySelectorAll('footer button').forEach(btn => btn.classList.remove('active'));

    const btnMap = {

      homeScreen: 'btnHome',

      ordersScreen: 'btnOrders',

      offersScreen: 'btnOffers',

      profileScreen: 'btnProfile'

    };

    if (btnMap[screenId]) {

      document.getElementById(btnMap[screenId]).classList.add('active');

      document.getElementById(btnMap[screenId]).setAttribute('aria-pressed', 'true');

      // Set others to false

      Object.values(btnMap).forEach(id => {

        if (id !== btnMap[screenId]) {

          document.getElementById(id).setAttribute('aria-pressed', 'false');

        }

      });

    } else {

      // For categoryScreen no footer active

      document.querySelectorAll('footer button').forEach(btn => btn.setAttribute('aria-pressed', 'false'));

    }


    if(screenId === 'ordersScreen') renderOrders();

    if(screenId === 'offersScreen') renderOffers();

    if(screenId === 'profileScreen') renderProfileForm();

  }


  // Navigation helper

  function navigateTo(screenId) {

    if(currentScreen !== screenId) {

      if(currentScreen !== 'homeScreen') historyStack.push(currentScreen);

      showScreen(screenId);

    }

  }


  function goBack() {

    if(historyStack.length > 0) {

      const prev = historyStack.pop();

      showScreen(prev);

    } else {

      showScreen('homeScreen');

    }

  }


  // Open category screen for selected category

  function openCategory(categoryName) {

    document.getElementById('categoryTitle').textContent = categoryName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

    const container = document.getElementById('categoryContent');

    const categoryList = categoriesData[categoryName];

    if(!categoryList) {

      container.innerHTML = "<p>No data available.</p>";

    } else {

      const html = categoryList.map(item => `

        <div class="order-item" tabindex="0" role="article" aria-label="${item.name} - ${item.offer}">

          <p class="name">${item.name}</p>

          <p class="details">${item.offer} - Starting from $${item.priceFrom}</p>

        </div>

      `).join('');

      container.innerHTML = html;

    }

    if(currentScreen !== 'categoryScreen') historyStack.push(currentScreen);

    showScreen('categoryScreen');

  }


  // Render Orders screen content

  function renderOrders() {

    const inProcessList = document.getElementById('ordersInProcessList');

    if(ordersInProcess.length === 0) {

      inProcessList.innerHTML = "<li>No orders in process.</li>"

    } else {

      inProcessList.innerHTML = ordersInProcess.map(order => `

        <li class="order-process-item" tabindex="0" role="article" aria-label="${order.name} order, status ${order.status}, placed on ${formatDateTime(order.datetime)}">

          <p class="name">${order.name}</p>

          <p class="details">Status: ${order.status}</p>

          <p class="details">Price: $${order.price.toFixed(2)}</p>

          <p class="details">Ordered on: ${formatDateTime(order.datetime)}</p>

        </li>

      `).join('');

    }

    const pastList = document.getElementById('pastOrdersList');

    if(pastOrders.length === 0) {

      pastList.innerHTML = "<li>No past orders found.</li>"

    } else {

      pastList.innerHTML = pastOrders.map(order => `

        <li class="order-item" tabindex="0" role="article" aria-label="Past order from ${order.name} at ${formatDateTime(order.datetime)} costing $${order.price.toFixed(2)}">

          <p class="name">${order.name}</p>

          <p class="details">Price: $${order.price.toFixed(2)}</p>

          <p class="details">Date/Time: ${formatDateTime(order.datetime)}</p>

        </li>

      `).join('');

    }

  }


  // Render Offers screen content

  function renderOffers() {

    const offersList = document.getElementById('offersList');

    if(offers.length === 0) {

      offersList.innerHTML = "<li>No offers available at the moment.</li>";

    } else {

      offersList.innerHTML = offers.map(offer => `

        <li class="offer-item" tabindex="0" role="article" aria-label="${offer.name} offer: ${offer.description}">

          <p class="name">${offer.name}</p>

          <p class="details">${offer.description}</p>

        </li>

      `).join('');

    }

  }


  // Format Date and Time string

  function formatDateTime(dateString) {

    try {

      const options = {year: 'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'};

      return new Date(dateString).toLocaleString(undefined, options);

    } catch(e) {

      return dateString;

    }

  }


  // Render profile form with existing data

  function renderProfileForm() {

    const nameInput = document.getElementById('nameInput');

    const phoneInput = document.getElementById('phoneInput');

    const emailInput = document.getElementById('emailInput');

    const dobInput = document.getElementById('dobInput');

    const maleBtn = document.getElementById('maleBtn');

    const femaleBtn = document.getElementById('femaleBtn');


    nameInput.value = profileData.name || '';

    phoneInput.value = profileData.phone || '';

    emailInput.value = profileData.email || '';

    dobInput.value = profileData.dob || '';


    maleBtn.classList.remove('selected');

    femaleBtn.classList.remove('selected');

    maleBtn.setAttribute('aria-pressed', 'false');

    femaleBtn.setAttribute('aria-pressed', 'false');


    if(profileData.gender === 'male') {

      maleBtn.classList.add('selected');

      maleBtn.setAttribute('aria-pressed', 'true');

    } else if(profileData.gender === 'female') {

      femaleBtn.classList.add('selected');

      femaleBtn.setAttribute('aria-pressed', 'true');

    }


    // Set max date today for date of birth

    dobInput.max = new Date().toISOString().split('T')[0];

  }


  // Handle gender buttons selection

  document.getElementById('maleBtn').addEventListener('click', () => {

    document.getElementById('maleBtn').classList.add('selected');

    document.getElementById('maleBtn').setAttribute('aria-pressed', 'true');

    document.getElementById('femaleBtn').classList.remove('selected');

    document.getElementById('femaleBtn').setAttribute('aria-pressed', 'false');

    profileData.gender = 'male';

  });

  document.getElementById('femaleBtn').addEventListener('click', () => {

    document.getElementById('femaleBtn').classList.add('selected');

    document.getElementById('femaleBtn').setAttribute('aria-pressed', 'true');

    document.getElementById('maleBtn').classList.remove('selected');

    document.getElementById('maleBtn').setAttribute('aria-pressed', 'false');

    profileData.gender = 'female';

  });


  // Update profile data on "Update" button click

  document.getElementById('updateProfileBtn').addEventListener('click', () => {

    const name = document.getElementById('nameInput').value.trim();

    const phone = document.getElementById('phoneInput').value.trim();

    const email = document.getElementById('emailInput').value.trim();

    const dob = document.getElementById('dobInput').value;


    if(!name) {

      alert('Please enter your name.');

      return;

    }

    const phonePattern = /^\+?[0-9\-\s]{7,15}$/;

    if(!phonePattern.test(phone)) {

      alert('Please enter a valid phone number.');

      return;

    }

    if(!email || !validateEmail(email)) {

      alert('Please enter a valid email address.');

      return;

    }

    // gender check

    if(!profileData.gender) {

      alert('Please select your gender.');

      return;

    }


    profileData = {name, phone, email, dob, gender: profileData.gender};

    localStorage.setItem(storageKey, JSON.stringify(profileData));

    alert('Profile updated successfully.');

  });


  // Email validation helper

  function validateEmail(email) {

    const re = /^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$/;

    return re.test(email);

  }


  // Sign out button logic: clears saved profile and reload page

  document.getElementById('signOutBtn').addEventListener('click', () => {

    if(confirm('Are you sure you want to sign out? All your saved profile data will be cleared.')) {

      localStorage.removeItem(storageKey);

      profileData = {name:'',phone:'',email:'',dob:'',gender:''};

      renderProfileForm();

      alert('Signed out successfully.');

      navigateTo('homeScreen');

    }

  });


  // Search input handler (for simplicity just console log)

  function handleSearchInput() {

    const val = document.getElementById('searchInput').value.trim().toLowerCase();

    // This could filter listings from the current screen but here just log

    console.log('Search:', val);

  }


  // Initialization on page load

  document.addEventListener('DOMContentLoaded', () => {

    showScreen('homeScreen');

  });

</script>

</body>

</html>
