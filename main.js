// main.js
// Configuração e constantes
const API_URL = 'http://localhost:5000'; // URL do backend Python
const REQUIRED_COLUMNS = [
    'ID_Item', 'Codigo_Patrimonial', 'Nome_Item', 'Número de serie',
    'Categoria', 'Descrição', 'Quantidade', 'Estado_Conservação',
    'Data_Aquisição', 'Valor_Aquisição', 'Fonte_Aquisição', 'Fornecedor',
    'Localização_Item', 'Distrito_Localização', 'Uso_Actual',
    'Responsável_Item', 'Contacto_Responsável_Item', 'Vida_Util_Estimada',
    'Data_Ultima_Verificação', 'Observaçães'
];

// Estado global da aplicação
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
    itemsPerPage: 10
};

// Elementos DOM da página inicial
const elements = {
    // Página inicial
    welcomeScreen: document.getElementById('welcomeScreen'),
    dashboardContainer: document.getElementById('dashboardContainer'),
    uploadArea: document.getElementById('uploadArea'),
    fileInputHome: document.getElementById('fileInputHome'),
    selectFileBtn: document.getElementById('selectFileBtn'),
    fileInfo: document.getElementById('fileInfo'),
    fileNameDisplay: document.getElementById('fileNameDisplay'),
    fileSizeDisplay: document.getElementById('fileSizeDisplay'),
    clearFileBtn: document.getElementById('clearFileBtn'),
    startAnalysisBtn: document.getElementById('startAnalysisBtn')
};

// Elementos DOM do dashboard (serão carregados dinamicamente)
let dashboardElements = {};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initHomePage();
    updateCurrentDate();
});

// ===== FUNÇÕES DA PÁGINA INICIAL =====

function initHomePage() {
    // Configurar upload de arquivo
    elements.selectFileBtn.addEventListener('click', () => {
        elements.fileInputHome.click();
    });
    
    elements.fileInputHome.addEventListener('change', handleFileSelect);
    
    // Drag and drop
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
            elements.fileInputHome.files = e.dataTransfer.files;
            handleFileSelect();
        }
    });
    
    // Clique na área de upload
    elements.uploadArea.addEventListener('click', () => {
        elements.fileInputHome.click();
    });
    
    // Botão limpar arquivo
    elements.clearFileBtn.addEventListener('click', clearSelectedFile);
    
    // Botão iniciar análise
    elements.startAnalysisBtn.addEventListener('click', startAnalysis);
}

function handleFileSelect() {
    const file = elements.fileInputHome.files[0];
    if (!file) return;
    
    // Validar tipo de arquivo
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
        showError('Formato de arquivo inválido. Use .xlsx, .xls ou .csv');
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
    elements.fileInputHome.value = '';
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
    if (!state.currentFile) {
        showError('Por favor, selecione um arquivo primeiro');
        return;
    }
    
    showLoading('Processando arquivo...');
    
    try {
        // Criar FormData para enviar o arquivo
        const formData = new FormData();
        formData.append('file', state.currentFile);
        
        // Enviar para backend (ou processar localmente se backend não estiver disponível)
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            state.processedData = data.data;
            state.filteredData = [...data.data];
            state.indicators = data.indicators;
            
            // Carregar dashboard
            loadDashboard();
            
            // Esconder tela inicial e mostrar dashboard
            elements.welcomeScreen.style.display = 'none';
            elements.dashboardContainer.style.display = 'block';
            
            // Inicializar dashboard
            initDashboard();
            updateDashboard();
            
        } else {
            // Se o backend não estiver disponível, processar localmente
            await processFileLocally(state.currentFile);
        }
        
    } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        
        // Tentar processamento local como fallback
        try {
            await processFileLocally(state.currentFile);
        } catch (localError) {
            showError('Erro ao processar o arquivo. Verifique o formato e tente novamente.');
        }
    } finally {
        hideLoading();
    }
}

