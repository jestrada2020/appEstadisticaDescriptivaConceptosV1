// Variables globales
let dataArray = [];
let sortedData = [];
let stats = {};
let frequencyData = [];

function calculateStatistics() {
    const input = document.getElementById('dataInput').value;
    if (!input.trim()) {
        alert('Por favor, ingrese algunos datos.');
        return;
    }
    
    // Procesar datos de entrada
    dataArray = input.split(/[,\s\n]+/)
                     .filter(x => x.trim() !== '')
                     .map(x => parseFloat(x.trim()))
                     .filter(x => !isNaN(x));
    
    if (dataArray.length === 0) {
        alert('No se encontraron datos válidos.');
        return;
    }
    
    sortedData = [...dataArray].sort((a, b) => a - b);
    
    // Realizar cálculos
    calculateBasicStats();
    calculateQuartiles();
    createFrequencyDistribution();
    
    // Mostrar resultados
    displayResults();
    createCharts();
    
    // Actualizar secciones específicas
    updateQuartileTutorial();
    updatePieChartTutorial();
    updateFrequencyComparison();
    updateDispersionMeasures();
    updatePolygonStats();
}

function calculateBasicStats() {
    const n = dataArray.length;
    const min = Math.min(...dataArray);
    const max = Math.max(...dataArray);
    const range = max - min;
    const k = Math.ceil(1 + 3.322 * Math.log10(n));
    
    // Determinar si todos los datos son enteros
    const allIntegers = dataArray.every(x => x === Math.floor(x));
    const amplitude = allIntegers ? Math.ceil(range / k) : Math.round((range / k) * 100) / 100;
    
    // Calcular estadísticas básicas
    const sum = dataArray.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const variance = dataArray.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / mean) * 100;
    
    stats = { n, min, max, range, k, amplitude, mean, variance, stdDev, cv, allIntegers };
}

function calculateQuartiles() {
    const n = sortedData.length;
    
    function getPercentile(data, p) {
        const index = p * (data.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        
        if (lower === upper) return data[lower];
        return data[lower] * (1 - weight) + data[upper] * weight;
    }
    
    const Q1 = getPercentile(sortedData, 0.25);
    const Q2 = getPercentile(sortedData, 0.5);
    const Q3 = getPercentile(sortedData, 0.75);
    const IQR = Q3 - Q1;
    
    // Calcular límites para outliers
    const lowerInnerFence = Q1 - 1.5 * IQR;
    const upperInnerFence = Q3 + 1.5 * IQR;
    const lowerOuterFence = Q1 - 3 * IQR;
    const upperOuterFence = Q3 + 3 * IQR;
    
    // Identificar outliers
    const outliers = {
        moderate: sortedData.filter(x => (x < lowerInnerFence && x >= lowerOuterFence) ||
                                        (x > upperInnerFence && x <= upperOuterFence)),
        extreme: sortedData.filter(x => x < lowerOuterFence || x > upperOuterFence)
    };
    
    stats.quartiles = { Q1, Q2, Q3, IQR, lowerInnerFence, upperInnerFence, lowerOuterFence, upperOuterFence, outliers };
}

function createFrequencyDistribution() {
    const { min, k, amplitude } = stats;
    frequencyData = [];
    
    for (let i = 0; i < k; i++) {
        const lowerBound = min + i * amplitude;
        const upperBound = min + (i + 1) * amplitude;
        const isLast = i === k - 1;
        
        // Contar frecuencia para este intervalo
        const frequency = dataArray.filter(x =>
            isLast ? (x >= lowerBound && x <= upperBound) : (x >= lowerBound && x < upperBound)
        ).length;
        
        const midpoint = (lowerBound + upperBound) / 2;
        
        frequencyData.push({
            interval: isLast ? `[${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}]` :
                               `[${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)})`,
            lowerBound,
            upperBound,
            frequency,
            relativeFreq: frequency / dataArray.length,
            midpoint
        });
    }
    
    // Calcular frecuencias acumuladas
    let cumFreq = 0;
    let cumRelFreq = 0;
    frequencyData.forEach(item => {
        cumFreq += item.frequency;
        cumRelFreq += item.relativeFreq;
        item.cumFreq = cumFreq;
        item.cumRelFreq = cumRelFreq;
    });
}

function displayResults() {
    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) {
        resultsContainer.classList.remove('hidden');
    }
    
    // Estadísticas básicas
    const basicStatsElement = document.getElementById('basicStats');
    if (basicStatsElement) {
        const basicStatsHTML = `
            <div class="bg-blue-50 p-3 rounded"><strong>Tamaño (n):</strong><br>${stats.n}</div>
            <div class="bg-green-50 p-3 rounded"><strong>Mínimo:</strong><br>${stats.min}</div>
            <div class="bg-red-50 p-3 rounded"><strong>Máximo:</strong><br>${stats.max}</div>
            <div class="bg-yellow-50 p-3 rounded"><strong>Rango (R):</strong><br>${stats.range.toFixed(2)}</div>
            <div class="bg-purple-50 p-3 rounded"><strong>Clases (k):</strong><br>${stats.k}</div>
            <div class="bg-indigo-50 p-3 rounded"><strong>Amplitud (a):</strong><br>${stats.amplitude}</div>
            <div class="bg-pink-50 p-3 rounded"><strong>Media:</strong><br>${stats.mean.toFixed(4)}</div>
            <div class="bg-gray-50 p-3 rounded"><strong>Varianza:</strong><br>${stats.variance.toFixed(4)}</div>
            <div class="bg-orange-50 p-3 rounded"><strong>Desv. Estándar:</strong><br>${stats.stdDev.toFixed(4)}</div>
            <div class="bg-teal-50 p-3 rounded"><strong>Coef. Variación:</strong><br>${stats.cv.toFixed(2)}%</div>
        `;
        basicStatsElement.innerHTML = basicStatsHTML;
    }
    
    // Cuartiles
    const quartilesElement = document.getElementById('quartiles');
    if (quartilesElement && stats.quartiles) {
        const { Q1, Q2, Q3, IQR } = stats.quartiles;
        const quartilesHTML = `
            <div>
                <h3 class="font-semibold mb-2 text-blue-700">Cuartiles</h3>
                <div class="space-y-2">
                    <div class="flex justify-between"><span>Q1 (25%):</span><span class="font-mono">${Q1.toFixed(4)}</span></div>
                    <div class="flex justify-between"><span>Q2 (Mediana, 50%):</span><span class="font-mono">${Q2.toFixed(4)}</span></div>
                    <div class="flex justify-between"><span>Q3 (75%):</span><span class="font-mono">${Q3.toFixed(4)}</span></div>
                    <div class="flex justify-between border-t pt-2"><span>RIQ (Q3-Q1):</span><span class="font-mono">${IQR.toFixed(4)}</span></div>
                </div>
            </div>
        `;
        quartilesElement.innerHTML = quartilesHTML;
    }
    
    // Outliers
    const outliersElement = document.getElementById('outliers');
    if (outliersElement && stats.quartiles) {
        const { outliers } = stats.quartiles;
        const totalOutliers = outliers.moderate.length + outliers.extreme.length;
        const outliersHTML = `
            <div>
                <h3 class="font-semibold mb-2 text-red-700">Valores Atípicos</h3>
                <div class="space-y-2">
                    <div class="text-sm text-gray-600">Total encontrados: ${totalOutliers}</div>
                    ${outliers.moderate.length > 0 ?
                        `<div><strong>Moderados (●):</strong><br><span class="text-sm">${outliers.moderate.map(x => x.toFixed(2)).join(', ')}</span></div>` : ''}
                    ${outliers.extreme.length > 0 ?
                        `<div><strong>Extremos (○):</strong><br><span class="text-sm">${outliers.extreme.map(x => x.toFixed(2)).join(', ')}</span></div>` : ''}
                    ${totalOutliers === 0 ? '<div class="text-green-600">No se encontraron valores atípicos</div>' : ''}
                </div>
            </div>
        `;
        outliersElement.innerHTML = outliersHTML;
    }
    
    // Tabla de frecuencias
    const frequencyTableElement = document.getElementById('frequencyTable');
    if (frequencyTableElement) {
        let tableHTML = `
            <thead class="bg-gray-100">
                <tr>
                    <th class="border border-gray-300 px-3 py-2">Intervalo de Clase</th>
                    <th class="border border-gray-300 px-3 py-2">Marca de Clase</th>
                    <th class="border border-gray-300 px-3 py-2">f</th>
                    <th class="border border-gray-300 px-3 py-2">fr</th>
                    <th class="border border-gray-300 px-3 py-2">F</th>
                    <th class="border border-gray-300 px-3 py-2">Fr</th>
                </tr>
            </thead>
            <tbody>
        `;
        
        frequencyData.forEach((item, index) => {
            const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
            tableHTML += `
                <tr class="${rowClass}">
                    <td class="border border-gray-300 px-3 py-2 text-center">${item.interval}</td>
                    <td class="border border-gray-300 px-3 py-2 text-center">${item.midpoint.toFixed(2)}</td>
                    <td class="border border-gray-300 px-3 py-2 text-center">${item.frequency}</td>
                    <td class="border border-gray-300 px-3 py-2 text-center">${item.relativeFreq.toFixed(4)}</td>
                    <td class="border border-gray-300 px-3 py-2 text-center">${item.cumFreq}</td>
                    <td class="border border-gray-300 px-3 py-2 text-center">${item.cumRelFreq.toFixed(4)}</td>
                </tr>
            `;
        });
        
        tableHTML += '</tbody>';
        frequencyTableElement.innerHTML = tableHTML;
    }
}

