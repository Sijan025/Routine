document.getElementById("add-row").addEventListener("click", () => {
    const table = document.getElementById("routine-table").getElementsByTagName("tbody")[0];
    const newRow = table.insertRow();
    const timeCell = newRow.insertCell(0);
    const activityCell = newRow.insertCell(1);
    const actionCell = newRow.insertCell(2);

    timeCell.contentEditable = "true";
    activityCell.contentEditable = "true";
    actionCell.innerHTML = '<button class="delete-row">Delete</button>';
});

document.getElementById("routine-table").addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-row")) {
        e.target.parentElement.parentElement.remove();
    }
});

document.getElementById("save-routine").addEventListener("click", () => {
    const rows = document.querySelectorAll("#routine-table tbody tr");
    const routine = [];

    rows.forEach(row => {
        const time = row.cells[0].innerText;
        const activity = row.cells[1].innerText;
        routine.push({ time, activity });
    });

    localStorage.setItem("routine", JSON.stringify(routine));
    alert("Routine saved successfully!");
});

window.addEventListener("load", () => {
    const savedRoutine = JSON.parse(localStorage.getItem("routine") || "[]");
    const table = document.getElementById("routine-table").getElementsByTagName("tbody")[0];
    savedRoutine.forEach(item => {
        const newRow = table.insertRow();
        const timeCell = newRow.insertCell(0);
        const activityCell = newRow.insertCell(1);
        const actionCell = newRow.insertCell(2);

        timeCell.contentEditable = "true";
        timeCell.innerText = item.time;
        activityCell.contentEditable = "true";
        activityCell.innerText = item.activity;
        actionCell.innerHTML = '<button class="delete-row">Delete</button>';
    });
});
