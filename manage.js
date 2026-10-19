const form = document.getElementById("articleForm");
const articleList = document.getElementById("articleList");
const message = document.getElementById("message");
const saveButton = document.getElementById("saveButton");

let articles = [];
let editingId = null;

// Load the starting articles from the JSON file.
// If the browser already has saved changes, use those instead.
function loadArticles() {
   const savedArticles = localStorage.getItem("popRazzArticles");

   if (savedArticles !== null) {
      articles = JSON.parse(savedArticles);
      displayArticles();
   } else {
      fetch("articles.json")
         .then(response => {
            if (!response.ok) {
               throw new Error("Could not load articles.json");
            }
            return response.json();
         })
         .then(data => {
            articles = data;
            saveArticles();
            displayArticles();
         })
         .catch(() => {
            articles = [];
            displayArticles();
            showMessage(
               "Could not load articles.json. Run the site using a local server.",
               "danger"
            );
         });
   }
}

// Save the current list as JSON in browser storage.
function saveArticles() {
   localStorage.setItem(
      "popRazzArticles",
      JSON.stringify(articles, null, 2)
   );
}

// Display the articles in the table.
function displayArticles() {
   articleList.innerHTML = "";

   for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const row = document.createElement("tr");

      const values = [
         article.id,
         article.title,
         article.category,
         article.format,
         article.value,
         article.details || "N/A"
      ];

      for (let j = 0; j < values.length; j++) {
         const cell = document.createElement("td");
         cell.textContent = values[j];
         row.appendChild(cell);
      }

      const actionCell = document.createElement("td");

      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.className = "btn btn-secondary btn-sm";
      editButton.type = "button";

      editButton.addEventListener("click", function () {
         document.getElementById("articleId").value = article.id;
         document.getElementById("title").value = article.title;
         document.getElementById("category").value = article.category;
         document.getElementById("format").value = article.format;
         document.getElementById("value").value = article.value;
         document.getElementById("details").value = article.details;

         editingId = article.id;
         document.getElementById("articleId").disabled = true;
         saveButton.textContent = "Update Article";
         document.getElementById("cancelButton").hidden = false;

         showMessage("Edit the article and click Update.", "info");
         form.scrollIntoView({ behavior: "smooth" });
      });


      actionCell.appendChild(editButton);

      // Create the Delete button
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.type = "button";
      deleteButton.className = "btn btn-danger btn-sm ms-2";

      // Delete the selected article
      deleteButton.addEventListener("click", function () {
         if (confirm("Are you sure you want to delete this article?")) {
            articles = articles.filter(function (item) {
               return item.id !== article.id;
            });

            saveArticles();
            displayArticles();

            showMessage("Article deleted successfully!", "success");
         }
      });

      actionCell.appendChild(deleteButton);
      row.appendChild(actionCell);
      articleList.appendChild(row);

   }

   // jQuery: apply the current search after rendering.
   $("#searchInput").trigger("input");
}

// Show success, error, or information messages.
function showMessage(text, type) {
   message.textContent = text;
   message.className = "alert alert-" + type + " mb-3";
}

// Add a new article or update an existing article.
form.addEventListener("submit", function (event) {
   event.preventDefault();

   const id = document.getElementById("articleId").value.trim();
   const title = document.getElementById("title").value.trim();
   const category = document.getElementById("category").value;
   const format = document.getElementById("format").value;
   const valueText = document.getElementById("value").value;
   const details = document.getElementById("details").value.trim();
   const value = Number(valueText);

   // Validate required fields.
   if (
      id === "" ||
      title === "" ||
      category === "" ||
      format === "" ||
      valueText === "" ||
      !Number.isFinite(value) ||
      value < 0 ||
      !Number.isInteger(value)
   ) {
      showMessage("Please complete all required fields correctly.", "danger");
      return;
   }

   // Do not allow two articles to have the same ID.
   const duplicate = articles.some(article =>
      article.id.toLowerCase() === id.toLowerCase() &&
      article.id !== editingId
   );

   if (duplicate) {
      showMessage("This Article ID already exists. Use a different ID.", "danger");
      return;
   }

   const newArticle = {
      id: id,
      title: title,
      category: category,
      format: format,
      value: value,
      details: details
   };

   if (editingId === null) {
      articles.push(newArticle);
      showMessage("Article added successfully!", "success");
   } else {
      const index = articles.findIndex(
         article => article.id === editingId
      );

      if (index !== -1) {
         articles[index] = newArticle;
      }

      showMessage("Article updated successfully!", "success");
   }

   saveArticles();
   displayArticles();
   resetForm();
});

// Reset the form after adding or updating.
function resetForm() {
   form.reset();
   editingId = null;
   document.getElementById("articleId").disabled = false;
   saveButton.textContent = "Add Article";
   document.getElementById("cancelButton").hidden = true;
}

document.getElementById("cancelButton").addEventListener("click", function () {
   resetForm();
   showMessage("Update cancelled.", "info");
});

// jQuery: search by title, category, or article ID.
$("#searchInput").on("input", function () {
   const searchText = $(this).val().toLowerCase();

   $("#articleList tr").each(function () {
      const rowText = $(this).text().toLowerCase();

      if (rowText.includes(searchText)) {
         $(this).show();
      } else {
         $(this).hide();
      }
   });
});

// Download the latest data as a JSON file.
document.getElementById("exportButton").addEventListener("click", function () {
   const jsonData = JSON.stringify(articles, null, 2);
   const file = new Blob([jsonData], { type: "application/json" });
   const url = URL.createObjectURL(file);
   const link = document.createElement("a");

   link.href = url;
   link.download = "articles.json";
   link.click();

   URL.revokeObjectURL(url);
   showMessage("Your current articles JSON file was downloaded.", "success");
});

// Start the page.
loadArticles();