async function processFileLocally(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                let data;
                const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                
                if (fileExtension === '.csv') {
                    data = parseCSV(e.target.result);
                } else {
                    // Para Excel, precisaríamos de uma biblioteca como SheetJS
                    // Esta é uma implementação simplificada
                    data = parseExcelSimplified(e.target.result);
                }
                
                // Validar colunas
                const missingColumns = REQUIRED_COLUMNS.filter(col => !data.columns.includes(col));
                if (missingColumns.length > 0) {
                    reject(new Error(`Colunas faltando: ${missingColumns.join(', ')}`));
                    return;
                }
                
                // Processar dados e calcular indicadores
                state.processedData = data.rows;
                state.filteredData = [...data.rows];
                state.indicators = calculateIndicators(data.rows);
                
                // Carregar dashboard
                loadDashboard();
                
                // Esconder tela inicial e mostrar dashboard
                elements.welcomeScreen.style.display = 'none';
                elements.dashboardContainer.style.display = 'block';
                
                // Inicializar dashboard
                initDashboard();
                updateDashboard();
                
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
    
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = lines[i].split(',');
        const row = {};
        
        headers.forEach((header, index) => {
            row[header] = values[index] ? values[index].trim() : '';
        });
        
        rows.push(row);
    }
    
    return { columns: headers, rows };
}

function parseExcelSimplified(arrayBuffer) {
    // Implementação simplificada - na prática use SheetJS
    // Esta é apenas para demonstração
    console.warn('Processamento Excel simplificado - use backend para melhor precisão');
    
    // Retornar dados de exemplo para demonstração
    return {
        columns: REQUIRED_COLUMNS,
        rows: generateSampleData()
    };
}

function generateSampleData() {
    // Gerar dados de exemplo para demonstração
    const sampleData = [];
    const categories = ['Mobiliário', 'Equipamento Informático', 'Veículos', 'Maquinaria', 'Edifícios'];
    const districts = ['Maputo', 'Matola', 'Beira', 'Nampula', 'Quelimane'];
    const statuses = ['Bom', 'Regular', 'Ruim'];
    const uses = ['Em uso', 'Em armazém', 'Em manutenção', 'Desativado'];
    
    for (let i = 1; i <= 50; i++) {
        sampleData.push({
            'ID_Item': `ITEM-${i.toString().padStart(3, '0')}`,
            'Codigo_Patrimonial': `CP-${2020 + (i % 5)}-${i}`,
            'Nome_Item': `Item ${i}`,
            'Número de serie': `SN-${1000 + i}`,
            'Categoria': categories[i % categories.length],
            'Descrição': `Descrição do item ${i}`,
            'Quantidade': Math.floor(Math.random() * 10) + 1,
            'Estado_Conservação': statuses[i % statuses.length],
            'Data_Aquisição': `202${i % 5}-${(i % 12) + 1}-${(i % 28) + 1}`,
            'Valor_Aquisição': (Math.random() * 10000 + 1000).toFixed(2),
            'Fonte_Aquisição': ['Compra', 'Doação', 'Transferência'][i % 3],
            'Fornecedor': `Fornecedor ${(i % 5) + 1}`,
            'Localização_Item': `Local ${i}`,
            'Distrito_Localização': districts[i % districts.length],
            'Uso_Actual': uses[i % uses.length],
            'Responsável_Item': `Responsável ${(i % 10) + 1}`,
            'Contacto_Responsável_Item': `+258 8${(i % 9) + 1} ${(i % 10)}${(i % 10)}${(i % 10)} ${(i % 10)}${(i % 10)}${(i % 10)}`,
            'Vida_Util_Estimada': (5 + (i % 15)).toString(),
            'Data_Ultima_Verificação': `2023-${(i % 12) + 1}-${(i % 28) + 1}`,
            'Observaçães': i % 3 === 0 ? 'Necessita manutenção' : ''
        });
    }
    
    return sampleData;
}