function createCharts() {
    createHistogram();
    createBoxplot();
    createCombinedChart();
    createOverlappingChart();
    createPolygonCharts();
    createPieChart();
}

function createHistogram() {
    if (typeof Plotly === 'undefined') {
        console.error('Plotly no está disponible');
        return;
    }
    
    const trace = {
        x: dataArray,
        type: 'histogram',
        name: 'Frecuencia',
        marker: {
            color: 'rgba(59, 130, 246, 0.7)',
            line: {
                color: 'rgba(59, 130, 246, 1)',
                width: 2
            }
        }
    };
    
    const layout = {
        title: 'Distribución de Frecuencias',
        xaxis: {
            title: 'Valores'
        },
        yaxis: {
            title: 'Frecuencia'
        },
        showlegend: false,
        height: 400,
        margin: { t: 50, b: 50, l: 50, r: 50 }
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        displaylogo: false
    };
    
    const histogramElement = document.getElementById('histogramChart');
    if (histogramElement) {
        Plotly.newPlot('histogramChart', [trace], layout, config);
    }
}

function createBoxplot() {
    if (typeof Plotly === 'undefined') {
        console.error('Plotly no está disponible');
        return;
    }
    
    const trace = {
        y: dataArray,
        type: 'box',
        name: 'Datos',
        boxpoints: 'outliers',
        marker: {
            color: 'rgba(34, 197, 94, 0.7)',
            outliercolor: 'rgba(255, 127, 14, 0.8)',
            line: {
                outliercolor: 'rgba(255, 127, 14, 1)',
                outlierwidth: 2
            }
        },
        line: {
            color: 'rgba(34, 197, 94, 1)'
        }
    };
    
    const layout = {
        title: 'Gráfico de Caja y Bigotes',
        yaxis: {
            title: 'Valores'
        },
        showlegend: false,
        height: 400,
        margin: { t: 50, b: 50, l: 50, r: 50 }
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        displaylogo: false
    };
    
    const boxplotElement = document.getElementById('boxplotChart');
    if (boxplotElement) {
        Plotly.newPlot('boxplotChart', [trace], layout, config);
    }
}

function createCombinedChart() {
    if (typeof Plotly === 'undefined') {
        console.error('Plotly no está disponible');
        return;
    }
    
    const histogramTrace = {
        x: dataArray,
        type: 'histogram',
        name: 'Frecuencia',
        marker: {
            color: 'rgba(59, 130, 246, 0.5)',
            line: {
                color: 'rgba(59, 130, 246, 1)',
                width: 2
            }
        },
        yaxis: 'y'
    };
    
    const boxplotTrace = {
        y: dataArray,
        type: 'box',
        name: 'Boxplot',
        boxpoints: 'outliers',
        marker: {
            color: 'rgba(34, 197, 94, 0.7)',
            outliercolor: 'rgba(255, 127, 14, 0.8)',
            line: {
                outliercolor: 'rgba(255, 127, 14, 1)',
                outlierwidth: 2
            }
        },
        line: {
            color: 'rgba(34, 197, 94, 1)'
        },
        yaxis: 'y2',
        xaxis: 'x2'
    };
    
    const layout = {
        title: 'Histograma con Gráfico de Caja y Bigotes',
        xaxis: {
            domain: [0, 0.85],
            title: 'Valores'
        },
        yaxis: {
            title: 'Frecuencia'
        },
        xaxis2: {
            domain: [0.85, 1],
            anchor: 'y2'
        },
        yaxis2: {
            anchor: 'x2',
            overlaying: 'y',
            side: 'right',
            title: 'Distribución'
        },
        height: 500,
        margin: { t: 50, b: 50, l: 50, r: 80 },
        showlegend: true
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        displaylogo: false
    };
    
    const combinedElement = document.getElementById('combinedChart');
    if (combinedElement) {
        Plotly.newPlot('combinedChart', [histogramTrace, boxplotTrace], layout, config);
    }
}

function createOverlappingChart() {
    if (typeof Plotly === 'undefined') {
        console.error('Plotly no está disponible');
        return;
    }
    
    const histogramTrace = {
        x: dataArray,
        type: 'histogram',
        name: 'Frecuencia',
        opacity: 0.7,
        marker: {
            color: 'lightgray',
            line: {
                color: 'gray',
                width: 1
            }
        }
    };
    
    const boxplotTrace = {
        x: dataArray,
        type: 'box',
        name: 'Boxplot',
        boxpoints: 'outliers',
        marker: {
            color: 'rgba(255, 0, 0, 0.3)',
            line: {
                color: 'red',
                width: 2
            }
        },
        yaxis: 'y2'
    };
    
    const layout = {
        title: 'Histograma con Boxplot Superpuesto',
        xaxis: {
            title: 'Valores',
            showgrid: true,
            gridcolor: 'lightgray'
        },
        yaxis: {
            title: 'Frecuencia',
            showgrid: true,
            gridcolor: 'lightgray'
        },
        yaxis2: {
            overlaying: 'y',
            side: 'right',
            showgrid: false,
            zeroline: false,
            showticklabels: false
        },
        height: 400,
        margin: { t: 50, b: 50, l: 50, r: 50 },
        showlegend: true,
        legend: {
            x: 0.7,
            y: 0.95
        }
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        displaylogo: false
    };
    
    const overlappingElement = document.getElementById('overlappingChart');
    if (overlappingElement) {
        Plotly.newPlot('overlappingChart', [histogramTrace, boxplotTrace], layout, config);
    }
}

function createPolygonCharts() {
    if (typeof Plotly === 'undefined') {
        console.error('Plotly no está disponible');
        return;
    }
    
    createPolygonRelativeChart();
    createPolygonAbsoluteChart();
    updatePolygonStats();
}

function createPolygonRelativeChart() {
    // Datos para frecuencias relativas acumuladas
    const cumulativeRelativeTrace = {
        x: sortedData,
        y: sortedData.map((_, i) => (i + 1) / sortedData.length),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Frecuencia Relativa Acumulada',
        line: {
            color: 'teal',
            width: 3
        },
        marker: {
            color: 'teal',
            size: 6,
            symbol: 'circle'
        },
        yaxis: 'y'
    };
    
    // Líneas de referencia para cuartiles
    const quartileLines = [];
    if (stats.quartiles) {
        const { Q1, Q2, Q3 } = stats.quartiles;
        
        // Línea Q1 (25%)
        quartileLines.push({
            x: [sortedData[0], sortedData[sortedData.length - 1]],
            y: [0.25, 0.25],
            type: 'scatter',
            mode: 'lines',
            name: 'Q1 (25%)',
            line: { color: 'green', width: 2, dash: 'dash' },
            yaxis: 'y'
        });
        
        // Línea Q2 (50%)
        quartileLines.push({
            x: [sortedData[0], sortedData[sortedData.length - 1]],
            y: [0.50, 0.50],
            type: 'scatter',
            mode: 'lines',
            name: 'Q2 (50%)',
            line: { color: 'orange', width: 2, dash: 'dash' },
            yaxis: 'y'
        });
        
        // Línea Q3 (75%)
        quartileLines.push({
            x: [sortedData[0], sortedData[sortedData.length - 1]],
            y: [0.75, 0.75],
            type: 'scatter',
            mode: 'lines',
            name: 'Q3 (75%)',
            line: { color: 'purple', width: 2, dash: 'dash' },
            yaxis: 'y'
        });
    }
    
    const layout = {
        title: 'Ojiva - Frecuencias Relativas Acumuladas',
        xaxis: {
            title: 'Valores',
            showgrid: true,
            gridcolor: 'lightgray',
            showline: true,
            linewidth: 2,
            linecolor: 'black'
        },
        yaxis: {
            title: 'Frecuencia Relativa Acumulada',
            side: 'left',
            showgrid: true,
            gridcolor: 'lightgray',
            tickfont: { size: 10 },
            showline: true,
            linewidth: 2,
            linecolor: 'black',
            range: [0, 1]
        },
        yaxis2: {
            title: 'Porcentaje (%)',
            side: 'right',
            overlaying: 'y',
            tickvals: [0, 0.25, 0.5, 0.75, 1.0],
            ticktext: ['0%', '25%', '50%', '75%', '100%'],
            tickfont: { size: 10, color: 'blue' },
            titlefont: { color: 'blue' },
            showgrid: false,
            showline: true,
            linewidth: 2,
            linecolor: 'blue',
            range: [0, 1]
        },
        height: 400,
        margin: { t: 50, b: 50, l: 60, r: 80 },
        showlegend: true,
        legend: { x: 0.02, y: 0.98 }
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        displaylogo: false
    };
    
    const traces = [cumulativeRelativeTrace, ...quartileLines];
    
    const polygonRelativeElement = document.getElementById('polygonRelativeChart');
    if (polygonRelativeElement) {
        Plotly.newPlot('polygonRelativeChart', traces, layout, config);
    }
}

