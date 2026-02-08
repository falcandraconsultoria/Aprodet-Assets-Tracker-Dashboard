// main.js - APRODET Dashboard Completo
// Sistema de análise patrimonial com upload de Excel/CSV

// ===== CONFIGURAÇÕES =====
const REQUIRED_COLUMNS = [
    'ID_Item', 'Codigo_Patrimonial', 'Nome_Item', 'Número de serie',
    'Categoria', 'Descrição', 'Quantidade', 'Estado_Conservação',
    'Data_Aquisição', 'Valor_Aquisição', 'Fonte_Aquisição', 'Fornecedor',
    'Localização_Item', 'Distrito_Localização', 'Uso_Actual',
    'Responsável_Item', 'Contacto_Responsável_Item', 'Vida_Util_Estimada',
    'Data_Ultima_Verificação', 'Observações'
];

// ===== ESTADO GLOBAL =====
const state = {
    currentFile: null,
    processedData: null,
    filteredData: null,
    indicators: {},
    charts: {},
    filters: {
        category: 'all',
        district: 'all',
        status: 'all',
        minValue: null,
        maxValue: null,
        responsible: 'all',
        use: 'all'
    },
    currentPage: 1,
    itemsPerPage: 10,
    searchTerm: '',
    isLoading: false
};

// ===== ELEMENTOS DOM =====
let elements = {};

// ===== INICIALIZAÇÃO PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    updateCurrentDate();
    
    // Configurar drag and drop
    setupDragAndDrop();
    
    // Verificar se há dados salvos
    checkForSavedData();
});

// ===== INICIALIZAÇÃO DE ELEMENTOS =====
function initializeElements() {
    // Páginas
    elements.uploadPage = document.getElementById('uploadPage');
    elements.dashboardPage = document.getElementById('dashboardPage');
    
    // Upload
    elements.uploadArea = document.getElementById('uploadArea');
    elements.fileInput = document.getElementById('fileInput');
    elements.selectFileBtn = document.getElementById('selectFileBtn');
    elements.fileInfo = document.getElementById('fileInfo');
    elements.fileNameDisplay = document.getElementById('fileNameDisplay');
    elements.fileSizeDisplay = document.getElementById('fileSizeDisplay');
    elements.clearFileBtn = document.getElementById('clearFileBtn');
    elements.startAnalysisBtn = document.getElementById('startAnalysisBtn');
    
    // Dashboard
    elements.backToHomeBtn = document.getElementById('backToHomeBtn');
    elements.dashboardSubtitle = document.getElementById('dashboardSubtitle');
    
    // Indicadores
    elements.totalValue = document.getElementById('totalValue');
    elements.totalItems = document.getElementById('totalItems');
    elements.avgStatus = document.getElementById('avgStatus');
    elements.criticalItems = document.getElementById('criticalItems');
    
    // Filtros
    elements.categoryFilter = document.getElementById('categoryFilter');
    elements.districtFilter = document.getElementById('districtFilter');
    elements.statusFilter = document.getElementById('statusFilter');
    elements.minValue = document.getElementById('minValue');
    elements.maxValue = document.getElementById('maxValue');
    elements.responsibleFilter = document.getElementById('responsibleFilter');
    elements.useFilter = document.getElementById('useFilter');
    elements.applyFiltersBtn = document.getElementById('applyFiltersBtn');
    elements.resetFiltersBtn = document.getElementById('resetFiltersBtn');
    elements.searchInput = document.getElementById('searchInput');
    
    // Tabelas
    elements.criticalTableBody = document.getElementById('criticalTableBody');
    elements.allItemsTableBody = document.getElementById('allItemsTableBody');
    
    // Loading
    elements.loadingOverlay = document.getElementById('loadingOverlay');
    elements.loadingText = document.getElementById('loadingText');
    
    // Exportação
    elements.exportPdfBtn = document.getElementById('exportPdfBtn');
    elements.exportCsvBtn = document.getElementById('exportCsvBtn');
    elements.exportReportBtn = document.getElementById('exportReportBtn');
}

