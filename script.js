const form = document.getElementById("subscriberForm");
const message = document.getElementById("message");
const subscriberList = document.getElementById("subscriberList");
const submitButton = form.querySelector('button[type="submit"]');

// Load saved subscribers
let subscribers = JSON.parse(
   localStorage.getItem("subscribers") || "[]"
);

// -1 means we are adding a new subscriber
let editingIndex = -1;

// Display subscribers in the table
function displaySubscribers() {
   subscriberList.innerHTML = "";

   for (let i = 0; i < subscribers.length; i++) {
      const subscriber = subscribers[i];
      const row = document.createElement("tr");

      const nameCell = document.createElement("td");
      nameCell.textContent = subscriber.name;
      row.appendChild(nameCell);

      const ageCell = document.createElement("td");
      ageCell.textContent = subscriber.age;
      row.appendChild(ageCell);

      const emailCell = document.createElement("td");
      emailCell.textContent = subscriber.email;
      row.appendChild(emailCell);

      const addressCell = document.createElement("td");
      addressCell.textContent = subscriber.address;
      row.appendChild(addressCell);

      const phoneCell = document.createElement("td");
      phoneCell.textContent = subscriber.phone || "N/A";
      row.appendChild(phoneCell);

      // Create the Edit button
      const actionCell = document.createElement("td");
      const editButton = document.createElement("button");

      editButton.textContent = "Edit";
      editButton.type = "button";
      editButton.className = "btn btn-secondary btn-sm";

      // Load subscriber information into the form
      editButton.addEventListener("click", function () {
         document.getElementById("fullName").value = subscriber.name;
         document.getElementById("age").value = subscriber.age;
         document.getElementById("email").value = subscriber.email;
         document.getElementById("address").value = subscriber.address;
         document.getElementById("phone").value = subscriber.phone;

         editingIndex = i;
         submitButton.textContent = "UPDATE SUBSCRIBER";

         message.textContent = "Edit the information and click Update.";
         message.className = "alert alert-info mt-3";

         form.scrollIntoView({ behavior: "smooth" });
      });

      actionCell.appendChild(editButton);
      row.appendChild(actionCell);

      subscriberList.appendChild(row);
   }
}

// Handle form submission
form.addEventListener("submit", function (event) {
   event.preventDefault();

   // Get values from the form
   const name = document.getElementById("fullName").value.trim();
   const age = document.getElementById("age").value;
   const email = document.getElementById("email").value.trim();
   const address = document.getElementById("address").value.trim();
   const phone = document.getElementById("phone").value.trim();

   // Validate the required information
   if (
      name === "" ||
      age === "" ||
      Number(age) <= 0 ||
      email === "" ||
      address === ""
   ) {
      message.textContent = "Please enter valid information in all required fields.";
      message.className = "alert alert-danger mt-3";
      return;
   }

   // Create a subscriber object
   const newSubscriber = {
      name: name,
      age: age,
      email: email,
      address: address,
      phone: phone
   };

   // Add or update a subscriber
   if (editingIndex === -1) {
      subscribers.push(newSubscriber);
      message.textContent = "Subscriber added successfully!";
   } else {
      subscribers[editingIndex] = newSubscriber;
      message.textContent = "Subscriber updated successfully!";
   }

   // Save subscriber information as JSON
   localStorage.setItem("subscribers", JSON.stringify(subscribers));

   // Update the table
   displaySubscribers();

   message.className = "alert alert-success mt-3";

   // Reset the form
   form.reset();
   editingIndex = -1;
   submitButton.textContent = "SUBSCRIBE";
});

// Show saved subscribers when the page opens
displaySubscribers();