function createPolygonAbsoluteChart() {
    const n = sortedData.length;
    
    // Datos para frecuencias absolutas acumuladas
    const cumulativeAbsoluteTrace = {
        x: sortedData,
        y: sortedData.map((_, i) => i + 1),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Frecuencia Absoluta Acumulada',
        line: {
            color: 'darkblue',
            width: 3
        },
        marker: {
            color: 'darkblue',
            size: 6,
            symbol: 'circle'
        },
        yaxis: 'y'
    };
    
    // Líneas de referencia para cuartiles
    const quartileLines = [];
    if (stats.quartiles) {
        // Línea Q1 (25%)
        quartileLines.push({
            x: [sortedData[0], sortedData[sortedData.length - 1]],
            y: [n * 0.25, n * 0.25],
            type: 'scatter',
            mode: 'lines',
            name: 'Q1 (25%)',
            line: { color: 'green', width: 2, dash: 'dash' },
            yaxis: 'y'
        });
        
        // Línea Q2 (50%)
        quartileLines.push({
            x: [sortedData[0], sortedData[sortedData.length - 1]],
            y: [n * 0.50, n * 0.50],
            type: 'scatter',
            mode: 'lines',
            name: 'Q2 (50%)',
            line: { color: 'orange', width: 2, dash: 'dash' },
            yaxis: 'y'
        });
        
        // Línea Q3 (75%)
        quartileLines.push({
            x: [sortedData[0], sortedData[sortedData.length - 1]],
            y: [n * 0.75, n * 0.75],
            type: 'scatter',
            mode: 'lines',
            name: 'Q3 (75%)',
            line: { color: 'purple', width: 2, dash: 'dash' },
            yaxis: 'y'
        });
    }
    
    const layout = {
        title: 'Ojiva - Frecuencias Absolutas Acumuladas',
        xaxis: {
            title: 'Valores',
            showgrid: true,
            gridcolor: 'lightgray',
            showline: true,
            linewidth: 2,
            linecolor: 'black'
        },
        yaxis: {
            title: 'Frecuencia Absoluta Acumulada',
            side: 'left',
            showgrid: true,
            gridcolor: 'lightgray',
            tickfont: { size: 10 },
            showline: true,
            linewidth: 2,
            linecolor: 'black',
            range: [0, n]
        },
        yaxis2: {
            title: 'Porcentaje (%)',
            side: 'right',
            overlaying: 'y',
            tickvals: [0, n * 0.25, n * 0.5, n * 0.75, n],
            ticktext: ['0%', '25%', '50%', '75%', '100%'],
            tickfont: { size: 10, color: 'blue' },
            titlefont: { color: 'blue' },
            showgrid: false,
            showline: true,
            linewidth: 2,
            linecolor: 'blue',
            range: [0, n]
        },
        height: 400,
        margin: { t: 50, b: 50, l: 60, r: 80 },
        showlegend: true,
        legend: { x: 0.02, y: 0.98 }
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        displaylogo: false
    };
    
    const traces = [cumulativeAbsoluteTrace, ...quartileLines];
    
    const polygonAbsoluteElement = document.getElementById('polygonAbsoluteChart');
    if (polygonAbsoluteElement) {
        Plotly.newPlot('polygonAbsoluteChart', traces, layout, config);
    }
}

function updatePolygonStats() {
    const n = dataArray.length;
    
    // Actualizar estadísticas mostradas
    const polygonTotalN = document.getElementById('polygon-total-n');
    if (polygonTotalN) polygonTotalN.textContent = n;
    
    if (stats.quartiles) {
        const { Q1, Q2, Q3 } = stats.quartiles;
        
        const polygonQ1 = document.getElementById('polygon-q1');
        if (polygonQ1) polygonQ1.textContent = Q1.toFixed(2);
        
        const polygonQ2 = document.getElementById('polygon-q2');
        if (polygonQ2) polygonQ2.textContent = Q2.toFixed(2);
        
        const polygonQ3 = document.getElementById('polygon-q3');
        if (polygonQ3) polygonQ3.textContent = Q3.toFixed(2);
    }
}

function createPieChart() {
    if (typeof Plotly === 'undefined') {
        console.error('Plotly no está disponible');
        return;
    }
    
    const trace = {
        labels: frequencyData.map(item => item.interval),
        values: frequencyData.map(item => item.frequency),
        type: 'pie',
        textinfo: 'label+percent+value',
        textposition: 'auto',
        hovertemplate: '<b>%{label}</b><br>' +
                     'Frecuencia: %{value}<br>' +
                     'Porcentaje: %{percent}<br>' +
                     '<extra></extra>',
        marker: {
            colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'],
            line: {
                color: '#FFFFFF',
                width: 2
            }
        }
    };
    
    const layout = {
        title: 'Distribución de Frecuencias - Gráfico de Torta',
        height: 500,
        margin: { t: 50, b: 50, l: 50, r: 50 },
        showlegend: true,
        legend: {
            orientation: 'v',
            x: 1.02,
            y: 0.5
        },
        font: {
            size: 12
        }
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'zoom2d'],
        displaylogo: false
    };
    
    const pieElement = document.getElementById('pieChart');
    if (pieElement) {
        Plotly.newPlot('pieChart', [trace], layout, config);
    }
}

function updatePieChartTutorial() {
    const n = dataArray.length;
    const degreesPerUnit = 360 / n;
    
    // Actualizar datos mostrados
    const pieDataDisplay = document.getElementById('pie-data-display');
    if (pieDataDisplay) {
        pieDataDisplay.innerHTML = sortedData.join(', ');
    }
    
    const pieTotalN = document.getElementById('pie-total-n');
    if (pieTotalN) {
        pieTotalN.textContent = n;
    }
    
    const pieDegreesPerUnit = document.getElementById('pie-degrees-per-unit');
    if (pieDegreesPerUnit) {
        pieDegreesPerUnit.textContent = degreesPerUnit.toFixed(2);
    }
    
    // Calcular y mostrar cálculos paso a paso
    let calculationsHTML = '';
    let tableHTML = '';
    let totalAngle = 0;
    const frequencies = frequencyData.map(item => item.frequency);
    
    frequencyData.forEach((item, index) => {
        const angle = (360 / n) * item.frequency;
        const percentage = (item.frequency / n) * 100;
        totalAngle += angle;
        
        calculationsHTML += `
            <div class="bg-white p-3 rounded border">
                <div class="font-semibold text-gray-800">α${index + 1} (${item.interval}):</div>
                <div class="font-mono text-lg">
                    α${index + 1} = <span class="text-blue-600">(360° / ${n})</span> × ${item.frequency} = <span class="text-green-600">${angle.toFixed(1)}°</span>
                </div>
            </div>
        `;
        
        const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        tableHTML += `
            <tr class="${rowClass}">
                <td class="border border-gray-300 px-3 py-2 text-center">${item.interval}</td>
                <td class="border border-gray-300 px-3 py-2 text-center">${item.frequency}</td>
                <td class="border border-gray-300 px-3 py-2 text-center">${percentage.toFixed(1)}%</td>
                <td class="border border-gray-300 px-3 py-2 text-center">${angle.toFixed(1)}°</td>
                <td class="border border-gray-300 px-3 py-2 text-center font-mono text-sm">(360°/${n}) × ${item.frequency}</td>
            </tr>
        `;
    });
    
    tableHTML += `
        <tr class="bg-gray-200 font-bold">
            <td class="border border-gray-300 px-3 py-2 text-center">Total</td>
            <td class="border border-gray-300 px-3 py-2 text-center">${n}</td>
            <td class="border border-gray-300 px-3 py-2 text-center">100%</td>
            <td class="border border-gray-300 px-3 py-2 text-center">${totalAngle.toFixed(1)}°</td>
            <td class="border border-gray-300 px-3 py-2 text-center">--</td>
        </tr>
    `;
    
    const pieCalculations = document.getElementById('pie-calculations');
    if (pieCalculations) {
        pieCalculations.innerHTML = calculationsHTML;
    }
    
    const pieTableBody = document.getElementById('pie-table-body');
    if (pieTableBody) {
        pieTableBody.innerHTML = tableHTML;
    }
    
    const codeFrequencies = document.getElementById('code-frequencies');
    if (codeFrequencies) {
        codeFrequencies.textContent = frequencies.join(',');
    }
}

