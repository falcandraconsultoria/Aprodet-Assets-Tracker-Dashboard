// main.js - APRODET Dashboard - Sistema Completo
// @Falcandra Data Consulting

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
    
    // Filtros
    filters: {
        category: 'all',
        district: 'all',
        status: 'all',
        responsible: 'all',
        use: 'all'
    },
    
    // UI State
    currentPage: 1,
    itemsPerPage: 10,
    searchTerm: '',
    chartTypes: {
        category: 'doughnut',
        status: 'bar',
        timeline: 'line',
        district: 'pie'
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
    setupCustomBranding();
    addDynamicStyles();
});

function initializeApplication() {
    setupDOMReferences();
    setupEventListeners();
    setupDragAndDrop();
    checkSavedData();
    
    // Configurar Chart.js
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = "'Poppins', sans-serif";
        Chart.defaults.color = '#6B7280';
    }
}

function setupDOMReferences() {
    // Elementos serão referenciados por ID diretamente
}

function setupRequiredFields() {
    const grid = document.getElementById('requiredFieldsGrid');
    if (!grid) return;
    
    CONFIG.REQUIRED_COLUMNS.forEach(field => {
        const span = document.createElement('span');
        span.className = 'field-tag';
        span.textContent = field;
        grid.appendChild(span);
    });
}

function setupCustomBranding() {
    // Adicionar logotipo APD no header
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

// ===== MANIPULAÇÃO DE ARQUIVOS =====
function setupEventListeners() {
    // Upload
    document.getElementById('selectFileBtn')?.addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    
    document.getElementById('fileInput')?.addEventListener('change', handleFileSelect);
    document.getElementById('clearFileBtn')?.addEventListener('click', clearSelectedFile);
    document.getElementById('startAnalysisBtn')?.addEventListener('click', startAnalysis);
    
    // Dashboard
    document.getElementById('backToHomeBtn')?.addEventListener('click', goBackToHome);
    
    // Filtros
    document.getElementById('applyFiltersBtn')?.addEventListener('click', applyFilters);
    document.getElementById('resetFiltersBtn')?.addEventListener('click', resetFilters);
    document.getElementById('searchInput')?.addEventListener('input', debounce(handleSearch, 300));
    
    // Paginação
    document.getElementById('itemsPerPage')?.addEventListener('change', function() {
        STATE.itemsPerPage = parseInt(this.value);
        updateTables();
        updatePagination();
    });
    
    // Busca na tabela
    document.getElementById('tableSearch')?.addEventListener('input', debounce(handleTableSearch, 300));
    
    // Exportação
    document.getElementById('exportPdfBtn')?.addEventListener('click', exportToPDF);
    document.getElementById('exportCsvBtn')?.addEventListener('click', exportToCSV);
    document.getElementById('exportReportBtn')?.addEventListener('click', exportReport);
}

function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    if (!uploadArea) return;
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            const fileInput = document.getElementById('fileInput');
            fileInput.files = e.dataTransfer.files;
            handleFileSelect();
        }
    });
}

function handleFileSelect() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) return;
    
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
        showNotification('Formato de arquivo inválido. Use .xlsx, .xls ou .csv', 'error');
        clearSelectedFile();
        return;
    }
    
    STATE.currentFile = file;
    
    document.getElementById('fileNameDisplay').textContent = file.name;
    document.getElementById('fileSizeDisplay').textContent = formatFileSize(file.size);
    document.getElementById('fileInfo').style.display = 'block';
    document.getElementById('uploadArea').style.display = 'none';
}

function clearSelectedFile() {
    document.getElementById('fileInput').value = '';
    STATE.currentFile = null;
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ===== ANÁLISE DE DADOS =====
async function startAnalysis() {
    showLoading('Processando dados...');
    
    try {
        if (STATE.currentFile) {
            await processUploadedFile(STATE.currentFile);
        } else {
            generateDemoData();
        }
        
        const validation = validateData(STATE.processedData);
        if (!validation.valid) {
            throw new Error(validation.message);
        }
        
        STATE.filteredData = [...STATE.processedData];
        STATE.originalData = [...STATE.processedData];
        
        calculateIndicators();
        updateDashboard();
        showDashboard();
        saveToLocalStorage();
        
        showNotification('Análise concluída com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro na análise:', error);
        showNotification(`Erro: ${error.message}. Usando dados de demonstração.`, 'warning');
        generateDemoData();
        calculateIndicators();
        updateDashboard();
        showDashboard();
    } finally {
        hideLoading();
    }
}

async function processUploadedFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                if (file.name.endsWith('.csv')) {
                    STATE.processedData = parseCSV(e.target.result);
                } else {
                    showNotification('Arquivo Excel detectado. Processando com dados de demonstração.', 'info');
                    STATE.processedData = generateDemoData();
                }
                resolve();
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = reject;
        
        if (file.name.endsWith('.csv')) {
            reader.readAsText(file, 'UTF-8');
        } else {
            reader.readAsArrayBuffer(file);
        }
    });
}

