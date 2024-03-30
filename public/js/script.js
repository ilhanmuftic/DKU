const loading = document.getElementById('loading')

function logout() {
    // Delete the JWT cookie
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Redirect to the login page
    window.location.href = "/login";
}

function toggleNavbar() {
    const navbarLinks = document.querySelector('.navbar-links');
    navbarLinks.classList.toggle('disabled');
}

function formatDate(datetime) {
    return new Date(datetime).toLocaleString('en-UK', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function show(element) {
    element.classList.toggle("disabled")
    element.classList.toggle("show")
}

function disable(element) {
    element.classList.toggle("disabled")
}

function fetchData(url) {
    return fetch(url)
        .then(response => response.json())
        .catch(error => console.error('Error fetching data:', error));
}

function delay(t) {
    return new Promise(resolve => setTimeout(resolve, t));
}

async function hideLoading(t) {
    await delay(t)
    disable(loading)
}

function selectAll() {
    x = document.getElementsByTagName('input')
    for (i of x) { i.click() }
}


function displayDataTable(data) {
    const table = document.createElement('table');
    table.cellSpacing = 0
    const headerRow = table.insertRow();
    const headers = ['Name', 'Assignment', 'Date', 'Description', 'Hours'];

    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    data.forEach(info => {
        const row = table.insertRow();
        const keys = ['Name', 'Assignment', 'Date', 'Description', 'Hours']; 

        keys.forEach(key => {
            const cell = row.insertCell(); 
            cell.textContent = info[key] || '';
        })

    });

    document.getElementById('data-table').appendChild(table);
}

function searchCompanies() {
    // Declare variables
    var input, filter, cards, card, h2, i, txtValue;
    input = document.getElementById('searchInput');
    filter = input.value.toUpperCase();
    cards = document.querySelectorAll('.card');
  
    // Loop through all cards, and hide those who don't match the search query
    cards.forEach(card => {
      h2 = card.querySelector('h2');
      txtValue = h2.textContent || h2.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  
function createAssignment(assignment) {
    if (!assignments) return;


    const eventCardDiv = document.createElement('div');
    eventCardDiv.classList.add('event-card');

    const eventNameHeading = document.createElement('h3');
    eventNameHeading.textContent = assignment.Name;

    const eventPlaceParagraph = document.createElement('p');
    eventPlaceParagraph.textContent = formatDate(assignment.Date);

    const eventTimeParagraph = document.createElement('p');
    eventTimeParagraph.textContent = `Hours: ${assignment.Hours}h`;

    const eventPeopleParagraph = document.createElement('p');
    eventPeopleParagraph.textContent = assignment.State;

    eventCardDiv.appendChild(eventNameHeading);
    eventCardDiv.appendChild(eventPlaceParagraph);
    eventCardDiv.appendChild(eventTimeParagraph);
    eventCardDiv.appendChild(eventPeopleParagraph);

    const joinButton = document.createElement('button');
    joinButton.textContent = 'View';
    joinButton.classList.add('join-button');

    const assignmentHref = document.createElement('a')
    assignmentHref.href = `/assignments/${assignment.Assignment_id || assignment.Id}`;
    assignmentHref.append(joinButton)

    eventCardDiv.appendChild(assignmentHref);
    return eventCardDiv;

}