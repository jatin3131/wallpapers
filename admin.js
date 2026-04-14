const select = document.getElementById("categorySelect");
const form = document.getElementById("uploadForm");
const newCatInput = document.getElementById("newCategory");
const descInput = document.getElementById("description");

// LOAD EXISTING CATEGORIES
fetch("/api/data")
  .then(res => res.json())
  .then(data => {
    select.innerHTML = "";

    Object.keys(data).forEach(cat => {
      let opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      select.appendChild(opt);
    });
  });

// SUBMIT FORM
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  let category = newCatInput.value.trim() || select.value;

  formData.set("category", category);

  // ✅ description added
  formData.set("description", descInput.value.trim());

  try {
    const res = await fetch("/upload", {
      method: "POST",
      body: formData
    });

    if (!res.ok) throw new Error("Upload failed");

    alert("Uploaded 🔥");
    form.reset();

  } catch (err) {
    console.error(err);
    alert("Upload failed ❌");
  }
});