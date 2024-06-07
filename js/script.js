document.addEventListener("DOMContentLoaded", function(){

    loadDataJSON();

    let labelsMonth = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    let dataSales = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0];
    let labelsTime = ["Breakfast Time", "Lunch Time", "Dinner Time"];
    let labelsPizza = [
      "The Thai Chicken Pizza",
      "The Barbecue Chicken Pizza",
      "The California Chicken Pizza",
    ];

    // Chart Sales Config
    const ctxSales = document.getElementById("salesChart").getContext("2d");

    const salesChart = new Chart(ctxSales, {
      type: "bar",
      data: {
        labels: labelsMonth,
        datasets: [
          {
            label: "Sales",
            data: dataSales,
            backgroundColor: "rgba(54, 162, 235, 1)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return "$" + value;
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });

    // chart timeTaggingChart

    const ctxTimeTagging = document
      .getElementById("timeTaggingChart")
      .getContext("2d");
    const timeTaggingChart = new Chart(ctxTimeTagging, {
      type: "doughnut",
      data: {
        labels: labelsTime,
        datasets: [
          {
            data: [0, 0, 0],
            backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
            hoverBackgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
          },
        },
      },
    });

    // Chart Best Tagging
    const ctxBestTagging = document
      .getElementById("bestTaggingChart")
      .getContext("2d");
    const bestTaggingChart = new Chart(ctxBestTagging, {
      type: "bar",
      data: {
        labels: labelsPizza,
        datasets: [
          {
            label: "Tagging",
            data: [0, 0, 0],
            backgroundColor: ["#CE93D8", "#FFEB3B", "#FFCDD2"],
            borderColor: ["#CE93D8", "#FFEB3B", "#FFCDD2"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y", // Set the index axis to 'y' for horizontal bar chart
        responsive: true,
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return value.toLocaleString();
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });


    function loadDataJSON() {
      fetch("../data/order_list.json")
        .then((response) => response.json())
        .then((response) => {
          let resultData = response;

          const categorySelected = document.getElementById("category").value;
        //   const sizeSelected = document.getElementById("size").value;
          const quartalSelected = document.getElementById("quartal").value;

          if (
            categorySelected != "all" &&
            quartalSelected != "all_quartal"
          ) {
            const dataFilterByCategory = resultData.filter(
              (item) =>
                item.category == categorySelected &&
                item.kuartal == quartalSelected
            );

            resultData = dataFilterByCategory;
          } else if (categorySelected == "all" && quartalSelected != "all_quartal") {
            const dataFilterByCategory = resultData.filter(
              (item) => item.kuartal == quartalSelected
            );

            resultData = dataFilterByCategory;
          } else if (quartalSelected == "all_quartal" && categorySelected != "all") {
            const dataFilterByCategory = response.filter(
              (item) => item.category == categorySelected
            );

            resultData = dataFilterByCategory;
            console.log("quartalSelected", quartalSelected);
            console.log("categorySelected", categorySelected != "all");

        }

          // Set data card
          setCardData(resultData);

          // load chart data sales
          loadDataChartSales(resultData);

          // load chart data timetag
          loadDataChartTimeTag(resultData);

          // load chart data timetag
          loadDataChartBestTagging(resultData);

            // Order list table
            orderList(resultData);

        })
        .catch((error) => {
          console.log(error);
          alert("Gagal memuat data!");
        });
    }

    function setCardData(resultData) {
      // get total recueipt
      const totalReceipt = resultData.length;

      // get total sales
      const totalSales = resultData.reduce(
        (acc, itemData) => acc + itemData.total,
        0
      );

      // get total qty
      const totalQty = resultData.reduce(
        (acc, itemData) => acc + itemData.quantity,
        0
      );

      //   get total type pizza

      const totalType = Object.groupBy(
        resultData,
        ({ pizza_type_id }) => pizza_type_id
      );
      const totalCategory = Object.entries(totalType).length;

      //   console.log(resultData);
      //   console.log("totalType", parseToArr);

      // set html el
      document.getElementById("total-receipt").textContent = totalReceipt;

      // set total sales
      document.getElementById("total-sales").textContent =
        currencyFormat(totalSales);

      // set total qty
      document.getElementById("total-qty").textContent = totalQty;

      // set total category
      document.getElementById("total-category").textContent = totalCategory;
    }

    function loadDataChartSales(resultData){

        let newDataChart = [...Array(12).keys()];
        
        labelsMonth.map((item, index) => {
            const month = index+1;
            const filterData = resultData
              .filter((itemData) => itemData.month == month)
              .reduce((acc, curr) => acc+ curr.total, 0);

            newDataChart[index] = filterData;
        });

        // updateDataChart
        salesChart.data.datasets[0].data = newDataChart;
        salesChart.update();

    }

    function loadDataChartTimeTag(resultData) {

      let newDataChart = [...Array(3).keys()];

      labelsTime.map((item, index) => {

        const filterData = resultData
          .filter((itemData) => itemData.time_tag == item)
          .reduce((acc, curr) => acc + curr.total, 0);

        newDataChart[index] = filterData;

      });

      // update data chart
      timeTaggingChart.data.datasets[0].data = newDataChart;
      timeTaggingChart.update();
      
    }

    function loadDataChartBestTagging(resultData) {

        let newDataChart = [...Array(3).keys()];

        labelsPizza.map((item, index) => {
            
        const filterData = resultData
          .filter((itemData) => itemData.pizza_name == item)
          .reduce((acc, curr) => acc + curr.total, 0);

        newDataChart[index] = filterData;

        });

        // update data chart
        bestTaggingChart.data.datasets[0].data = newDataChart;
        bestTaggingChart.update();
    }

    // Table order list

    function orderList(resultData){

       const table = new DataTable("#order-list", {
         data: resultData,
         columns: [
           { data: "order_id" },
           { data: "date_order" },
           { data: "pizza_name" },
           { data: "price" },
         ],
         responsive: true,
         destroy: true,
         rowReorder: {
            selector: 'td:nth-child(2)'
        }
       });

        // table.destroy();

        table.clear().rows.add(resultData).draw();
            
    }

    function currencyFormat(number) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(number);
    }

    document
      .getElementById("btn-filter")
      .addEventListener("click", function () {
        loadDataJSON();
      });

});