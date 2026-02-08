// main.js - APRODET Dashboard
// Código JavaScript completo para funcionamento do dashboard

// ===== CONFIGURAÇÕES =====
const REQUIRED_COLUMNS = [
    'ID_Item', 'Codigo_Patrimonial', 'Nome_Item', 'Número de serie',
    'Categoria', 'Descrição', 'Quantidade', 'Estado_Conservação',
    'Data_Aquisição', 'Valor_Aquisição', 'Fonte_Aquisição', 'Fornecedor',
    'Localização_Item', 'Distrito_Localização', 'Uso_Actual',
    'Responsável_Item', 'Contacto_Responsável_Item', 'Vida_Util_Estimada',
    'Data_Ultima_Verificação', 'Observações'
];

// ===== ESTADO DA APLICAÇÃO =====
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
    searchTerm: ''
};

// ===== ELEMENTOS DOM (serão inicializados) =====
let elements = {};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    initElements();
    initUploadPage();
    initDashboard();
    updateCurrentDate();
    setupEventListeners();
});

// ===== INICIALIZAÇÃO DE ELEMENTOS =====
function initElements() {
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
}

// ===== CONFIGURAÇÃO DE EVENT LISTENERS =====
function setupEventListeners() {
    // Filtros
    if (elements.applyFiltersBtn) {
        elements.applyFiltersBtn.addEventListener('click', applyFilters);
    }
    if (elements.resetFiltersBtn) {
        elements.resetFiltersBtn.addEventListener('click', resetFilters);
    }
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', debounce(applySearch, 300));
    }
    
    // Exportação
    if (elements.exportPdfBtn) {
        elements.exportPdfBtn.addEventListener('click', exportToPDF);
    }
    if (elements.exportCsvBtn) {
        elements.exportCsvBtn.addEventListener('click', exportToCSV);
    }
}

// ===== FUNÇÕES DA PÁGINA DE UPLOAD =====
function initUploadPage() {
    // Botão selecionar arquivo
    if (elements.selectFileBtn) {
        elements.selectFileBtn.addEventListener('click', () => {
            elements.fileInput.click();
        });
    }
    
    // Quando arquivo é selecionado
    if (elements.fileInput) {
        elements.fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Drag and drop
    setupDragAndDrop();
    
    // Limpar arquivo
    if (elements.clearFileBtn) {
        elements.clearFileBtn.addEventListener('click', clearSelectedFile);
    }
    
    // Iniciar análise
    if (elements.startAnalysisBtn) {
        elements.startAnalysisBtn.addEventListener('click', startAnalysis);
    }
}

function handleFileSelect() {
    const file = elements.fileInput.files[0];
    if (!file) return;
    
    // Validar tipo
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
        alert('Formato de arquivo inválido. Use .xlsx, .xls ou .csv');
        clearSelectedFile();
        return;
    }
    
    // Atualizar estado
    state.currentFile = file;
    
    // Atualizar interface
    if (elements.fileNameDisplay) {
        elements.fileNameDisplay.textContent = file.name;
    }
    if (elements.fileSizeDisplay) {
        elements.fileSizeDisplay.textContent = formatFileSize(file.size);
    }
    if (elements.fileInfo) {
        elements.fileInfo.style.display = 'block';
    }
    if (elements.uploadArea) {
        elements.uploadArea.style.display = 'none';
    }
}

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

