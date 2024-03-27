const eventListDiv = document.getElementById('assignments');
const myEventListDiv = document.getElementById('my-assignments');

const brk = document.createElement('br')
var Assignments


r = new Request("/student/get-my-assignments")

fetch(r).then(re => {
    re.json().then(data => {
        console.log(data)
        data.forEach(assignment => {
            displayMyAssignment(assignment)
        });
    })
})

r = new Request("/student/get-assignments")

fetch(r).then(re => { re.json().then(data => { 
    console.log(data) 
    data.forEach(assignment => {
        displayAssignment(assignment)
    });
}) })


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

function displayAssignment(assignment){
    const eventCardDiv = createAssignment(assignment)

    const joinButton = document.createElement('button');
    joinButton.textContent = 'Join';
    joinButton.classList.add('join-button');
    joinButton.addEventListener('click', () => joinEvent(assignment.id));

    eventCardDiv.appendChild(joinButton);

    eventListDiv.appendChild(eventCardDiv);

    return eventCardDiv
}


function displayMyAssignment(assignment){

    if(!assignment) return;

    const eventCardDiv = createAssignment(assignment)

    const joinButton = document.createElement('button');
    joinButton.textContent = 'View';
    joinButton.classList.add('join-button');
    joinButton.addEventListener('click', () => joinEvent(assignment.Id));

    eventCardDiv.appendChild(joinButton);

    if(assignment.State == "Pending"){
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.classList.add('join-button');
        submitButton.classList.add('submit-button');
        submitButton.addEventListener('click', () => submitEvent(assignment.Id));

        eventCardDiv.appendChild(submitButton);
    }

    myEventListDiv.appendChild(eventCardDiv);

    return eventCardDiv
}
