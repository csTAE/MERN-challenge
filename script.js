// DOM Elements
const monthSelect = document.getElementById('monthSelect');
const searchInput = document.getElementById('searchInput');
const transactionsTable = document.getElementById('transactionsTable');
const statisticsContainer = document.getElementById('statistics');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const barChartCanvas = document.getElementById('barChart').getContext('2d');

// Initial values
let currentPage = 1;
const perPage = 10; // Adjust as per your pagination settings

// Event listeners
monthSelect.addEventListener('change', fetchTransactions);
searchInput.addEventListener('input', fetchTransactions);
prevPageBtn.addEventListener('click', () => changePage(-1));
nextPageBtn.addEventListener('click', () => changePage(1));

// Fetch transactions function
async function fetchTransactions() {
  const selectedMonth = monthSelect.value;
  const searchText = searchInput.value;

  try {
    const response = await fetch(`/api/transactions?month=${selectedMonth}&search=${searchText}`);
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    const data = await response.json();
    displayTransactions(data.transactions);
    displayStatistics(data.statistics);
    displayBarChart(data.barChartData);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Display transactions in table
function displayTransactions(transactions) {
  let tableHtml = '<tr><th>Title</th><th>Description</th><th>Price</th></tr>';
  transactions.forEach(transaction => {
    tableHtml += `<tr>
      <td>${transaction.title}</td>
      <td>${transaction.description}</td>
      <td>${transaction.price}</td>
    </tr>`;
  });
  transactionsTable.innerHTML = tableHtml;
}

// Display statistics
function displayStatistics(statistics) {
  statisticsContainer.innerHTML = `
    <div>Total Sales Amount: ${statistics.totalSaleAmount}</div>
    <div>Total Sold Items: ${statistics.totalSoldItems}</div>
    <div>Total Not Sold Items: ${statistics.totalNotSoldItems}</div>
  `;
}

// Display bar chart
function displayBarChart(barChartData) {
  const { priceRanges, itemCounts } = barChartData;

  new Chart(barChartCanvas, {
    type: 'bar',
    data: {
      labels: priceRanges,
      datasets: [{
        label: 'Number of Items',
        data: itemCounts,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        xAxes: [{
          gridLines: {
            display: false
          },
          ticks: {
            beginAtZero: true
          }
        }],
        yAxes: [{
          gridLines: {
            display: true
          },
          ticks: {
            beginAtZero: true,
            stepSize: 1
          }
        }]
      }
    }
  });
}

// Pagination functions
function changePage(direction) {
  currentPage += direction;
  fetchTransactions();
}