function updateQuartileTutorial() {
    const n = sortedData.length;
    const dataStr = sortedData.join(', ');
    
    // Actualizar elementos de datos
    const dataDisplay = document.getElementById('data-display');
    if (dataDisplay) {
        dataDisplay.textContent = dataStr;
    }
    
    const nValueQ1 = document.getElementById('n-value-q1');
    if (nValueQ1) nValueQ1.textContent = n;
    
    const nValueQ2 = document.getElementById('n-value-q2');
    if (nValueQ2) nValueQ2.textContent = n;
    
    const nValueQ3 = document.getElementById('n-value-q3');
    if (nValueQ3) nValueQ3.textContent = n;

    // Calcular Q1
    const q1Pos = n / 4;
    const q1Fraction = document.getElementById('q1-fraction');
    if (q1Fraction) q1Fraction.textContent = `${n}/4`;
    
    const q1Result = document.getElementById('q1-result');
    if (q1Result) q1Result.textContent = q1Pos;
    
    if (Number.isInteger(q1Pos)) {
        const val1 = sortedData[q1Pos - 1];
        const val2 = sortedData[q1Pos];
        const q1Calculation = document.getElementById('q1-calculation');
        if (q1Calculation) q1Calculation.textContent = `(${val1} + ${val2}) / 2`;
        
        const q1Final = document.getElementById('q1-final');
        if (q1Final) q1Final.textContent = ((val1 + val2) / 2).toFixed(4);
    } else {
        const pos = Math.ceil(q1Pos);
        const q1Calculation = document.getElementById('q1-calculation');
        if (q1Calculation) q1Calculation.textContent = `Valor en posición ${pos}`;
        
        const q1Final = document.getElementById('q1-final');
        if (q1Final) q1Final.textContent = sortedData[pos - 1].toFixed(4);
    }

    // Calcular Q2
    const q2Pos = n / 2;
    const q2Fraction = document.getElementById('q2-fraction');
    if (q2Fraction) q2Fraction.textContent = `${n}/2`;
    
    const q2Result = document.getElementById('q2-result');
    if (q2Result) q2Result.textContent = q2Pos;
    
    if (Number.isInteger(q2Pos)) {
        const val1 = sortedData[q2Pos - 1];
        const val2 = sortedData[q2Pos];
        const q2Calculation = document.getElementById('q2-calculation');
        if (q2Calculation) q2Calculation.textContent = `(${val1} + ${val2}) / 2`;
        
        const q2Final = document.getElementById('q2-final');
        if (q2Final) q2Final.textContent = ((val1 + val2) / 2).toFixed(4);
    } else {
        const pos = Math.ceil(q2Pos);
        const q2Calculation = document.getElementById('q2-calculation');
        if (q2Calculation) q2Calculation.textContent = `Valor en posición ${pos}`;
        
        const q2Final = document.getElementById('q2-final');
        if (q2Final) q2Final.textContent = sortedData[pos - 1].toFixed(4);
    }

    // Calcular Q3
    const q3Pos = 3 * n / 4;
    
    const q3Fraction = document.getElementById('q3-fraction');
    if (q3Fraction) q3Fraction.textContent = `3*${n}/4`;
    
    const q3Result = document.getElementById('q3-result');
    if (q3Result) q3Result.textContent = q3Pos;
    
    if (Number.isInteger(q3Pos)) {
        const val1 = sortedData[q3Pos - 1];
        const val2 = sortedData[q3Pos];
        const q3Calculation = document.getElementById('q3-calculation');
        if (q3Calculation) q3Calculation.textContent = `(${val1} + ${val2}) / 2`;
        
        const q3Final = document.getElementById('q3-final');
        if (q3Final) q3Final.textContent = ((val1 + val2) / 2).toFixed(4);
    } else {
        const pos = Math.ceil(q3Pos);
        const q3Calculation = document.getElementById('q3-calculation');
        if (q3Calculation) q3Calculation.textContent = `Valor en posición ${pos}`;
        
        const q3Final = document.getElementById('q3-final');
        if (q3Final) q3Final.textContent = sortedData[pos - 1].toFixed(4);
    }

    // Resumen de cuartiles
    if (stats.quartiles) {
        const { Q1, Q2, Q3, IQR } = stats.quartiles;
        
        const summaryQ1 = document.getElementById('summary-q1');
        if (summaryQ1) summaryQ1.textContent = Q1.toFixed(4);
        
        const summaryQ2 = document.getElementById('summary-q2');
        if (summaryQ2) summaryQ2.textContent = Q2.toFixed(4);
        
        const summaryQ3 = document.getElementById('summary-q3');
        if (summaryQ3) summaryQ3.textContent = Q3.toFixed(4);
        
        const summaryIqr = document.getElementById('summary-iqr');
        if (summaryIqr) summaryIqr.textContent = IQR.toFixed(4);
    }
}

function updateFrequencyComparison() {
    const n = dataArray.length;
    const { range, k, amplitude } = stats;
    
    // Actualizar fórmulas
    const formulaN = document.getElementById('formula-n');
    if (formulaN) formulaN.textContent = n;
    
    const formulaK = document.getElementById('formula-k');
    if (formulaK) formulaK.textContent = k;
    
    const formulaRange = document.getElementById('formula-range');
    if (formulaRange) formulaRange.textContent = range.toFixed(2);
    
    const formulaAmplitude = document.getElementById('formula-amplitude');
    if (formulaAmplitude) formulaAmplitude.textContent = amplitude;

    // Tabla de frecuencias simple
    const simpleFreq = {};
    sortedData.forEach(val => {
        simpleFreq[val] = (simpleFreq[val] || 0) + 1;
    });

    let simpleTableHTML = '';
    let cumFreq = 0;
    let cumRelFreq = 0;
    
    Object.entries(simpleFreq).forEach(([value, freq]) => {
        const relFreq = freq / n;
        cumFreq += freq;
        cumRelFreq += relFreq;
        
        simpleTableHTML += `
            <tr>
                <td class="border border-gray-300 px-2 py-1 text-center">${value}</td>
                <td class="border border-gray-300 px-2 py-1 text-center">${freq}</td>
                <td class="border border-gray-300 px-2 py-1 text-center">${relFreq.toFixed(4)}</td>
                <td class="border border-gray-300 px-2 py-1 text-center">${cumFreq}</td>
                <td class="border border-gray-300 px-2 py-1 text-center">${cumRelFreq.toFixed(4)}</td>
            </tr>
        `;
    });
    
    const simpleFrequencyBody = document.getElementById('simple-frequency-body');
    if (simpleFrequencyBody) {
        simpleFrequencyBody.innerHTML = simpleTableHTML;
    }
    
    const simpleDataDisplay = document.getElementById('simple-data-display');
    if (simpleDataDisplay) {
        simpleDataDisplay.textContent = sortedData.join(', ');
    }

    // Tabla de frecuencias agrupadas
    let groupedTableHTML = '';
    frequencyData.forEach(item => {
        groupedTableHTML += `
            <tr>
                <td class="border border-gray-300 px-2 py-1 text-center">${item.interval}</td>
                <td class="border border-gray-300 px-2 py-1 text-center">${item.midpoint.toFixed(2)}</td>
                <td class="border border-gray-300 px-2 py-1 text-center">${item.frequency}</td>
                <td class="border border-gray-300 px-2 py-1 text-center">${item.relativeFreq.toFixed(4)}</td>
                <td class="border border-gray-300 px-2 py-1 text-center">${item.cumFreq}</td>
                <td class="border border-gray-300 px-2 py-1 text-center">${item.cumRelFreq.toFixed(4)}</td>
            </tr>
        `;
    });
    
    const groupedFrequencyBody = document.getElementById('grouped-frequency-body');
    if (groupedFrequencyBody) {
        groupedFrequencyBody.innerHTML = groupedTableHTML;
    }
}