function parseCSV(csvText) {
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const item = {};
        
        headers.forEach((header, index) => {
            let value = values[index] || '';
            
            if (header === 'Valor_Aquisição') {
                value = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
            } else if (header === 'Quantidade') {
                value = parseInt(value) || 1;
            }
            
            item[header] = value;
        });
        
        data.push(item);
    }
    
    return data;
}

// ===== GERAÇÃO DE DADOS DE DEMONSTRAÇÃO =====
function generateDemoData() {
    const categories = ['Mobiliário', 'Equipamento Informático', 'Veículos', 'Maquinaria', 'Edifícios', 'Ferramentas', 'Equipamento Médico'];
    const statuses = ['Bom', 'Regular', 'Ruim'];
    const districts = ['Maputo', 'Matola', 'Beira', 'Nampula', 'Quelimane', 'Tete', 'Xai-Xai', 'Inhambane', 'Pemba'];
    const uses = ['Em uso', 'Em armazém', 'Em manutenção', 'Desativado', 'Em reparação'];
    const responsibles = ['Maria Silva', 'João Santos', 'Ana Pereira', 'Carlos Mendes', 'Sofia Costa', 'Miguel Fernandes', 'Luísa Gomes'];
    const suppliers = ['Fornecedor A', 'Fornecedor B', 'Fornecedor C', 'Fornecedor D'];
    const sources = ['Compra', 'Doação', 'Transferência', 'Herança'];
    
    const demoData = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 1; i <= CONFIG.DEMO_ITEMS_COUNT; i++) {
        const category = categories[i % categories.length];
        const status = statuses[i % statuses.length];
        const district = districts[i % districts.length];
        const value = Math.round((Math.random() * 500000 + 1000) * 100) / 100;
        const quantity = Math.floor(Math.random() * 5) + 1;
        const year = currentYear - (i % 6);
        const month = (i % 12) + 1;
        const day = (i % 28) + 1;
        
        demoData.push({
            'ID_Item': `ITEM-${i.toString().padStart(4, '0')}`,
            'Codigo_Patrimonial': `CP-${year}-${(i % 1000).toString().padStart(3, '0')}`,
            'Nome_Item': `${category} Modelo ${i}`,
            'Número de serie': `SN-${2023000 + i}`,
            'Categoria': category,
            'Descrição': `Descrição detalhada do ${category.toLowerCase()} número ${i}`,
            'Quantidade': quantity,
            'Estado_Conservação': status,
            'Data_Aquisição': `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
            'Valor_Aquisição': value,
            'Fonte_Aquisição': sources[i % sources.length],
            'Fornecedor': suppliers[i % suppliers.length],
            'Localização_Item': `Sala ${(i % 50) + 1}, Edifício ${String.fromCharCode(65 + (i % 5))}`,
            'Distrito_Localização': district,
            'Uso_Actual': uses[i % uses.length],
            'Responsável_Item': responsibles[i % responsibles.length],
            'Contacto_Responsável_Item': `+258 8${(i % 9) + 1} ${i % 10}${(i + 1) % 10}${(i + 2) % 10} ${(i + 3) % 10}${(i + 4) % 10}${(i + 5) % 10}`,
            'Vida_Util_Estimada': (5 + (i % 20)).toString(),
            'Data_Ultima_Verificação': `${year + Math.floor(Math.random() * 2)}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
            'Observações': i % 7 === 0 ? 'Necessita manutenção urgente' : 
                          i % 5 === 0 ? 'Verificar estado periodicamente' : 
                          i % 10 === 0 ? 'Alto valor - seguro necessário' : ''
        });
    }
    
    return demoData;
}

// ===== CÁLCULO DE INDICADORES =====
function calculateIndicators() {
    const data = STATE.filteredData.length > 0 ? STATE.filteredData : STATE.processedData;
    
    if (!data || data.length === 0) {
        resetIndicators();
        return;
    }
    
    let totalValue = 0;
    let totalItems = 0;
    let statusScore = 0;
    let criticalItems = 0;
    
    const statusDistribution = {};
    const categoryDistribution = {};
    const districtDistribution = {};
    const timelineData = {};
    
    data.forEach(item => {
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        const quantity = parseInt(item['Quantidade']) || 1;
        const status = item['Estado_Conservação'] || 'Não Informado';
        const category = item['Categoria'] || 'Não Categorizado';
        const district = item['Distrito_Localização'] || 'Não Especificado';
        const date = item['Data_Aquisição'];
        
        totalValue += value * quantity;
        totalItems += quantity;
        
        statusDistribution[status] = (statusDistribution[status] || 0) + quantity;
        
        if (status === 'Bom') statusScore += quantity * 100;
        else if (status === 'Regular') statusScore += quantity * 60;
        else if (status === 'Ruim') statusScore += quantity * 20;
        else statusScore += quantity * 50;
        
        if (status === 'Ruim' && value > 10000) {
            criticalItems += quantity;
        }
        
        if (!categoryDistribution[category]) {
            categoryDistribution[category] = { value: 0, count: 0 };
        }
        categoryDistribution[category].value += value * quantity;
        categoryDistribution[category].count += quantity;
        
        districtDistribution[district] = (districtDistribution[district] || 0) + 1;
        
        if (date) {
            const year = date.substring(0, 4);
            if (!timelineData[year]) {
                timelineData[year] = { value: 0, count: 0 };
            }
            timelineData[year].value += value * quantity;
            timelineData[year].count += quantity;
        }
    });
    
    const avgStatus = totalItems > 0 ? Math.round(statusScore / totalItems) : 0;
    
    STATE.indicators = {
        totalValue,
        totalItems,
        avgStatus,
        criticalItems,
        statusDistribution,
        categoryDistribution,
        districtDistribution,
        timelineData
    };
}

