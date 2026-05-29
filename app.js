const defaultData = {
  assembly: [
    { id: "minimum", name: "Minimum job", note: "Use this even for small jobs", price: 60 },
    { id: "small", name: "Small item", note: "Chair, nightstand, small shelf", price: 45 },
    { id: "medium", name: "Medium item", note: "Desk, TV stand, cabinet", price: 80 },
    { id: "large", name: "Large item", note: "Dresser, wardrobe, bunk bed", price: 140 },
    { id: "bed", name: "Bed frame", note: "Standard bed assembly", price: 90 },
    { id: "dresser", name: "Dresser", note: "Adjust higher for many drawers", price: 120 },
    { id: "hourly", name: "Hourly rate", note: "Extra work per hour", price: 45 }
  ],
  custom: [
    { id: "customHourly", name: "Custom hourly rate", note: "Simple lumber work", price: 55 },
    { id: "smallBuild", name: "Small custom build", note: "Small shelf, brace, frame", price: 120 },
    { id: "mediumBuild", name: "Medium custom build", note: "Bench, table base, storage", price: 250 },
    { id: "materialMarkup", name: "Material markup %", note: "Add on top of material cost", price: 20 },
    { id: "pickup", name: "Material pickup", note: "Store pickup and handling", price: 35 }
  ],
  travel: [
    { id: "travel", name: "Travel fee", note: "Add when job is far", price: 25 },
    { id: "stairs", name: "Stairs / heavy item", note: "Extra effort fee", price: 25 },
    { id: "sameDay", name: "Same-day job", note: "Rush fee", price: 30 }
  ]
};

const storageKey = "jose-pricing-v1";
let data = loadData();

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const jobType = document.querySelector("#jobType");
const quantity = document.querySelector("#quantity");
const extraHours = document.querySelector("#extraHours");
const travelFee = document.querySelector("#travelFee");
const quoteTotal = document.querySelector("#quoteTotal");
const customerMessage = document.querySelector("#customerMessage");
const copyMessage = document.querySelector("#copyMessage");
const resetButton = document.querySelector("#resetButton");
const exportPrices = document.querySelector("#exportPrices");
const importPrices = document.querySelector("#importPrices");
const backupStatus = document.querySelector("#backupStatus");

function loadData() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return cloneData(defaultData);

  try {
    return { ...cloneData(defaultData), ...JSON.parse(saved) };
  } catch {
    return cloneData(defaultData);
  }
}

function cloneData(source) {
  return JSON.parse(JSON.stringify(source));
}

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(data));
  backupStatus.textContent = "Saved on this device.";
}

function allItems() {
  return [...data.assembly, ...data.custom, ...data.travel];
}

function findItem(id) {
  return allItems().find((item) => item.id === id);
}

function renderPriceList(section, containerId) {
  const container = document.querySelector(containerId);
  container.innerHTML = "";

  data[section].forEach((item) => {
    const row = document.createElement("div");
    row.className = "price-row";
    row.innerHTML = `
      <label for="${item.id}">
        <strong>${item.name}</strong>
        <span>${item.note}</span>
      </label>
      <input id="${item.id}" inputmode="decimal" type="number" min="0" step="1" value="${item.price}">
    `;

    row.querySelector("input").addEventListener("input", (event) => {
      item.price = Number(event.target.value || 0);
      saveData();
      updateQuote();
    });

    container.appendChild(row);
  });
}

function renderJobOptions() {
  const selected = jobType.value || "medium";
  jobType.innerHTML = "";

  [...data.assembly, ...data.custom].forEach((item) => {
    if (item.id === "hourly" || item.id === "materialMarkup") return;
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.name} - ${money.format(item.price)}`;
    jobType.appendChild(option);
  });

  jobType.value = findItem(selected) ? selected : "medium";
}

function updateQuote() {
  renderJobOptions();

  const baseItem = findItem(jobType.value);
  const count = Math.max(1, Number(quantity.value || 1));
  const hours = Math.max(0, Number(extraHours.value || 0));
  const hourly = findItem("hourly")?.price || 0;
  const minimum = findItem("minimum")?.price || 0;
  const travel = travelFee.checked ? findItem("travel")?.price || 0 : 0;
  const base = (baseItem?.price || 0) * count;
  const total = Math.max(minimum, base + hours * hourly + travel);

  quoteTotal.textContent = money.format(total);
  customerMessage.value = `Hi, this is Jose. I can help with the ${baseItem?.name.toLowerCase() || "job"}. Based on the details, my estimated price is ${money.format(total)}. Please send me the item link or photos, your location, and the best time for you so I can confirm the final price. Thanks.`;
}

function switchTab(tabId) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabId);
  });

  document.querySelectorAll(".price-section").forEach((section) => {
    section.classList.toggle("active", section.id === tabId);
  });
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});

[jobType, quantity, extraHours, travelFee].forEach((input) => {
  input.addEventListener("input", updateQuote);
  input.addEventListener("change", updateQuote);
});

copyMessage.addEventListener("click", async () => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(customerMessage.value);
  } else {
    customerMessage.select();
    document.execCommand("copy");
  }

  copyMessage.textContent = "Message copied";
  setTimeout(() => {
    copyMessage.textContent = "Copy customer message";
  }, 1400);
});

exportPrices.addEventListener("click", () => {
  const file = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = "jose-prices-backup.json";
  link.click();
  URL.revokeObjectURL(link.href);
  backupStatus.textContent = "Backup file exported.";
});

importPrices.addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;

  try {
    const imported = JSON.parse(await file.text());
    data = {
      assembly: Array.isArray(imported.assembly) ? imported.assembly : data.assembly,
      custom: Array.isArray(imported.custom) ? imported.custom : data.custom,
      travel: Array.isArray(imported.travel) ? imported.travel : data.travel
    };
    saveData();
    renderAll();
    backupStatus.textContent = "Imported price file.";
  } catch {
    backupStatus.textContent = "That file could not be imported.";
  }

  event.target.value = "";
});

resetButton.addEventListener("click", () => {
  const confirmed = confirm("Reset all prices back to the starter prices?");
  if (!confirmed) return;
  data = cloneData(defaultData);
  saveData();
  renderAll();
});

function renderAll() {
  renderPriceList("assembly", "#assemblyList");
  renderPriceList("custom", "#customList");
  renderPriceList("travel", "#travelList");
  renderJobOptions();
  updateQuote();
}

renderAll();
