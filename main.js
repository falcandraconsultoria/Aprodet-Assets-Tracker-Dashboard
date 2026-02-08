// main.js - APRODET Dashboard - Sistema Completo
// Complemento total para o index.html
// Versão atualizada com as modificações solicitadas

// ===== CONFIGURAÇÕES GLOBAIS =====
const CONFIG = {
    REQUIRED_COLUMNS: [
        'ID_Item', 'Codigo_Patrimonial', 'Nome_Item', 'Número de serie',
        'Categoria', 'Descrição', 'Quantidade', 'Estado_Conservação',
        'Data_Aquisição', 'Valor_Aquisição', 'Fonte_Aquisição', 'Fornecedor',
        'Localização_Item', 'Distrito_Localização', 'Uso_Actual',
        'Responsável_Item', 'Contacto_Responsável_Item', 'Vida_Util_Estimada',
        'Data_Ultima_Verificação', 'Observações'
    ],
    CURRENCY: 'MZN',
    DEMO_ITEMS_COUNT: 100,
    ITEMS_PER_PAGE_OPTIONS: [10, 25, 50, 100]
};

// ===== ESTADO DA APLICAÇÃO =====
const STATE = {
    // Dados
    currentFile: null,
    processedData: [],
    filteredData: [],
    originalData: [],
    
    // Indicadores
    indicators: {
        totalValue: 0,
        totalItems: 0,
        avgStatus: 0,
        criticalItems: 0,
        statusDistribution: {},
        categoryDistribution: {},
        districtDistribution: {},
        timelineData: {}
    },
    
    // Filtros - REMOVIDOS minValue e maxValue conforme solicitado
    filters: {
        category: 'all',
        district: 'all',
        status: 'all',
        // minValue: null, // REMOVIDO
        // maxValue: null, // REMOVIDO
        responsible: 'all',
        use: 'all'
    },
    
    // UI State
    currentPage: 1,
    itemsPerPage: 10,
    searchTerm: '',
    // Atualizado tipos de gráficos conforme solicitado
    chartTypes: {
        category: 'doughnut',     // Mantido com legenda circular
        status: 'bar',            // Mudado para barras horizontais
        timeline: 'line',         // Sem legenda
        district: 'pie'           // Mantido com legenda circular
    },
    
    // Controle
    isLoading: false,
    charts: {}
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApplication();
    setupRequiredFields();
    updateCurrentDate();
    
    // Adicionar logotipo APD e @Falcandra Data Consulting
    setupCustomBranding();
});

function initializeApplication() {
    // Configurar elementos DOM
    setupDOMReferences();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Configurar drag & drop
    setupDragAndDrop();
    
    // Verificar dados salvos
    checkSavedData();
}

function setupCustomBranding() {
    // Adicionar logotipo APD no header se não existir
    const header = document.querySelector('.header');
    if (header && !document.querySelector('.apd-logo')) {
        const apdLogo = document.createElement('div');
        apdLogo.className = 'apd-logo';
        apdLogo.innerHTML = `
            <div class="apd-text">APD</div>
            <div class="apd-label">Associação</div>
        `;
        header.insertBefore(apdLogo, header.firstChild);
    }
    
    // Adicionar @Falcandra Data Consulting no footer
    const footer = document.querySelector('.footer');
    if (footer && !footer.querySelector('.consulting-text')) {
        const consultingDiv = document.createElement('div');
        consultingDiv.className = 'consulting-text';
        consultingDiv.textContent = '@Falcandra Data Consulting';
        footer.insertBefore(consultingDiv, footer.firstChild);
    }
}

