/* Interactive Compare charts, month navigation, and currency-safe summaries. */
(function () {
  "use strict";

  const palette = ["#9b7bff", "#43d7ee", "#638cff", "#ee78b7", "#ff9b67", "#57d6a0", "#efc869", "#58aee8", "#ff7585", "#9eb2d8"];
  const chartInstances = new Map();
  const monthSelect = document.getElementById("comparison-month");
  const canvasWrap = document.getElementById("primary-chart-canvas-wrap");
  const tooltip = document.getElementById("chart-hover-tooltip");
  let monthNames = new Intl.DateTimeFormat(Finova.getLocale(), { month: "long", year: "numeric" });
  let selectedMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let chartMode = "trend";
  let renderSequence = 0;

  function monthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function monthLabel(date) {
    return monthNames.format(date);
  }

  function shiftMonth(date, offset) {
    return new Date(date.getFullYear(), date.getMonth() + offset, 1);
  }

  function inMonth(transaction, month) {
    return typeof transaction.date === "string" && transaction.date.slice(0, 7) === monthKey(month);
  }

  function isCurrentMonth(month) {
    const today = new Date();
    return month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();
  }

  function expensesInMonth(transactions, month) {
    return transactions.filter((item) => item.type === "expense" && inMonth(item, month));
  }

  function placeSummary(transactions) {
    const places = [...new Set(transactions.map((item) => item.place).filter(Boolean))];
    return places.length ? places.join(", ") : "No place recorded";
  }

  function escapeText(text) {
    return Finova.escapeHTML(text);
  }

  function rgba(hex, alpha) {
    const raw = hex.replace("#", "");
    const expanded = raw.length === 3 ? raw.split("").map((part) => part + part).join("") : raw;
    const number = Number.parseInt(expanded, 16);
    return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${alpha})`;
  }

  function getTransactions() {
    return Finova.getTransactions().filter((item) =>
      Number.isFinite(Number(item.amount)) && Number(item.amount) >= 0 && item.currency && item.date);
  }

  function populateMonthSelect(transactions) {
    const firstSaved = transactions.reduce((earliest, item) => {
      const month = new Date(`${item.date.slice(0, 7)}-01T12:00:00`);
      return Number.isNaN(month.getTime()) || month > earliest ? earliest : month;
    }, shiftMonth(new Date(), -23));
    const current = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const options = [];
    for (let month = new Date(firstSaved); month <= current; month = shiftMonth(month, 1)) {
      options.push({ value: monthKey(month), label: monthLabel(month) });
    }
    if (!options.some((option) => option.value === monthKey(selectedMonth))) {
      options.push({ value: monthKey(selectedMonth), label: monthLabel(selectedMonth) });
      options.sort((a, b) => a.value.localeCompare(b.value));
    }
    monthSelect.replaceChildren(...options.map((item) => new Option(item.label, item.value)));
    monthSelect.value = monthKey(selectedMonth);
    document.getElementById("previous-month").disabled = options[0]?.value === monthKey(selectedMonth);
    document.getElementById("next-month").disabled = monthKey(selectedMonth) >= monthKey(current);
  }

  async function convertedRows(transactions, targetCurrency) {
    if (!Array.isArray(transactions) || transactions.length === 0) return [];
    const target = String(targetCurrency || Finova.getPreferredCurrency() || "USD").toUpperCase().trim();
    const currencies = [...new Set(transactions.map((item) => String(item.currency || target).toUpperCase().trim()))];
    const rates = new Map();
    let ratesDate = "";
    try {
      await Promise.all(currencies.map(async (currency) => {
        const result = await Finova.getExchangeRate(currency, target);
        rates.set(currency, result);
        if (result && result.date && result.date > ratesDate) ratesDate = result.date;
      }));
    } catch (error) {
      console.warn("FINOVA could not convert chart values; displaying currency-separated data.", error);
      return null;
    }
    const rows = transactions.map((item) => {
      const code = String(item.currency || target).toUpperCase().trim();
      const rateInfo = rates.get(code) || { rate: 1, date: ratesDate };
      const origAmount = Number(item.amount) || 0;
      return {
        ...item,
        displayAmount: origAmount * (Number(rateInfo.rate) || 1),
        displayCurrency: target
      };
    });
    rows.ratesDate = ratesDate;
    return rows;
  }

  function groupCategories(transactions, rows) {
    const rowById = new Map((rows || []).map((row, index) => [row.id || `${row.date}|${row.title}|${row.amount}|${index}`, row]));
    const result = new Map();
    transactions.forEach((transaction, index) => {
      const row = rowById.get(transaction.id || `${transaction.date}|${transaction.title}|${transaction.amount}|${index}`);
      const currency = row ? row.displayCurrency : transaction.currency;
      const amount = row ? row.displayAmount : Number(transaction.amount);
      const category = transaction.category || "Other";
      const key = `${category}\u0000${currency}`;
      const existing = result.get(key) || { category, currency, amount: 0, count: 0, places: [] };
      existing.amount += amount;
      existing.count += 1;
      if (transaction.place && !existing.places.includes(transaction.place)) existing.places.push(transaction.place);
      result.set(key, existing);
    });
    return [...result.values()].sort((a, b) => b.amount - a.amount);
  }

  function categoryIndex(category, categories) {
    return Math.max(0, categories.indexOf(category));
  }

  function prepareChartStage(mode) {
    chartInstances.forEach((chart) => chart.destroy());
    chartInstances.clear();
    canvasWrap.replaceChildren();
    tooltip.classList.remove("visible");
    const center = document.getElementById("chart-center-label");
    center.classList.toggle("hidden", mode !== "circular" && mode !== "pie");
    center.hidden = (mode === "trend" || mode === "line");
    document.getElementById("chart-comparison-legend").hidden = mode !== "normal";
  }

  function addChartCanvas(id, label) {
    const wrapper = document.createElement("div");
    wrapper.className = "primary-chart-canvas";
    const canvas = document.createElement("canvas");
    canvas.id = id;
    canvas.setAttribute("aria-label", label);
    wrapper.appendChild(canvas);
    canvasWrap.appendChild(wrapper);
    return canvas;
  }

  function addSecondaryCanvas(container, id, label, title) {
    const card = document.createElement("div");
    card.className = "secondary-chart-card";
    if (title) {
      const heading = document.createElement("h3");
      heading.textContent = title;
      card.appendChild(heading);
    }
    const canvas = document.createElement("canvas");
    canvas.id = id;
    canvas.setAttribute("aria-label", label);
    card.appendChild(canvas);
    container.appendChild(card);
    return canvas;
  }

  function showTooltip(context, rows, mode, targetCurrency) {
    const chart = context.chart;
    const model = context.tooltip;
    if (model.opacity === 0 || !model.dataPoints?.length) {
      tooltip.classList.remove("visible");
      return;
    }
    const points = mode === "bar" ? model.dataPoints : model.dataPoints.slice(0, 1);
    const items = points.map((point) => {
      const metadata = point.dataset.tooltipRows?.[point.dataIndex];
      if (!metadata || !point.raw) return "";
      const month = metadata.month || monthLabel(selectedMonth);
      const category = metadata.category || point.label;
      const amount = point.raw;
      const amountCurrency = metadata.currency || point.dataset.currency || targetCurrency;
      const percentage = metadata.percentage == null ? "" : `<small>${metadata.percentage.toFixed(1)}% of ${escapeText(amountCurrency)} expenses</small>`;
      return `<div class="chart-tooltip-entry"><strong>${escapeText(category)}</strong><span>${escapeText(month)}</span><b>${Finova.formatCurrency(amount, amountCurrency)}</b><small>${metadata.count} transaction${metadata.count === 1 ? "" : "s"} · ${escapeText(placeSummary(metadata.transactions || []))}</small>${percentage}</div>`;
    }).filter(Boolean);
    if (!items.length) {
      tooltip.classList.remove("visible");
      return;
    }
    tooltip.innerHTML = items.join('<div class="chart-tooltip-divider"></div>');
    const bounds = chart.canvas.getBoundingClientRect();
    const stageElement = chart.canvas.closest(".primary-chart-stage") || chart.canvas.closest(".chart-panel");
    if (tooltip.parentElement !== stageElement) stageElement.appendChild(tooltip);
    const stage = stageElement.getBoundingClientRect();
    const x = bounds.left - stage.left + model.caretX;
    const y = bounds.top - stage.top + model.caretY;
    tooltip.style.left = `${Math.max(14, Math.min(x + 14, stage.width - 290))}px`;
    tooltip.style.top = `${Math.max(10, Math.min(y - 12, stage.height - 138))}px`;
    tooltip.classList.add("visible");
  }

  const arcGlowPlugin = {
    id: "finovaArcGlow",
    afterDatasetDraw(chart, args) {
      const active = chart.getActiveElements().filter((element) => element.datasetIndex === args.index);
      if (!active.length) return;
      const { ctx } = chart;
      const element = active[0].element;
      ctx.save();
      ctx.shadowColor = "rgba(141, 174, 255, .72)";
      ctx.shadowBlur = 18;
      ctx.strokeStyle = "rgba(255,255,255,.82)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(element.x, element.y, (element.outerRadius + element.innerRadius) / 2, element.startAngle, element.endAngle);
      ctx.stroke();
      ctx.restore();
    }
  };

  const barGlowPlugin = {
    id: "finovaBarGlow",
    afterDatasetDraw(chart, args) {
      const active = chart.getActiveElements().filter((element) => element.datasetIndex === args.index);
      if (!active.length) return;
      const { ctx } = chart;
      const element = active[0].element;
      ctx.save();
      ctx.shadowColor = "rgba(107, 145, 255, .8)";
      ctx.shadowBlur = 14;
      ctx.fillStyle = element.options.backgroundColor;
      ctx.fillRect(element.x - element.width / 2, element.y, element.width, element.base - element.y);
      ctx.restore();
    }
  };

  function chartOptions({ tooltipMode, rows, currency, extraPlugins, scales, animationDuration }) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: animationDuration || 700, easing: "easeOutQuart" },
      interaction: { mode: tooltipMode === "bar" ? "index" : "nearest", intersect: tooltipMode !== "bar" },
      onHover(event, activeElements, chart) {
        chart.canvas.style.cursor = activeElements.length ? "pointer" : "default";
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false, external: (context) => showTooltip(context, rows, tooltipMode, currency) },
        ...(extraPlugins || {})
      },
      ...(scales ? { scales } : {}),
      ...(tooltipMode === "circular" ? { cutout: "70%", radius: "91%", hoverOffset: 12, elements: { arc: { borderWidth: 3, borderColor: "#111a2b", hoverBorderWidth: 3, hoverBorderColor: "#eef3ff" } } } : {})
    };
  }

  const lineGlowPlugin = {
    id: "lineGlow",
    beforeDatasetDraw(chart, args) {
      const { ctx } = chart;
      const meta = args.meta;
      if (meta.type === "line") {
        ctx.save();
        const color = meta.dataset.borderColor;
        ctx.shadowColor = typeof color === "string" ? color : "rgba(124, 101, 246, 0.45)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 2;
      }
    },
    afterDatasetDraw(chart, args) {
      if (args.meta.type === "line") {
        chart.ctx.restore();
      }
    }
  };

  async function drawLineTrend(transactions, targetCurrency, selectedMonthDate) {
    prepareChartStage("trend");
    document.getElementById("primary-chart-eyebrow").textContent = "MONTHLY TREND";
    document.getElementById("primary-chart-title").textContent = "Income vs expenses trend";
    document.getElementById("primary-chart-subtitle").textContent = "Curved cash flow comparison across the 6-month period.";

    const offsets = [5, 4, 3, 2, 1, 0];
    const trendMonths = offsets.map((off) => shiftMonth(selectedMonthDate, -off));
    const labels = trendMonths.map((m) => {
      const formatted = new Intl.DateTimeFormat(Finova.getLocale(), { month: "short", year: "numeric" }).format(m);
      return formatted.replace(" ", " '");
    });

    const incomePoints = [];
    const expensePoints = [];
    let periodIncomeTotal = 0;
    let periodExpenseTotal = 0;

    for (const m of trendMonths) {
      const mTrans = transactions.filter((t) => inMonth(t, m));
      const incList = mTrans.filter((t) => t.type === "income");
      const expList = mTrans.filter((t) => t.type === "expense");

      const incConv = await Finova.convertTransactions(incList, targetCurrency);
      const expConv = await Finova.convertTransactions(expList, targetCurrency);

      const incVal = Number(incConv.value) || 0;
      const expVal = Number(expConv.value) || 0;

      incomePoints.push(incVal);
      expensePoints.push(expVal);
      periodIncomeTotal += incVal;
      periodExpenseTotal += expVal;
    }

    const canvas = addChartCanvas("primary-chart", "Monthly income and expenses line graph");
    const ctx = canvas.getContext("2d");

    // Dynamic gradient fills
    const incomeGrad = ctx.createLinearGradient(0, 20, 0, 300);
    incomeGrad.addColorStop(0, "rgba(124, 101, 246, 0.32)");
    incomeGrad.addColorStop(0.7, "rgba(99, 140, 255, 0.06)");
    incomeGrad.addColorStop(1, "rgba(99, 140, 255, 0)");

    const expenseGrad = ctx.createLinearGradient(0, 20, 0, 300);
    expenseGrad.addColorStop(0, "rgba(56, 189, 248, 0.30)");
    expenseGrad.addColorStop(0.7, "rgba(56, 189, 248, 0.05)");
    expenseGrad.addColorStop(1, "rgba(56, 189, 248, 0)");

    const chart = new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Income",
            data: incomePoints,
            borderColor: "#7c65f6",
            backgroundColor: incomeGrad,
            fill: true,
            tension: 0.38,
            cubicInterpolationMode: "monotone",
            borderWidth: 3,
            pointBackgroundColor: "#eef3ff",
            pointBorderColor: "#7c65f6",
            pointBorderWidth: 2.5,
            pointRadius: 4.5,
            pointHoverRadius: 7.5,
            pointHoverBackgroundColor: "#ffffff",
            pointHoverBorderColor: "#7c65f6",
            pointHoverBorderWidth: 3
          },
          {
            label: "Expenses",
            data: expensePoints,
            borderColor: "#38bdf8",
            backgroundColor: expenseGrad,
            fill: true,
            tension: 0.38,
            cubicInterpolationMode: "monotone",
            borderWidth: 3,
            pointBackgroundColor: "#eef3ff",
            pointBorderColor: "#38bdf8",
            pointBorderWidth: 2.5,
            pointRadius: 4.5,
            pointHoverRadius: 7.5,
            pointHoverBackgroundColor: "#ffffff",
            pointHoverBorderColor: "#38bdf8",
            pointHoverBorderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: "easeOutQuart" },
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: "rgba(10, 16, 32, 0.94)",
            titleColor: "#eef3ff",
            titleFont: { size: 12, weight: "700", family: "Manrope, sans-serif" },
            bodyColor: "#dbe4f5",
            bodyFont: { size: 11, family: "DM Sans, sans-serif" },
            borderColor: "rgba(143, 168, 255, 0.28)",
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              label: (context) => ` ${context.dataset.label}: ${Finova.formatCurrency(context.raw, targetCurrency)}`,
              afterBody: (items) => {
                if (items.length >= 2) {
                  const inc = items[0].raw || 0;
                  const exp = items[1].raw || 0;
                  const diff = inc - exp;
                  return ` Net cash flow: ${diff >= 0 ? "+" : "−"}${Finova.formatCurrency(Math.abs(diff), targetCurrency)}`;
                }
                return "";
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: "#8d9ab2",
              font: { size: 10, family: "DM Sans, sans-serif" }
            },
            border: { display: false }
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(151, 174, 218, 0.08)" },
            ticks: {
              color: "#71809a",
              font: { size: 9, family: "DM Sans, sans-serif" },
              maxTicksLimit: 5,
              callback: (value) => Finova.formatCurrency(value, targetCurrency, { compact: true })
            },
            border: { display: false }
          }
        }
      },
      plugins: [lineGlowPlugin]
    });

    chartInstances.set(canvas.id, chart);

    const firstMonthStr = monthLabel(trendMonths[0]);
    const lastMonthStr = monthLabel(trendMonths[trendMonths.length - 1]);
    document.getElementById("chart-month-badges").innerHTML = `<span class="period-tag">${firstMonthStr} – ${lastMonthStr}</span>`;

    const legend = document.getElementById("primary-chart-legend");
    const netTotal = periodIncomeTotal - periodExpenseTotal;

    legend.innerHTML = `
      <div class="line-graph-legend">
        <div class="line-legend-item">
          <span class="line-legend-badge income-badge"></span>
          <div class="line-legend-info">
            <small>6-MONTH INCOME</small>
            <strong class="income-value">${Finova.formatCurrency(periodIncomeTotal, targetCurrency)}</strong>
          </div>
        </div>
        <div class="line-legend-item">
          <span class="line-legend-badge expense-badge"></span>
          <div class="line-legend-info">
            <small>6-MONTH EXPENSES</small>
            <strong class="expense-value">${Finova.formatCurrency(periodExpenseTotal, targetCurrency)}</strong>
          </div>
        </div>
        <div class="line-legend-item">
          <span class="line-legend-badge net-badge"></span>
          <div class="line-legend-info">
            <small>NET CASH FLOW</small>
            <strong class="${netTotal >= 0 ? "positive-text" : "negative-text"}">${netTotal >= 0 ? "+" : "−"}${Finova.formatCurrency(Math.abs(netTotal), targetCurrency)}</strong>
          </div>
        </div>
      </div>
    `;
  }


  function monthSeries(monthTransactions, categories, displayRows, month) {
    const expenses = monthTransactions.filter((item) => item.type === "expense");
    const incomes = monthTransactions.filter((item) => item.type === "income");
    const displayByTransaction = new Map(displayRows.map((item, index) => [
      item.id || `${item.date}|${item.title}|${item.amount}|${index}`, item
    ]));
    const amountFor = (item, index) => {
      const key = item.id || `${item.date}|${item.title}|${item.amount}|${index}`;
      const row = displayByTransaction.get(key);
      return row && Number.isFinite(row.displayAmount) ? row.displayAmount : Number(item.amount);
    };
    const categoryValues = categories.map((category) => {
      let amount = 0;
      let count = 0;
      const matching = [];
      expenses.forEach((item, index) => {
        if ((item.category || "Other") === category) {
          amount += amountFor(item, monthTransactions.indexOf(item));
          count += 1;
          matching.push(item);
        }
      });
      return { amount, count, transactions: matching, category, month: monthLabel(month) };
    });
    const incomeAmount = incomes.reduce((sum, item) => sum + amountFor(item, monthTransactions.indexOf(item)), 0);
    return {
      data: [...categoryValues.map((item) => item.amount), expenses.reduce((sum, item) => sum + amountFor(item, monthTransactions.indexOf(item)), 0), incomeAmount],
      rows: [...categoryValues,
        { category: "Total expenses", count: expenses.length, transactions: expenses, month: monthLabel(month) },
        { category: "Income", amount: incomeAmount, count: incomes.length, transactions: incomes, month: monthLabel(month) }]
    };
  }

  function drawBarComparison(currentItems, previousItems, currentRows, previousRows, targetCurrency, converted) {
    prepareChartStage("bar");
    document.getElementById("primary-chart-eyebrow").textContent = "MONTHLY COMPARISON";
    document.getElementById("primary-chart-title").textContent = "Current month, in context";
    document.getElementById("primary-chart-subtitle").textContent = "Compare category spending and income with the month before.";
    document.getElementById("current-month-legend").textContent = monthLabel(selectedMonth);
    document.getElementById("previous-month-legend").textContent = monthLabel(shiftMonth(selectedMonth, -1));

    const currentCategories = [...new Set(currentItems.filter((item) => item.type === "expense").map((item) => item.category || "Other"))];
    const previousCategories = [...new Set(previousItems.filter((item) => item.type === "expense").map((item) => item.category || "Other"))];
    const categoryNames = [...new Set([...currentCategories, ...previousCategories])].sort();
    const labels = [...categoryNames, "Total expenses", "Income"];
    const current = monthSeries(currentItems, categoryNames, currentRows, selectedMonth);
    const previousMonth = shiftMonth(selectedMonth, -1);
    const previous = monthSeries(previousItems, categoryNames, previousRows, previousMonth);
    const chartCurrencies = converted
      ? [targetCurrency]
      : [...new Set([...currentItems, ...previousItems].map((item) => item.currency))];

    if (!converted && chartCurrencies.length) {
      chartCurrencies.forEach((currency) => {
        const monthRowsFor = (items, rows) => {
          const rowCurrencyTransactions = items.filter((item) => item.currency === currency);
          const sourceRows = rows.filter((item) => item.currency === currency);
          return monthSeries(rowCurrencyTransactions, categoryNames, sourceRows, selectedMonth);
        };
        const currentCurrency = monthRowsFor(currentItems, currentRows);
        const previousCurrency = monthRowsFor(previousItems, previousRows);
        const labelsForCurrency = [...categoryNames, "Total expenses", "Income"];
        const host = document.createElement("section");
        host.className = "currency-chart-block";
        const heading = document.createElement("h3");
        heading.textContent = `${currency} · ${Finova.currencyInfo(currency).name}`;
        const chartWrap = document.createElement("div");
        chartWrap.className = "currency-chart-canvas";
        const canvas = document.createElement("canvas");
        canvas.setAttribute("aria-label", `${currency} category and income comparison`);
        chartWrap.appendChild(canvas);
        host.append(heading, chartWrap);
        canvasWrap.appendChild(host);
        createBarChart(canvas, labelsForCurrency, currentCurrency, previousCurrency, currency);
      });
      document.getElementById("chart-month-badges").innerHTML =
        `<span class="period-tag">${escapeText(monthLabel(selectedMonth))}</span><span class="period-tag">${escapeText(monthLabel(previousMonth))}</span>`;
      document.getElementById("primary-chart-legend").innerHTML = '<div class="chart-empty">No exchange rates available. Each currency is charted separately, without combining totals.</div>';
      return;
    }

    const canvas = addChartCanvas("primary-chart", "Current and previous month spending by category and income");
    createBarChart(canvas, labels, current, previous, targetCurrency);
    document.getElementById("chart-month-badges").innerHTML =
      `<span class="period-tag">${escapeText(monthLabel(selectedMonth))}</span><span class="period-tag">${escapeText(monthLabel(previousMonth))}</span>`;
    document.getElementById("primary-chart-legend").innerHTML = labels.map((category, index) => {
      const color = category === "Income" ? "#57d6a0" : category === "Total expenses" ? "#b084ff" : palette[index % palette.length];
      return `<span class="bar-category-key"><i style="--category-color:${color}"></i>${escapeText(category)}</span>`;
    }).join("");
  }

  function createBarChart(canvas, labels, current, previous, currency) {
    const currentColors = labels.map((label, index) => label === "Income" ? "#57d6a0" : label === "Total expenses" ? "#b084ff" : palette[index % palette.length]);
    const previousColors = currentColors.map((color) => rgba(color, 0.42));
    const datasets = [
      {
        label: monthLabel(selectedMonth),
        currency,
        data: current.data,
        tooltipRows: current.rows,
        backgroundColor: currentColors,
        hoverBackgroundColor: currentColors.map((color) => rgba(color, 0.98)),
        borderColor: currentColors,
        hoverBorderColor: "#f4f7ff",
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 38,
        categoryPercentage: 0.72,
        barPercentage: 0.84
      },
      {
        label: monthLabel(shiftMonth(selectedMonth, -1)),
        currency,
        data: previous.data,
        tooltipRows: previous.rows,
        backgroundColor: previousColors,
        hoverBackgroundColor: currentColors.map((color) => rgba(color, 0.72)),
        borderColor: previousColors,
        hoverBorderColor: currentColors,
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 38,
        categoryPercentage: 0.72,
        barPercentage: 0.84
      }
    ];
    const chart = new Chart(canvas, {
      type: "bar",
      data: { labels, datasets },
      options: chartOptions({
        tooltipMode: "bar",
        currency,
        animationDuration: 700,
        scales: {
          x: { grid: { display: false }, ticks: { color: "#a6b3ca", font: { size: 9 }, maxRotation: 0, autoSkip: false }, border: { display: false } },
          y: { beginAtZero: true, grid: { color: "rgba(151,174,218,.08)" }, ticks: { color: "#7888a1", font: { size: 8 }, maxTicksLimit: 5, callback: (value) => Finova.formatCurrency(value, currency, { compact: true }) }, border: { display: false } }
        }
      }),
      plugins: [barGlowPlugin]
    });
    chartInstances.set(canvas.id || `currency-${currency}-${chartInstances.size}`, chart);
  }

  async function drawWeeklyAndMonthlyCharts(transactions, targetCurrency, sequence) {
    const weeklyContainer = document.getElementById("weekly-chart-container");
    const monthlyContainer = document.getElementById("monthly-chart-container");
    weeklyContainer.replaceChildren();
    monthlyContainer.replaceChildren();
    weeklyContainer.classList.remove("secondary-chart-groups");
    monthlyContainer.classList.remove("secondary-chart-groups");

    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
    const weekCount = Math.ceil((monthStart.getDay() + daysInMonth) / 7);
    const weekLabels = Array.from({ length: weekCount }, (_, index) => `Week ${index + 1}`);
    const weeklyItems = expensesInMonth(transactions, selectedMonth);
    const currencyCodes = [...new Set(weeklyItems.map((item) => item.currency))];
    const weeklyConverted = await convertedRows(weeklyItems, targetCurrency);
    if (sequence !== renderSequence) return;
    if (weeklyConverted) {
      const weeklyCanvas = addSecondaryCanvas(weeklyContainer, "weekly-chart", "Weekly expenses comparison");
      const weeklyPoints = weekLabels.map((_, weekIndex) => {
        const matching = weeklyItems.filter((original) => {
          const transactionDate = new Date(`${original.date}T12:00:00`);
          return Math.floor((transactionDate.getDate() - 1 + monthStart.getDay()) / 7) === weekIndex;
        });
        const matchingIndexes = matching.map((original) => weeklyItems.indexOf(original));
        return {
          amount: matchingIndexes.reduce((sum, index) => sum + weeklyConverted[index].displayAmount, 0),
          count: matching.length,
          transactions: matching,
          category: weekLabels[weekIndex],
          month: monthLabel(selectedMonth)
        };
      });
      const weeklyAmounts = weekLabels.map((_, weekIndex) => weeklyPoints[weekIndex].amount);
      const chart = new Chart(weeklyCanvas, {
        type: "bar",
        data: { labels: weekLabels, datasets: [{ label: targetCurrency, currency: targetCurrency, data: weeklyAmounts, tooltipRows: weeklyPoints, backgroundColor: "#638cff", borderRadius: 5, maxBarThickness: 32 }] },
        options: chartOptions({ tooltipMode: "bar", currency: targetCurrency, scales: { x: { grid: { display: false }, ticks: { color: "#8492aa", font: { size: 9 } }, border: { display: false } }, y: { beginAtZero: true, grid: { color: "rgba(151,174,218,.08)" }, ticks: { color: "#71809a", font: { size: 8 }, maxTicksLimit: 5, callback: (value) => Finova.formatCurrency(value, targetCurrency, { compact: true }) }, border: { display: false } } } })
      });
      chartInstances.set(weeklyCanvas.id, chart);
    } else {
      weeklyContainer.classList.add("secondary-chart-groups");
      currencyCodes.forEach((currency, index) => {
        const currencyItems = weeklyItems.filter((item) => item.currency === currency);
        const dataset = {
          label: currency,
          currency,
          data: weekLabels.map((_, weekIndex) => currencyItems.reduce((sum, item) => {
            const date = new Date(`${item.date}T12:00:00`);
            return Math.floor((date.getDate() - 1 + monthStart.getDay()) / 7) === weekIndex ? sum + Number(item.amount) : sum;
          }, 0)),
          backgroundColor: palette[index % palette.length],
          borderRadius: 5,
          maxBarThickness: 32
        };
        dataset.tooltipRows = weekLabels.map((label, weekIndex) => {
          const matching = weeklyItems.filter((item) => {
            const date = new Date(`${item.date}T12:00:00`);
            return item.currency === dataset.currency && Math.floor((date.getDate() - 1 + monthStart.getDay()) / 7) === weekIndex;
          });
          return { category: label, month: monthLabel(selectedMonth), count: matching.length, transactions: matching };
        });
        const canvas = addSecondaryCanvas(weeklyContainer, `weekly-${currency}`, `${currency} weekly expenses`, currency);
        const chart = new Chart(canvas, {
          type: "bar",
          data: { labels: weekLabels, datasets: [dataset] },
          options: chartOptions({ tooltipMode: "bar", currency, scales: { x: { grid: { display: false }, ticks: { color: "#8492aa", font: { size: 9 } }, border: { display: false } }, y: { beginAtZero: true, grid: { color: "rgba(151,174,218,.08)" }, ticks: { color: "#71809a", font: { size: 8 }, maxTicksLimit: 5, callback: (value) => Finova.formatCurrency(value, currency, { compact: true }) }, border: { display: false } } } })
        });
        chartInstances.set(canvas.id, chart);
      });
    }

    const trendMonths = Array.from({ length: 6 }, (_, index) => shiftMonth(selectedMonth, index - 5));
    const trendLabels = trendMonths.map((month) => new Intl.DateTimeFormat(Finova.getLocale(), { month: "short", year: "2-digit" }).format(month));
    const trendTransactions = transactions.filter((item) => trendMonths.some((month) => inMonth(item, month)));
    const trendConverted = await convertedRows(trendTransactions, targetCurrency);
    if (sequence !== renderSequence) return;
    let trendData;
    if (trendConverted) {
      const datasets = ["income", "expense"].map((type, typeIndex) => ({
          label: type === "income" ? "Income" : "Expenses",
          currency: targetCurrency,
          data: trendMonths.map((month) => trendConverted.reduce((sum, row, index) =>
            trendTransactions[index].type === type && inMonth(trendTransactions[index], month) ? sum + row.displayAmount : sum, 0)),
          tooltipRows: trendMonths.map((month) => {
          const matching = trendTransactions.filter((item) => item.type === type && inMonth(item, month));
          const indexes = matching.map((item) => trendTransactions.indexOf(item));
          return { category: type === "income" ? "Income" : "Expenses", month: monthLabel(month), count: matching.length, transactions: matching,
            amount: indexes.reduce((sum, index) => sum + trendConverted[index].displayAmount, 0) };
          }),
          backgroundColor: typeIndex ? "rgba(125,140,255,.76)" : "rgba(87,214,160,.76)",
          borderRadius: 5,
          maxBarThickness: 26
        }));
      trendData = { labels: trendLabels, datasets };
    } else {
      const trendCurrencies = [...new Set(trendTransactions.map((item) => item.currency))];
      monthlyContainer.classList.add("secondary-chart-groups");
      trendCurrencies.forEach((currency, currencyIndex) => {
        const datasets = ["income", "expense"].map((type) => ({
          label: type === "income" ? "Income" : "Expenses",
          currency,
          data: trendMonths.map((month) => trendTransactions.reduce((sum, item) =>
            item.currency === currency && item.type === type && inMonth(item, month) ? sum + Number(item.amount) : sum, 0)),
          tooltipRows: trendMonths.map((month) => {
            const matching = trendTransactions.filter((item) => item.currency === currency && item.type === type && inMonth(item, month));
            return { category: type === "income" ? "Income" : "Expenses", month: monthLabel(month), count: matching.length, transactions: matching };
          }),
          backgroundColor: type === "income" ? rgba(palette[currencyIndex % palette.length], 0.8) : rgba(palette[currencyIndex % palette.length], 0.45),
          borderRadius: 4,
          maxBarThickness: 26
        }));
        const canvas = addSecondaryCanvas(monthlyContainer, `trend-${currency}`, `${currency} monthly income and expenses`, currency);
        const currencyChart = new Chart(canvas, {
          type: "bar",
          data: { labels: trendLabels, datasets },
          options: chartOptions({ tooltipMode: "bar", scales: { x: { grid: { display: false }, ticks: { color: "#8492aa", font: { size: 9 } }, border: { display: false } }, y: { beginAtZero: true, grid: { color: "rgba(151,174,218,.08)" }, ticks: { color: "#71809a", font: { size: 8 }, maxTicksLimit: 5, callback: (value) => Finova.formatCurrency(value, currency, { compact: true }) }, border: { display: false } } } })
        });
        chartInstances.set(canvas.id, currencyChart);
      });
    }
    if (trendConverted) {
      const monthlyCanvas = addSecondaryCanvas(monthlyContainer, "monthly-chart", "Monthly income and expense comparison");
      const monthlyChart = new Chart(monthlyCanvas, {
        type: "bar",
        data: trendData,
        options: chartOptions({ tooltipMode: "bar", scales: { x: { grid: { display: false }, ticks: { color: "#8492aa", font: { size: 9 } }, border: { display: false } }, y: { beginAtZero: true, grid: { color: "rgba(151,174,218,.08)" }, ticks: { color: "#71809a", font: { size: 8 }, maxTicksLimit: 5, callback: (value) => Finova.formatCurrency(value, targetCurrency, { compact: true }) }, border: { display: false } } } })
      });
      chartInstances.set(monthlyCanvas.id, monthlyChart);
    }
    document.getElementById("weekly-title").textContent = `Spending by week`;
    document.getElementById("weekly-period").textContent = monthLabel(selectedMonth);
    document.getElementById("monthly-period").textContent = `${monthLabel(trendMonths[0])} – ${monthLabel(selectedMonth)}`;
  }

  async function renderCompare() {
    const sequence = ++renderSequence;
    const transactions = getTransactions();
    populateMonthSelect(transactions);
    const preferred = Finova.getPreferredCurrency();
    const previousMonth = shiftMonth(selectedMonth, -1);
    const currentItems = transactions.filter((item) => inMonth(item, selectedMonth));
    const previousItems = transactions.filter((item) => inMonth(item, previousMonth));
    const currentExpenses = expensesInMonth(transactions, selectedMonth);
    const previousExpenses = expensesInMonth(transactions, previousMonth);
    const [currentConverted, previousConverted, currentAllConverted, previousAllConverted] = await Promise.all([
      convertedRows(currentExpenses, preferred),
      convertedRows(previousExpenses, preferred),
      convertedRows(currentItems, preferred),
      convertedRows(previousItems, preferred)
    ]);
    if (sequence !== renderSequence) return;

    const currentSum = currentConverted
      ? currentConverted.reduce((sum, item) => sum + item.displayAmount, 0)
      : currentExpenses.reduce((groups, item) => {
        groups[item.currency] = (groups[item.currency] || 0) + Number(item.amount);
        return groups;
      }, {});
    const previousSum = previousConverted
      ? previousConverted.reduce((sum, item) => sum + item.displayAmount, 0)
      : previousExpenses.reduce((groups, item) => {
        groups[item.currency] = (groups[item.currency] || 0) + Number(item.amount);
        return groups;
      }, {});
    const currentTotal = currentConverted ? currentSum : null;
    const previousTotal = previousConverted ? previousSum : null;
    const comparable = currentConverted && previousConverted;
    document.getElementById("comparison-heading").textContent = `${monthLabel(selectedMonth).toUpperCase()} VS PREVIOUS`;
    document.getElementById("average-period").textContent = isCurrentMonth(selectedMonth) ? "this month" : "per day";
    document.getElementById("top-category-caption").textContent = `Highest expense category in ${monthLabel(selectedMonth)}`;
    const changeNode = document.getElementById("month-change");
    const caption = document.getElementById("month-change-caption");
    const detail = document.getElementById("month-compare-detail");
    if (comparable && previousTotal > 0) {
      const percent = (currentTotal - previousTotal) / previousTotal * 100;
      changeNode.textContent = `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`;
      changeNode.className = percent > 0 ? "negative-text" : "positive-text";
      caption.textContent = percent > 0 ? "more than previous month" : percent < 0 ? "less than previous month" : "same as previous month";
      document.getElementById("month-progress").style.width = `${Math.min(Math.abs(percent), 100)}%`;
      detail.textContent = `${Finova.formatCurrency(currentTotal, preferred)} · Previous ${Finova.formatCurrency(previousTotal, preferred)}`;
    } else if (comparable && currentTotal === 0 && previousTotal === 0) {
      changeNode.textContent = "0.0%";
      changeNode.className = "positive-text";
      caption.textContent = "no expenses in either month";
      document.getElementById("month-progress").style.width = "0";
      detail.textContent = `${Finova.formatCurrency(0, preferred)} in both months`;
    } else if (!comparable && !currentExpenses.length && !previousExpenses.length) {
      changeNode.textContent = "0.0%";
      changeNode.className = "positive-text";
      caption.textContent = "no expenses in either month";
      document.getElementById("month-progress").style.width = "0";
      detail.textContent = "No expenses saved for either month.";
    } else {
      changeNode.textContent = "—";
      changeNode.className = "";
      caption.textContent = comparable ? "No previous month data available to compare against" : "Currencies shown separately";
      document.getElementById("month-progress").style.width = "0";
      detail.textContent = comparable
        ? `${Finova.formatCurrency(currentTotal, preferred)} · No previous-month records to compare against`
        : `${monthLabel(selectedMonth)}: ${Finova.groupedText(currentSum, false)} · ${monthLabel(previousMonth)}: ${Finova.groupedText(previousSum, false)}`;
    }

    const daysElapsed = isCurrentMonth(selectedMonth) ? Math.max(new Date().getDate(), 1) : new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
    const dailyNode = document.getElementById("daily-average");
    dailyNode.textContent = comparable
      ? Finova.formatCurrency(currentTotal / daysElapsed, preferred)
      : Finova.groupedText(Object.fromEntries(Object.entries(currentSum).map(([code, amount]) => [code, amount / daysElapsed])), false);

    const categoryRows = groupCategories(currentExpenses, currentConverted);
    const categories = [...new Set(categoryRows.map((item) => item.category))];
    const categoryTotals = new Map();
    categoryRows.forEach((item) => {
      const key = item.category;
      categoryTotals.set(key, (categoryTotals.get(key) || 0) + item.amount);
    });
    const topCategory = categoryRows[0];
    if (comparable) {
      const byName = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1]);
      document.getElementById("top-category").textContent = byName[0]?.[0] || "—";
      const topAmountEl = document.getElementById("top-category-amount");
      if (byName[0]) {
        Finova.animateNumber(topAmountEl, byName[0][1], preferred);
      } else {
        topAmountEl.textContent = "No spending yet";
      }
    } else {
      const sameCurrency = new Set(categoryRows.map((item) => item.currency)).size <= 1;
      document.getElementById("top-category").textContent = sameCurrency ? topCategory?.category || "—" : "Multiple currencies";
      const topAmountEl = document.getElementById("top-category-amount");
      if (sameCurrency && topCategory) {
        Finova.animateNumber(topAmountEl, topCategory.amount, topCategory.currency);
      } else {
        topAmountEl.textContent = categoryRows.length ? "No cross-currency ranking" : "No spending yet";
      }
    }

    if (chartMode === "trend" || chartMode === "line" || chartMode === "circular") {
      await drawLineTrend(transactions, preferred, selectedMonth);
    } else {
      drawBarComparison(currentItems, previousItems, currentAllConverted || currentItems, previousAllConverted || previousItems, preferred, Boolean(currentAllConverted && previousAllConverted));
    }
    document.getElementById("chart-month-badges").setAttribute("aria-label", `${monthLabel(selectedMonth)} compared with ${monthLabel(previousMonth)}`);

    await drawWeeklyAndMonthlyCharts(transactions, preferred, sequence);
    if (sequence !== renderSequence) return;
    const ratesDate = currentAllConverted?.ratesDate || previousAllConverted?.ratesDate
      || currentConverted?.ratesDate || previousConverted?.ratesDate;
    document.getElementById("compare-conversion-note").textContent = !transactions.length
      ? "Add a transaction to bring your personal spending insights to life."
      : comparable
        ? `Estimated conversions to ${preferred}${ratesDate ? ` · rates dated ${ratesDate}` : ""}. Original transaction amounts and currencies are unchanged.`
      : "Exchange rates unavailable. Cross-currency totals are not combined; each currency remains separate in the chart.";
    Finova.applyTranslations();
  }

  document.querySelectorAll("[data-chart-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      chartMode = button.dataset.chartMode;
      document.querySelectorAll("[data-chart-mode]").forEach((option) => {
        const active = option === button;
        option.classList.toggle("active", active);
        option.setAttribute("aria-pressed", String(active));
      });
      renderCompare();
    });
  });
  document.getElementById("previous-month").addEventListener("click", () => {
    selectedMonth = shiftMonth(selectedMonth, -1);
    renderCompare();
  });
  document.getElementById("next-month").addEventListener("click", () => {
    const next = shiftMonth(selectedMonth, 1);
    const current = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    if (next <= current) {
      selectedMonth = next;
      renderCompare();
    }
  });
  monthSelect.addEventListener("change", () => {
    const [year, month] = monthSelect.value.split("-").map(Number);
    selectedMonth = new Date(year, month - 1, 1);
    renderCompare();
  });
  window.addEventListener("finova:data-changed", renderCompare);
  window.addEventListener("finova:currency-changed", renderCompare);
  window.addEventListener("finova:language-changed", () => {
    monthNames = new Intl.DateTimeFormat(Finova.getLocale(), { month: "long", year: "numeric" });
    renderCompare();
  });
  window.FinovaCompare = { renderCompare, drawLineTrend };

  document.addEventListener("DOMContentLoaded", async () => {
    if (await Finova.ready) await renderCompare();
  });
})();
