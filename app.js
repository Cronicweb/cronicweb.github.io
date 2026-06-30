/* ============ MallOS interactive prototype ============ */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const titles = {
    home: "MallOS", hotel: "Hotel Booking", qr: "Scan to Order",
    ai: "AI Menu Search", self: "Self Order", kds: "Captain · KDS",
    bill: "Billing", crm: "CRM", inv: "Inventory"
  };

  /* ---- toast ---- */
  let toastT;
  function toast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ---- view switching with back history ---- */
  let currentView = "home";
  const navStack = [];

  function render(view) {
    currentView = view;
    $$(".view").forEach(v => v.classList.toggle("active", v.dataset.view === view));
    $$(".modtab").forEach(b => b.classList.toggle("active", b.dataset.v === view));
    const title = $("#appTitle");
    if (title) title.textContent = titles[view] || "MallOS";
    const back = $("#backBtn");
    if (back) back.hidden = navStack.length === 0;
    const area = $(".scrollarea");
    if (area) area.scrollTop = 0;
  }
  function show(view) {
    if (view === currentView) return;
    navStack.push(currentView);
    render(view);
  }
  function goBack() {
    if (!navStack.length) return;
    render(navStack.pop());
  }

  /* ---- mobile nav toggle ---- */
  const navToggle = $("#navToggle"), navMenu = $("#navMenu"), topnav = $(".topnav");
  navToggle?.addEventListener("click", () => {
    const open = topnav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  navMenu?.addEventListener("click", e => {
    if (e.target.tagName === "A") topnav.classList.remove("open");
  });

  $$(".modtab").forEach(b => b.addEventListener("click", () => show(b.dataset.v)));
  $$("[data-go]").forEach(el => el.addEventListener("click", () => show(el.dataset.go)));
  $("#backBtn")?.addEventListener("click", goBack);

  /* ============ HOTEL BOOKING ============ */
  const busyRooms = new Set([102, 105, 110, 203, 207, 212, 215, 220]);
  const RATE = 4500, GST_HOTEL = 0.12;
  let selectedRoom = null;

  function buildRooms() {
    const grid = $("#roomGrid");
    if (!grid) return;
    grid.innerHTML = "";
    // 24 rooms: 101-112, 201-212
    const nums = [];
    for (let i = 101; i <= 112; i++) nums.push(i);
    for (let i = 201; i <= 212; i++) nums.push(i);
    nums.forEach(n => {
      const d = document.createElement("div");
      const busy = busyRooms.has(n);
      d.className = "room " + (busy ? "busy" : "free");
      d.textContent = n;
      if (!busy) d.addEventListener("click", () => selectRoom(n, d));
      grid.appendChild(d);
    });
  }
  function selectRoom(n, el) {
    selectedRoom = n;
    $$("#roomGrid .room").forEach(r => r.classList.remove("sel"));
    el.classList.remove("free");
    el.classList.add("sel");
    updateHotel();
  }
  function updateHotel() {
    const nights = Math.max(1, parseInt($("#hNights")?.value || "2", 10));
    const base = RATE * nights;
    const gst = Math.round(base * GST_HOTEL);
    const total = base + gst;
    $("#hRoomNo").textContent = selectedRoom || "—";
    $("#hNightsLbl").textContent = nights;
    $("#hRate").textContent = "₹" + base.toLocaleString("en-IN");
    $("#hGst").textContent = "₹" + gst.toLocaleString("en-IN");
    $("#hTotal").textContent = "₹" + total.toLocaleString("en-IN");
    $("#hBook").disabled = !selectedRoom;
  }
  $("#hNights")?.addEventListener("input", updateHotel);
  $("#hBook")?.addEventListener("click", () => {
    if (!selectedRoom) return;
    busyRooms.add(selectedRoom);
    toast("✅ Room " + selectedRoom + " booked & confirmed!");
    selectedRoom = null;
    buildRooms();
    updateHotel();
  });

  /* ============ QR ============ */
  function buildQR() {
    const box = $("#qrbox");
    if (!box) return;
    // simple deterministic pseudo-QR
    const N = 11, cell = 12;
    let rects = "";
    let seed = 7;
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        const finder = (x < 3 && y < 3) || (x > N - 4 && y < 3) || (x < 3 && y > N - 4);
        if (finder || rnd() > 0.5)
          rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="#0b1020"/>`;
      }
    box.innerHTML = `<svg viewBox="0 0 ${N * cell} ${N * cell}">${rects}</svg>`;
  }
  $("#qrScan")?.addEventListener("click", () => {
    toast("📲 Menu opened for Table 12");
    show("self");
  });

  /* ============ MENU DATA ============ */
  const MENU = [
    { id: 1, name: "Paneer Tikka", price: 280, tags: ["veg", "spicy", "paneer", "starter"], stock: 8 },
    { id: 2, name: "Veg Biryani", price: 240, tags: ["veg", "spicy", "rice"], stock: 12 },
    { id: 3, name: "Butter Chicken", price: 360, tags: ["nonveg", "spicy", "curry"], stock: 6 },
    { id: 4, name: "Margherita Pizza", price: 320, tags: ["veg", "light", "italian"], stock: 5 },
    { id: 5, name: "Cold Coffee", price: 120, tags: ["veg", "light", "beverage", "under 300"], stock: 20 },
    { id: 6, name: "Gulab Jamun", price: 90, tags: ["veg", "dessert", "sweet", "under 300"], stock: 0 },
    { id: 7, name: "Paneer Butter Masala", price: 300, tags: ["veg", "paneer", "curry"], stock: 4 },
    { id: 8, name: "Chocolate Brownie", price: 150, tags: ["veg", "dessert", "sweet", "under 300"], stock: 7 }
  ];

  /* ============ AI SEARCH ============ */
  function aiSearch(q) {
    q = (q || "").toLowerCase().trim();
    const out = $("#aiResults");
    if (!out) return;
    let res = MENU;
    if (q) {
      const priceMatch = q.match(/under\s*(\d+)/);
      res = MENU.filter(m => {
        if (priceMatch && m.price <= +priceMatch[1]) return true;
        if (m.name.toLowerCase().includes(q)) return true;
        return m.tags.some(t => q.includes(t) || t.includes(q));
      });
    }
    if (!res.length) {
      out.innerHTML = `<div class="pcard"><small>🤖 No dishes matched. Try “veg”, “dessert” or “under 300”.</small></div>`;
      return;
    }
    out.innerHTML = res.map(m => `
      <div class="pcard"><div class="row">
        <div><h5 style="margin:0">${m.name}</h5><small>${m.tags.slice(0,3).join(" · ")}</small></div>
        <div style="text-align:right"><b>₹${m.price}</b><br>
        ${m.stock ? '<span class="pill">In stock</span>' : '<span class="pill off">Out</span>'}</div>
      </div></div>`).join("");
  }
  $("#aiInput")?.addEventListener("input", e => aiSearch(e.target.value));
  $$(".chip[data-q]").forEach(c => c.addEventListener("click", () => {
    const inp = $("#aiInput"); if (inp) inp.value = c.dataset.q;
    aiSearch(c.dataset.q);
  }));

  /* ============ SELF ORDER + STOCK ============ */
  const cart = {};
  function buildMenu() {
    const list = $("#menuList");
    if (!list) return;
    list.innerHTML = MENU.map(m => `
      <div class="pcard" data-id="${m.id}">
        <div class="row">
          <div><h5 style="margin:0">${m.name}</h5>
            <small>₹${m.price} · ${m.stock > 0 ? "Stock: " + m.stock : '<span style="color:var(--danger)">Sold out</span>'}</small>
          </div>
          <button class="mini-btn add" data-id="${m.id}" ${m.stock <= 0 ? "disabled" : ""}>＋ Add</button>
        </div>
      </div>`).join("");
    $$(".add", list).forEach(b => b.addEventListener("click", () => addToCart(+b.dataset.id)));
  }
  function addToCart(id) {
    const m = MENU.find(x => x.id === id);
    if (!m || m.stock <= 0) { toast("⚠️ Out of stock"); return; }
    m.stock--;                       // real-time stock check & decrement
    cart[id] = (cart[id] || 0) + 1;
    updateCart();
    buildMenu();
    toast("Added " + m.name);
  }
  function updateCart() {
    let count = 0, total = 0;
    Object.entries(cart).forEach(([id, q]) => {
      const m = MENU.find(x => x.id === +id);
      count += q; total += m.price * q;
    });
    $("#cartCount").textContent = count;
    $("#cartTotal").textContent = "₹" + total;
    $("#placeOrder").disabled = count === 0;
  }
  $("#placeOrder")?.addEventListener("click", () => {
    toast("✅ Order placed & sent to kitchen!");
    Object.keys(cart).forEach(k => delete cart[k]);
    updateCart();
  });

  /* ============ KDS ============ */
  let ticket = 41;
  const kdsData = [
    { t: 14, items: ["Veg Biryani", "Cold Coffee ×2"], done: [false, false] }
  ];
  function renderKDS() {
    const list = $("#kdsList");
    if (!list) return;
    list.innerHTML = kdsData.map((k, ki) => `
      <div class="kds">
        <div class="head"><span>🎫 #${100 + ki} · Table ${k.t}</span><span>NEW</span></div>
        <ul>${k.items.map((it, ii) => `<li class="${k.done[ii] ? "done" : ""}" data-k="${ki}" data-i="${ii}">▢ ${it}</li>`).join("")}</ul>
      </div>`).join("");
    $$("#kdsList li").forEach(li => li.addEventListener("click", () => {
      const k = +li.dataset.k, i = +li.dataset.i;
      kdsData[k].done[i] = !kdsData[k].done[i];
      renderKDS();
    }));
  }
  $("#punch")?.addEventListener("click", () => {
    kdsData.unshift({ t: 12, items: ["Paneer Tikka", "Butter Chicken", "Gulab Jamun"], done: [false, false, false] });
    ticket++;
    renderKDS();
    toast("👨‍🍳 Order punched → kitchen screen");
  });

  /* ============ BILLING ============ */
  $("#payBtn")?.addEventListener("click", () => toast("💳 Payment received · e-invoice generated"));
  $("#tallyBtn")?.addEventListener("click", () => toast("📚 Posted to Tally (verify-only)"));

  /* ============ CRM ============ */
  $("#sendCampaign")?.addEventListener("click", () => toast("📨 Christmas blast sent to 1,240 customers"));
  $("#genCoupon")?.addEventListener("click", () => {
    const code = "MALL-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    const out = $("#couponOut");
    if (out) out.textContent = "Coupon created: " + code + " (15% off)";
    toast("🎟️ " + code + " ready to sell");
  });

  /* ---- init ---- */
  buildRooms(); updateHotel(); buildQR(); buildMenu(); updateCart();
  renderKDS(); aiSearch("");
  const today = new Date().toISOString().slice(0, 10);
  const ci = $("#hCheckin"); if (ci) ci.value = today;
})();
