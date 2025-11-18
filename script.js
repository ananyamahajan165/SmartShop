// SmartShop script - product rendering, cart & wishlist (localStorage)

const PRODUCTS = [
  // Groceries
  {id:'p1',name:'Fresh Apples (1kg)', price:150, category:'groceries', expiry:'20 Sep 2025', badge:'Fresh', img:'images/apples.svg', eco:false},
  {id:'p2',name:'Bananas (1 dozen)', price:60, category:'groceries', expiry:'08 Sep 2025', badge:'Near', img:'images/bananas.svg', eco:false},
  {id:'p3',name:'Basmati Rice (5kg)', price:420, category:'groceries', expiry:'', badge:'N/A', img:'images/rice.svg', eco:false},
  {id:'p4',name:'Toor Dal (1kg)', price:140, category:'groceries', expiry:'', badge:'N/A', img:'images/dal.svg', eco:false},
  {id:'p5',name:'White Sugar (1kg)', price:55, category:'groceries', expiry:'', badge:'N/A', img:'images/sugar.svg', eco:false},
  {id:'p6',name:'Table Salt (1kg)', price:30, category:'groceries', expiry:'', badge:'N/A', img:'images/salt.svg', eco:false},
  {id:'p7',name:'Sunflower Oil (1L)', price:160, category:'groceries', expiry:'02 Dec 2025', badge:'Fresh', img:'images/oil.svg', eco:false},
  {id:'p8',name:'Potato Chips', price:35, category:'groceries', expiry:'12 Oct 2025', badge:'Fresh', img:'images/chips.svg', eco:false},

  // Dairy
  {id:'p9',name:'Organic Milk (1L)', price:60, category:'dairy', expiry:'02 Sep 2025', badge:'Expiring', img:'images/milk.svg', eco:false},
  {id:'p10',name:'Fresh Paneer (200g)', price:120, category:'dairy', expiry:'22 Sep 2025', badge:'Fresh', img:'images/paneer.svg', eco:false},
  {id:'p11',name:'Fresh Curd (500g)', price:55, category:'dairy', expiry:'18 Sep 2025', badge:'Near', img:'images/curd.svg', eco:false},
  {id:'p12',name:'Salted Butter (100g)', price:90, category:'dairy', expiry:'06 Nov 2025', badge:'Fresh', img:'images/butter.svg', eco:false},

  // Electronics
  {id:'p13',name:'Wireless Headphones', price:2500, category:'electronics', expiry:'', badge:'N/A', img:'images/headphones.svg', eco:false},
  {id:'p14',name:'Fast Charger', price:499, category:'electronics', expiry:'', badge:'N/A', img:'images/charger.svg', eco:false},
  {id:'p15',name:'10,000 mAh Powerbank', price:899, category:'electronics', expiry:'', badge:'N/A', img:'images/powerbank.svg', eco:false},
  {id:'p16',name:'True Wireless Earbuds', price:1299, category:'electronics', expiry:'', badge:'N/A', img:'images/earbuds.svg', eco:false},

  // Clothes
  {id:'p17',name:'Classic Cotton T-Shirt', price:499, category:'clothes', expiry:'', badge:'N/A', img:'images/tshirt.svg', eco:false},
  {id:'p18',name:'Comfort Jeans', price:999, category:'clothes', expiry:'', badge:'N/A', img:'images/jeans.svg', eco:false},
  {id:'p19',name:'Light Jacket', price:1499, category:'clothes', expiry:'', badge:'N/A', img:'images/jacket.svg', eco:false},
  {id:'p20',name:'Sport Socks (Pack of 3)', price:199, category:'clothes', expiry:'', badge:'N/A', img:'images/socks.svg', eco:false},

  // Giftcards / Eco
  {id:'p21',name:'SmartShop Gift Card', price:1000, category:'gifts', expiry:'', badge:'N/A', img:'images/giftcard.svg', eco:false},
  {id:'p22',name:'Reusable Eco Bag', price:249, category:'eco', expiry:'', badge:'Eco', img:'images/reusablebag.svg', eco:true}
];

// localStorage keys
const CART_KEY = 'smartshop_cart_v1';
const WISH_KEY = 'smartshop_wish_v1';

function qs(sel, ctx=document){ return ctx.querySelector(sel); }
function qsa(sel, ctx=document){ return Array.from(ctx.querySelectorAll(sel)); }

// Render products into #products container
function renderProducts(filter='all'){
  const container = qs('#products');
  if(!container) return;
  container.innerHTML = '';
  const list = (filter === 'all') ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="thumb"><img src="${p.img}" alt="${p.name}"></div>
      <div class="info">
        <h4>${p.name}</h4>
        <div class="price">₹${p.price}</div>
        <div class="expiry">${p.expiry ? 'Expiry: ' + p.expiry : 'No Expiry'} <span class="badge ${p.badge==='Fresh'?'green':p.badge==='Expiring'?'red':'yellow'}">${p.badge}</span></div>
        <div class="actions">
          <button class="btn small primary" onclick="addToCart('${p.id}')">Add to Cart</button>
          <button class="btn small ghost" onclick="addToWishlist('${p.id}')">♡ Wishlist</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
  updateCartCount();
}

