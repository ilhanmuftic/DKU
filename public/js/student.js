const assContainer = document.getElementById('all-assignments')
const brk = document.createElement('br')
var Assignments


r = new Request("/student/get-my-assignments")

fetch(r).then(re=>{re.json().then(data=>{console.log(data)})})

r = new Request("/student/get-assignments")

fetch(r).then(re=>{re.json().then(data=>{console.log(data)})})
