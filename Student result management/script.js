const subjectsContainer = document.getElementById("subjectsContainer");
const addSubjectBtn = document.getElementById("addSubjectBtn");
const clearBtn = document.getElementById("clearBtn");
const studentForm = document.getElementById("studentForm");
const resultBody = document.getElementById("resultBody");
const tableHead = document.getElementById("tableHead");
const studentNameInput = document.getElementById("studentName");
const pdfBtn = document.getElementById("downloadPDF");

let subjects = [];
let students = JSON.parse(localStorage.getItem("students")) || [];
let subjectNames = JSON.parse(localStorage.getItem("subjectNames")) || [];

function renderSubjects() {
  subjectsContainer.innerHTML = "";
  subjects.forEach((subject, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <input type="text" value="${subject}" placeholder="Subject Name" oninput="updateSubject(${index}, this.value)" />
      <input type="number" placeholder="Marks" min="0" max="100" />
      <button type="button" onclick="removeSubject(${index})">❌</button>
    `;
    subjectsContainer.appendChild(div);
  });
  updateHeaders();
}

function updateSubject(index, value) {
  if (subjectNames.includes(value) && value !== subjects[index]) return;
  subjects[index] = value;
  subjectNames[index] = value;
  localStorage.setItem("subjectNames", JSON.stringify(subjectNames));
  updateHeaders();
}

function removeSubject(index) {
  subjects.splice(index, 1);
  subjectNames.splice(index, 1);
  localStorage.setItem("subjectNames", JSON.stringify(subjectNames));
  renderSubjects();
}

function updateHeaders() {
  const subjectCols = subjects.map(sub => `<th>${sub}</th>`).join('');
  tableHead.innerHTML = `
    <th>Student Name</th>
    ${subjectCols}
    <th>Total</th>
    <th>Percentage</th>
    <th>Status</th>
    <th>Remarks</th>
    <th>Actions</th>
  `;
}

addSubjectBtn.onclick = () => {
  const name = `Subject ${subjects.length + 1}`;
  if (subjectNames.includes(name)) return;
  subjects.push(name);
  subjectNames.push(name);
  localStorage.setItem("subjectNames", JSON.stringify(subjectNames));
  renderSubjects();
};

studentForm.onsubmit = (e) => {
  e.preventDefault();
  const name = studentNameInput.value.trim();
  if (!name || students.some(s => s.name === name)) return alert("Invalid or duplicate name");

  const inputs = subjectsContainer.querySelectorAll("div");
  let marks = [], total = 0;
  let valid = true;

  inputs.forEach((input, i) => {
    const val = parseInt(input.children[1].value);
    if (isNaN(val) || val < 0 || val > 100) {
      input.children[1].style.border = "2px solid red";
      valid = false;
    } else {
      input.children[1].style.border = "";
      marks.push(val);
      total += val;
    }
  });

  if (!valid) return;

  const percentage = (total / (marks.length * 100)) * 100;
  const status = marks.every(m => m >= 35) ? "Pass" : "Fail";

  const remark = percentage >= 85 ? "Excellent 🎉" :
                 percentage >= 70 ? "Very Good ✅" :
                 percentage >= 50 ? "Good 👍" :
                 percentage >= 35 ? "Needs Improvement ⚠️" :
                 "Fail ❌";

  const student = { name, marks, total, percentage, status, remarks: remark };
  students.push(student);
  localStorage.setItem("students", JSON.stringify(students));
  renderStudents();
  studentNameInput.value = "";
  subjectsContainer.querySelectorAll("input[type=number]").forEach(i => i.value = "");
};

function renderStudents() {
  resultBody.innerHTML = "";
  students.forEach((s, i) => {
    const tr = document.createElement("tr");
    tr.className = s.status.toLowerCase();
    tr.innerHTML = `
      <td>${s.name}</td>
      ${s.marks.map(m => `<td>${m}</td>`).join('')}
      <td>${s.total}</td>
      <td>${s.percentage.toFixed(2)}%</td>
      <td>${s.status}</td>
      <td>${s.remarks}</td>
      <td>
        <button onclick="editStudent(${i})">✏️</button>
        <button onclick="deleteStudent(${i})">🗑</button>
      </td>
    `;
    resultBody.appendChild(tr);
  });
}

function editStudent(index) {
  const stu = students[index];
  studentNameInput.value = stu.name;
  subjectsContainer.querySelectorAll("input[type=number]").forEach((input, i) => {
    input.value = stu.marks[i];
  });
  deleteStudent(index);
}

function deleteStudent(index) {
  students.splice(index, 1);
  localStorage.setItem("students", JSON.stringify(students));
  renderStudents();
}

clearBtn.onclick = () => {
  if (confirm("Are you sure?")) {
    students = [];
    subjects = [];
    subjectNames = [];
    localStorage.clear();
    renderSubjects();
    renderStudents();
  }
};

pdfBtn.onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const headers = [["Name", ...subjects, "Total", "Percentage", "Status", "Remarks"]];
  const data = students.map(s => [
    s.name, ...s.marks, s.total, s.percentage.toFixed(2) + "%", s.status, s.remarks
  ]);
  doc.autoTable({ head: headers, body: data });
  doc.save("Student_Results.pdf");
};

window.onload = () => {
  subjectNames.forEach(s => subjects.push(s));
  renderSubjects();
  renderStudents();
};
