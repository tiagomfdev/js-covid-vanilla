const api = axios.create({ baseURL: "https://api.covid19api.com/" });

async function getAPISummary() {
  let response = "";
  try {
    response = await api.get("summary");
  } catch (error) {
    console.log(error);
  }
  return response.data;
}

function getTotals({ TotalConfirmed, TotalDeaths, TotalRecovered }) {
  return {
    totalConfirmed: TotalConfirmed,
    totalDeaths: TotalDeaths,
    totalRecovered: TotalRecovered,
  };
}

function getKPIs({ Global }) {
  return getTotals(Global);
}

function getNewCasesPieChart({ totalConfirmed, totalDeaths, totalRecovered }) {
  const myChartData = {
    type: "pie",
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Distribuição de novos casos" },
      },
    },
    data: {
      labels: ["Confirmados", "Recuperados", "Mortes"],
      datasets: [
        {
          data: [totalConfirmed, totalRecovered, totalDeaths],
          backgroundColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
          ],
          borderColor: [
            "rgba(255, 255, 255, 1)",
            "rgba(255, 255, 255, 1)",
            "rgba(255, 255, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
  };

  return myChartData;
}

function getTotalDeathPipeChart({ Countries }) {
  let result = _.orderBy(Countries, ["TotalDeaths"], ["desc"]);
  result = _.slice(result, 0, 10);

  const countriesList = result.map(({ Country }) => Country);
  const totalDeathsList = result.map(({ TotalDeaths }) => TotalDeaths);

  const myChartData = {
    type: "bar",
    data: {
      labels: countriesList,
      datasets: [
        {
          label: "Total de Mortes por país - Top 10",
          data: totalDeathsList,
          backgroundColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(54, 162, 235, 1)",
          ],
          borderColor: [
            "rgb(255, 255, 255)",
            "rgb(255, 255, 255)",
            "rgb(255, 255, 255)",
            "rgb(255, 255, 255)",
            "rgb(255, 255, 255)",
            "rgb(255, 255, 255)",
            "rgb(255, 255, 255)",
            "rgb(255, 255, 255)",
            "rgb(255, 255, 255)",
            "rgb(255, 255, 255)",
          ],
          borderWidth: 1,
        },
      ],
    },

    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  return myChartData;
}

async function loadPage() {
  //chamando api para pegar os dados
  const data = await getAPISummary();

  //KPIs dados e preenchendo a tela
  const kpi = getKPIs(data);
  const confirmed = document.getElementById("confirmed");
  const recovered = document.getElementById("recovered");
  const death = document.getElementById("death");

  confirmed.innerHTML = new Intl.NumberFormat("pt-BR").format(
    kpi.totalConfirmed
  );
  recovered.innerHTML = new Intl.NumberFormat("pt-BR").format(
    kpi.totalRecovered
  );
  death.innerHTML = new Intl.NumberFormat("pt-BR").format(kpi.totalDeaths);

  //Grafico de pizza novos casos
  const ctxPizza = document.getElementById("pizza").getContext("2d");
  const pieChartData = getNewCasesPieChart(kpi);
  new Chart(ctxPizza, pieChartData);

  //Grafico de barra Mortes por pais - TOP 10
  const ctxBarras = document.getElementById("barras").getContext("2d");
  const barChartData = getTotalDeathPipeChart(data);
  new Chart(ctxBarras, barChartData);
}

loadPage();
