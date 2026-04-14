const categoriesEl = document.getElementById("categories");
const grid = document.getElementById("grid");
const search = document.getElementById("search");

let data = {};
let currentCategory = "";
let allImages = [];
let filteredImages = [];

let visibleCount = 0;
const batchSize = 6;

let observer;
const modal = document.getElementById("modal");
const previewImgEl = document.getElementById("previewImg");
const fullImgEl = document.getElementById("fullImg");

const modalCategories = document.getElementById("modalCategories");
const modalGrid = document.getElementById("modalGrid");

const downloadBtn = document.getElementById("downloadBtn");
/* ========================= LOAD DATA ========================= */

let metaData = {};

fetch("/data.json")
  .then(res => res.json())
  .then(res => {
    metaData = res;
  });

fetch("/api/data")
  .then(res => res.json())
  .then(res => {
    data = res;
    categoriesEl.innerHTML = "";

    Object.keys(data).forEach(cat => {
      let btn = document.createElement("div");
      btn.innerHTML = `<span>${cat}</span>`;
      btn.onclick = () => loadCategory(cat);
      categoriesEl.appendChild(btn);
    });

    const keys = Object.keys(data);
    if (keys.length > 0) loadCategory(keys[0]);
  });

/* ========================= LOAD CATEGORY ========================= */
function loadCategory(cat) {
  currentCategory = cat;

  allImages = (data[cat] || []).filter(img => !img.includes("full"));
  filteredImages = [...allImages];
  

  resetAndLoad();
}

/* ========================= RESET ========================= */
function resetAndLoad() {
  grid.innerHTML = "";
  visibleCount = 0;
  

  if (observer) observer.disconnect();

  loadMoreImages();
}

/* ========================= LOAD MORE ========================= */
function loadMoreImages() {
  const next = filteredImages.slice(visibleCount, visibleCount + batchSize);

  next.forEach(img => {
  let el = document.createElement("img"); // ✅ FIRST

  el.src = `/category/${currentCategory}/${img}`;

  // ✅ THEN use it
    el.onclick = () => {
  openModal(img, currentCategory);
};

function openModal(img, category) {
  document.body.style.overflow = "hidden";
  const fullImg = img.replace("preview", "full");
  const fullPath = `/category/${category}/${fullImg}`;

  previewImgEl.src = `/category/${category}/${img}`;
  fullImgEl.src = fullPath;

  // ✅ DOWNLOAD LOGIC
  downloadBtn.onclick = () => {
    startDownloadAnimation();

    const a = document.createElement("a");
    a.href = fullPath;
    a.download = fullImg;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(stopDownloadAnimation, 1500); // stop animation
  };

  modal.classList.remove("hidden");

  loadModalCategories(category);
  loadModalGrid(category);
}



function loadModalCategories(activeCat) {
  modalCategories.innerHTML = "";

  Object.keys(data).forEach(cat => {
    let btn = document.createElement("div");
   btn.innerHTML = `<span>${cat}</span>`;

    if (cat === activeCat) {
      btn.style.background = "rgba(3, 194, 54, 1)";
      // btn.style.color = "yellow"; // highlight
    }

    btn.onclick = () => {
      loadModalGrid(cat);
      loadModalCategories(cat);
    };

    modalCategories.appendChild(btn);
  });
}
function closeModalFunc() {
  modal.classList.add("hidden");
  document.body.style.overflow = "auto"; // ✅ restore
}
function loadModalGrid(category) {
  modalGrid.innerHTML = "";

  const imgs = (data[category] || []).filter(img =>
    img.includes("preview")
  );

  imgs.forEach(img => {
    let el = document.createElement("img");
    el.src = `/category/${category}/${img}`;

    el.onclick = () => {
      openModal(img, category); // reload modal with new image
    };

    modalGrid.appendChild(el);
  });
}
// ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModalFunc();
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModalFunc();
});
    // ❌ MODAL CLICK REMOVED

    grid.appendChild(el);
  });

  visibleCount += next.length;

  if (visibleCount >= filteredImages.length) return;

  observeLast();
}

/* ========================= INFINITE SCROLL ========================= */
function observeLast() {
  const lastImg = grid.lastElementChild;
  if (!lastImg) return;

  observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      observer.disconnect();
      loadMoreImages();
    }
  });

  observer.observe(lastImg);
}

/* ========================= SEARCH ========================= */
const searchBtn = document.getElementById("searchBtn");

function performSearch() {
  const val = search.value.toLowerCase().trim();

  if (!val) {
    filteredImages = [...allImages];
    resetAndLoad();
    return;
  }

  filteredImages = allImages.filter(img => {
    const meta = metaData[img];

    if (!meta) return false;

    const desc = meta.description.toLowerCase();

    return smartMatch(desc, val);
  });

  resetAndLoad();
}
function smartMatch(text, query) {
  const words = query.split(" ");

  return words.every(word => fuzzyMatch(text, word));
}

// ENTER key
search.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    performSearch();
  }
});

// Button click
searchBtn.onclick = performSearch;

function fuzzyMatch(str, query) {
  let i = 0, j = 0;

  while (i < str.length && j < query.length) {
    if (str[i] === query[j]) j++;
    i++;
  }

  return j === query.length;
}

function startDownloadAnimation() {
  downloadBtn.classList.add("loading");
  downloadBtn.innerHTML = "<span>Downloading...</span>";
}

function stopDownloadAnimation() {
  downloadBtn.classList.remove("loading");
  downloadBtn.innerHTML = "<span>Download</span>";
}


/* ========================= DOWNLOAD BTN LOGIC ========================= */


// function openModal(img, category) {
//   const fullImg = img.replace("preview", "full");
//   const fullPath = `/category/${category}/${fullImg}`;

//   previewImgEl.src = `/category/${category}/${img}`;
//   fullImgEl.src = fullPath;

//   downloadBtn.onclick = () => {
//     const a = document.createElement("a");
//     a.href = fullPath;
//     a.download = fullImg;
//     a.click();
//   };

//   modal.classList.remove("hidden");

//   loadModalCategories(category);
//   loadModalGrid(category);
// }