function updateDispersionMeasures() {
    const { range, stdDev, variance } = stats;
    const { IQR } = stats.quartiles || {};
    const cv = stats.cv;
    const mean = stats.mean;
    
    // Actualizar medidas de dispersión
    const dispersionRange = document.getElementById('dispersion-range');
    if (dispersionRange) dispersionRange.textContent = range.toFixed(2);
    
    const dispersionIqr = document.getElementById('dispersion-iqr');
    if (dispersionIqr && IQR) dispersionIqr.textContent = IQR.toFixed(2);
    
    const dispersionVariance = document.getElementById('dispersion-variance');
    if (dispersionVariance) dispersionVariance.textContent = variance.toFixed(2);
    
    const dispersionStd = document.getElementById('dispersion-std');
    if (dispersionStd) dispersionStd.textContent = stdDev.toFixed(2);
    
    // Coeficiente de variación
    const cvMean = document.getElementById('cv-mean');
    if (cvMean) cvMean.textContent = mean.toFixed(2);
    
    const cvStd = document.getElementById('cv-std');
    if (cvStd) cvStd.textContent = stdDev.toFixed(2);
    
    const cvResult = document.getElementById('cv-result');
    if (cvResult) cvResult.textContent = cv.toFixed(2) + '%';
    
    // Interpretación del CV
    let interpretation = '';
    let analysisClass = '';
    let analysisText = '';
    
    if (cv < 15) {
        interpretation = 'Baja dispersión';
        analysisClass = 'bg-green-50 border-green-200';
        analysisText = 'Los datos tienen baja dispersión. La media es muy representativa del conjunto de datos y puede usarse con confianza para caracterizar la distribución.';
    } else if (cv <= 35) {
        interpretation = 'Dispersión moderada';
        analysisClass = 'bg-yellow-50 border-yellow-200';
        analysisText = 'Los datos tienen dispersión moderada. La media es aceptablemente representativa, pero se debe considerar la variabilidad al interpretar los resultados.';
    } else {
        interpretation = 'Alta dispersión';
        analysisClass = 'bg-red-50 border-red-200';
        analysisText = 'Los datos tienen alta dispersión. La media es poco representativa del conjunto de datos y debe interpretarse con precaución.';
    }
    
    const cvInterpretation = document.getElementById('cv-interpretation');
    if (cvInterpretation) cvInterpretation.textContent = interpretation;
    
    const cvAnalysis = document.getElementById('cv-analysis');
    if (cvAnalysis) {
        cvAnalysis.className = `mt-4 p-3 rounded border ${analysisClass}`;
    }
    
    const cvAnalysisText = document.getElementById('cv-analysis-text');
    if (cvAnalysisText) cvAnalysisText.textContent = analysisText;
}

function analyzeRiverData() {
    const input = document.getElementById('riverDepthInput').value;
    const safeHeight = parseFloat(document.getElementById('safeHeight').value);
    
    if (!input.trim()) {
        alert('Por favor, ingrese las profundidades del río.');
        return;
    }
    
    const depths = input.split(/[,\s\n]+/)
                        .filter(x => x.trim() !== '')
                        .map(x => parseFloat(x.trim()))
                        .filter(x => !isNaN(x));
    
    if (depths.length === 0) {
        alert('No se encontraron datos de profundidad válidos.');
        return;
    }
    
    const n = depths.length;
    const sum = depths.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const min = Math.min(...depths);
    const max = Math.max(...depths);
    const range = max - min;
    const variance = depths.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / mean) * 100;
    
    const riverAnalysisResults = document.getElementById('riverAnalysisResults');
    if (riverAnalysisResults) {
        riverAnalysisResults.classList.remove('hidden');
    }
    
    // Actualizar estadísticas del río
    const riverMean = document.getElementById('river-mean');
    if (riverMean) riverMean.textContent = mean.toFixed(2);
    
    const riverStd = document.getElementById('river-std');
    if (riverStd) riverStd.textContent = stdDev.toFixed(2);
    
    const riverCv = document.getElementById('river-cv');
    if (riverCv) riverCv.textContent = cv.toFixed(2);
    
    const riverRange = document.getElementById('river-range');
    if (riverRange) riverRange.textContent = range.toFixed(2);
    
    // Análisis de decisión
    let decisionHTML = `
        <p class="mb-2"><strong>Profundidad media:</strong> ${mean.toFixed(2)} pies</p>
        <p class="mb-2"><strong>Dispersión (Desviación Estándar):</strong> ${stdDev.toFixed(2)} pies</p>
        <p class="mb-2"><strong>Coeficiente de Variación:</strong> ${cv.toFixed(2)}%</p>
    `;
    
    if (cv > 35) {
        decisionHTML += `<p class="text-red-700 font-semibold">El CV es alto (>35%), lo que indica que la media no es muy representativa. Los datos están muy dispersos.</p>`;
    } else if (cv > 15) {
        decisionHTML += `<p class="text-yellow-700 font-semibold">El CV es moderado (15-35%), la media es aceptablemente representativa.</p>`;
    } else {
        decisionHTML += `<p class="text-green-700 font-semibold">El CV es bajo (<15%), la media es muy representativa.</p>`;
    }
    
    const riverDecisionContent = document.getElementById('river-decision-content');
    if (riverDecisionContent) {
        riverDecisionContent.innerHTML = decisionHTML;
    }
    
    // Evaluación de riesgo
    const unsafePoints = depths.filter(d => d > safeHeight).length;
    const percentageUnsafe = (unsafePoints / n) * 100;
    
    let riskHTML = `
        <p class="mb-2">Con una altura segura de <strong>${safeHeight} pies</strong>:</p>
        <p class="mb-2">Hay <strong>${unsafePoints}</strong> puntos de medición (${percentageUnsafe.toFixed(1)}%) que superan la altura segura.</p>
    `;
    
    if (percentageUnsafe > 20) {
        riskHTML += `<p class="text-red-700 font-bold">RIESGO ALTO: Una proporción significativa del río es demasiado profunda. No se recomienda cruzar.</p>`;
    } else if (percentageUnsafe > 0) {
        riskHTML += `<p class="text-yellow-700 font-bold">RIESGO MODERADO: Existen puntos de riesgo. Proceda con extrema precaución.</p>`;
    } else {
        riskHTML += `<p class="text-green-700 font-bold">RIESGO BAJO: Todos los puntos medidos están dentro del límite seguro.</p>`;
    }
    
    const riverRiskContent = document.getElementById('river-risk-content');
    if (riverRiskContent) {
        riverRiskContent.innerHTML = riskHTML;
    }
    
    createRiverChart(depths, safeHeight, mean);
}

function createRiverChart(depths, safeHeight, mean) {
    if (typeof Plotly === 'undefined') {
        console.error('Plotly no está disponible');
        return;
    }
    
    const xValues = depths.map((_, i) => `Punto ${i + 1}`);
    
    const traceDepths = {
        x: xValues,
        y: depths,
        type: 'bar',
        name: 'Profundidad Medida',
        marker: {
            color: depths.map(d => d > safeHeight ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.7)'),
            line: {
                color: depths.map(d => d > safeHeight ? 'rgba(239, 68, 68, 1)' : 'rgba(59, 130, 246, 1)'),
                width: 2
            }
        }
    };
    
    const traceSafeHeight = {
        x: xValues,
        y: Array(depths.length).fill(safeHeight),
        type: 'scatter',
        mode: 'lines',
        name: 'Altura Segura',
        line: {
            color: 'green',
            width: 3,
            dash: 'dash'
        }
    };
    
    const traceMean = {
        x: xValues,
        y: Array(depths.length).fill(mean),
        type: 'scatter',
        mode: 'lines',
        name: 'Profundidad Media',
        line: {
            color: 'orange',
            width: 3,
            dash: 'dot'
        }
    };
    
    const layout = {
        title: 'Perfil de Profundidad del Río',
        xaxis: {
            title: 'Puntos de Medición'
        },
        yaxis: {
            title: 'Profundidad (pies)'
        },
        showlegend: true,
        height: 400,
        margin: { t: 50, b: 50, l: 50, r: 50 },
        barmode: 'overlay'
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false
    };
    
    const riverChart = document.getElementById('riverChart');
    if (riverChart) {
        Plotly.newPlot('riverChart', [traceDepths, traceSafeHeight, traceMean], layout, config);
    }
}

function clearData() {
    const dataInput = document.getElementById('dataInput');
    if (dataInput) {
        dataInput.value = '';
    }
    
    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) {
        resultsContainer.classList.add('hidden');
    }
    
    dataArray = [];
    sortedData = [];
    stats = {};
    frequencyData = [];
}