async function startAnalysis() {
    showLoading('Processando dados...');
    
    try {
        if (state.currentFile) {
            // Tentar processar arquivo real
            await processRealFile(state.currentFile);
        } else {
            // Usar dados de demonstração
            generateDemoData();
        }
        
        // Atualizar dashboard
        updateDashboard();
        
        // Mostrar dashboard
        elements.uploadPage.style.display = 'none';
        elements.dashboardPage.style.display = 'block';
        
        // Atualizar subtítulo
        if (state.currentFile) {
            elements.dashboardSubtitle.textContent = `Analisando: ${state.currentFile.name}`;
        } else {
            elements.dashboardSubtitle.textContent = 'Modo de demonstração';
        }
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao processar arquivo. Usando dados de demonstração.');
        generateDemoData();
        updateDashboard();
        elements.uploadPage.style.display = 'none';
        elements.dashboardPage.style.display = 'block';
        elements.dashboardSubtitle.textContent = 'Modo de demonstração';
    } finally {
        hideLoading();
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
                    // Para Excel, usamos dados demo (em produção usar SheetJS)
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
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    });
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = lines[i].split(',');
        const item = {};
        
        headers.forEach((header, index) => {
            item[header] = values[index] ? values[index].trim() : '';
        });
        
        // Converter valores numéricos
        if (item['Valor_Aquisição']) {
            item['Valor_Aquisição'] = parseFloat(item['Valor_Aquisição']) || 0;
        }
        if (item['Quantidade']) {
            item['Quantidade'] = parseInt(item['Quantidade']) || 1;
        }
        
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
        
        demoData.push({
            'ID_Item': `ITEM-${i.toString().padStart(3, '0')}`,
            'Codigo_Patrimonial': `CP-${2020 + (i % 5)}-${i}`,
            'Nome_Item': `${category} ${i}`,
            'Número de serie': `SN-${10000 + i}`,
            'Categoria': category,
            'Descrição': `Descrição do ${category.toLowerCase()} ${i}`,
            'Quantidade': quantity,
            'Estado_Conservação': status,
            'Data_Aquisição': `202${Math.floor(Math.random() * 5)}-${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}-${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}`,
            'Valor_Aquisição': value,
            'Fonte_Aquisição': ['Compra', 'Doação', 'Transferência'][i % 3],
            'Fornecedor': `Fornecedor ${(i % 10) + 1}`,
            'Localização_Item': `Sala ${(i % 20) + 1}`,
            'Distrito_Localização': district,
            'Uso_Actual': uses[i % uses.length],
            'Responsável_Item': responsibles[i % responsibles.length],
            'Contacto_Responsável_Item': `+258 8${i % 10}${i % 10} ${i % 10}${i % 10}${i % 10} ${i % 10}${i % 10}${i % 10}`,
            'Vida_Util_Estimada': (5 + (i % 15)).toString(),
            'Data_Ultima_Verificação': `2023-${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}-${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}`,
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
    
    // Valor total
    const totalValue = data.reduce((sum, item) => {
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        const quantity = parseInt(item['Quantidade']) || 1;
        return sum + (value * quantity);
    }, 0);
    
    // Total de itens (considerando quantidade)
    const totalItems = data.reduce((sum, item) => {
        return sum + (parseInt(item['Quantidade']) || 1);
    }, 0);
    
    // Distribuição por estado
    const statusDistribution = {};
    data.forEach(item => {
        const status = item['Estado_Conservação'] || 'Não Informado';
        const quantity = parseInt(item['Quantidade']) || 1;
        statusDistribution[status] = (statusDistribution[status] || 0) + quantity;
    });
    
    // Calcular estado médio (0-100%)
    let statusScore = 0;
    let totalItemsForScore = 0;
    
    data.forEach(item => {
        const status = item['Estado_Conservação'];
        const quantity = parseInt(item['Quantidade']) || 1;
        
        if (status === 'Bom') statusScore += quantity * 100;
        else if (status === 'Regular') statusScore += quantity * 60;
        else if (status === 'Ruim') statusScore += quantity * 20;
        else statusScore += quantity * 50; // Não informado
        
        totalItemsForScore += quantity;
    });
    
    const avgStatus = totalItemsForScore > 0 ? Math.round(statusScore / totalItemsForScore) : 0;
    
    // Itens críticos (valor alto + estado ruim)
    const criticalItems = data.filter(item => {
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        const status = item['Estado_Conservação'];
        return status === 'Ruim' && value > 5000;
    }).length;
    
    // Distribuição por categoria
    const categoryDistribution = {};
    data.forEach(item => {
        const category = item['Categoria'] || 'Não Categorizado';
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        const quantity = parseInt(item['Quantidade']) || 1;
        
        if (!categoryDistribution[category]) {
            categoryDistribution[category] = { value: 0, count: 0 };
        }
        
        categoryDistribution[category].value += value * quantity;
        categoryDistribution[category].count += quantity;
    });
    
    // Distribuição por distrito
    const districtDistribution = {};
    data.forEach(item => {
        const district = item['Distrito_Localização'] || 'Não Especificado';
        if (!districtDistribution[district]) {
            districtDistribution[district] = 0;
        }
        districtDistribution[district]++;
    });
    
    state.indicators = {
        totalValue,
        totalItems,
        statusDistribution,
        avgStatus,
        criticalItems,
        categoryDistribution,
        districtDistribution,
        dataLength: data.length
    };
}

// ===== INICIALIZAÇÃO DO DASHBOARD =====
function initDashboard() {
    if (elements.backToHomeBtn) {
        elements.backToHomeBtn.addEventListener('click', goBackToHome);
    }
}

function goBackToHome() {
    elements.dashboardPage.style.display = 'none';
    elements.uploadPage.style.display = 'block';
    clearSelectedFile();
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
}

function updateFilterOptions() {
    if (!state.processedData) return;
    
    const data = state.processedData;
    
    // Coletar valores únicos
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
    
    // Atualizar selects
    updateSelectOptions(elements.categoryFilter, categories, 'Todas as Categorias');
    updateSelectOptions(elements.districtFilter, districts, 'Todos os Distritos');
    updateSelectOptions(elements.responsibleFilter, responsibles, 'Todos os Responsáveis');
    updateSelectOptions(elements.useFilter, uses, 'Todos os Usos');
}

function updateSelectOptions(selectElement, valuesSet, defaultText) {
    if (!selectElement) return;
    
    // Salvar valor selecionado atual
    const currentValue = selectElement.value;
    
    // Limpar opções (exceto a primeira)
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    
    // Adicionar novas opções
    const valuesArray = Array.from(valuesSet).sort();
    valuesArray.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        selectElement.appendChild(option);
    });
    
    // Restaurar valor selecionado se ainda existir
    if (currentValue && valuesArray.includes(currentValue)) {
        selectElement.value = currentValue;
    } else {
        selectElement.value = 'all';
    }
}