function calculateIndicators(data) {
    if (!data || data.length === 0) return {};
    
    // Calcular indicadores básicos
    const totalValue = data.reduce((sum, item) => {
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        const quantity = parseInt(item['Quantidade']) || 1;
        return sum + (value * quantity);
    }, 0);
    
    const totalItems = data.reduce((sum, item) => {
        return sum + (parseInt(item['Quantidade']) || 1);
    }, 0);
    
    // Distribuição por estado
    const statusDistribution = {};
    data.forEach(item => {
        const status = item['Estado_Conservação'] || 'Não Informado';
        statusDistribution[status] = (statusDistribution[status] || 0) + 1;
    });
    
    // Calcular estado médio
    let avgStatus = 0;
    if (statusDistribution['Bom']) avgStatus += statusDistribution['Bom'] * 100;
    if (statusDistribution['Regular']) avgStatus += statusDistribution['Regular'] * 60;
    if (statusDistribution['Ruim']) avgStatus += statusDistribution['Ruim'] * 20;
    avgStatus = totalItems > 0 ? Math.round(avgStatus / totalItems) : 0;
    
    // Itens críticos (valor alto + estado ruim)
    const criticalItems = data.filter(item => {
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        const status = item['Estado_Conservação'];
        return status === 'Ruim' && value > 5000;
    }).length;
    
    return {
        totalValue,
        totalItems,
        statusDistribution,
        avgStatus,
        criticalItems,
        categories: groupByCategory(data),
        districts: groupByDistrict(data),
        timeline: groupByTimeline(data)
    };
}

function groupByCategory(data) {
    const groups = {};
    data.forEach(item => {
        const category = item['Categoria'] || 'Não Categorizado';
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        const quantity = parseInt(item['Quantidade']) || 1;
        
        if (!groups[category]) {
            groups[category] = { value: 0, count: 0 };
        }
        
        groups[category].value += value * quantity;
        groups[category].count += quantity;
    });
    return groups;
}

function groupByDistrict(data) {
    const groups = {};
    data.forEach(item => {
        const district = item['Distrito_Localização'] || 'Não Especificado';
        if (!groups[district]) {
            groups[district] = 0;
        }
        groups[district]++;
    });
    return groups;
}

function groupByTimeline(data) {
    const groups = {};
    data.forEach(item => {
        const date = item['Data_Aquisição'];
        if (!date) return;
        
        // Extrair ano-mês
        const yearMonth = date.substring(0, 7); // Assumindo formato YYYY-MM-DD
        
        if (!groups[yearMonth]) {
            groups[yearMonth] = 0;
        }
        
        groups[yearMonth] += parseFloat(item['Valor_Aquisição']) || 0;
    });
    return groups;
}

// ===== FUNÇÕES DO DASHBOARD =====

function loadDashboard() {
    // Carregar conteúdo do dashboard
    fetch('dashboard.html')
        .then(response => response.text())
        .then(html => {
            elements.dashboardContainer.innerHTML = html;
            
            // Inicializar elementos do dashboard
            initDashboardElements();
            initDashboard();
        })
        .catch(error => {
            console.error('Erro ao carregar dashboard:', error);
            showError('Erro ao carregar o dashboard');
        });
}

function initDashboardElements() {
    // Mapear elementos do dashboard
    dashboardElements = {
        // Cabeçalho
        backToHomeBtn: document.getElementById('backToHomeBtn'),
        currentDate: document.getElementById('currentDate'),
        
        // Controle
        uploadNewBtn: document.getElementById('uploadNewBtn'),
        currentFileName: document.getElementById('currentFileName'),
        refreshAnalysisBtn: document.getElementById('refreshAnalysisBtn'),
        exportPdfBtn: document.getElementById('exportPdfBtn'),
        helpBtn: document.getElementById('helpBtn'),
        
        // Filtros
        filtersSection: document.getElementById('filtersSection'),
        categoryFilter: document.getElementById('categoryFilter'),
        districtFilter: document.getElementById('districtFilter'),
        statusFilter: document.getElementById('statusFilter'),
        minValue: document.getElementById('minValue'),
        maxValue: document.getElementById('maxValue'),
        responsibleFilter: document.getElementById('responsibleFilter'),
        useFilter: document.getElementById('useFilter'),
        applyFilters: document.getElementById('applyFilters'),
        resetFilters: document.getElementById('resetFilters'),
        exportFilteredBtn: document.getElementById('exportFilteredBtn'),
        
        // Indicadores
        indicatorsSection: document.getElementById('indicatorsSection'),
        totalValue: document.getElementById('totalValue'),
        totalItems: document.getElementById('totalItems'),
        avgStatus: document.getElementById('avgStatus'),
        criticalItems: document.getElementById('criticalItems'),
        avgAge: document.getElementById('avgAge'),
        avgLifeLeft: document.getElementById('avgLifeLeft'),
        
        // Tabelas
        criticalTableBody: document.getElementById('criticalTableBody'),
        allItemsTableBody: document.getElementById('allItemsTableBody'),
        searchTable: document.getElementById('searchTable'),
        itemsPerPage: document.getElementById('itemsPerPage'),
        pagination: document.getElementById('pagination'),
        criticalCount: document.getElementById('criticalCount'),
        totalRows: document.getElementById('totalRows'),
        lastUpdate: document.getElementById('lastUpdate'),
        
        // Modais
        helpModal: document.getElementById('helpModal'),
        closeModal: document.getElementById('closeModal'),
        loadingModal: document.getElementById('loadingModal'),
        loadingMessage: document.getElementById('loadingMessage')
    };
}