function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.remove('active');
    });
    
    // Desactivar todos los elementos del menú
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (sectionId === 'all-sections') {
        // Mostrar todas las secciones excepto las especiales
        document.querySelectorAll('.section-content').forEach(section => {
            if (section.id !== 'all-sections' && 
                section.id !== 'input-section' && 
                section.id !== 'frequency-comparison-section' && 
                section.id !== 'quartile-tutorial-section' && 
                section.id !== 'pie-chart-section' && 
                section.id !== 'dispersion-theory-section' && 
                section.id !== 'river-simulation-section' &&
                section.id !== 'enhanced-boxplot-section') {
                section.classList.add('active');
            }
        });
        
        const allSectionsElement = document.getElementById('all-sections');
        if (allSectionsElement) {
            allSectionsElement.classList.add('active');
        }
        
        const menuAll = document.getElementById('menu-all');
        if (menuAll) {
            menuAll.classList.add('active');
        }
        
        cloneResultsToAllSections();
    } else {
        // Mostrar sección específica
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            sectionElement.classList.add('active');
        }
        
        const menuElement = document.getElementById(`menu-${sectionId.replace('-section', '')}`);
        if (menuElement) {
            menuElement.classList.add('active');
        }
    }
}

function cloneResultsToAllSections() {
    // Clonar estadísticas básicas
    const basicStats = document.getElementById('basicStats');
    const basicStats2 = document.getElementById('basicStats2');
    if (basicStats && basicStats2) {
        basicStats2.innerHTML = basicStats.innerHTML;
    }
    
    // Clonar cuartiles y outliers
    const quartiles = document.getElementById('quartiles');
    const quartiles2 = document.getElementById('quartiles2');
    if (quartiles && quartiles2) {
        quartiles2.innerHTML = quartiles.innerHTML;
    }
    
    const outliers = document.getElementById('outliers');
    const outliers2 = document.getElementById('outliers2');
    if (outliers && outliers2) {
        outliers2.innerHTML = outliers.innerHTML;
    }
    
    // Clonar tabla de frecuencias
    const frequencyTable = document.getElementById('frequencyTable');
    const frequencyTable2 = document.getElementById('frequencyTable2');
    if (frequencyTable && frequencyTable2) {
        frequencyTable2.innerHTML = frequencyTable.innerHTML;
    }
    
    // Clonar gráficos usando Plotly
    if (typeof Plotly !== 'undefined') {
        const histogramChart = document.getElementById('histogramChart');
        if (histogramChart && histogramChart.data) {
            Plotly.react('histogramChart2', histogramChart.data, histogramChart.layout);
        }
        
        const boxplotChart = document.getElementById('boxplotChart');
        if (boxplotChart && boxplotChart.data) {
            Plotly.react('boxplotChart2', boxplotChart.data, boxplotChart.layout);
        }
        
        const combinedChart = document.getElementById('combinedChart');
        if (combinedChart && combinedChart.data) {
            Plotly.react('combinedChart2', combinedChart.data, combinedChart.layout);
        }
        
        const overlappingChart = document.getElementById('overlappingChart');
        if (overlappingChart && overlappingChart.data) {
            Plotly.react('overlappingChart2', overlappingChart.data, overlappingChart.layout);
        }
        
        const polygonRelativeChart = document.getElementById('polygonRelativeChart');
        if (polygonRelativeChart && polygonRelativeChart.data) {
            Plotly.react('polygonRelativeChart2', polygonRelativeChart.data, polygonRelativeChart.layout);
        }
        
        const polygonAbsoluteChart = document.getElementById('polygonAbsoluteChart');
        if (polygonAbsoluteChart && polygonAbsoluteChart.data) {
            Plotly.react('polygonAbsoluteChart2', polygonAbsoluteChart.data, polygonAbsoluteChart.layout);
        }
        
        const pieChart = document.getElementById('pieChart');
        if (pieChart && pieChart.data) {
            Plotly.react('pieChart2', pieChart.data, pieChart.layout);
        }
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// Variables globales para el boxplot mejorado
let enhancedData = [];
let enhancedStats = {};

function calculateEnhancedBoxplot() {
    const input = document.getElementById('enhancedBoxplotInput').value;
    if (!input.trim()) {
        alert('Por favor, ingrese algunos datos.');
        return;
    }
    
    // Procesar datos de entrada
    enhancedData = input.split(/[,\s\n]+/)
                        .filter(x => x.trim() !== '')
                        .map(x => parseFloat(x.trim()))
                        .filter(x => !isNaN(x));
    
    if (enhancedData.length === 0) {
        alert('No se encontraron datos válidos.');
        return;
    }
    
    // Ordenar datos
    enhancedData.sort((a, b) => a - b);
    
    // Mostrar datos ordenados
    const enhancedDataDisplay = document.getElementById('enhancedDataDisplay');
    if (enhancedDataDisplay) {
        enhancedDataDisplay.textContent = enhancedData.join(', ');
    }
    
    // Calcular estadísticas mejoradas
    calculateEnhancedStatistics();
    displayEnhancedResults();
    createEnhancedBoxplotVisualization();
    
    // Mostrar contenedor de resultados
    const resultsContainer = document.getElementById('enhancedBoxplotResults');
    if (resultsContainer) {
        resultsContainer.classList.remove('hidden');
    }
}

function calculateEnhancedStatistics() {
    
    // Función para calcular percentiles
    function getPercentile(data, p) {
        const index = p * (data.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        
        if (lower === upper) return data[lower];
        return data[lower] * (1 - weight) + data[upper] * weight;
    }
    
    // Calcular cuartiles
    const Q1 = getPercentile(enhancedData, 0.25);
    const Q2 = getPercentile(enhancedData, 0.5);
    const Q3 = getPercentile(enhancedData, 0.75);
    const IQR = Q3 - Q1;
    
    // Calcular barreras interiores (1.5 × IQR)
    const innerLowerFence = Q1 - 1.5 * IQR;
    const innerUpperFence = Q3 + 1.5 * IQR;
    
    // Calcular barreras exteriores (3 × IQR)
    const outerLowerFence = Q1 - 3 * IQR;
    const outerUpperFence = Q3 + 3 * IQR;
    
    // Clasificar outliers
    const outliers = {
        moderate: enhancedData.filter(x => 
            (x < innerLowerFence && x >= outerLowerFence) ||
            (x > innerUpperFence && x <= outerUpperFence)
        ),
        extreme: enhancedData.filter(x => 
            x < outerLowerFence || x > outerUpperFence
        ),
        normal: enhancedData.filter(x => 
            x >= innerLowerFence && x <= innerUpperFence
        )
    };
    
    // Calcular límites de los bigotes según las reglas estándar del boxplot
    // Los bigotes se extienden hasta el valor real más extremo que esté dentro de las barreras interiores
    const valuesWithinFences = enhancedData.filter(x => x >= innerLowerFence && x <= innerUpperFence);
    
    let whiskerLower, whiskerUpper;
    
    if (valuesWithinFences.length > 0) {
        // Bigote inferior: el valor más pequeño que esté dentro del rango normal
        whiskerLower = Math.min(...valuesWithinFences);
        // Bigote superior: el valor más grande que esté dentro del rango normal
        whiskerUpper = Math.max(...valuesWithinFences);
    } else {
        // Si no hay valores dentro del rango (caso extremo), usar Q1 y Q3
        whiskerLower = Q1;
        whiskerUpper = Q3;
    }
    
    enhancedStats = {
        Q1, Q2, Q3, IQR,
        innerLowerFence, innerUpperFence,
        outerLowerFence, outerUpperFence,
        whiskerLower, whiskerUpper,
        outliers
    };
}

function displayEnhancedResults() {
    // Mostrar cuartiles
    const q1Element = document.getElementById('enhanced-q1');
    if (q1Element) q1Element.textContent = enhancedStats.Q1.toFixed(4);
    
    const q2Element = document.getElementById('enhanced-q2');
    if (q2Element) q2Element.textContent = enhancedStats.Q2.toFixed(4);
    
    const q3Element = document.getElementById('enhanced-q3');
    if (q3Element) q3Element.textContent = enhancedStats.Q3.toFixed(4);
    
    const iqrElement = document.getElementById('enhanced-iqr');
    if (iqrElement) iqrElement.textContent = enhancedStats.IQR.toFixed(4);
    
    // Mostrar barreras interiores
    const innerLowerElement = document.getElementById('enhanced-inner-lower');
    if (innerLowerElement) innerLowerElement.textContent = enhancedStats.innerLowerFence.toFixed(4);
    
    const innerUpperElement = document.getElementById('enhanced-inner-upper');
    if (innerUpperElement) innerUpperElement.textContent = enhancedStats.innerUpperFence.toFixed(4);
    
    // Mostrar barreras exteriores
    const outerLowerElement = document.getElementById('enhanced-outer-lower');
    if (outerLowerElement) outerLowerElement.textContent = enhancedStats.outerLowerFence.toFixed(4);
    
    const outerUpperElement = document.getElementById('enhanced-outer-upper');
    if (outerUpperElement) outerUpperElement.textContent = enhancedStats.outerUpperFence.toFixed(4);
    
    // Análisis de outliers
    updateOutlierAnalysis();
    
    // Actualizar leyenda de colores y zonas
    updateLegendValues();
}

function updateLegendValues() {
    const { Q1, Q2, Q3, IQR, innerLowerFence, innerUpperFence, outerLowerFence, outerUpperFence, whiskerLower, whiskerUpper } = enhancedStats;
    
    // Actualizar valores en la leyenda de zonas
    const legendOuterLower = document.getElementById('legend-outer-lower');
    if (legendOuterLower) legendOuterLower.textContent = outerLowerFence.toFixed(2);
    
    const legendOuterUpper = document.getElementById('legend-outer-upper');
    if (legendOuterUpper) legendOuterUpper.textContent = outerUpperFence.toFixed(2);
    
    const legendInnerLower = document.getElementById('legend-inner-lower');
    if (legendInnerLower) legendInnerLower.textContent = innerLowerFence.toFixed(2);
    
    const legendInnerUpper = document.getElementById('legend-inner-upper');
    if (legendInnerUpper) legendInnerUpper.textContent = innerUpperFence.toFixed(2);
    
    const legendInnerLower2 = document.getElementById('legend-inner-lower-2');
    if (legendInnerLower2) legendInnerLower2.textContent = innerLowerFence.toFixed(2);
    
    const legendInnerUpper2 = document.getElementById('legend-inner-upper-2');
    if (legendInnerUpper2) legendInnerUpper2.textContent = innerUpperFence.toFixed(2);
    
    const legendQ1 = document.getElementById('legend-q1');
    if (legendQ1) legendQ1.textContent = Q1.toFixed(2);
    
    const legendQ2 = document.getElementById('legend-q2');
    if (legendQ2) legendQ2.textContent = Q2.toFixed(2);
    
    const legendQ3 = document.getElementById('legend-q3');
    if (legendQ3) legendQ3.textContent = Q3.toFixed(2);
    
    // Actualizar valores en las fórmulas
    const legendIqr = document.getElementById('legend-iqr');
    if (legendIqr) legendIqr.textContent = IQR.toFixed(2);
    
    const legend15ri = document.getElementById('legend-1.5ri');
    if (legend15ri) legend15ri.textContent = (1.5 * IQR).toFixed(2);
    
    const legend3ri = document.getElementById('legend-3ri');
    if (legend3ri) legend3ri.textContent = (3 * IQR).toFixed(2);
    
    // Actualizar valores de los bigotes
    const legendWhiskerLower = document.getElementById('legend-whisker-lower');
    if (legendWhiskerLower) legendWhiskerLower.textContent = whiskerLower.toFixed(2);
    
    const legendWhiskerUpper = document.getElementById('legend-whisker-upper');
    if (legendWhiskerUpper) legendWhiskerUpper.textContent = whiskerUpper.toFixed(2);
}

function updateOutlierAnalysis() {
    const { outliers } = enhancedStats;
    const totalOutliers = outliers.moderate.length + outliers.extreme.length;
    const totalNormal = outliers.normal.length;
    const totalData = enhancedData.length;
    
    let analysisHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div class="bg-white p-3 rounded border text-center">
                <div class="text-sm text-gray-600">Valores Normales</div>
                <div class="text-2xl font-bold text-green-600">${totalNormal}</div>
                <div class="text-xs text-gray-500">${((totalNormal/totalData)*100).toFixed(1)}%</div>
            </div>
            <div class="bg-white p-3 rounded border text-center">
                <div class="text-sm text-gray-600">Outliers Moderados</div>
                <div class="text-2xl font-bold text-orange-600">${outliers.moderate.length}</div>
                <div class="text-xs text-gray-500">${((outliers.moderate.length/totalData)*100).toFixed(1)}%</div>
            </div>
            <div class="bg-white p-3 rounded border text-center">
                <div class="text-sm text-gray-600">Outliers Extremos</div>
                <div class="text-2xl font-bold text-red-600">${outliers.extreme.length}</div>
                <div class="text-xs text-gray-500">${((outliers.extreme.length/totalData)*100).toFixed(1)}%</div>
            </div>
        </div>
    `;
    
    if (outliers.moderate.length > 0) {
        analysisHTML += `
            <div class="bg-orange-50 p-3 rounded border border-orange-200 mb-3">
                <h4 class="font-semibold text-orange-800 mb-2">Outliers Moderados (●):</h4>
                <div class="text-sm font-mono">${outliers.moderate.map(x => x.toFixed(2)).join(', ')}</div>
                <p class="text-xs text-gray-700 mt-1">Valores entre 1.5×RI y 3×RI de distancia de los cuartiles</p>
            </div>
        `;
    }
    
    if (outliers.extreme.length > 0) {
        analysisHTML += `
            <div class="bg-red-50 p-3 rounded border border-red-200 mb-3">
                <h4 class="font-semibold text-red-800 mb-2">Outliers Extremos (○):</h4>
                <div class="text-sm font-mono">${outliers.extreme.map(x => x.toFixed(2)).join(', ')}</div>
                <p class="text-xs text-gray-700 mt-1">Valores más allá de 3×RI de distancia de los cuartiles</p>
            </div>
        `;
    }
    
    if (totalOutliers === 0) {
        analysisHTML += `
            <div class="bg-green-50 p-3 rounded border border-green-200">
                <h4 class="font-semibold text-green-800">✅ No se encontraron valores atípicos</h4>
                <p class="text-sm text-gray-700">Todos los datos se encuentran dentro de los límites normales</p>
            </div>
        `;
    }
    
    const analysisElement = document.getElementById('enhancedOutlierAnalysis');
    if (analysisElement) {
        analysisElement.innerHTML = analysisHTML;
    }
}

function createEnhancedBoxplotVisualization() {
    if (typeof Plotly === 'undefined') {
        console.error('Plotly no está disponible');
        return;
    }
    
    const { Q1, Q2, Q3, IQR, innerLowerFence, innerUpperFence, outerLowerFence, outerUpperFence, outliers } = enhancedStats;
    
    const traces = [];
    
    // Crear bandas de color de fondo más amplias
    const dataRange = Math.max(...enhancedData) - Math.min(...enhancedData);
    const minVal = Math.min(...enhancedData) - dataRange * 0.3;
    const maxVal = Math.max(...enhancedData) + dataRange * 0.3;
    const yRange = 1.5;
    
    // Función helper para crear rectángulos de color
    function createColorBand(x1, x2, color, name) {
        return {
            type: 'scatter',
            x: [x1, x2, x2, x1, x1],
            y: [-yRange, -yRange, yRange, yRange, -yRange],
            fill: 'toself',
            fillcolor: color,
            mode: 'lines',
            line: { color: 'transparent' },
            name: name,
            showlegend: false,
            hoverinfo: 'skip'
        };
    }
    
    // Bandas de color más visibles
    traces.push(createColorBand(minVal, outerLowerFence, 'rgba(239, 68, 68, 0.15)', 'Zona Extrema Izq'));
    traces.push(createColorBand(outerLowerFence, innerLowerFence, 'rgba(249, 115, 22, 0.15)', 'Zona Moderada Izq'));
    traces.push(createColorBand(innerLowerFence, innerUpperFence, 'rgba(34, 197, 94, 0.15)', 'Zona Normal'));
    traces.push(createColorBand(innerUpperFence, outerUpperFence, 'rgba(249, 115, 22, 0.15)', 'Zona Moderada Der'));
    traces.push(createColorBand(outerUpperFence, maxVal, 'rgba(239, 68, 68, 0.15)', 'Zona Extrema Der'));
    
    // Líneas límites principales con mejor visibilidad
    
    // Barreras exteriores (3×RI) - líneas rojas punteadas
    traces.push({
        x: [outerLowerFence, outerLowerFence],
        y: [-yRange, yRange],
        mode: 'lines',
        line: { color: 'rgb(239, 68, 68)', width: 3, dash: 'dot' },
        name: `Barrera Exterior Inf (3×RI)`,
        showlegend: true,
        hovertemplate: 'Barrera Exterior Inferior (3×RI): %{x:.2f}<extra></extra>'
    });
    
    traces.push({
        x: [outerUpperFence, outerUpperFence],
        y: [-yRange, yRange],
        mode: 'lines',
        line: { color: 'rgb(239, 68, 68)', width: 3, dash: 'dot' },
        name: `Barrera Exterior Sup (3×RI)`,
        showlegend: true,
        hovertemplate: 'Barrera Exterior Superior (3×RI): %{x:.2f}<extra></extra>'
    });
    
    // Barreras interiores (1.5×RI) - líneas naranjas discontinuas
    traces.push({
        x: [innerLowerFence, innerLowerFence],
        y: [-yRange, yRange],
        mode: 'lines',
        line: { color: 'rgb(249, 115, 22)', width: 3, dash: 'dash' },
        name: `Barrera Interior Inf (1.5×RI)`,
        showlegend: true,
        hovertemplate: 'Barrera Interior Inferior (1.5×RI): %{x:.2f}<extra></extra>'
    });
    
    traces.push({
        x: [innerUpperFence, innerUpperFence],
        y: [-yRange, yRange],
        mode: 'lines',
        line: { color: 'rgb(249, 115, 22)', width: 3, dash: 'dash' },
        name: `Barrera Interior Sup (1.5×RI)`,
        showlegend: true,
        hovertemplate: 'Barrera Interior Superior (1.5×RI): %{x:.2f}<extra></extra>'
    });
    
    // Box plot personalizado con valores calculados correctamente
    const { whiskerLower, whiskerUpper } = enhancedStats;
    
    // Caja principal (del Q1 al Q3)
    traces.push({
        x: [Q1, Q3, Q3, Q1, Q1],
        y: [-0.25, -0.25, 0.25, 0.25, -0.25],
        fill: 'toself',
        fillcolor: 'rgba(147, 197, 253, 0.4)',
        mode: 'lines',
        line: {
            color: 'rgb(29, 78, 216)',
            width: 3
        },
        name: 'Caja IQR (Q₁ a Q₃)',
        showlegend: true,
        hovertemplate: 'Caja IQR: Q₁=%{x[0]:.2f} a Q₃=%{x[1]:.2f}<extra></extra>'
    });
    
    // Línea de la mediana
    traces.push({
        x: [Q2, Q2],
        y: [-0.25, 0.25],
        mode: 'lines',
        line: {
            color: 'rgb(29, 78, 216)',
            width: 4
        },
        name: 'Mediana (Q₂)',
        showlegend: true,
        hovertemplate: 'Mediana: %{x:.2f}<extra></extra>'
    });
    
    // Bigote izquierdo (desde Q1 hasta whiskerLower)
    traces.push({
        x: [whiskerLower, Q1],
        y: [0, 0],
        mode: 'lines',
        line: {
            color: 'rgb(29, 78, 216)',
            width: 2
        },
        name: 'Bigote Izquierdo',
        showlegend: true,
        hovertemplate: 'Bigote Izquierdo: desde %{x[0]:.2f} hasta Q₁<extra></extra>'
    });
    
    // Bigote derecho (desde Q3 hasta whiskerUpper)
    traces.push({
        x: [Q3, whiskerUpper],
        y: [0, 0],
        mode: 'lines',
        line: {
            color: 'rgb(29, 78, 216)',
            width: 2
        },
        name: 'Bigote Derecho',
        showlegend: true,
        hovertemplate: 'Bigote Derecho: desde Q₃ hasta %{x[1]:.2f}<extra></extra>'
    });
    
    // Tapas de los bigotes
    traces.push({
        x: [whiskerLower, whiskerLower],
        y: [-0.1, 0.1],
        mode: 'lines',
        line: {
            color: 'rgb(29, 78, 216)',
            width: 2
        },
        name: 'Límite Inferior Real',
        showlegend: false,
        hovertemplate: 'Límite Inferior: %{x:.2f}<extra></extra>'
    });
    
    traces.push({
        x: [whiskerUpper, whiskerUpper],
        y: [-0.1, 0.1],
        mode: 'lines',
        line: {
            color: 'rgb(29, 78, 216)',
            width: 2
        },
        name: 'Límite Superior Real',
        showlegend: false,
        hovertemplate: 'Límite Superior: %{x:.2f}<extra></extra>'
    });
    
    // Outliers moderados con mejor visibilidad
    if (outliers.moderate.length > 0) {
        traces.push({
            x: outliers.moderate,
            y: Array(outliers.moderate.length).fill(0),
            mode: 'markers',
            marker: {
                color: 'rgb(249, 115, 22)',
                size: 12,
                symbol: 'circle',
                line: {
                    color: 'rgb(194, 65, 12)',
                    width: 2
                }
            },
            name: 'Outliers Moderados (●)',
            showlegend: true,
            hovertemplate: 'Outlier Moderado: %{x:.2f}<extra></extra>'
        });
    }
    
    // Outliers extremos con mejor visibilidad
    if (outliers.extreme.length > 0) {
        traces.push({
            x: outliers.extreme,
            y: Array(outliers.extreme.length).fill(0),
            mode: 'markers',
            marker: {
                color: 'rgba(239, 68, 68, 0.3)',
                size: 14,
                symbol: 'circle-open',
                line: {
                    color: 'rgb(220, 38, 38)',
                    width: 3
                }
            },
            name: 'Outliers Extremos (○)',
            showlegend: true,
            hovertemplate: 'Outlier Extremo: %{x:.2f}<extra></extra>'
        });
    }
    
    // Crear anotaciones básicas - solo cuartiles principales
    const annotations = [
        // Cuartiles principales - posicionados de manera simple y limpia
        {
            x: Q1,
            y: 0.6,
            text: `<b>Q₁</b><br>${Q1.toFixed(2)}`,
            showarrow: true,
            arrowhead: 4,
            arrowcolor: 'rgb(37, 99, 235)',
            arrowwidth: 2,
            font: { size: 11, color: 'rgb(37, 99, 235)' },
            bgcolor: 'rgba(147, 197, 253, 0.9)',
            bordercolor: 'rgb(37, 99, 235)',
            borderwidth: 1,
            ax: 20,
            ay: -30
        },
        {
            x: Q2,
            y: 0.8,
            text: `<b>Q₂ (Mediana)</b><br>${Q2.toFixed(2)}`,
            showarrow: true,
            arrowhead: 4,
            arrowcolor: 'rgb(147, 51, 234)',
            arrowwidth: 2,
            font: { size: 11, color: 'rgb(147, 51, 234)' },
            bgcolor: 'rgba(196, 181, 253, 0.9)',
            bordercolor: 'rgb(147, 51, 234)',
            borderwidth: 1,
            ax: 0,
            ay: -40
        },
        {
            x: Q3,
            y: 0.6,
            text: `<b>Q₃</b><br>${Q3.toFixed(2)}`,
            showarrow: true,
            arrowhead: 4,
            arrowcolor: 'rgb(21, 128, 61)',
            arrowwidth: 2,
            font: { size: 11, color: 'rgb(21, 128, 61)' },
            bgcolor: 'rgba(134, 239, 172, 0.9)',
            bordercolor: 'rgb(21, 128, 61)',
            borderwidth: 1,
            ax: -20,
            ay: -30
        },
        
        // Anotación de RI centrada en la parte inferior
        {
            x: (Q1 + Q3) / 2,
            y: -1.3,
            text: `<b>RI = ${IQR.toFixed(2)}</b>`,
            showarrow: false,
            font: { size: 13, color: 'rgb(75, 85, 99)' },
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            bordercolor: 'rgb(75, 85, 99)',
            borderwidth: 2
        }
    ];
    
    const layout = {
        title: {
            text: '<b>Diagrama de Caja y Bigotes con Límites y Barreras Detalladas</b>',
            font: { size: 18 }
        },
        xaxis: {
            title: {
                text: '<b>Valores</b>',
                font: { size: 14 }
            },
            showgrid: true,
            gridcolor: 'rgba(156, 163, 175, 0.3)',
            range: [minVal, maxVal],
            zeroline: false
        },
        yaxis: {
            title: {
                text: '<b>Distribución</b>',
                font: { size: 14 }
            },
            showgrid: false,
            zeroline: false,
            range: [-yRange, yRange]
        },
        height: 600,
        margin: { t: 100, b: 120, l: 80, r: 180 },
        showlegend: true,
        legend: {
            x: 1.02,
            y: 0.98,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            bordercolor: 'rgba(0, 0, 0, 0.2)',
            borderwidth: 1,
            font: { size: 11 },
            xanchor: 'left'
        },
        annotations: annotations,
        plot_bgcolor: 'rgba(249, 250, 251, 0.5)',
        paper_bgcolor: 'white'
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        displaylogo: false
    };
    
    const chartElement = document.getElementById('enhancedBoxplotChart');
    if (chartElement) {
        Plotly.newPlot('enhancedBoxplotChart', traces, layout, config);
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    showSection('input-section');
});