const defaultData = {
  assembly: [
    { id: "curtainRods", name: "Curtain rods", note: "Per basic curtain rod", price: 20 },
    { id: "mirrorsSmallMedium", name: "Mirrors small / medium", note: "Small or medium mirror", price: 15 },
    { id: "mirrorsLarge", name: "Mirrors large", note: "Larger mirror", price: 50 },
    { id: "dressers", name: "Dressers", note: "Standard dresser assembly", price: 80 },
    { id: "bedsFullQueen", name: "Beds full to queen", note: "Full, twin, or queen bed", price: 75 },
    { id: "bedsKing", name: "King size bed", note: "King bed assembly", price: 100 },
    { id: "patioSet", name: "Outdoor patio set", note: "Sofa and two chairs", price: 90 },
    { id: "patioMoreItems", name: "Outdoor patio more items", note: "Larger patio set", price: 130 },
    { id: "framesSmallMedium", name: "Hang frames small / medium", note: "Small or medium frame", price: 15 },
    { id: "framesLarge", name: "Hang frames large", note: "Larger frame", price: 50 },
    { id: "knobs", name: "Kitchen / drawer knobs", note: "Per knob", price: 10 },
    { id: "entertainmentCenter", name: "Entertainment center", note: "Assembly", price: 80 },
    { id: "tvMount", name: "TV mount", note: "$92 each TV", price: 92 },
    { id: "chandelierBasic", name: "Chandelier basic swap", note: "Standard ceiling, existing wiring and box", price: 250 },
    { id: "chandelierNewLocation", name: "Chandelier new location", note: "Cutting drywall, new wire, new ceiling box", price: 650 },
    { id: "chandelierHighCeiling", name: "Chandelier high ceiling / foyer", note: "12-20+ ft, tall ladder/scaffold, extra help", price: 1200 },
    { id: "chandelierHeavy", name: "Chandelier heavy fixture", note: "Over 30 lbs, reinforced support and rated box", price: 900 },
    { id: "ceilingFan", name: "Ceiling fan", note: "Each, depends on switch wiring", price: 150 },
    { id: "simpleDoorKnobs", name: "Simple door knobs", note: "Basic door knob", price: 10 },
    { id: "codeLock", name: "Code lock for doors", note: "Keypad/code lock install", price: 50 },
    { id: "lockKeyDoorKnob", name: "Lock key door knob", note: "Locking keyed door knob", price: 20 },
    { id: "smartDoorbellLow", name: "Smart doorbell simple", note: "Simple install", price: 50 },
    { id: "smartDoorbellHigh", name: "Smart doorbell complex", note: "More difficult install", price: 90 },
    { id: "diningTableLow", name: "Dining table simple", note: "Simple dining table", price: 85 },
    { id: "diningTableHigh", name: "Dining table larger", note: "Larger or more complex table", price: 150 },
    { id: "pantryCabinet", name: "Pantry cabinet", note: "Assembly", price: 90 },
    { id: "babyCribSimple", name: "Baby crib simple", note: "Basic crib", price: 100 },
    { id: "babyCribComplex", name: "Baby crib complex", note: "Complex crib", price: 200 },
    { id: "hourly", name: "Hourly rate", note: "Extra work per hour", price: 45 }
  ],
  custom: [
    { id: "customHourly", name: "Custom hourly rate", note: "Simple lumber work", price: 55 },
    { id: "swingSetSmall", name: "Swing set small", note: "Depends on size", price: 450 },
    { id: "swingSetLarge", name: "Swing set large", note: "Depends on size", price: 700 },
    { id: "gazeboSmall", name: "Gazebo / pergola small", note: "Depends on size", price: 460 },
    { id: "gazeboLarge", name: "Gazebo / pergola large", note: "Depends on size", price: 860 },
    { id: "materialMarkup", name: "Material markup %", note: "Add on top of material cost", price: 20 },
    { id: "pickup", name: "Material pickup", note: "Store pickup and handling", price: 35 }
  ],
  travel: [
    { id: "travel", name: "Gas / miles fee", note: "Within a 50 mile radius", price: 36.25 },
    { id: "stairs", name: "Stairs / heavy item", note: "Extra effort fee", price: 25 },
    { id: "sameDay", name: "Same-day job", note: "Rush fee", price: 30 }
  ]
};

