# Frontend Integration Guide

## Base URL Setup

In your frontend, create a config file or just define this at the top of your JS files:

```js
const API_BASE = 'https://your-backend.onrender.com/api';
// During local dev: const API_BASE = 'http://localhost:5000/api';
```

---

## 1. Register Page (GET /register → POST to API)

Your register form should POST to `/api/auth/register`.

```js
// register.js (or inside your form submit handler)
const registerForm = document.getElementById('register-form');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name     = document.getElementById('name').value;
  const email    = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',           // Important: sends/receives cookies
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (data.success) {
      // Store token in localStorage as backup (cookie is set automatically)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/';      // Redirect to homepage
    } else {
      alert(data.message);             // Show error to user
    }
  } catch (err) {
    console.error('Registration failed:', err);
    alert('Something went wrong. Please try again.');
  }
});
```

---

## 2. Login Page (GET /login → POST to API)

```js
// login.js
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email    = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/';      // Redirect to homepage on success
    } else {
      // Show error message on the page
      document.getElementById('error-msg').textContent = data.message;
    }
  } catch (err) {
    console.error('Login failed:', err);
  }
});
```

---

## 3. Protected Profile Page (GET /profile)

Add this guard at the TOP of your profile page script, before any other code:

```js
// profile.js
const token = localStorage.getItem('token');

// Redirect to login if no token found
if (!token) {
  window.location.href = '/login';
}

// Fetch and display user profile
const loadProfile = async () => {
  try {
    const res = await fetch(`${API_BASE}/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await res.json();

    if (data.success) {
      const { name, email, createdAt } = data.user;

      document.getElementById('user-name').textContent  = name;
      document.getElementById('user-email').textContent = email;
      document.getElementById('member-since').textContent =
        new Date(createdAt).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        });
    } else {
      // Token invalid or expired → force re-login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  } catch (err) {
    console.error('Could not load profile:', err);
  }
};

loadProfile();
```

---

## 4. Crypto Pages

### All Cryptocurrencies (GET /crypto)

```js
// crypto.js
const loadAllCryptos = async () => {
  const res  = await fetch(`${API_BASE}/crypto`);
  const data = await res.json();

  const container = document.getElementById('crypto-list');

  data.data.forEach((coin) => {
    const isPositive = coin.change24h >= 0;
    const card = `
      <div class="crypto-card">
        <img src="${coin.image}" alt="${coin.name}" onerror="this.src='/fallback.png'">
        <h3>${coin.name} <span>${coin.symbol}</span></h3>
        <p class="price">$${coin.price.toLocaleString()}</p>
        <p class="change ${isPositive ? 'green' : 'red'}">
          ${isPositive ? '+' : ''}${coin.change24h}%
        </p>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', card);
  });
};

loadAllCryptos();
```

### Top Gainers (GET /crypto/gainers)

```js
const loadGainers = async () => {
  const res  = await fetch(`${API_BASE}/crypto/gainers`);
  const data = await res.json();
  // Same display logic as above — data.data is your array
};
```

### New Listings (GET /crypto/new)

```js
const loadNewListings = async () => {
  const res  = await fetch(`${API_BASE}/crypto/new`);
  const data = await res.json();
  // data.data sorted newest → oldest
};
```

### Add New Crypto (POST /crypto)

```js
const addCryptoForm = document.getElementById('add-crypto-form');

addCryptoForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name:      document.getElementById('crypto-name').value,
    symbol:    document.getElementById('crypto-symbol').value,
    price:     parseFloat(document.getElementById('crypto-price').value),
    image:     document.getElementById('crypto-image').value,
    change24h: parseFloat(document.getElementById('crypto-change').value),
  };

  const token = localStorage.getItem('token');

  const res = await fetch(`${API_BASE}/crypto`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,  // Include if you make this route protected
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (data.success) {
    alert('Cryptocurrency added!');
    addCryptoForm.reset();
  } else {
    alert(data.message);
  }
});
```

### Logout

```js
const logout = async () => {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  });
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

document.getElementById('logout-btn').addEventListener('click', logout);
```

---

## Deployment Checklist

### Backend (Render)
1. Push code to GitHub Classroom
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add **Environment Variables** (from `.env.example`):
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a long random string
   - `NODE_ENV` — `production`
   - `CLIENT_URL` — your deployed frontend URL
7. Deploy and copy the live URL

### Frontend
1. Replace `API_BASE` with your Render backend URL
2. Make sure all fetch calls include `credentials: 'include'`
3. Deploy to Vercel / Netlify / GitHub Pages