// ===== CONFIGURAÇÃO DE EVENT LISTENERS =====
function setupEventListeners() {
    // Upload
    if (elements.selectFileBtn) {
        elements.selectFileBtn.addEventListener('click', () => elements.fileInput.click());
    }
    
    if (elements.fileInput) {
        elements.fileInput.addEventListener('change', handleFileSelect);
    }
    
    if (elements.clearFileBtn) {
        elements.clearFileBtn.addEventListener('click', clearSelectedFile);
    }
    
    if (elements.startAnalysisBtn) {
        elements.startAnalysisBtn.addEventListener('click', startAnalysis);
    }
    
    // Dashboard
    if (elements.backToHomeBtn) {
        elements.backToHomeBtn.addEventListener('click', goBackToHome);
    }
    
    // Filtros
    if (elements.applyFiltersBtn) {
        elements.applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    if (elements.resetFiltersBtn) {
        elements.resetFiltersBtn.addEventListener('click', resetFilters);
    }
    
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', function(e) {
            state.searchTerm = e.target.value;
            applyFilters();
        });
    }
    
    // Exportação
    if (elements.exportPdfBtn) {
        elements.exportPdfBtn.addEventListener('click', exportToPDF);
    }
    
    if (elements.exportCsvBtn) {
        elements.exportCsvBtn.addEventListener('click', exportToCSV);
    }
    
    if (elements.exportReportBtn) {
        elements.exportReportBtn.addEventListener('click', exportReport);
    }
}

// ===== DRAG AND DROP =====
function setupDragAndDrop() {
    if (!elements.uploadArea) return;
    
    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.add('drag-over');
    });
    
    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.classList.remove('drag-over');
    });
    
    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            elements.fileInput.files = e.dataTransfer.files;
            handleFileSelect();
        }
    });
}

// ===== MANIPULAÇÃO DE ARQUIVOS =====
function handleFileSelect() {
    const file = elements.fileInput.files[0];
    if (!file) return;
    
    // Validar tipo
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
        showNotification('Formato de arquivo inválido. Use .xlsx, .xls ou .csv', 'error');
        clearSelectedFile();
        return;
    }
    
    // Atualizar estado
    state.currentFile = file;
    
    // Atualizar interface
    elements.fileNameDisplay.textContent = file.name;
    elements.fileSizeDisplay.textContent = formatFileSize(file.size);
    elements.fileInfo.style.display = 'block';
    elements.uploadArea.style.display = 'none';
}

function clearSelectedFile() {
    elements.fileInput.value = '';
    state.currentFile = null;
    elements.fileInfo.style.display = 'none';
    elements.uploadArea.style.display = 'block';
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
    state.isLoading = true;
    
    try {
        if (state.currentFile) {
            await processRealFile(state.currentFile);
        } else {
            generateDemoData();
        }
        
        // Validar dados
        const validation = validateData(state.processedData);
        if (!validation.valid) {
            throw new Error(validation.message);
        }
        
        // Atualizar dashboard
        updateDashboard();
        
        // Mostrar dashboard
        switchToDashboard();
        
        // Salvar dados para recarregamento
        saveDataToStorage();
        
    } catch (error) {
        console.error('Erro na análise:', error);
        showNotification(`Erro: ${error.message}. Usando dados de demonstração.`, 'warning');
        generateDemoData();
        updateDashboard();
        switchToDashboard();
    } finally {
        hideLoading();
        state.isLoading = false;
    }
}

async function processRealFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                if (file.name.endsWith('.csv')) {
                    state.processedData = parseCSV(e.target.result);
                } else {
                    // Para Excel, usamos dados demo
                    showNotification('Arquivo Excel detectado. Usando dados de demonstração.', 'info');
                    state.processedData = generateDemoData();
                }
                state.filteredData = [...state.processedData];
                calculateIndicators();
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
            
            // Converter tipos de dados
            if (header === 'Valor_Aquisição' || header === 'Quantidade') {
                value = parseFloat(value) || (header === 'Quantidade' ? 1 : 0);
            }
            
            item[header] = value;
        });
        
        data.push(item);
    }
    
    return data;
}

