const studentContainer = document.getElementById('student-container')


r = new Request("/professor/get-students")

fetch(r).then(re=>{re.json().then(data=>{
  /*
  for(student of data){
    studentContainer.append(createStudent(student))
  } */
  console.log(data)
  displayStudentTable(data)
})})


function displayStudentTable(data) {
  const table = document.createElement('table');
  table.cellSpacing = 0
  const headerRow = table.insertRow();
  const headers = ['Name', 'Hours', 'Assignments', 'Date', 'State', ];

  headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
  });

  data.forEach(info => {
      var row = table.insertRow();
      row.classList.add('info')
      row.insertCell().textContent = info.Name
      row.insertCell().textContent = info.Hours

      const keys = ['Name', 'Date', 'State']; 

      if (!info.Assignments || info.Assignments.length === 0) {
        keys.forEach(key => {
          const cell = row.insertCell();
          cell.textContent = ''; // or you can set a default value
        });
      } else {
        info.Assignments.forEach(assignment => {
          assignment['Date'] = formatDate(assignment['Date'])
          keys.forEach(key => {
            const cell = row.insertCell();

            
            if(key=='State' && assignment[key] == 'Pending'){
              const approveButton = document.createElement('button')
              approveButton.innerText = "Approve"
              approveButton.classList.add('state-button')
              approveButton.classList.add('approve')

              approveButton.onclick = () => {approveAssignment(assignment.Id)}

              const denyButton = document.createElement('button')
              denyButton.innerText = "Deny"
              denyButton.classList.add('state-button')
              denyButton.classList.add('deny')

              denyButton.onclick = () => {denyAssignment(assignment.Id)}

              cell.append(approveButton)
              cell.append(denyButton)

            } else cell.textContent = assignment[key] || '';

          });
          row = table.insertRow();
          row.insertCell();
          row.insertCell();
        });
        table.deleteRow(-1);
      }

  });

  document.getElementById('data-table').appendChild(table);
}

function approveAssignment(assignmentId){
  const data = { assignmentId }

    fetch(`/professor/assignment-approve/${assignmentId}`, {
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

function denyAssignment(assignmentId){
  const data = { assignmentId }

    fetch(`/professor/assignment-deny/${assignmentId}`, {
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