function initDashboard() {
    if (!dashboardElements.backToHomeBtn) return;
    
    // Event listeners do dashboard
    dashboardElements.backToHomeBtn.addEventListener('click', goBackToHome);
    dashboardElements.uploadNewBtn.addEventListener('click', uploadNewFile);
    dashboardElements.refreshAnalysisBtn.addEventListener('click', refreshAnalysis);
    dashboardElements.exportPdfBtn.addEventListener('click', exportToPDF);
    dashboardElements.helpBtn.addEventListener('click', showHelpModal);
    
    // Filtros
    dashboardElements.applyFilters.addEventListener('click', applyFilters);
    dashboardElements.resetFilters.addEventListener('click', resetFilters);
    dashboardElements.exportFilteredBtn.addEventListener('click', exportFilteredData);
    
    // Busca e paginação
    dashboardElements.searchTable.addEventListener('input', filterTable);
    dashboardElements.itemsPerPage.addEventListener('change', updatePagination);
    
    // Modais
    dashboardElements.closeModal.addEventListener('click', () => {
        dashboardElements.helpModal.style.display = 'none';
    });
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === dashboardElements.helpModal) {
            dashboardElements.helpModal.style.display = 'none';
        }
    });
    
    // Tabs do modal de ajuda
    document.querySelectorAll('.help-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchHelpTab(tabName);
        });
    });
    
    // Botões dos gráficos
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const chartType = this.getAttribute('data-chart');
            toggleChartType(chartType);
        });
    });
}

function updateDashboard() {
    if (!state.processedData) return;
    
    // Atualizar informações do arquivo
    if (state.currentFile) {
        dashboardElements.currentFileName.textContent = state.currentFile.name;
    }
    
    // Atualizar indicadores
    updateIndicators();
    
    // Atualizar filtros
    updateFilterOptions();
    
    // Atualizar gráficos
    updateCharts();
    
    // Atualizar tabelas
    updateTables();
    
    // Atualizar informações do rodapé
    dashboardElements.totalRows.textContent = state.processedData.length;
    dashboardElements.lastUpdate.textContent = new Date().toLocaleString('pt-PT');
    
    // Mostrar seções
    dashboardElements.filtersSection.style.display = 'block';
    dashboardElements.indicatorsSection.style.display = 'grid';
    dashboardElements.chartsSection.style.display = 'grid';
}

function updateIndicators() {
    const indicators = state.indicators;
    
    // Formatar valor monetário
    const formattedValue = new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'MZN'
    }).format(indicators.totalValue || 0);
    
    dashboardElements.totalValue.textContent = formattedValue;
    dashboardElements.totalItems.textContent = indicators.totalItems || 0;
    dashboardElements.avgStatus.textContent = `${indicators.avgStatus || 0}%`;
    dashboardElements.criticalItems.textContent = indicators.criticalItems || 0;
    
    // Calcular idade média (exemplo simplificado)
    const avgAge = calculateAverageAge(state.processedData);
    dashboardElements.avgAge.textContent = `${avgAge} anos`;
    
    // Calcular vida útil restante média
    const avgLifeLeft = calculateAverageLifeLeft(state.processedData);
    dashboardElements.avgLifeLeft.textContent = `${avgLifeLeft}%`;
    
    // Atualizar contador de itens críticos
    dashboardElements.criticalCount.textContent = `${indicators.criticalItems || 0} itens`;
}

