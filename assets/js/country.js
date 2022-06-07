const api = axios.create({ baseURL: "https://api.covid19api.com/" });
let myChart = null;

async function getAPIStatusByCountry(country, from, to) {
  let response = "";
  try {
    console.log(`country/${country}?from=${from}&to=${to}`);
    response = await api.get(`country/${country}?from=${from}&to=${to}`);
  } catch (error) {
    console.log(error);
  }
  return response.data;
}

async function getAPICountries() {
  let response = "";
  try {
    response = await api.get("countries");
  } catch (error) {
    console.log(error);
  }
  return response.data;
}

function getCountriesList(list) {
  const result = _.orderBy(list, ["Country"]);

  return result;
}

function getDailyStatusByCountryChart(data, filter) {
  let qtyByday = [];

  switch (filter) {
    case "Deaths":
      for (let i = 1; i < data.length; i++) {
        qtyByday.push(data[i].Deaths - data[i - 1].Deaths);
      }

      break;
    case "Confirmed":
      for (let i = 1; i < data.length; i++) {
        qtyByday.push(data[i].Confirmed - data[i - 1].Confirmed);
      }

      break;
    case "Recovered":
      for (let i = 1; i < data.length; i++) {
        qtyByday.push(data[i].Recovered - data[i - 1].Recovered);
      }

      break;
  }

  let totalValue = qtyByday.reduce((a, b) => a + b) / qtyByday.length;
  let media = Array(qtyByday.length).fill(totalValue);
  console.log(media, totalValue);

  data = data.slice(1, data.length);

  const config = {
    type: "line",
    data: {
      labels: data.map(({ Date }) => Date.substr(0, 10)),
      datasets: [
        {
          label: data[0].Country,
          data: qtyByday,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
        {
          label: "Media",
          data: media,
          fill: false,
          borderColor: "rgb(255, 0, 0)",
          tension: 0.1,
        },
      ],
    },
  };

  return config;
}

async function generateDailyStatusByCountryChart() {
  const selectedCountry = document.getElementById("cmbCountry").value;
  const selectedFilter = document.getElementById("cmbData").value;

  let dateStart = document.getElementById("date_start").value;
  let dateEnd = document.getElementById("date_end").value;

  let newDateStart = new Date(
    dateStart.split("-")[0],
    dateStart.split("-")[1] - 1,
    dateStart.split("-")[2]
  );

  newDateStart.setDate(newDateStart.getDate() - 1);

  let day = newDateStart.getDate();
  let month = newDateStart.getMonth() + 1;
  let year = newDateStart.getFullYear();
  month = month.toString().padStart(2, "0");
  day = day.toString().padStart(2, "0");

  const fullDate = `${year}-${month}-${day}`;

  const data = await getAPIStatusByCountry(selectedCountry, fullDate, dateEnd);

  //Gerar KPIs na tela
  generateKPIsData(data);

  //Grafico de barra Mortes por pais - TOP 10
  const ctxLinhas = document.getElementById("linhas").getContext("2d");
  const barChartData = getDailyStatusByCountryChart(data, selectedFilter);

  if (myChart) myChart.destroy();
  myChart = new Chart(ctxLinhas, barChartData);
}

async function generateKPIsData(data) {
  let kpiconfirmed = document.getElementById("kpiconfirmed");
  let kpideaths = document.getElementById("kpideaths");
  let kpirecovered = document.getElementById("kpirecovered");

  kpiconfirmed.innerHTML = new Intl.NumberFormat("pt-BR").format(
    _.last(data).Confirmed
  );
  kpideaths.innerHTML = new Intl.NumberFormat("pt-BR").format(
    _.last(data).Deaths
  );
  kpirecovered.innerHTML = new Intl.NumberFormat("pt-BR").format(
    _.last(data).Recovered
  );
}

async function loadPage() {
  const btnFiltro = document.getElementById("filtro");
  btnFiltro.onclick = generateDailyStatusByCountryChart;

  const data = await getAPICountries();

  const selectCountries = document.getElementById("cmbCountry");
  const optionList = [];

  for (element of getCountriesList(data)) {
    optionList.push(
      `<option value='${element.Slug}'> ${element.Country} </option>`
    );
  }

  selectCountries.innerHTML = optionList.join();

  //  generateDailyStatusByCountryChart();
}

loadPage();