function resetIndicators() {
    STATE.indicators = {
        totalValue: 0,
        totalItems: 0,
        avgStatus: 0,
        criticalItems: 0,
        statusDistribution: {},
        categoryDistribution: {},
        districtDistribution: {},
        timelineData: {}
    };
}

// ===== VALIDAÇÃO =====
function validateData(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return { valid: false, message: 'Dados inválidos ou vazios' };
    }
    
    const sampleItem = data[0];
    const required = ['ID_Item', 'Nome_Item', 'Categoria', 'Valor_Aquisição'];
    
    for (const field of required) {
        if (!sampleItem.hasOwnProperty(field)) {
            return { valid: false, message: `Campo obrigatório "${field}" não encontrado` };
        }
    }
    
    return { 
        valid: true, 
        message: `Dados válidos: ${data.length} itens processados` 
    };
}

// ===== ATUALIZAÇÃO DO DASHBOARD =====
function updateDashboard() {
    updateIndicatorsUI();
    updateFilterOptions();
    createCharts();
    updateTables();
    updateSummary();
    updateUIState();
}

function updateIndicatorsUI() {
    const indicators = STATE.indicators;
    
    const formattedValue = formatCurrency(indicators.totalValue);
    
    const totalValueElement = document.getElementById('totalValue');
    if (totalValueElement) {
        totalValueElement.innerHTML = 
            `<span class="currency-symbol">MZN</span> ${formattedValue}`;
        totalValueElement.classList.add('patrimony-value');
    }
    
    document.getElementById('totalItems').textContent = 
        indicators.totalItems.toLocaleString('pt-PT');
    
    document.getElementById('avgStatus').textContent = 
        `${indicators.avgStatus}%`;
    
    document.getElementById('criticalItems').textContent = 
        indicators.criticalItems.toLocaleString('pt-PT');
    
    const criticalCount = document.getElementById('criticalCount');
    if (criticalCount) {
        criticalCount.textContent = `${indicators.criticalItems} itens`;
    }
    
    const fileInfo = document.getElementById('currentFileInfo');
    if (fileInfo) {
        if (STATE.currentFile) {
            fileInfo.textContent = `Analisando: ${STATE.currentFile.name}`;
        } else {
            fileInfo.textContent = `Modo demonstração: ${STATE.processedData.length} itens`;
        }
    }
    
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        const total = STATE.originalData.length;
        const filtered = STATE.filteredData.length;
        resultsCount.textContent = `${filtered} de ${total} itens`;
    }
    
    adjustPatrimonyValueFont();
}

function adjustPatrimonyValueFont() {
    const patrimonyElement = document.getElementById('totalValue');
    if (!patrimonyElement) return;
    
    const textLength = patrimonyElement.textContent.length;
    
    patrimonyElement.classList.remove('font-small', 'font-very-small');
    
    if (textLength > 20) {
        patrimonyElement.classList.add('font-very-small');
    } else if (textLength > 15) {
        patrimonyElement.classList.add('font-small');
    }
}

function updateFilterOptions() {
    if (!STATE.processedData || STATE.processedData.length === 0) return;
    
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
    
    updateSelect('categoryFilter', Array.from(categories).sort(), 'Todas as Categorias');
    updateSelect('districtFilter', Array.from(districts).sort(), 'Todos os Distritos');
    updateSelect('responsibleFilter', Array.from(responsibles).sort(), 'Todos os Responsáveis');
    updateSelect('useFilter', Array.from(uses).sort(), 'Todos os Usos');
}

function updateSelect(selectId, options, defaultText) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const currentValue = select.value;
    select.innerHTML = '';
    
    const defaultOption = document.createElement('option');
    defaultOption.value = 'all';
    defaultOption.textContent = defaultText;
    select.appendChild(defaultOption);
    
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        select.appendChild(opt);
    });
    
    if (currentValue && options.includes(currentValue)) {
        select.value = currentValue;
    }
}

// ===== GRÁFICOS =====
function createCharts() {
    destroyCharts();
    createCategoryChart();
    createStatusChart();
    createDistrictChart();
    createTimelineChart();
}

