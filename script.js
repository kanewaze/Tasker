document.addEventListener("DOMContentLoaded", function () {
    const data = [
        { amount: 7000, issueDate: "15-Aug-2023", dueDate: "16-Aug-2026", interest: 19 },
        { amount: 29000, issueDate: "17-Mar-2025", dueDate: "18-Mar-2028", interest: 26 },
        { amount: 21000, issueDate: "09-Dec-2024", dueDate: "10-Dec-2027", interest: 26 },
        { amount: 20000, issueDate: "14-Oct-2024", dueDate: "15-Oct-2027", interest: 26 },
        { amount: 33000, issueDate: "23-Mar-2024", dueDate: "24-Mar-2027", interest: 26 },
        { amount: 12000, issueDate: "29-Nov-2023", dueDate: "30-Nov-2026", interest: 19 },
        { amount: 13000, issueDate: "27-Dec-2023", dueDate: "28-Dec-2026", interest: 19 },
        { amount: 15000, issueDate: "24-Oct-2023", dueDate: "25-Oct-2026", interest: 19 }
    ];

    const tableBody = document.getElementById("statementBody");
    const totalAmountElem = document.getElementById("totalAmount");
    const sortBySelect = document.getElementById("sortBy");
    const daySortToggle = document.getElementById("daySortToggle");

    function formatDate(dateStr) {
        const [day, month, year] = dateStr.split("-");
        const months = { "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12 };
        return { day: parseInt(day), month: months[month], year: parseInt(year) };
    }

    function sortData() {
        let sortedData = [...data];
        if (daySortToggle.checked) {
            sortedData.sort((a, b) => formatDate(a.dueDate).day - formatDate(b.dueDate).day);
        } else {
            const sortBy = sortBySelect.value;
            if (sortBy === "amount") {
                sortedData.sort((a, b) => a.amount - b.amount);
            } else if (sortBy === "due") {
                sortedData.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            } else {
                sortedData.sort((a, b) => new Date(a.issueDate) - new Date(b.issueDate));
            }
        }
        renderTable(sortedData);
    }

    function renderTable(dataList) {
        tableBody.innerHTML = "";
        let totalAmount = 0;

        dataList.forEach(entry => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${entry.amount}</td>
                <td>${entry.issueDate}</td>
                <td>${entry.dueDate}</td>
                <td>${entry.interest}%</td>
            `;
            totalAmount += entry.amount;
            tableBody.appendChild(row);
        });

        totalAmountElem.textContent = totalAmount.toLocaleString();
    }

    sortBySelect.addEventListener("change", sortData);
    daySortToggle.addEventListener("change", sortData);
    renderTable(data);
});