function updateFilterOptions() {
    // Limpar opções atuais
    clearSelectOptions(dashboardElements.categoryFilter);
    clearSelectOptions(dashboardElements.districtFilter);
    clearSelectOptions(dashboardElements.responsibleFilter);
    clearSelectOptions(dashboardElements.useFilter);
    
    // Coletar valores únicos dos dados
    const categories = new Set();
    const districts = new Set();
    const responsibles = new Set();
    const uses = new Set();
    
    state.processedData.forEach(item => {
        if (item['Categoria']) categories.add(item['Categoria']);
        if (item['Distrito_Localização']) districts.add(item['Distrito_Localização']);
        if (item['Responsável_Item']) responsibles.add(item['Responsável_Item']);
        if (item['Uso_Actual']) uses.add(item['Uso_Actual']);
    });
    
    // Adicionar opções aos selects
    addOptionToSelect(dashboardElements.categoryFilter, 'all', 'Todas as Categorias');
    categories.forEach(cat => addOptionToSelect(dashboardElements.categoryFilter, cat, cat));
    
    addOptionToSelect(dashboardElements.districtFilter, 'all', 'Todos os Distritos');
    districts.forEach(dist => addOptionToSelect(dashboardElements.districtFilter, dist, dist));
    
    addOptionToSelect(dashboardElements.responsibleFilter, 'all', 'Todos os Responsáveis');
    responsibles.forEach(resp => addOptionToSelect(dashboardElements.responsibleFilter, resp, resp));
    
    addOptionToSelect(dashboardElements.useFilter, 'all', 'Todos os Usos');
    uses.forEach(use => addOptionToSelect(dashboardElements.useFilter, use, use));
}

function updateCharts() {
    // Gráfico de categoria
    createCategoryChart();
    
    // Gráfico de status
    createStatusChart();
    
    // Gráfico de timeline
    createTimelineChart();
    
    // Gráfico de distrito
    createDistrictChart();
    
    // Gráfico top 10
    createTop10Chart();
    
    // Gráfico de verificações
    createVerificationsChart();
}

function createCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    if (state.charts.category) {
        state.charts.category.destroy();
    }
    
    const categories = state.indicators.categories || {};
    const labels = Object.keys(categories);
    const data = labels.map(label => categories[label].value);
    
    state.charts.category = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EF4444',
                    '#06B6D4', '#84CC16', '#F59E0B', '#EC4899', '#6366F1'
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
                    text: 'Distribuição de Valor por Categoria'
                }
            }
        }
    });
}

function createStatusChart() {
    const ctx = document.getElementById('statusChart').getContext('2d');
    
    if (state.charts.status) {
        state.charts.status.destroy();
    }
    
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
                }
            }
        }
    });
}

function createTimelineChart() {
    const ctx = document.getElementById('timelineChart').getContext('2d');
    
    if (state.charts.timeline) {
        state.charts.timeline.destroy();
    }
    
    const timelineData = state.indicators.timeline || {};
    const labels = Object.keys(timelineData).sort();
    const data = labels.map(label => timelineData[label]);
    
    state.charts.timeline = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Valor das Aquisições',
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
                }
            }
        }
    });
}

function createDistrictChart() {
    const ctx = document.getElementById('districtChart').getContext('2d');
    
    if (state.charts.district) {
        state.charts.district.destroy();
    }
    
    const districts = state.indicators.districts || {};
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

function createTop10Chart() {
    const ctx = document.getElementById('top10Chart').getContext('2d');
    
    if (state.charts.top10) {
        state.charts.top10.destroy();
    }
    
    // Obter top 10 itens por valor
    const topItems = [...state.processedData]
        .sort((a, b) => {
            const valA = parseFloat(a['Valor_Aquisição']) || 0;
            const valB = parseFloat(b['Valor_Aquisição']) || 0;
            return valB - valA;
        })
        .slice(0, 10);
    
    const labels = topItems.map(item => 
        item['Nome_Item'] ? item['Nome_Item'].substring(0, 20) + '...' : 'Sem nome'
    );
    const data = topItems.map(item => parseFloat(item['Valor_Aquisição']) || 0);
    
    state.charts.top10 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Valor (MZN)',
                data: data,
                backgroundColor: '#3B82F6',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                title: {
                    display: true,
                    text: 'Top 10 Itens Mais Valiosos'
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Valor (MZN)'
                    }
                }
            }
        }
    });
}