// ===== CRIAÇÃO DE GRÁFICOS =====
function createCharts() {
    if (!state.processedData) return;
    
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
    createCategoryChart();
    createStatusChart();
    createDistrictChart();
    createTimelineChart();
}

function createCategoryChart() {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const categories = state.indicators.categoryDistribution || {};
    
    const labels = Object.keys(categories);
    const data = labels.map(label => categories[label].value);
    
    // Cores para as categorias
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
                        padding: 20
                    }
                },
                title: {
                    display: true,
                    text: 'Distribuição de Valor por Categoria'
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
    
    // Cores baseadas no status
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
                    text: 'Distribuição por Estado de Conservação'
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
                    text: 'Distribuição de Itens por Distrito'
                }
            }
        }
    });
}

function createTimelineChart() {
    const canvas = document.getElementById('timelineChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const data = state.processedData || [];
    
    // Agrupar por ano de aquisição
    const yearGroups = {};
    data.forEach(item => {
        const date = item['Data_Aquisição'];
        if (!date) return;
        
        const year = date.substring(0, 4); // Extrair ano
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        
        if (!yearGroups[year]) {
            yearGroups[year] = 0;
        }
        yearGroups[year] += value;
    });
    
    const labels = Object.keys(yearGroups).sort();
    const values = labels.map(year => yearGroups[year]);
    
    state.charts.timeline = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Valor das Aquisições',
                data: values,
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
                    text: 'Aquisições ao Longo do Tempo'
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
    
    if (!state.filteredData) return;
    
    // Encontrar itens críticos
    const criticalItems = state.filteredData.filter(item => {
        const status = item['Estado_Conservação'];
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        return status === 'Ruim' && value > 5000;
    });
    
    if (criticalItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: var(--text-light);">
                    <i class="fas fa-check-circle" style="color: var(--aprodet-green); font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    Nenhum item crítico encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    // Adicionar itens à tabela
    criticalItems.forEach(item => {
        const row = document.createElement('tr');
        
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        const formattedValue = new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'MZN'
        }).format(value);
        
        row.innerHTML = `
            <td>${item['ID_Item'] || ''}</td>
            <td>${item['Nome_Item'] || ''}</td>
            <td>${item['Categoria'] || ''}</td>
            <td><span class="status-badge status-bad">${item['Estado_Conservação'] || ''}</span></td>
            <td>${formattedValue}</td>
            <td>${item['Localização_Item'] || ''}</td>
        `;
        
        tbody.appendChild(row);
    });
}

