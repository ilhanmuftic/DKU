const eventListDiv = document.getElementById('assignments');

r = new Request("/professor/get-assignments")

fetch(r).then(re => {
    re.json().then(assignments => {
        assignments.forEach(assignment => {
            displayAssignment(assignment)

        });
    })
})


function displayAssignment(assignment) {
    const eventCardDiv = createAssignment(assignment)

    eventListDiv.appendChild(eventCardDiv);

    return eventCardDiv
}