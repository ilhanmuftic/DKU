const assContainer = document.getElementById('all-assignments')
const brk = document.createElement('br')
var Assignments


r = new Request("/student/get-my-assignments")

fetch(r).then(re=>{re.json().then(data=>{
    console.log(data)
    displayAssignments(data)
})})

r = new Request("/student/get-assignments")

fetch(r).then(re=>{re.json().then(data=>{console.log(data)})})


function displayAssignments(assignments) {
    if(!assignments) return;
    const eventListDiv = document.getElementById('my-assignments');
    eventListDiv.classList.add('event-list');

    assignments.forEach(assignment => {
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

        const joinButton = document.createElement('button');
        joinButton.textContent = 'Apply';
        joinButton.classList.add('join-button');
        joinButton.addEventListener('click', () => joinEvent(assignment.id));

        // Appending elements
        eventCardDiv.appendChild(eventNameHeading);
        eventCardDiv.appendChild(eventPlaceParagraph);
        eventCardDiv.appendChild(eventTimeParagraph);
        eventCardDiv.appendChild(eventPeopleParagraph);
        eventCardDiv.appendChild(joinButton);

        eventListDiv.appendChild(eventCardDiv);
    });
    
}