function destroyCharts() {
    Object.values(STATE.charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    STATE.charts = {};
}

function createCategoryChart() {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const distribution = STATE.indicators.categoryDistribution || {};
    
    const labels = Object.keys(distribution);
    const data = labels.map(label => distribution[label].value);
    
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
                    display: true,
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20,
                        font: { size: 11 }
                    }
                },
                title: {
                    display: true,
                    text: 'Valor por Categoria (MZN)',
                    font: { size: 14, weight: '600' },
                    padding: { top: 10, bottom: 20 }
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

function createStatusChart() {
    const canvas = document.getElementById('statusChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const distribution = STATE.indicators.statusDistribution || {};
    
    const labels = Object.keys(distribution);
    const data = labels.map(label => distribution[label]);
    
    const backgroundColors = labels.map(label => {
        switch(label) {
            case 'Bom': return 'rgba(46, 204, 113, 0.7)';
            case 'Regular': return 'rgba(241, 196, 15, 0.7)';
            case 'Ruim': return 'rgba(231, 76, 60, 0.7)';
            default: return 'rgba(52, 152, 219, 0.7)';
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
    
    if (STATE.charts.status) {
        STATE.charts.status.destroy();
    }
    
    STATE.charts.status = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
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
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
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
                    font: { size: 14, weight: '600' },
                    padding: { top: 10, bottom: 20 }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: { display: true, text: 'Número de Itens' },
                    grid: { display: true, color: 'rgba(0,0,0,0.05)' }
                },
                y: { grid: { display: false } }
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
                    display: true,
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20,
                        font: { size: 11 }
                    }
                },
                title: {
                    display: true,
                    text: 'Distribuição por Distrito',
                    font: { size: 14, weight: '600' },
                    padding: { top: 10, bottom: 20 }
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
    
    if (STATE.charts.timeline) {
        STATE.charts.timeline.destroy();
    }
    
    STATE.charts.timeline = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '',
                data: data,
                borderColor: 'rgba(155, 89, 182, 1)',
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
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Aquisições ao Longo do Tempo',
                    font: { size: 14, weight: '600' },
                    padding: { top: 10, bottom: 20 }
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
                    title: { display: true, text: 'Valor (MZN)' },
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                },
                x: {
                    title: { display: true, text: 'Ano' },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                }
            }
        }
    });
}

// ===== TABELAS =====
function updateTables() {
    updateCriticalTable();
    updateAllItemsTable();
    updatePagination();
}