// filter helper for buttons
function filterProducts(cat){
  renderProducts(cat);
  // smooth scroll to products
  const c = qs('#products');
  if(c) c.scrollIntoView({behavior:'smooth', block:'start'});
}

// CART functions
function readCart(){ return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCount(); }
function addToCart(productId){
  const p = PRODUCTS.find(x=>x.id===productId);
  if(!p) return;
  let cart = readCart();
  const existing = cart.find(i=>i.id===productId);
  if(existing){ existing.qty += 1; } else { cart.push({id:p.id, name:p.name, price:p.price, qty:1, img:p.img}); }
  saveCart(cart);
  toast(`${p.name} added to cart`);
  renderProducts(currentFilter); // optional subtle UI update
  updateCartPageIfPresent();
}
function removeFromCart(productId){
  let cart = readCart().filter(i=>i.id!==productId);
  saveCart(cart);
  updateCartPageIfPresent();
}
function changeQty(productId, qty){
  let cart = readCart();
  const item = cart.find(i=>i.id===productId);
  if(item){ item.qty = Math.max(1, Number(qty) || 1); saveCart(cart); updateCartPageIfPresent(); }
}
function cartTotal(){
  return readCart().reduce((s,i)=>s + (i.price * i.qty), 0);
}
function updateCartCount(){
  const cnt = readCart().reduce((s,i)=>s + i.qty, 0);
  qsa('.cart-count').forEach(el => el.textContent = cnt>0?cnt:''); // badge elements
}

// WISHLIST
function readWish(){ return JSON.parse(localStorage.getItem(WISH_KEY) || '[]'); }
function saveWish(w){ 
  localStorage.setItem(WISH_KEY, JSON.stringify(w));
  // Dispatch a custom event for React components
  window.dispatchEvent(new CustomEvent('wishlist-updated'));
}
function addToWishlist(productId){
  const p = PRODUCTS.find(x=>x.id===productId);
  if(!p) return;
  let w = readWish();
  if(!w.find(i=>i.id===productId)){ 
    w.push({id:p.id, name:p.name, img:p.img}); 
    saveWish(w); 
    toast('Saved to wishlist');
  }
}

// Toast
function toast(msg, t=1200){
  const d = document.createElement('div'); d.className='toast'; d.textContent = msg;
  Object.assign(d.style, {position:'fixed',left:'50%',bottom:'24px',transform:'translateX(-50%)',background:'#0d47a1',color:'#fff',padding:'10px 14px',borderRadius:'999px',zIndex:9999,fontWeight:700});
  document.body.appendChild(d);
  setTimeout(()=> d.remove(), t);
}

// Update cart page if open
function updateCartPageIfPresent(){
  const listEl = qs('#cart-items');
  const totalEl = qs('#cart-total');
  if(!listEl) return;
  const cart = readCart();
  listEl.innerHTML = '';
  cart.forEach(item => {
    const li = document.createElement('div');
    li.className = 'cart-item';
    li.innerHTML = `
      <img src="${item.img}" style="width:84px;height:84px;border-radius:8px;object-fit:cover">
      <div>
        <strong>${item.name}</strong>
        <div class="small">₹${item.price}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
        <div class="qty"><input type="number" min="1" value="${item.qty}" onchange="changeQty('${item.id}', this.value)"></div>
        <div style="font-weight:800">₹${item.price * item.qty}</div>
        <button class="btn ghost" onclick="removeFromCart('${item.id}')">Remove</button>
      </div>
    `;
    listEl.appendChild(li);
  });
  if(totalEl) totalEl.textContent = '₹' + cartTotal();
  updateCartCount();
}

// Update wishlist page if open
function updateWishPageIfPresent(){
  const listEl = qs('#wishlist-items');
  if(!listEl) return;
  const wish = readWish();
  listEl.innerHTML = '';
  wish.forEach(item=>{
    const div = document.createElement('div');
    div.className = 'card';
    div.style.padding='10px';
    div.innerHTML = `<div style="display:flex;gap:10px;align-items:center"><img src="${item.img}" style="width:64px;height:48px;object-fit:cover"><div><strong>${item.name}</strong></div></div>`;
    listEl.appendChild(div);
  });
}

// On page load
let currentFilter = 'all';
document.addEventListener('DOMContentLoaded', ()=>{
  // render products if container exists
  if(qs('#products')) renderProducts('all');
  updateCartCount();
  updateCartPageIfPresent();
  updateWishPageIfPresent();
  // mobile nav close on click links
  document.addEventListener('click', (ev)=>{ if(ev.target.matches('.nav-links a')) qs('.nav-links')?.classList.remove('show'); });
});

// Hamburger toggle
function toggleMenu(){ qs('.nav-links')?.classList.toggle('show'); }