// ===== GERAÇÃO DE DADOS DE DEMONSTRAÇÃO =====
function generateDemoData() {
    const categories = ['Mobiliário', 'Equipamento Informático', 'Veículos', 'Maquinaria', 'Edifícios'];
    const statuses = ['Bom', 'Regular', 'Ruim'];
    const districts = ['Maputo', 'Matola', 'Beira', 'Nampula', 'Quelimane', 'Tete', 'Xai-Xai'];
    const uses = ['Em uso', 'Em armazém', 'Em manutenção', 'Desativado'];
    const responsibles = ['Maria Silva', 'João Santos', 'Ana Pereira', 'Carlos Mendes', 'Sofia Costa'];
    
    const demoData = [];
    
    for (let i = 1; i <= 100; i++) {
        const category = categories[i % categories.length];
        const status = statuses[i % statuses.length];
        const district = districts[i % districts.length];
        const value = Math.round((Math.random() * 100000 + 1000) * 100) / 100;
        const quantity = Math.floor(Math.random() * 5) + 1;
        const year = 2018 + (i % 6);
        const month = (i % 12) + 1;
        const day = (i % 28) + 1;
        
        demoData.push({
            'ID_Item': `ITEM-${i.toString().padStart(3, '0')}`,
            'Codigo_Patrimonial': `CP-${year}-${i}`,
            'Nome_Item': `${category} ${i}`,
            'Número de serie': `SN-${10000 + i}`,
            'Categoria': category,
            'Descrição': `Descrição do ${category.toLowerCase()} modelo ${i}`,
            'Quantidade': quantity,
            'Estado_Conservação': status,
            'Data_Aquisição': `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
            'Valor_Aquisição': value,
            'Fonte_Aquisição': ['Compra', 'Doação', 'Transferência'][i % 3],
            'Fornecedor': `Fornecedor ${(i % 10) + 1}`,
            'Localização_Item': `Sala ${(i % 20) + 1}, Piso ${(i % 3) + 1}`,
            'Distrito_Localização': district,
            'Uso_Actual': uses[i % uses.length],
            'Responsável_Item': responsibles[i % responsibles.length],
            'Contacto_Responsável_Item': `+258 8${i % 10}${i % 10} ${i % 10}${i % 10}${i % 10} ${i % 10}${i % 10}${i % 10}`,
            'Vida_Util_Estimada': (5 + (i % 15)).toString(),
            'Data_Ultima_Verificação': `2023-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
            'Observações': i % 7 === 0 ? 'Necessita manutenção urgente' : (i % 5 === 0 ? 'Verificar estado' : '')
        });
    }
    
    state.processedData = demoData;
    state.filteredData = [...demoData];
    calculateIndicators();
    
    return demoData;
}

// ===== CÁLCULO DE INDICADORES =====
function calculateIndicators() {
    if (!state.processedData || state.processedData.length === 0) {
        state.indicators = {};
        return;
    }
    
    const data = state.processedData;
    
    // Valor total e contagem
    let totalValue = 0;
    let totalItems = 0;
    const statusDistribution = {};
    const categoryDistribution = {};
    const districtDistribution = {};
    const criticalItems = [];
    
    data.forEach(item => {
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        const quantity = parseInt(item['Quantidade']) || 1;
        const status = item['Estado_Conservação'] || 'Não Informado';
        const category = item['Categoria'] || 'Não Categorizado';
        const district = item['Distrito_Localização'] || 'Não Especificado';
        
        // Valor total
        totalValue += value * quantity;
        totalItems += quantity;
        
        // Distribuição por estado
        statusDistribution[status] = (statusDistribution[status] || 0) + quantity;
        
        // Distribuição por categoria
        if (!categoryDistribution[category]) {
            categoryDistribution[category] = { value: 0, count: 0 };
        }
        categoryDistribution[category].value += value * quantity;
        categoryDistribution[category].count += quantity;
        
        // Distribuição por distrito
        districtDistribution[district] = (districtDistribution[district] || 0) + 1;
        
        // Itens críticos
        if (status === 'Ruim' && value > 5000) {
            criticalItems.push(item);
        }
    });
    
    // Calcular estado médio (0-100%)
    let statusScore = 0;
    data.forEach(item => {
        const status = item['Estado_Conservação'];
        const quantity = parseInt(item['Quantidade']) || 1;
        
        if (status === 'Bom') statusScore += quantity * 100;
        else if (status === 'Regular') statusScore += quantity * 60;
        else if (status === 'Ruim') statusScore += quantity * 20;
        else statusScore += quantity * 50;
    });
    
    const avgStatus = totalItems > 0 ? Math.round(statusScore / totalItems) : 0;
    
    // Timeline (aquisições por ano)
    const timelineData = {};
    data.forEach(item => {
        const date = item['Data_Aquisição'];
        if (!date) return;
        
        const year = date.substring(0, 4);
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        const quantity = parseInt(item['Quantidade']) || 1;
        
        if (!timelineData[year]) {
            timelineData[year] = { value: 0, count: 0 };
        }
        timelineData[year].value += value * quantity;
        timelineData[year].count += quantity;
    });
    
    state.indicators = {
        totalValue,
        totalItems,
        statusDistribution,
        avgStatus,
        criticalItems: criticalItems.length,
        categoryDistribution,
        districtDistribution,
        timelineData,
        dataLength: data.length
    };
}