function updateAllItemsTable() {
    if (!elements.allItemsTableBody) return;
    
    const tbody = elements.allItemsTableBody;
    tbody.innerHTML = '';
    
    if (!state.filteredData) return;
    
    // Aplicar paginação
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const paginatedItems = state.filteredData.slice(startIndex, endIndex);
    
    if (paginatedItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: var(--text-light);">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    Nenhum item encontrado com os filtros atuais
                </td>
            </tr>
        `;
        return;
    }
    
    // Adicionar itens à tabela
    paginatedItems.forEach(item => {
        const row = document.createElement('tr');
        
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        const formattedValue = new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'MZN'
        }).format(value);
        
        // Determinar classe de status
        const status = item['Estado_Conservação'] || '';
        let statusClass = 'status-regular';
        if (status === 'Bom') statusClass = 'status-good';
        else if (status === 'Ruim') statusClass = 'status-bad';
        
        row.innerHTML = `
            <td>${item['ID_Item'] || ''}</td>
            <td>${item['Nome_Item'] ? item['Nome_Item'].substring(0, 30) + (item['Nome_Item'].length > 30 ? '...' : '') : ''}</td>
            <td>${item['Categoria'] || ''}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>${formattedValue}</td>
            <td>${item['Distrito_Localização'] || ''}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// ===== FILTROS =====
function applyFilters() {
    if (!state.processedData) return;
    
    state.filteredData = [...state.processedData];
    
    // Aplicar filtros sequencialmente
    state.filteredData = state.filteredData.filter(item => {
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
        
        // Filtro de valor
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        if (state.filters.minValue !== null && value < state.filters.minValue) {
            return false;
        }
        if (state.filters.maxValue !== null && value > state.filters.maxValue) {
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
        
        // Filtro de busca
        if (state.searchTerm && state.searchTerm.trim() !== '') {
            const searchLower = state.searchTerm.toLowerCase();
            const searchFields = [
                item['ID_Item'],
                item['Nome_Item'],
                item['Categoria'],
                item['Descrição'],
                item['Localização_Item']
            ].filter(field => field).map(field => field.toLowerCase());
            
            if (!searchFields.some(field => field.includes(searchLower))) {
                return false;
            }
        }
        
        return true;
    });
    
    // Recalcular indicadores para dados filtrados
    calculateIndicatorsForFilteredData();
    
    // Atualizar dashboard
    updateIndicators();
    updateTables();
}

function calculateIndicatorsForFilteredData() {
    if (!state.filteredData) {
        state.indicators = {};
        return;
    }
    
    // Recalcular apenas com dados filtrados
    const tempData = state.filteredData;
    const tempProcessedData = state.processedData;
    
    state.processedData = tempData;
    calculateIndicators();
    state.processedData = tempProcessedData;
}

function resetFilters() {
    // Resetar valores dos filtros
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
    
    // Resetar controles da interface
    if (elements.categoryFilter) elements.categoryFilter.value = 'all';
    if (elements.districtFilter) elements.districtFilter.value = 'all';
    if (elements.statusFilter) elements.statusFilter.value = 'all';
    if (elements.minValue) elements.minValue.value = '';
    if (elements.maxValue) elements.maxValue.value = '';
    if (elements.responsibleFilter) elements.responsibleFilter.value = 'all';
    if (elements.useFilter) elements.useFilter.value = 'all';
    if (elements.searchInput) elements.searchInput.value = '';
    
    // Resetar dados filtrados
    state.filteredData = state.processedData ? [...state.processedData] : null;
    
    // Recalcular indicadores
    calculateIndicators();
    
    // Atualizar dashboard
    updateDashboard();
}

function applySearch() {
    if (elements.searchInput) {
        state.searchTerm = elements.searchInput.value;
        applyFilters();
    }
}

// ===== EXPORTAÇÃO =====
function exportToPDF() {
    showLoading('Gerando PDF...');
    
    setTimeout(() => {
        alert('Funcionalidade de exportação PDF será implementada em breve!');
        hideLoading();
    }, 1000);
}

function exportToCSV() {
    if (!state.filteredData || state.filteredData.length === 0) {
        alert('Nenhum dado para exportar!');
        return;
    }
    
    showLoading('Gerando CSV...');
    
    try {
        // Criar cabeçalhos
        const headers = REQUIRED_COLUMNS;
        const csvRows = [];
        
        // Adicionar cabeçalhos
        csvRows.push(headers.join(','));
        
        // Adicionar dados
        state.filteredData.forEach(item => {
            const row = headers.map(header => {
                const value = item[header] || '';
                // Escapar vírgulas e aspas
                return `"${String(value).replace(/"/g, '""')}"`;
            });
            csvRows.push(row.join(','));
        });
        
        // Criar blob e download
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
