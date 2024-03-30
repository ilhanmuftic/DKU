const eventListDiv = document.getElementById('assignments');
const myEventListDiv = document.getElementById('my-assignments');

const brk = document.createElement('br')
var MY_ASSIGNMENTS = []


r = new Request("/student/get-my-assignments")

fetch(r).then(re => {
    re.json().then(data => {
        console.log(data)

    })
})

r = new Request("/student/get-assignments")

fetch(r).then(re => {
    re.json().then(data => {
        console.log(data)

    })
})

Promise.all([
    fetch("/student/get-my-assignments").then(response => response.json()),
    fetch("/student/get-assignments").then(response => response.json())
])
    .then(([myAssignments, allAssignments]) => {
        console.log(myAssignments, allAssignments);
        MY_ASSIGNMENTS = myAssignments
        myAssignments.forEach(assignment => {
            displayMyAssignment(assignment)
        });

        allAssignments.forEach(assignment => {
            displayAssignment(assignment)
        });

    })
    .catch(error => console.error("Error fetching assignments:", error));


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


    return eventCardDiv;

}

function displayAssignment(assignment) {
    const eventCardDiv = createAssignment(assignment)
    console.log(MY_ASSIGNMENTS)
    if (!MY_ASSIGNMENTS.some(ass => ass.Assignment_id == assignment.Id)) {
        const joinButton = document.createElement('button');
        joinButton.textContent = 'Apply';
        joinButton.classList.add('join-button');
        joinButton.addEventListener('click', () => applyAssignment(assignment.Id));

        eventCardDiv.appendChild(joinButton);
    }

    eventListDiv.appendChild(eventCardDiv);

    return eventCardDiv
}


function displayMyAssignment(assignment) {

    if (!assignment) return;

    const eventCardDiv = createAssignment(assignment)

    const joinButton = document.createElement('button');
    joinButton.textContent = 'View';
    joinButton.classList.add('join-button');
    joinButton.addEventListener('click', () => viewEvent(assignment.Id));

    eventCardDiv.appendChild(joinButton);

    if (assignment.State == "In Progress" || assignment.State == "Denied") {
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.classList.add('join-button');
        submitButton.classList.add('submit-button');
        submitButton.addEventListener('click', () => submitAssignment(assignment.Id));

        eventCardDiv.appendChild(submitButton);
    }

    myEventListDiv.appendChild(eventCardDiv);

    return eventCardDiv
}


function applyAssignment(assignmentId) {
    const data = { assignmentId }

    fetch(`/student/assignment-apply/${assignmentId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            if (response.ok) location.reload()
            else alert("An error occurred. Please try again later.");
        }).catch((error) => {
            console.error("Error:", error);
            alert("An error occurred. Please try again later.");
        });

}


function submitAssignment(assignmentId){
    const data = { assignmentId }

    fetch(`/student/assignment-submit/${assignmentId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            if (response.ok) location.reload()
            else alert("An error occurred. Please try again later.");
        }).catch((error) => {
            console.error("Error:", error);
            alert("An error occurred. Please try again later.");
        });
}