// ===== VALIDAÇÃO DE DADOS =====
function validateData(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return { valid: false, message: 'Dados inválidos ou vazios' };
    }
    
    // Verificar campos mínimos
    const sampleItem = data[0];
    const requiredFields = ['ID_Item', 'Nome_Item', 'Categoria', 'Valor_Aquisição'];
    
    for (const field of requiredFields) {
        if (!sampleItem.hasOwnProperty(field)) {
            return { 
                valid: false, 
                message: `Campo obrigatório "${field}" não encontrado` 
            };
        }
    }
    
    return { valid: true, message: `Dados válidos: ${data.length} itens processados` };
}

// ===== ATUALIZAÇÃO DO DASHBOARD =====
function updateDashboard() {
    updateIndicators();
    updateFilterOptions();
    createCharts();
    updateTables();
}

function updateIndicators() {
    const indicators = state.indicators;
    
    // Formatar valor monetário
    const formattedValue = new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'MZN'
    }).format(indicators.totalValue || 0);
    
    if (elements.totalValue) {
        elements.totalValue.textContent = formattedValue;
    }
    if (elements.totalItems) {
        elements.totalItems.textContent = indicators.totalItems || 0;
    }
    if (elements.avgStatus) {
        elements.avgStatus.textContent = `${indicators.avgStatus || 0}%`;
    }
    if (elements.criticalItems) {
        elements.criticalItems.textContent = indicators.criticalItems || 0;
    }
    
    // Atualizar subtítulo
    if (elements.dashboardSubtitle) {
        const itemCount = state.filteredData ? state.filteredData.length : 0;
        const totalCount = state.processedData ? state.processedData.length : 0;
        const filterText = itemCount !== totalCount ? ` (${itemCount} de ${totalCount} itens)` : ` (${totalCount} itens)`;
        elements.dashboardSubtitle.textContent = `Análise Patrimonial${filterText}`;
    }
}

function updateFilterOptions() {
    if (!state.processedData) return;
    
    const data = state.processedData;
    const categories = new Set();
    const districts = new Set();
    const responsibles = new Set();
    const uses = new Set();
    
    data.forEach(item => {
        if (item['Categoria']) categories.add(item['Categoria']);
        if (item['Distrito_Localização']) districts.add(item['Distrito_Localização']);
        if (item['Responsável_Item']) responsibles.add(item['Responsável_Item']);
        if (item['Uso_Actual']) uses.add(item['Uso_Actual']);
    });
    
    updateSelect(elements.categoryFilter, categories, 'Todas as Categorias');
    updateSelect(elements.districtFilter, districts, 'Todos os Distritos');
    updateSelect(elements.responsibleFilter, responsibles, 'Todos os Responsáveis');
    updateSelect(elements.useFilter, uses, 'Todos os Usos');
}

function updateSelect(selectElement, valuesSet, defaultText) {
    if (!selectElement) return;
    
    const currentValue = selectElement.value;
    
    // Limpar opções (exceto a primeira)
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    
    // Ordenar e adicionar valores
    Array.from(valuesSet).sort().forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        selectElement.appendChild(option);
    });
    
    // Restaurar valor selecionado
    if (currentValue && Array.from(valuesSet).includes(currentValue)) {
        selectElement.value = currentValue;
    }
}