function updateCriticalTable() {
    const tbody = document.getElementById('criticalTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const criticalItems = STATE.filteredData.filter(item => {
        const status = item['Estado_Conservação'];
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        return status === 'Ruim' && value > 10000;
    });
    
    if (criticalItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <h4>Nenhum item crítico encontrado</h4>
                        <p>Todos os itens estão em bom ou regular estado</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    criticalItems.slice(0, 20).forEach(item => {
        const row = document.createElement('tr');
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        
        row.innerHTML = `
            <td><strong>${escapeHtml(item['ID_Item'] || '')}</strong></td>
            <td>${escapeHtml(item['Nome_Item'] || '')}</td>
            <td><span class="category-tag">${escapeHtml(item['Categoria'] || '')}</span></td>
            <td><span class="status-badge status-bad">${escapeHtml(item['Estado_Conservação'] || '')}</span></td>
            <td><strong>${formatCurrency(value)}</strong></td>
            <td>${escapeHtml(item['Localização_Item'] || '')}</td>
            <td>
                <button class="btn-icon" onclick="showItemDetails('${item['ID_Item']}')" title="Ver detalhes">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" onclick="exportItem('${item['ID_Item']}')" title="Exportar item">
                    <i class="fas fa-download"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function updateAllItemsTable() {
    const tbody = document.getElementById('allItemsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const startIndex = (STATE.currentPage - 1) * STATE.itemsPerPage;
    const endIndex = startIndex + STATE.itemsPerPage;
    const paginatedItems = STATE.filteredData.slice(startIndex, endIndex);
    
    if (paginatedItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">
                    <i class="fas fa-search"></i>
                    <div>
                        <h4>Nenhum item encontrado</h4>
                        <p>Tente ajustar os filtros ou termos de busca</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    paginatedItems.forEach(item => {
        const row = document.createElement('tr');
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        const status = item['Estado_Conservação'] || '';
        
        let statusClass = 'status-regular';
        if (status === 'Bom') statusClass = 'status-good';
        else if (status === 'Ruim') statusClass = 'status-bad';
        
        row.innerHTML = `
            <td><code>${escapeHtml(item['ID_Item'] || '')}</code></td>
            <td>${escapeHtml(truncateText(item['Nome_Item'] || '', 25))}</td>
            <td><span class="category-tag">${escapeHtml(item['Categoria'] || '')}</span></td>
            <td><span class="status-badge ${statusClass}">${escapeHtml(status)}</span></td>
            <td>${formatCurrency(value)}</td>
            <td>${escapeHtml(item['Distrito_Localização'] || '')}</td>
            <td>
                <button class="btn-icon" onclick="showItemDetails('${item['ID_Item']}')" title="Ver detalhes">
                    <i class="fas fa-info-circle"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function updatePagination() {
    const totalItems = STATE.filteredData.length;
    const totalPages = Math.ceil(totalItems / STATE.itemsPerPage);
    
    const paginationInfo = document.getElementById('paginationInfo');
    if (paginationInfo) {
        const start = ((STATE.currentPage - 1) * STATE.itemsPerPage) + 1;
        const end = Math.min(STATE.currentPage * STATE.itemsPerPage, totalItems);
        paginationInfo.textContent = `Mostrando ${start}-${end} de ${totalItems} itens`;
    }
    
    const controls = document.getElementById('paginationControls');
    if (!controls) return;
    
    controls.innerHTML = '';
    
    const prevBtn = document.createElement('button');
    prevBtn.className = `btn-pagination ${STATE.currentPage === 1 ? 'disabled' : ''}`;
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = STATE.currentPage === 1;
    prevBtn.onclick = () => changePage(STATE.currentPage - 1);
    controls.appendChild(prevBtn);
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, STATE.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `btn-pagination ${i === STATE.currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => changePage(i);
        controls.appendChild(pageBtn);
    }
    
    const nextBtn = document.createElement('button');
    nextBtn.className = `btn-pagination ${STATE.currentPage === totalPages ? 'disabled' : ''}`;
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = STATE.currentPage === totalPages;
    nextBtn.onclick = () => changePage(STATE.currentPage + 1);
    controls.appendChild(nextBtn);
}

function changePage(page) {
    if (page < 1 || page > Math.ceil(STATE.filteredData.length / STATE.itemsPerPage)) {
        return;
    }
    
    STATE.currentPage = page;
    updateTables();
    
    const tableSection = document.querySelector('.tables-section');
    if (tableSection) {
        tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ===== RESUMO E RECOMENDAÇÕES =====
function updateSummary() {
    updateSummaryContent();
    updateRecommendations();
}

function updateSummaryContent() {
    const container = document.getElementById('summaryContent');
    if (!container) return;
    
    const indicators = STATE.indicators;
    const totalItems = indicators.totalItems || 0;
    const avgStatus = indicators.avgStatus || 0;
    
    let summaryHTML = `
        <div class="summary-item">
            <div class="summary-icon">
                <i class="fas fa-coins"></i>
            </div>
            <div class="summary-text">
                <h4>Valor Total</h4>
                <p>${formatCurrency(indicators.totalValue)} em ${totalItems.toLocaleString('pt-PT')} itens</p>
            </div>
        </div>
        
        <div class="summary-item">
            <div class="summary-icon">
                <i class="fas fa-clipboard-check"></i>
            </div>
            <div class="summary-text">
                <h4>Estado Geral</h4>
                <p>Índice de conservação: <strong>${avgStatus}%</strong></p>
            </div>
        </div>
    `;
    
    const categories = Object.keys(indicators.categoryDistribution || {});
    if (categories.length > 0) {
        const topCategory = categories.reduce((a, b) => 
            indicators.categoryDistribution[a].value > indicators.categoryDistribution[b].value ? a : b
        );
        
        summaryHTML += `
            <div class="summary-item">
                <div class="summary-icon">
                    <i class="fas fa-chart-pie"></i>
                </div>
                <div class="summary-text">
                    <h4>Categoria Principal</h4>
                    <p>${topCategory}: ${formatCurrency(indicators.categoryDistribution[topCategory].value)}</p>
                </div>
            </div>
        `;
    }
    
    const districts = Object.keys(indicators.districtDistribution || {});
    if (districts.length > 0) {
        const topDistrict = districts.reduce((a, b) => 
            indicators.districtDistribution[a] > indicators.districtDistribution[b] ? a : b
        );
        
        summaryHTML += `
            <div class="summary-item">
                <div class="summary-icon">
                    <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="summary-text">
                    <h4>Distrito com Mais Itens</h4>
                    <p>${topDistrict}: ${indicators.districtDistribution[topDistrict]} itens</p>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = summaryHTML;
}

function updateRecommendations() {
    const container = document.getElementById('recommendationsContent');
    if (!container) return;
    
    const indicators = STATE.indicators;
    const recommendations = [];
    
    if (indicators.criticalItems > 0) {
        recommendations.push({
            icon: 'exclamation-triangle',
            color: 'error',
            text: `Priorizar manutenção de ${indicators.criticalItems} itens críticos (alto valor + estado ruim)`,
            priority: 'Alta'
        });
    }
    
    if (indicators.avgStatus < 70) {
        recommendations.push({
            icon: 'tools',
            color: 'warning',
            text: `Implementar plano de manutenção preventiva (estado médio: ${indicators.avgStatus}%)`,
            priority: 'Média'
        });
    }
    
    const currentYear = new Date().getFullYear();
    const oldItems = STATE.filteredData.filter(item => {
        const date = item['Data_Aquisição'];
        if (!date) return false;
        const year = parseInt(date.substring(0, 4));
        return currentYear - year > 5;
    }).length;
    
    if (oldItems > 0) {
        recommendations.push({
            icon: 'history',
            color: 'info',
            text: `${oldItems} itens com mais de 5 anos - considerar renovação`,
            priority: 'Média'
        });
    }
    
    const today = new Date();
    const pendingVerifications = STATE.filteredData.filter(item => {
        const lastVerification = item['Data_Ultima_Verificação'];
        if (!lastVerification) return true;
        
        const lastDate = new Date(lastVerification);
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 365;
    }).length;
    
    if (pendingVerifications > 0) {
        recommendations.push({
            icon: 'calendar-check',
            color: 'info',
            text: `${pendingVerifications} itens com verificação atrasada (> 1 ano)`,
            priority: 'Baixa'
        });
    }
    
    if (recommendations.length === 0) {
        recommendations.push({
            icon: 'check-circle',
            color: 'success',
            text: 'Situação do patrimônio dentro dos parâmetros aceitáveis',
            priority: 'Baixa'
        });
    }
    
    let recommendationsHTML = '';
    recommendations.forEach(rec => {
        recommendationsHTML += `
            <div class="recommendation-item ${rec.color}">
                <div class="recommendation-icon">
                    <i class="fas fa-${rec.icon}"></i>
                </div>
                <div class="recommendation-content">
                    <p>${rec.text}</p>
                    <span class="priority-badge ${rec.color}">Prioridade: ${rec.priority}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = recommendationsHTML;
}

// ===== FILTROS =====
function applyFilters() {
    if (!STATE.processedData || STATE.processedData.length === 0) {
        showNotification('Nenhum dado disponível para filtrar', 'warning');
        return;
    }
    
    collectFilterValues();
    
    STATE.filteredData = STATE.processedData.filter(item => {
        return applyAllFilters(item);
    });
    
    calculateIndicators();
    STATE.currentPage = 1;
    updateDashboard();
    
    showNotification(`Filtros aplicados: ${STATE.filteredData.length} itens encontrados`, 'success');
}

function collectFilterValues() {
    STATE.filters.category = getSelectValue('categoryFilter');
    STATE.filters.district = getSelectValue('districtFilter');
    STATE.filters.status = getSelectValue('statusFilter');
    STATE.filters.responsible = getSelectValue('responsibleFilter');
    STATE.filters.use = getSelectValue('useFilter');
}

function getSelectValue(selectId) {
    const select = document.getElementById(selectId);
    return select ? select.value : 'all';
}

function applyAllFilters(item) {
    const filters = STATE.filters;
    
    if (filters.category !== 'all' && filters.category !== item['Categoria']) {
        return false;
    }
    
    if (filters.district !== 'all' && filters.district !== item['Distrito_Localização']) {
        return false;
    }
    
    if (filters.status !== 'all' && filters.status !== item['Estado_Conservação']) {
        return false;
    }
    
    if (filters.responsible !== 'all' && filters.responsible !== item['Responsável_Item']) {
        return false;
    }
    
    if (filters.use !== 'all' && filters.use !== item['Uso_Actual']) {
        return false;
    }
    
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
    STATE.filters = {
        category: 'all',
        district: 'all',
        status: 'all',
        responsible: 'all',
        use: 'all'
    };
    
    STATE.searchTerm = '';
    STATE.currentPage = 1;
    
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
    
    document.getElementById('tableSearch').value = '';
    
    STATE.filteredData = [...STATE.processedData];
    calculateIndicators();
    updateDashboard();
    
    showNotification('Filtros resetados com sucesso', 'info');
}

function handleSearch(e) {
    STATE.searchTerm = e.target.value;
    applyFilters();
}

function handleTableSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#allItemsTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// ===== EXPORTAÇÃO =====
function exportToPDF() {
    showLoading('Gerando relatório PDF...');
    
    setTimeout(() => {
        hideLoading();
        
        const reportContent = generateReportContent();
        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        const fileName = `relatorio_aprodet_${new Date().getTime()}.txt`;
        
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Relatório exportado como arquivo de texto', 'success');
    }, 1500);
}

function exportToCSV() {
    if (!STATE.filteredData || STATE.filteredData.length === 0) {
        showNotification('Nenhum dado para exportar', 'warning');
        return;
    }
    
    showLoading('Gerando arquivo CSV...');
    
    try {
        const headers = CONFIG.REQUIRED_COLUMNS;
        const csvRows = [];
        
        csvRows.push(headers.join(';'));
        
        STATE.filteredData.forEach(item => {
            const row = headers.map(header => {
                const value = item[header] || '';
                const escaped = String(value).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(row.join(';'));
        });
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        const fileName = STATE.currentFile 
            ? `aprodet_${STATE.currentFile.name.replace(/\.[^/.]+$/, '')}_exportado.csv`
            : `aprodet_dashboard_${new Date().getTime()}.csv`;
        
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        hideLoading();
        showNotification('CSV exportado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao exportar CSV:', error);
        hideLoading();
        showNotification('Erro ao exportar CSV', 'error');
    }
}

function exportReport() {
    if (!STATE.filteredData || STATE.filteredData.length === 0) {
        showNotification('Nenhum dado para relatório', 'warning');
        return;
    }
    
    showLoading('Gerando relatório detalhado...');
    
    const reportContent = generateReportContent();
    
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const fileName = `relatorio_detalhado_aprodet_${new Date().getTime()}.txt`;
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    hideLoading();
    showNotification('Relatório gerado com sucesso!', 'success');
}

function generateReportContent() {
    const indicators = STATE.indicators;
    const now = new Date();
    
    return `
RELATÓRIO APRODET - DASHBOARD PATRIMONIAL
==========================================
Data de geração: ${now.toLocaleDateString('pt-PT')} ${now.toLocaleTimeString('pt-PT')}
Itens analisados: ${STATE.filteredData.length}
Fonte: ${STATE.currentFile ? STATE.currentFile.name : 'Dados de demonstração'}

RESUMO EXECUTIVO
================
• Valor Total do Patrimônio: ${formatCurrency(indicators.totalValue)}
• Total de Itens no Inventário: ${indicators.totalItems}
• Estado Médio de Conservação: ${indicators.avgStatus}%
• Itens Críticos Identificados: ${indicators.criticalItems}

DISTRIBUIÇÃO POR CATEGORIA
==========================
${Object.entries(indicators.categoryDistribution || {}).map(([cat, data]) => 
    `• ${cat}: ${formatCurrency(data.value)} (${data.count} itens, ${((data.count / indicators.totalItems) * 100).toFixed(1)}%)`
).join('\n')}

DISTRIBUIÇÃO POR ESTADO
=======================
${Object.entries(indicators.statusDistribution || {}).map(([status, count]) => 
    `• ${status}: ${count} itens (${((count / indicators.totalItems) * 100).toFixed(1)}%)`
).join('\n')}

DISTRIBUIÇÃO GEOGRÁFICA
=======================
${Object.entries(indicators.districtDistribution || {}).map(([district, count]) => 
    `• ${district}: ${count} itens`
).join('\n')}

ITENS CRÍTICOS (TOP 20)
=======================
${STATE.filteredData
    .filter(item => item['Estado_Conservação'] === 'Ruim' && (parseFloat(item['Valor_Aquisição']) || 0) > 10000)
    .slice(0, 20)
    .map((item, index) => 
        `${index + 1}. ${item['ID_Item']} - ${item['Nome_Item']} - ${formatCurrency(parseFloat(item['Valor_Aquisição']) || 0)} - ${item['Localização_Item']}`
    ).join('\n')}

ANÁLISE TEMPORAL
================
${Object.entries(indicators.timelineData || {}).sort((a, b) => a[0] - b[0]).map(([year, data]) => 
    `• ${year}: ${formatCurrency(data.value)} em ${data.count} aquisições`
).join('\n')}

RECOMENDAÇÕES PRIORITÁRIAS
==========================
1. ${indicators.criticalItems > 0 ? 
    `Priorizar manutenção/reposição de ${indicators.criticalItems} itens críticos` : 
    'Nenhum item crítico identificado'}
2. ${indicators.avgStatus < 70 ? 
    `Implementar plano de manutenção preventiva (estado médio atual: ${indicators.avgStatus}%)` :
    'Estado do patrimônio dentro dos parâmetros aceitáveis'}
3. Revisar periodicamente itens com mais de 5 anos de uso
4. Considerar seguro para itens de alto valor (> 50,000 MZN)

--- FIM DO RELATÓRIO ---
Gerado pelo APRODET Dashboard v1.0
Moeda: Metical (MZN)
`;
}

// ===== NAVEGAÇÃO =====
function showDashboard() {
    document.getElementById('uploadPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'block';
    
    updateCurrentDate();
    document.getElementById('lastUpdate').textContent = 
        new Date().toLocaleTimeString('pt-PT');
    
    document.getElementById('processedItems').textContent = 
        STATE.processedData.length;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBackToHome() {
    document.getElementById('dashboardPage').style.display = 'none';
    document.getElementById('uploadPage').style.display = 'block';
    clearSelectedFile();
    
    STATE.filteredData = [...STATE.processedData];
    STATE.currentPage = 1;
    
    showNotification('Pronto para novo upload ou análise', 'info');
}

// ===== FUNÇÕES AUXILIARES =====
function showLoading(message) {
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');
    
    if (overlay && text) {
        text.textContent = message;
        overlay.style.display = 'flex';
        STATE.isLoading = true;
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
        STATE.isLoading = false;
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'MZN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value || 0);
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const dateString = now.toLocaleDateString('pt-PT', options);
    
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = dateString;
    }
}

function updateUIState() {
    const hasData = STATE.filteredData && STATE.filteredData.length > 0;
    
    const exportButtons = ['exportPdfBtn', 'exportCsvBtn', 'exportReportBtn'];
    exportButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.disabled = !hasData;
        }
    });
}

// ===== FUNÇÕES DO MODAL =====
window.showItemDetails = function(itemId) {
    const item = STATE.filteredData.find(i => i['ID_Item'] === itemId);
    if (!item) {
        showNotification('Item não encontrado', 'error');
        return;
    }
    
    const modal = document.getElementById('itemModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    modalTitle.textContent = `Detalhes: ${item['Nome_Item']}`;
    
    let modalHTML = `
        <div class="item-details">
            <div class="detail-row">
                <span class="detail-label">ID do Item:</span>
                <span class="detail-value">${escapeHtml(item['ID_Item'])}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Código Patrimonial:</span>
                <span class="detail-value">${escapeHtml(item['Codigo_Patrimonial'])}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Categoria:</span>
                <span class="detail-value">${escapeHtml(item['Categoria'])}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Estado:</span>
                <span class="detail-value status-badge ${item['Estado_Conservação'] === 'Bom' ? 'status-good' : item['Estado_Conservação'] === 'Ruim' ? 'status-bad' : 'status-regular'}">
                    ${escapeHtml(item['Estado_Conservação'])}
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Valor de Aquisição:</span>
                <span class="detail-value">${formatCurrency(parseFloat(item['Valor_Aquisição']) || 0)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Data de Aquisição:</span>
                <span class="detail-value">${escapeHtml(item['Data_Aquisição'])}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Localização:</span>
                <span class="detail-value">${escapeHtml(item['Localização_Item'])}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Distrito:</span>
                <span class="detail-value">${escapeHtml(item['Distrito_Localização'])}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Responsável:</span>
                <span class="detail-value">${escapeHtml(item['Responsável_Item'])}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Uso Atual:</span>
                <span class="detail-value">${escapeHtml(item['Uso_Actual'])}</span>
            </div>
    `;
    
    if (item['Descrição']) {
        modalHTML += `
            <div class="detail-row">
                <span class="detail-label">Descrição:</span>
                <span class="detail-value">${escapeHtml(item['Descrição'])}</span>
            </div>
        `;
    }
    
    if (item['Observações']) {
        modalHTML += `
            <div class="detail-row">
                <span class="detail-label">Observações:</span>
                <span class="detail-value">${escapeHtml(item['Observações'])}</span>
            </div>
        `;
    }
    
    modalHTML += `</div>`;
    
    modalBody.innerHTML = modalHTML;
    modal.style.display = 'flex';
};

window.exportItem = function(itemId) {
    const item = STATE.filteredData.find(i => i['ID_Item'] === itemId);
    if (!item) return;
    
    const itemContent = JSON.stringify(item, null, 2);
    const blob = new Blob([itemContent], { type: 'application/json' });
    const link = document.createElement('a');
    const fileName = `item_${itemId}_${new Date().getTime()}.json`;
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`Item ${itemId} exportado com sucesso`, 'success');
};

// ===== LOCAL STORAGE =====
function saveToLocalStorage() {
    try {
        const dataToSave = {
            indicators: STATE.indicators,
            filters: STATE.filters,
            lastUpdated: new Date().getTime(),
            dataLength: STATE.processedData.length
        };
        localStorage.setItem('aprodetDashboard', JSON.stringify(dataToSave));
    } catch (error) {
        console.warn('Não foi possível salvar dados:', error);
    }
}

function checkSavedData() {
    try {
        const saved = localStorage.getItem('aprodetDashboard');
        if (saved) {
            const data = JSON.parse(saved);
            const oneDayAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
            
            if (data.lastUpdated > oneDayAgo) {
                showNotification('Dados anteriores encontrados. Carregue um novo arquivo para análise atual.', 'info');
            }
        }
    } catch (error) {
        console.warn('Erro ao recuperar dados:', error);
    }
}

// ===== NOTIFICAÇÕES =====
window.showNotification = function(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const notificationIcon = document.getElementById('notification-icon');
    
    if (!notification || !notificationText || !notificationIcon) return;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    else if (type === 'error') iconClass = 'fa-exclamation-circle';
    else if (type === 'warning') iconClass = 'fa-exclamation-triangle';
    
    notificationIcon.className = `fas ${iconClass}`;
    notificationText.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
};

window.hideNotification = function() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.style.display = 'none';
    }
};

// ===== GERADOR DE CORES =====
function generateColors(count) {
    const colors = [
        'rgba(52, 152, 219, 0.8)',
        'rgba(46, 204, 113, 0.8)',
        'rgba(155, 89, 182, 0.8)',
        'rgba(241, 196, 15, 0.8)',
        'rgba(230, 126, 34, 0.8)',
        'rgba(231, 76, 60, 0.8)',
        'rgba(149, 165, 166, 0.8)',
        'rgba(26, 188, 156, 0.8)',
        'rgba(155, 89, 182, 0.8)',
        'rgba(22, 160, 133, 0.8)'
    ];
    
    if (count <= colors.length) {
        return colors.slice(0, count);
    }
    
    const additionalColors = [];
    for (let i = colors.length; i < count; i++) {
        const hue = (i * 137.508) % 360;
        additionalColors.push(`hsl(${hue}, 70%, 65%)`);
    }
    
    return [...colors, ...additionalColors].slice(0, count);
}

// ===== ESTILOS DINÂMICOS =====
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Ajuste para valor total do patrimônio */
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
        
        /* Logotipo APD */
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
        
        /* @Falcandra Data Consulting */
        .consulting-text {
            font-size: 14px;
            color: #3498db;
            font-weight: 600;
            margin-bottom: 10px;
            font-style: italic;
        }
        
        /* Remoção de filtros de valor */
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

// ===== PREVENIR SAÍDA =====
window.addEventListener('beforeunload', function(e) {
    if (STATE.isLoading) {
        e.preventDefault();
        e.returnValue = 'A análise ainda está em progresso. Tem certeza que deseja sair?';
        return e.returnValue;
    }
});

// ===== FUNÇÕES GLOBAIS =====
window.toggleChartType = function(chartName) {
    const types = ['pie', 'bar', 'line', 'doughnut'];
    const currentIndex = types.indexOf(STATE.chartTypes[chartName]);
    STATE.chartTypes[chartName] = types[(currentIndex + 1) % types.length];
    
    createCharts();
    showNotification(`Gráfico alterado para: ${STATE.chartTypes[chartName]}`, 'info');
};

// ===== INICIALIZAÇÃO FINAL =====
console.log('APRODET Dashboard carregado com sucesso!');