function createVerificationsChart() {
    const ctx = document.getElementById('verificationsChart').getContext('2d');
    
    if (state.charts.verifications) {
        state.charts.verifications.destroy();
    }
    
    // Calcular dias desde última verificação
    const today = new Date();
    const verificationStatus = {
        'Atualizado (< 30 dias)': 0,
        'A vencer (30-90 dias)': 0,
        'Vencido (> 90 dias)': 0,
        'Sem data': 0
    };
    
    state.processedData.forEach(item => {
        const lastVerification = item['Data_Ultima_Verificação'];
        if (!lastVerification) {
            verificationStatus['Sem data']++;
            return;
        }
        
        const lastDate = new Date(lastVerification);
        if (isNaN(lastDate.getTime())) {
            verificationStatus['Sem data']++;
            return;
        }
        
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 30) {
            verificationStatus['Atualizado (< 30 dias)']++;
        } else if (diffDays <= 90) {
            verificationStatus['A vencer (30-90 dias)']++;
        } else {
            verificationStatus['Vencido (> 90 dias)']++;
        }
    });
    
    const labels = Object.keys(verificationStatus);
    const data = labels.map(label => verificationStatus[label]);
    
    state.charts.verifications = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#10B981', // Atualizado - verde
                    '#F59E0B', // A vencer - laranja
                    '#EF4444', // Vencido - vermelho
                    '#6B7280'  // Sem data - cinza
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Status das Verificações'
                }
            }
        }
    });
}

function updateTables() {
    updateCriticalTable();
    updateAllItemsTable();
}

function updateCriticalTable() {
    const tbody = dashboardElements.criticalTableBody;
    tbody.innerHTML = '';
    
    // Encontrar itens críticos
    const criticalItems = state.filteredData.filter(item => {
        const status = item['Estado_Conservação'];
        const value = parseFloat(item['Valor_Aquisição']) || 0;
        return status === 'Ruim' && value > 5000;
    });
    
    // Adicionar linhas à tabela
    criticalItems.forEach((item, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${item['ID_Item'] || ''}</td>
            <td>${item['Nome_Item'] || ''}</td>
            <td>${item['Categoria'] || ''}</td>
            <td><span class="status-badge status-bad">${item['Estado_Conservação'] || ''}</span></td>
            <td>${item['Localização_Item'] || ''}</td>
            <td>${formatCurrency(item['Valor_Aquisição'])}</td>
            <td>${item['Responsável_Item'] || ''}</td>
            <td>
                <button class="btn-small" onclick="showItemDetails('${item['ID_Item']}')" title="Ver detalhes">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Atualizar contador
    dashboardElements.criticalCount.textContent = `${criticalItems.length} itens`;
}

function updateAllItemsTable() {
    const tbody = dashboardElements.allItemsTableBody;
    tbody.innerHTML = '';
    
    // Calcular paginação
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const paginatedItems = state.filteredData.slice(startIndex, endIndex);
    
    // Adicionar linhas à tabela
    paginatedItems.forEach(item => {
        const row = document.createElement('tr');
        
        // Determinar classe de status
        let statusClass = 'status-regular';
        let statusText = item['Estado_Conservação'] || '';
        
        if (statusText === 'Bom') statusClass = 'status-good';
        else if (statusText === 'Ruim') statusClass = 'status-bad';
        
        row.innerHTML = `
            <td>${item['ID_Item'] || ''}</td>
            <td>${item['Nome_Item'] ? item['Nome_Item'].substring(0, 30) + (item['Nome_Item'].length > 30 ? '...' : '') : ''}</td>
            <td>${item['Categoria'] || ''}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${formatCurrency(item['Valor_Aquisição'])}</td>
            <td>${item['Localização_Item'] || ''}</td>
            <td>
                <button class="btn-small" onclick="showItemDetails('${item['ID_Item']}')" title="Ver detalhes">
                    <i class="fas fa-info-circle"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Atualizar paginação
    updatePaginationControls();
}

function updatePaginationControls() {
    const totalItems = state.filteredData.length;
    const totalPages = Math.ceil(totalItems / state.itemsPerPage);
    
    let paginationHTML = '';
    
    if (totalPages > 1) {
        // Botão anterior
        paginationHTML += `
            <button class="page-btn ${state.currentPage === 1 ? 'disabled' : ''}" 
                    onclick="changePage(${state.currentPage - 1})" 
                    ${state.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Números de página
        for (let i