// ===== CRIAÇÃO DE GRÁFICOS =====
function createCharts() {
    // Destruir gráficos existentes
    if (state.charts) {
        Object.values(state.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
    }
    
    state.charts = {};
    
    // Criar gráficos
    setTimeout(() => {
        createCategoryChart();
        createStatusChart();
        createDistrictChart();
        createTimelineChart();
    }, 100);
}

function createCategoryChart() {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const categories = state.indicators.categoryDistribution || {};
    
    const labels = Object.keys(categories);
    const data = labels.map(label => categories[label].value);
    
    const backgroundColors = [
        '#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EF4444',
        '#06B6D4', '#84CC16', '#F59E0B', '#EC4899', '#6366F1'
    ];
    
    state.charts.category = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors.slice(0, labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        font: {
                            size: 11
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Distribuição de Valor por Categoria',
                    font: {
                        size: 14
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
    const statusDist = state.indicators.statusDistribution || {};
    
    const labels = Object.keys(statusDist);
    const data = labels.map(label => statusDist[label]);
    
    const backgroundColors = labels.map(label => {
        switch(label) {
            case 'Bom': return '#10B981';
            case 'Regular': return '#F97316';
            case 'Ruim': return '#EF4444';
            default: return '#6B7280';
        }
    });
    
    state.charts.status = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Número de Itens',
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribuição por Estado de Conservação',
                    font: {
                        size: 14
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Número de Itens'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Estado de Conservação'
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
    const districts = state.indicators.districtDistribution || {};
    
    const labels = Object.keys(districts);
    const data = labels.map(label => districts[label]);
    
    state.charts.district = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#3B82F6', '#10B981', '#F97316', '#8B5CF6',
                    '#EF4444', '#06B6D4', '#84CC16', '#F59E0B'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                title: {
                    display: true,
                    text: 'Distribuição de Itens por Distrito',
                    font: {
                        size: 14
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
    const timeline = state.indicators.timelineData || {};
    
    const labels = Object.keys(timeline).sort();
    const data = labels.map(year => timeline[year].value);
    
    state.charts.timeline = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Valor das Aquisições (MZN)',
                data: data,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Aquisições ao Longo do Tempo',
                    font: {
                        size: 14
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Valor (MZN)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Ano'
                    }
                }
            }
        }
    });
}

// ===== ATUALIZAÇÃO DE TABELAS =====
function updateTables() {
    updateCriticalTable();
    updateAllItemsTable();
}

function updateCriticalTable() {
    if (!elements.criticalTableBody) return;
    
    const tbody = elements.criticalTableBody;
    tbody.innerHTML = '';
    
    if (!state.filteredData) {
        showEmptyTableMessage(tbody, 6, 'Nenhum dado disponível');
        return;
    }
    
    const criticalItems = state.filteredData.filter(item => {
        const status = item['Estado_Conservação'];
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        return status === 'Ruim' && value > 5000;
    });
    
    if (criticalItems.length === 0) {
        showEmptyTableMessage(tbody, 6, 'Nenhum item crítico encontrado', 'check-circle', '#10B981');
        return;
    }
    
    criticalItems.forEach(item => {
        const row = document.createElement('tr');
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        
        row.innerHTML = `
            <td>${escapeHtml(item['ID_Item'] || '')}</td>
            <td>${escapeHtml(item['Nome_Item'] || '')}</td>
            <td>${escapeHtml(item['Categoria'] || '')}</td>
            <td><span class="status-badge status-bad">${escapeHtml(item['Estado_Conservação'] || '')}</span></td>
            <td>${formatCurrency(value)}</td>
            <td>${escapeHtml(item['Localização_Item'] || '')}</td>
        `;
        tbody.appendChild(row);
    });
}

function updateAllItemsTable() {
    if (!elements.allItemsTableBody) return;
    
    const tbody = elements.allItemsTableBody;
    tbody.innerHTML = '';
    
    if (!state.filteredData) {
        showEmptyTableMessage(tbody, 6, 'Nenhum dado disponível');
        return;
    }
    
    // Aplicar paginação
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const paginatedItems = state.filteredData.slice(startIndex, endIndex);
    
    if (paginatedItems.length === 0) {
        showEmptyTableMessage(tbody, 6, 'Nenhum item encontrado', 'search', '#6B7280');
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
            <td>${escapeHtml(item['ID_Item'] || '')}</td>
            <td>${escapeHtml(truncateText(item['Nome_Item'] || '', 30))}</td>
            <td>${escapeHtml(item['Categoria'] || '')}</td>
            <td><span class="status-badge ${statusClass}">${escapeHtml(status)}</span></td>
            <td>${formatCurrency(value)}</td>
            <td>${escapeHtml(item['Distrito_Localização'] || '')}</td>
        `;
        tbody.appendChild(row);
    });
}

function showEmptyTableMessage(tbody, colSpan, message, icon = 'info-circle', color = '#6B7280') {
    tbody.innerHTML = `
        <tr>
            <td colspan="${colSpan}" style="text-align: center; padding: 40px 20px;">
                <i class="fas fa-${icon}" style="font-size: 3rem; color: ${color}; margin-bottom: 15px; display: block;"></i>
                <h4 style="color: ${color}; margin-bottom: 10px;">${message}</h4>
                <p style="color: #9CA3AF; font-size: 0.9rem;">
                    ${state.filteredData && state.filteredData.length > 0 ? 
                        'Tente ajustar os filtros' : 
                        'Carregue um arquivo ou use os dados de demonstração'}
                </p>
            </td>
        </tr>
    `;
}

// ===== FILTROS =====
function applyFilters() {
    if (!state.processedData) return;
    
    // Coletar valores dos filtros
    state.filters.category = elements.categoryFilter ? elements.categoryFilter.value : 'all';
    state.filters.district = elements.districtFilter ? elements.districtFilter.value : 'all';
    state.filters.status = elements.statusFilter ? elements.statusFilter.value : 'all';
    state.filters.responsible = elements.responsibleFilter ? elements.responsibleFilter.value : 'all';
    state.filters.use = elements.useFilter ? elements.useFilter.value : 'all';
    
    // Valores numéricos
    state.filters.minValue = elements.minValue && elements.minValue.value ? 
        parseFloat(elements.minValue.value) : null;
    state.filters.maxValue = elements.maxValue && elements.maxValue.value ? 
        parseFloat(elements.maxValue.value) : null;
    
    // Aplicar filtros
    state.filteredData = state.processedData.filter(item => {
        // Filtro de categoria
        if (state.filters.category !== 'all' && state.filters.category !== item['Categoria']) {
            return false;
        }
        
        // Filtro de distrito
        if (state.filters.district !== 'all' && state.filters.district !== item['Distrito_Localização']) {
            return false;
        }
        
        // Filtro de estado
        if (state.filters.status !== 'all' && state.filters.status !== item['Estado_Conservação']) {
            return false;
        }
        
        // Filtro de responsável
        if (state.filters.responsible !== 'all' && state.filters.responsible !== item['Responsável_Item']) {
            return false;
        }
        
        // Filtro de uso
        if (state.filters.use !== 'all' && state.filters.use !== item['Uso_Actual']) {
            return false;
        }
        
        // Filtro de valor
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        if (state.filters.minValue !== null && value < state.filters.minValue) {
            return false;
        }
        if (state.filters.maxValue !== null && value > state.filters.maxValue) {
            return false;
        }
        
        // Filtro de busca
        if (state.searchTerm && state.searchTerm.trim() !== '') {
            const searchLower = state.searchTerm.toLowerCase();
            const searchableFields = [
                item['ID_Item'],
                item['Nome_Item'],
                item['Categoria'],
                item['Descrição'],
                item['Localização_Item'],
                item['Distrito_Localização'],
                item['Responsável_Item']
            ].filter(field => field).map(field => field.toLowerCase());
            
            if (!searchableFields.some(field => field.includes(searchLower))) {
                return false;
            }
        }
        
        return true;
    });
    
    // Recalcular indicadores para dados filtrados
    calculateIndicatorsForFilteredData();
    
    // Resetar paginação
    state.currentPage = 1;
    
    // Atualizar dashboard
    updateDashboard();
}

function calculateIndicatorsForFilteredData() {
    if (!state.filteredData) return;
    
    // Salvar dados originais
    const originalData = state.processedData;
    
    // Calcular indicadores com dados filtrados
    state.processedData = state.filteredData;
    calculateIndicators();
    
    // Restaurar dados originais
    state.processedData = originalData;
}

function resetFilters() {
    // Resetar estado
    state.filters = {
        category: 'all',
        district: 'all',
        status: 'all',
        minValue: null,
        maxValue: null,
        responsible: 'all',
        use: 'all'
    };
    state.searchTerm = '';
    state.currentPage = 1;
    
    // Resetar controles
    if (elements.categoryFilter) elements.categoryFilter.value = 'all';
    if (elements.districtFilter) elements.districtFilter.value = 'all';
    if (elements.statusFilter) elements.statusFilter.value = 'all';
    if (elements.responsibleFilter) elements.responsibleFilter.value = 'all';
    if (elements.useFilter) elements.useFilter.value = 'all';
    if (elements.minValue) elements.minValue.value = '';
    if (elements.maxValue) elements.maxValue.value = '';
    if (elements.searchInput) elements.searchInput.value = '';
    
    // Resetar dados filtrados
    state.filteredData = state.processedData ? [...state.processedData] : null;
    
    // Recalcular indicadores
    calculateIndicators();
    
    // Atualizar dashboard
    updateDashboard();
}

// ===== NAVEGAÇÃO =====
function switchToDashboard() {
    elements.uploadPage.style.display = 'none';
    elements.dashboardPage.style.display = 'block';
    
    // Adicionar animação
    elements.dashboardPage.style.opacity = '0';
    elements.dashboardPage.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        elements.dashboardPage.style.transition = 'all 0.5s ease';
        elements.dashboardPage.style.opacity = '1';
        elements.dashboardPage.style.transform = 'translateY(0)';
    }, 50);
}

function goBackToHome() {
    elements.dashboardPage.style.display = 'none';
    elements.uploadPage.style.display = 'block';
    clearSelectedFile();
}

// ===== EXPORTAÇÃO =====
function exportToPDF() {
    showLoading('Gerando relatório PDF...');
    
    // Verificar se jsPDF está disponível
    if (typeof window.jspdf !== 'undefined') {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Adicionar conteúdo básico
            doc.setFontSize(20);
            doc.text('RELATÓRIO APRODET', 105, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.text(`Data: ${new Date().toLocaleDateString('pt-PT')}`, 20, 40);
            doc.text(`Hora: ${new Date().toLocaleTimeString('pt-PT')}`, 20, 50);
            
            // Adicionar indicadores
            doc.setFontSize(14);
            doc.text('INDICADORES PRINCIPAIS', 20, 70);
            
            doc.setFontSize(10);
            doc.text(`• Valor Total: ${formatCurrency(state.indicators.totalValue || 0)}`, 30, 85);
            doc.text(`• Total de Itens: ${state.indicators.totalItems || 0}`, 30, 95);
            doc.text(`• Estado Médio: ${state.indicators.avgStatus || 0}%`, 30, 105);
            doc.text(`• Itens Críticos: ${state.indicators.criticalItems || 0}`, 30, 115);
            
            // Salvar PDF
            doc.save(`relatorio_aprodet_${new Date().getTime()}.pdf`);
            
            hideLoading();
            showNotification('PDF gerado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            hideLoading();
            showNotification('Erro ao gerar PDF. Tente novamente.', 'error');
        }
    } else {
        hideLoading();
        showNotification('Funcionalidade PDF não disponível no momento.', 'info');
    }
}

function exportToCSV() {
    if (!state.filteredData || state.filteredData.length === 0) {
        showNotification('Nenhum dado para exportar!', 'warning');
        return;
    }
    
    showLoading('Gerando arquivo CSV...');
    
    try {
        // Converter dados para CSV
        const headers = Object.keys(state.filteredData[0]);
        const csvRows = [];
        
        // Cabeçalhos
        csvRows.push(headers.join(','));
        
        // Dados
        state.filteredData.forEach(item => {
            const row = headers.map(header => {
                const value = item[header];
                const escaped = (value === null || value === undefined) ? '' : String(value);
                return `"${escaped.replace(/"/g, '""')}"`;
            });
            csvRows.push(row.join(','));
        });
        
        // Criar e baixar arquivo
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        const fileName = state.currentFile 
            ? `aprodet_${state.currentFile.name.replace(/\.[^/.]+$/, '')}_export.csv`
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
        showNotification('Erro ao exportar CSV. Tente novamente.', 'error');
    }
}