const storageKey = "jose-pricing-v3";
const removedPriceIds = ["minimum", "chandelier"];
const forcedPriceUpdates = {
  travel: 36.25
};
const sectionOnlyIds = {
  assembly: [
    "tvMount",
    "chandelierBasic",
    "chandelierNewLocation",
    "chandelierHighCeiling",
    "chandelierHeavy",
    "ceilingFan",
    "simpleDoorKnobs",
    "codeLock",
    "lockKeyDoorKnob",
    "smartDoorbellLow",
    "smartDoorbellHigh"
  ],
  custom: [],
  travel: []
};
let data = loadData();

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const jobType = document.querySelector("#jobType");
const quantity = document.querySelector("#quantity");
const extraHours = document.querySelector("#extraHours");
const travelFee = document.querySelector("#travelFee");
const quoteTotal = document.querySelector("#quoteTotal");
const quoteBreakdown = document.querySelector("#quoteBreakdown");
const customerMessage = document.querySelector("#customerMessage");
const copyMessage = document.querySelector("#copyMessage");
const resetButton = document.querySelector("#resetButton");
const exportPrices = document.querySelector("#exportPrices");
const importPrices = document.querySelector("#importPrices");
const backupStatus = document.querySelector("#backupStatus");
const pricePaste = document.querySelector("#pricePaste");
const applyPastedPrices = document.querySelector("#applyPastedPrices");
const pasteStatus = document.querySelector("#pasteStatus");

function loadData() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return cleanupData(cloneData(defaultData));

  try {
    return cleanupData(mergeSavedData(JSON.parse(saved)));
  } catch {
    return cleanupData(cloneData(defaultData));
  }
}

function cloneData(source) {
  return JSON.parse(JSON.stringify(source));
}

function cleanupData(source) {
  ["assembly", "custom", "travel"].forEach((section) => {
    source[section] = (source[section] || []).filter((item) => !removedPriceIds.includes(item.id));
  });

  Object.entries(forcedPriceUpdates).forEach(([id, price]) => {
    const item = allItemsFrom(source).find((priceItem) => priceItem.id === id);
    if (item) item.price = price;
  });

  Object.entries(sectionOnlyIds).forEach(([correctSection, ids]) => {
    ids.forEach((id) => {
      ["assembly", "custom", "travel"].forEach((section) => {
        if (section === correctSection) return;
        source[section] = source[section].filter((item) => item.id !== id);
      });
    });
  });

  return source;
}

function allItemsFrom(source) {
  return [...(source.assembly || []), ...(source.custom || []), ...(source.travel || [])];
}

function mergeSavedData(savedData) {
  const nextData = cloneData(defaultData);

  ["assembly", "custom", "travel"].forEach((section) => {
    const savedItems = Array.isArray(savedData[section]) ? savedData[section] : [];

    savedItems.forEach((savedItem) => {
      const existingItem = nextData[section].find((item) => item.id === savedItem.id);
      if (existingItem) {
        existingItem.price = Number(savedItem.price || 0);
      } else {
        nextData[section].push(savedItem);
      }
    });
  });

  return nextData;
}

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(data));
  backupStatus.textContent = "Saved on this device.";
}

function roundPrice(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function allItems() {
  return [...data.assembly, ...data.custom, ...data.travel];
}

function findItem(id) {
  return allItems().find((item) => item.id === id);
}

function cleanName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findItemByName(name) {
  const cleaned = cleanName(name);
  return allItems().find((item) => {
    const itemName = cleanName(item.name);
    return cleaned === itemName || cleaned.includes(itemName) || itemName.includes(cleaned);
  });
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
      <input id="${item.id}" inputmode="decimal" type="number" min="0" step="0.01" value="${item.price}">
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
  const travel = travelFee.checked ? findItem("travel")?.price || 0 : 0;
  const base = (baseItem?.price || 0) * count;
  const extra = hours * hourly;
  const total = roundPrice(base + extra + travel);

  quoteTotal.textContent = money.format(total);
  quoteBreakdown.textContent = `Job: ${money.format(roundPrice(base))} + extra time: ${money.format(roundPrice(extra))} + gas/miles: ${money.format(roundPrice(travel))}`;
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
    data = cleanupData({
      assembly: Array.isArray(imported.assembly) ? imported.assembly : data.assembly,
      custom: Array.isArray(imported.custom) ? imported.custom : data.custom,
      travel: Array.isArray(imported.travel) ? imported.travel : data.travel
    });
    saveData();
    renderAll();
    backupStatus.textContent = "Imported price file.";
  } catch {
    backupStatus.textContent = "That file could not be imported.";
  }

  event.target.value = "";
});

applyPastedPrices.addEventListener("click", () => {
  const lines = pricePaste.value.split(/\r?\n/);
  let updatedCount = 0;

  lines.forEach((line) => {
    const match = line.match(/^(.+?)\s+\$?(\d+(?:\.\d{1,2})?)\s*%?$/);
    if (!match) return;

    const [, rawName, rawPrice] = match;
    const item = findItemByName(rawName);
    if (!item) return;

    item.price = Number(rawPrice);
    updatedCount += 1;
  });

  if (updatedCount === 0) {
    pasteStatus.textContent = "No matching prices found. Try one price per line, like: Bed frame 100";
    return;
  }

  saveData();
  renderAll();
  pasteStatus.textContent = `Updated ${updatedCount} price${updatedCount === 1 ? "" : "s"}.`;
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
