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


function createStudent(student){
  const studentDiv = document.createElement('div');
  studentDiv.classList.add('student-all');
  studentDiv.id = student.Id;
  
  const collapsibleDiv = document.createElement('div');
  collapsibleDiv.classList.add('student', 'collapsible');
  collapsibleDiv.textContent = student.Name;
  
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('content');
  contentDiv.style.display = 'none';
  
  const info1Div = document.createElement('div');
  info1Div.classList.add('info1');
  contentDiv.textContent = 'Class: ' + student.Class + '   Hours: ' + student.Hours


  collapsibleDiv.addEventListener("click", function() {
    this.classList.toggle("active");
    if (contentDiv.style.display === "flex") {
      contentDiv.style.display = "none";
    } else {
      contentDiv.style.display = "flex";
    }
  });      

  
  contentDiv.appendChild(info1Div);
  collapsibleDiv.appendChild(contentDiv)
  studentDiv.appendChild(collapsibleDiv);
  
  return studentDiv
}

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
            cell.textContent = assignment[key] || '';
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