// ===== CONFIGURAÇÃO DE GRÁFICOS ATUALIZADA =====
function createStatusChart() {
    const canvas = document.getElementById('statusChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const distribution = STATE.indicators.statusDistribution || {};
    
    // Ordenar para melhor visualização em barras horizontais
    const labels = Object.keys(distribution);
    const data = labels.map(label => distribution[label]);
    
    // Cores para os estados
    const backgroundColors = labels.map(label => {
        switch(label) {
            case 'Bom': return 'rgba(46, 204, 113, 0.7)';        // Verde
            case 'Regular': return 'rgba(241, 196, 15, 0.7)';    // Amarelo
            case 'Ruim': return 'rgba(231, 76, 60, 0.7)';        // Vermelho
            default: return 'rgba(52, 152, 219, 0.7)';           // Azul para outros
        }
    });
    
    const borderColors = labels.map(label => {
        switch(label) {
            case 'Bom': return 'rgba(46, 204, 113, 1)';
            case 'Regular': return 'rgba(241, 196, 15, 1)';
            case 'Ruim': return 'rgba(231, 76, 60, 1)';
            default: return 'rgba(52, 152, 219, 1)';
        }
    });
    
    // DESTRUIÇÃO DE GRÁFICO EXISTENTE
    if (STATE.charts.status) {
        STATE.charts.status.destroy();
    }
    
    STATE.charts.status = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '', // REMOVIDO LEGENDA
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
                // BORDAS ARREDONDADAS CONFORME SOLICITADO
                borderRadius: {
                    topLeft: 10,
                    topRight: 10,
                    bottomLeft: 10,
                    bottomRight: 10
                },
                borderSkipped: false
            }]
        },
        options: {
            indexAxis: 'y', // BARRAS HORIZONTAIS
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // REMOVIDA LEGENDA
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.x} itens`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Estado de Conservação',
                    font: {
                        size: 14,
                        weight: '600'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Número de Itens'
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function createTimelineChart() {
    const canvas = document.getElementById('timelineChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const timeline = STATE.indicators.timelineData || {};
    
    const labels = Object.keys(timeline).sort();
    const data = labels.map(year => timeline[year].value);
    
    // DESTRUIÇÃO DE GRÁFICO EXISTENTE
    if (STATE.charts.timeline) {
        STATE.charts.timeline.destroy();
    }
    
    STATE.charts.timeline = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '', // REMOVIDO LEGENDA
                data: data,
                borderColor: 'rgba(155, 89, 182, 1)', // Roxo
                backgroundColor: 'rgba(155, 89, 182, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: 'rgba(155, 89, 182, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // REMOVIDA LEGENDA
                },
                title: {
                    display: true,
                    text: 'Aquisições ao Longo do Tempo',
                    font: {
                        size: 14,
                        weight: '600'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Valor (MZN)'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Ano'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                }
            }
        }
    });
}

function createCategoryChart() {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const distribution = STATE.indicators.categoryDistribution || {};
    
    const labels = Object.keys(distribution);
    const data = labels.map(label => distribution[label].value);
    
    // DESTRUIÇÃO DE GRÁFICO EXISTENTE
    if (STATE.charts.category) {
        STATE.charts.category.destroy();
    }
    
    STATE.charts.category = new Chart(ctx, {
        type: STATE.chartTypes.category,
        data: {
            labels: labels,
            datasets: [{
                label: 'Valor (MZN)',
                data: data,
                backgroundColor: generateColors(labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true, // MANTIDA LEGENDA
                    position: 'right',
                    labels: {
                        usePointStyle: true, // PALETA CIRCULAR
                        pointStyle: 'circle',
                        padding: 20,
                        font: {
                            size: 11
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Valor por Categoria (MZN)',
                    font: {
                        size: 14,
                        weight: '600'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const itemCount = distribution[labels[context.dataIndex]]?.count || 0;
                            return `${label}: ${formatCurrency(value)} (${itemCount} itens)`;
                        }
                    }
                }
            }
        }
    });
}

function createDistrictChart() {
    const canvas = document.getElementById('districtChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const distribution = STATE.indicators.districtDistribution || {};
    
    const labels = Object.keys(distribution);
    const data = labels.map(label => distribution[label]);
    
    // DESTRUIÇÃO DE GRÁFICO EXISTENTE
    if (STATE.charts.district) {
        STATE.charts.district.destroy();
    }
    
    STATE.charts.district = new Chart(ctx, {
        type: STATE.chartTypes.district,
        data: {
            labels: labels,
            datasets: [{
                label: 'Número de Itens',
                data: data,
                backgroundColor: generateColors(labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true, // MANTIDA LEGENDA
                    position: 'right',
                    labels: {
                        usePointStyle: true, // PALETA CIRCULAR
                        pointStyle: 'circle',
                        padding: 20,
                        font: {
                            size: 11
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Distribuição por Distrito',
                    font: {
                        size: 14,
                        weight: '600'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                }
            }
        }
    });
}

// ===== ATUALIZAÇÃO DO DASHBOARD =====
function updateDashboard() {
    updateIndicatorsUI();
    updateFilterOptions();
    createCharts();
    updateTables();
    updateSummary();
    updateUIState();
    
    // Ajustar fonte do valor total para números longos
    adjustPatrimonyValueFont();
}

function updateIndicatorsUI() {
    const indicators = STATE.indicators;
    
    // Formatar valor em MZN
    const formattedValue = formatCurrency(indicators.totalValue);
    
    // Atualizar cards
    const totalValueElement = document.getElementById('totalValue');
    if (totalValueElement) {
        totalValueElement.innerHTML = 
            `<span class="currency-symbol">MZN</span> ${formattedValue}`;
        
        // Adicionar classe para fonte menor
        totalValueElement.classList.add('patrimony-value');
    }
    
    document.getElementById('totalItems').textContent = 
        indicators.totalItems.toLocaleString('pt-PT');
    
    document.getElementById('avgStatus').textContent = 
        `${indicators.avgStatus}%`;
    
    document.getElementById('criticalItems').textContent = 
        indicators.criticalItems.toLocaleString('pt-PT');
    
    // Atualizar contador de itens críticos
    const criticalCount = document.getElementById('criticalCount');
    if (criticalCount) {
        criticalCount.textContent = `${indicators.criticalItems} itens`;
    }
    
    // Atualizar informações do arquivo
    const fileInfo = document.getElementById('currentFileInfo');
    if (fileInfo) {
        if (STATE.currentFile) {
            fileInfo.textContent = `Analisando: ${STATE.currentFile.name}`;
        } else {
            fileInfo.textContent = `Modo demonstração: ${STATE.processedData.length} itens`;
        }
    }
    
    // Atualizar contador de resultados
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        const total = STATE.originalData.length;
        const filtered = STATE.filteredData.length;
        resultsCount.textContent = `${filtered} de ${total} itens`;
    }
}

function adjustPatrimonyValueFont() {
    // Ajustar dinamicamente o tamanho da fonte para valores longos
    const patrimonyElement = document.getElementById('totalValue');
    if (!patrimonyElement) return;
    
    const textLength = patrimonyElement.textContent.length;
    
    // Remover classes anteriores
    patrimonyElement.classList.remove('font-small', 'font-very-small');
    
    // Aplicar classes baseadas no comprimento do texto
    if (textLength > 20) {
        patrimonyElement.classList.add('font-very-small');
    } else if (textLength > 15) {
        patrimonyElement.classList.add('font-small');
    }
}

// ===== ATUALIZAÇÃO DE FILTROS =====
function updateFilterOptions() {
    if (!STATE.processedData || STATE.processedData.length === 0) return;
    
    // Coletar valores únicos
    const categories = new Set();
    const districts = new Set();
    const responsibles = new Set();
    const uses = new Set();
    
    STATE.processedData.forEach(item => {
        if (item['Categoria']) categories.add(item['Categoria']);
        if (item['Distrito_Localização']) districts.add(item['Distrito_Localização']);
        if (item['Responsável_Item']) responsibles.add(item['Responsável_Item']);
        if (item['Uso_Actual']) uses.add(item['Uso_Actual']);
    });
    
    // Atualizar selects - REMOVIDOS filtros de valor
    updateSelect('categoryFilter', Array.from(categories).sort(), 'Todas as Categorias');
    updateSelect('districtFilter', Array.from(districts).sort(), 'Todos os Distritos');
    updateSelect('responsibleFilter', Array.from(responsibles).sort(), 'Todos os Responsáveis');
    updateSelect('useFilter', Array.from(uses).sort(), 'Todos os Usos');
    
    // REMOVER controles de valor mínimo/máximo se existirem
    removeValueFilters();
}

function removeValueFilters() {
    // Esconder ou remover os controles de valor mínimo/máximo
    const minValueControl = document.getElementById('minValueControl');
    const maxValueControl = document.getElementById('maxValueControl');
    const valueFilterSection = document.querySelector('.value-filter-section');
    
    if (minValueControl) minValueControl.style.display = 'none';
    if (maxValueControl) maxValueControl.style.display = 'none';
    if (valueFilterSection) valueFilterSection.style.display = 'none';
}

function collectFilterValues() {
    STATE.filters.category = getSelectValue('categoryFilter');
    STATE.filters.district = getSelectValue('districtFilter');
    STATE.filters.status = getSelectValue('statusFilter');
    STATE.filters.responsible = getSelectValue('responsibleFilter');
    STATE.filters.use = getSelectValue('useFilter');
    
    // REMOVIDOS minValue e maxValue
    // const minValue = document.getElementById('minValue')?.value;
    // const maxValue = document.getElementById('maxValue')?.value;
    // STATE.filters.minValue = minValue ? parseFloat(minValue) : null;
    // STATE.filters.maxValue = maxValue ? parseFloat(maxValue) : null;
}

function applyAllFilters(item) {
    const filters = STATE.filters;
    
    // Filtro de categoria
    if (filters.category !== 'all' && filters.category !== item['Categoria']) {
        return false;
    }
    
    // Filtro de distrito
    if (filters.district !== 'all' && filters.district !== item['Distrito_Localização']) {
        return false;
    }
    
    // Filtro de estado
    if (filters.status !== 'all' && filters.status !== item['Estado_Conservação']) {
        return false;
    }
    
    // Filtro de responsável
    if (filters.responsible !== 'all' && filters.responsible !== item['Responsável_Item']) {
        return false;
    }
    
    // Filtro de uso
    if (filters.use !== 'all' && filters.use !== item['Uso_Actual']) {
        return false;
    }
    
    // REMOVIDOS filtros de valor
    // const value = parseFloat(item['Valor_Aquisição']) || 0;
    // if (filters.minValue !== null && value < filters.minValue) {
    //     return false;
    // }
    // if (filters.maxValue !== null && value > filters.maxValue) {
    //     return false;
    // }
    
    // Filtro de busca
    if (STATE.searchTerm && STATE.searchTerm.trim() !== '') {
        const searchLower = STATE.searchTerm.toLowerCase();
        const searchFields = [
            item['ID_Item'],
            item['Nome_Item'],
            item['Categoria'],
            item['Descrição'],
            item['Localização_Item'],
            item['Distrito_Localização'],
            item['Responsável_Item'],
            item['Fornecedor']
        ].filter(field => field).map(field => field.toLowerCase());
        
        if (!searchFields.some(field => field.includes(searchLower))) {
            return false;
        }
    }
    
    return true;
}

function resetFilters() {
    // Resetar estado
    STATE.filters = {
        category: 'all',
        district: 'all',
        status: 'all',
        // REMOVIDOS: minValue: null, maxValue: null,
        responsible: 'all',
        use: 'all'
    };
    
    STATE.searchTerm = '';
    STATE.currentPage = 1;
    
    // Resetar controles - REMOVIDOS controles de valor
    const controls = [
        'categoryFilter', 'districtFilter', 'statusFilter',
        'responsibleFilter', 'useFilter', 'searchInput'
    ];
    
    controls.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'SELECT') {
                element.value = 'all';
            } else {
                element.value = '';
            }
        }
    });
    
    // REMOVIDOS: document.getElementById('minValue').value = '';
    // REMOVIDOS: document.getElementById('maxValue').value = '';
    document.getElementById('tableSearch').value = '';
    
    // Resetar dados filtrados
    STATE.filteredData = [...STATE.processedData];
    
    // Recalcular
    calculateIndicators();
    updateDashboard();
    
    showNotification('Filtros resetados com sucesso', 'info');
}

// ===== FUNÇÕES AUXILIARES ADICIONAIS =====
function formatCurrency(value) {
    // Formatar com separadores de milhar e duas casas decimais
    const number = parseFloat(value) || 0;
    return number.toLocaleString('pt-PT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function generateColors(count) {
    const colors = [
        'rgba(52, 152, 219, 0.8)',     // Azul
        'rgba(46, 204, 113, 0.8)',     // Verde
        'rgba(155, 89, 182, 0.8)',     // Roxo
        'rgba(241, 196, 15, 0.8)',     // Amarelo
        'rgba(230, 126, 34, 0.8)',     // Laranja
        'rgba(231, 76, 60, 0.8)',      // Vermelho
        'rgba(149, 165, 166, 0.8)',    // Cinza
        'rgba(26, 188, 156, 0.8)',     // Turquesa
        'rgba(155, 89, 182, 0.8)',     // Lilás
        'rgba(22, 160, 133, 0.8)'      // Verde-azulado
    ];
    
    if (count <= colors.length) {
        return colors.slice(0, count);
    }
    
    // Gerar cores adicionais se necessário
    const additionalColors = [];
    for (let i = colors.length; i < count; i++) {
        const hue = (i * 137.508) % 360; // Distribuição áurea
        additionalColors.push(`hsl(${hue}, 70%, 65%)`);
    }
    
    return [...colors, ...additionalColors].slice(0, count);
}

// ===== ESTILOS CSS DINÂMICOS =====
function addDynamicStyles() {
    // Adicionar estilos CSS para as alterações
    const style = document.createElement('style');
    style.textContent = `
        /* Ajuste para valor total do patrimônio com números longos */
        .patrimony-value {
            font-size: 19px !important;
            line-height: 1.2;
            word-break: break-word;
        }
        
        .patrimony-value.font-small {
            font-size: 17px !important;
        }
        
        .patrimony-value.font-very-small {
            font-size: 15px !important;
        }
        
        /* Logotipo APD no cabeçalho */
        .apd-logo {
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: rgba(255, 255, 255, 0.1);
            padding: 10px 15px;
            border-radius: 6px;
            margin-right: 20px;
        }
        
        .apd-text {
            font-size: 24px;
            font-weight: 800;
            color: #3498db;
            letter-spacing: 1px;
        }
        
        .apd-label {
            font-size: 10px;
            color: #ecf0f1;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
        }
        
        /* @Falcandra Data Consulting no footer */
        .consulting-text {
            font-size: 14px;
            color: #3498db;
            font-weight: 600;
            margin-bottom: 10px;
            font-style: italic;
        }
        
        /* Remoção de controles de filtro de valor */
        .value-filter-controls {
            display: none !important;
        }
        
        /* Ajustes para gráficos */
        .chart-container {
            position: relative;
            height: 300px;
        }
    `;
    
    document.head.appendChild(style);
}

// ===== INICIALIZAÇÃO FINAL =====
// Garantir que tudo está configurado
setTimeout(() => {
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = "'Poppins', sans-serif";
        Chart.defaults.color = '#6B7280';
    }
    
    // Adicionar estilos dinâmicos
    addDynamicStyles();
}, 100);