function exportReport() {
    if (!state.indicators || !state.filteredData) {
        showNotification('Nenhum dado disponível para relatório', 'warning');
        return;
    }
    
    showLoading('Gerando relatório...');
    
    try {
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
        
        hideLoading();
        showNotification('Relatório gerado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        hideLoading();
        showNotification('Erro ao gerar relatório.', 'error');
    }
}

function generateReportContent() {
    const indicators = state.indicators;
    const now = new Date();
    
    return `
RELATÓRIO APRODET - DASHBOARD PATRIMONIAL
==========================================
Data de geração: ${now.toLocaleDateString('pt-PT')} ${now.toLocaleTimeString('pt-PT')}
Arquivo: ${state.currentFile ? state.currentFile.name : 'Dados de demonstração'}
Itens analisados: ${state.filteredData ? state.filteredData.length : 0}

RESUMO EXECUTIVO
================
• Valor Total do Patrimônio: ${formatCurrency(indicators.totalValue || 0)}
• Total de Itens no Inventário: ${indicators.totalItems || 0}
• Estado Médio de Conservação: ${indicators.avgStatus || 0}%
• Itens Críticos Identificados: ${indicators.criticalItems || 0}

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

ITENS CRÍTICOS (PRIORIDADE ALTA)
=================================
${state.filteredData
    .filter(item => item['Estado_Conservação'] === 'Ruim' && (parseFloat(item['Valor_Aquisição']) || 0) > 5000)
    .slice(0, 20)
    .map((item, index) => 
        `${index + 1}. ${item['ID_Item']} - ${item['Nome_Item']} - ${formatCurrency(parseFloat(item['Valor_Aquisição']) || 0)} - ${item['Localização_Item']}`
    ).join('\n')}

RECOMENDAÇÕES
=============
1. ${indicators.criticalItems > 0 ? 
    `Priorizar manutenção/reposição de ${indicators.criticalItems} itens críticos` : 
    'Nenhum item crítico requer atenção imediata'}
2. ${indicators.avgStatus < 70 ? 
    `Implementar plano de manutenção preventiva (estado médio: ${indicators.avgStatus}%)` :
    'Estado do patrimônio dentro dos parâmetros aceitáveis'}
3. Revisar periodicamente itens com mais de 5 anos de uso
4. Considerar seguro para itens de alto valor

ANÁLISE TEMPORAL
================
${Object.entries(indicators.timelineData || {}).sort((a, b) => a[0] - b[0]).map(([year, data]) => 
    `• ${year}: ${formatCurrency(data.value)} em ${data.count} aquisições`
).join('\n')}

--- FIM DO RELATÓRIO ---
Gerado pelo APRODET Dashboard v1.0
`;
}

// ===== UTILITÁRIOS =====
function showLoading(message) {
    if (elements.loadingOverlay && elements.loadingText) {
        elements.loadingText.textContent = message;
        elements.loadingOverlay.style.display = 'flex';
        state.isLoading = true;
    }
}

function hideLoading() {
    if (elements.loadingOverlay) {
        elements.loadingOverlay.style.display = 'none';
        state.isLoading = false;
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
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F97316' : '#3B82F6'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    // Adicionar ao documento
    document.body.appendChild(notification);
    
    // Botão fechar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    // Adicionar estilos de animação se não existirem
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 0;
                margin-left: 10px;
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== LOCAL STORAGE =====
function saveDataToStorage() {
    try {
        const dataToSave = {
            indicators: state.indicators,
            filters: state.filters,
            lastUpdated: new Date().getTime()
        };
        localStorage.setItem('aprodetDashboardData', JSON.stringify(dataToSave));
    } catch (error) {
        console.warn('Não foi possível salvar dados no localStorage:', error);
    }
}

function checkForSavedData() {
    try {
        const savedData = localStorage.getItem('aprodetDashboardData');
        if (savedData) {
            const data = JSON.parse(savedData);
            const oneDayAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
            
            if (data.lastUpdated > oneDayAgo) {
                // Dados são recentes (menos de 24 horas)
                state.indicators = data.indicators || {};
                state.filters = data.filters || {};
                
                // Mostrar notificação
                setTimeout(() => {
                    showNotification('Dados anteriores encontrados. Carregue um novo arquivo ou use dados de demonstração.', 'info');
                }, 1000);
            }
        }
    } catch (error) {
        console.warn('Erro ao recuperar dados salvos:', error);
    }
}

// ===== PREVENIR SAÍDA ACIDENTAL =====
window.addEventListener('beforeunload', function(e) {
    if (state.isLoading) {
        e.preventDefault();
        e.returnValue = 'A análise ainda está em progresso. Tem certeza que deseja sair?';
        return e.returnValue;
    }
});

// ===== INICIALIZAÇÃO FINAL =====
// Garantir que todos os elementos estão prontos
setTimeout(() => {
    if (!elements.uploadPage && document.getElementById('uploadPage')) {
        initializeElements();
        setupEventListeners();
    }
}, 100);
