// Select DOM elements
const container = document.querySelector(".container");
const sign_in_form = document.querySelector(".sign-in-form");

// Prevent form submission
sign_in_form.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = sign_in_form.email.value;
  const password = sign_in_form.password.value;
  const data = { email, password };
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
      } else {
        document.cookie = `authToken=${data.token}; path=/`
        window.location.href = data.url;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    });
});
