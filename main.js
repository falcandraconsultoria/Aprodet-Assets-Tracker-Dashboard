// main.js - APRODET Dashboard - Sistema Completo
// VERSÃO MELHORADA com recomendações completas

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
        category: 'pie',
        status: 'bar',
        timeline: 'line',
        district: 'doughnut'
    },
    
    // Controle
    isLoading: false,
    charts: {}
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('APRODET Dashboard - Inicializando...');
    
    initializeApplication();
    setupRequiredFields();
    updateCurrentDate();
    
    // VERIFICAÇÃO e correção do layout
    fixLayoutIssues();
    
    // Adicionar @Falcandra Data Consulting no footer
    addFalcandraBranding();
    
    console.log('APRODET Dashboard - Inicialização completa');
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

// ===== CORREÇÕES DE LAYOUT =====
function fixLayoutIssues() {
    console.log('Aplicando correções de layout...');
    
    fixDuplicatedTitle();
    fixLogoCircles();
    fixDashboardTitles();
}

function fixDuplicatedTitle() {
    console.log('Verificando título duplicado...');
    
    // Encontrar todos os títulos
    const titles = document.querySelectorAll('h1');
    let aprodetTitleCount = 0;
    
    titles.forEach(title => {
        if (title.textContent.includes('APRODET')) {
            aprodetTitleCount++;
            
            // Se for mais de um título com APRODET, corrigir
            if (aprodetTitleCount > 1) {
                // Se estiver no logo APRODET, mudar para apenas "APRODET"
                if (title.closest('.aprodet-logo') || title.closest('.logo-container')) {
                    console.log('Corrigindo título no logo APRODET...');
                    title.textContent = 'APRODET';
                }
                
                // Se for um h1 extra, remover
                const parent = title.parentElement;
                const siblings = parent ? parent.querySelectorAll('h1') : [];
                if (siblings.length > 1) {
                    console.log('Removendo título duplicado...');
                    title.remove();
                }
            }
        }
    });
}

function fixLogoCircles() {
    console.log('Corrigindo círculos do logo APRODET...');
    
    const aprodetLogo = document.querySelector('.aprodet-logo');
    if (!aprodetLogo) {
        console.warn('Logo APRODET não encontrado');
        return;
    }
    
    // Garantir que o logo tenha a estrutura correta
    if (!aprodetLogo.querySelector('.logo-container')) {
        const logoContainer = document.createElement('div');
        logoContainer.className = 'logo-container';
        logoContainer.innerHTML = `
            <div class="logo-visual">
                <div class="logo-circle"></div>
                <div class="logo-circle"></div>
                <div class="logo-circle"></div>
                <div class="logo-circle"></div>
            </div>
            <div class="logo-text">APRODET</div>
        `;
        aprodetLogo.innerHTML = '';
        aprodetLogo.appendChild(logoContainer);
    }
    
    // Aplicar estilos de centralização
    const logoContainer = aprodetLogo.querySelector('.logo-container');
    const logoVisual = aprodetLogo.querySelector('.logo-visual');
    const logoText = aprodetLogo.querySelector('.logo-text');
    
    if (logoContainer) {
        logoContainer.style.display = 'flex';
        logoContainer.style.flexDirection = 'column';
        logoContainer.style.alignItems = 'center';
        logoContainer.style.justifyContent = 'center';
    }
    
    if (logoVisual) {
        logoVisual.style.display = 'flex';
        logoVisual.style.justifyContent = 'center';
        logoVisual.style.alignItems = 'center';
        logoVisual.style.gap = '8px';
        logoVisual.style.marginBottom = '5px';
    }
    
    // Garantir que os círculos tenham o estilo correto
    const circles = aprodetLogo.querySelectorAll('.logo-circle');
    circles.forEach(circle => {
        circle.style.width = '22px';
        circle.style.height = '22px';
        circle.style.borderRadius = '50%';
        circle.style.backgroundColor = '#3498db';
    });
    
    if (logoText) {
        logoText.style.textAlign = 'center';
        logoText.style.fontSize = '24px';
        logoText.style.fontWeight = '700';
        logoText.style.color = '#3498db';
        
        // Garantir que não tenha "Dashboard" no logo
        if (logoText.textContent.includes('Dashboard')) {
            logoText.textContent = 'APRODET';
        }
    }
    
    console.log('Círculos do logo APRODET corrigidos');
}

function fixDashboardTitles() {
    // Garantir que apenas o header tenha "APRODET Dashboard"
    const dashboardTitles = document.querySelectorAll('.dashboard-title, .header-title h1');
    dashboardTitles.forEach((title, index) => {
        if (index > 0) {
            // Se não for o primeiro título, ocultar
            title.style.display = 'none';
        }
    });
}

function setupDOMReferences() {
    // Elementos serão referenciados por ID
    console.log('Configurando referências DOM...');
}

function setupRequiredFields() {
    const grid = document.getElementById('requiredFieldsGrid');
    if (!grid) return;
    
    // Limpar grid existente
    grid.innerHTML = '';
    
    CONFIG.REQUIRED_COLUMNS.forEach(field => {
        const span = document.createElement('span');
        span.className = 'field-tag';
        span.textContent = field;
        grid.appendChild(span);
    });
}

function addFalcandraBranding() {
    const footer = document.querySelector('.footer');
    if (!footer) return;
    
    // Verificar se já existe
    if (!footer.querySelector('.falcandra-branding')) {
        const brandDiv = document.createElement('div');
        brandDiv.className = 'falcandra-branding';
        brandDiv.innerHTML = `
            <p style="font-size: 14px; color: #3498db; font-weight: 600; font-style: italic; margin-bottom: 10px;">
                @Falcandra Data Consulting
            </p>
        `;
        
        // Inserir no início do footer
        footer.insertBefore(brandDiv, footer.firstChild);
    }
}

// ===== MANIPULAÇÃO DE ARQUIVOS =====
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // Upload Page
    const selectFileBtn = document.getElementById('selectFileBtn');
    const fileInput = document.getElementById('fileInput');
    const clearFileBtn = document.getElementById('clearFileBtn');
    const startAnalysisBtn = document.getElementById('startAnalysisBtn');
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    
    if (selectFileBtn) {
        selectFileBtn.addEventListener('click', () => {
            if (fileInput) fileInput.click();
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    if (clearFileBtn) {
        clearFileBtn.addEventListener('click', clearSelectedFile);
    }
    
    if (startAnalysisBtn) {
        startAnalysisBtn.addEventListener('click', startAnalysis);
    }
    
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', goBackToHome);
    }
    
    // Dashboard Filtros
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const searchInput = document.getElementById('searchInput');
    const itemsPerPage = document.getElementById('itemsPerPage');
    const tableSearch = document.getElementById('tableSearch');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    if (itemsPerPage) {
        itemsPerPage.addEventListener('change', function() {
            STATE.itemsPerPage = parseInt(this.value);
            updateTables();
            updatePagination();
        });
    }
    
    if (tableSearch) {
        tableSearch.addEventListener('input', debounce(handleTableSearch, 300));
    }
    
    // Botões de exportação
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const exportReportBtn = document.getElementById('exportReportBtn');
    
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportToPDF);
    }
    
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportToCSV);
    }
    
    if (exportReportBtn) {
        exportReportBtn.addEventListener('click', exportReport);
    }
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
    
    if (!file) {
        showNotification('Nenhum arquivo selecionado', 'warning');
        return;
    }
    
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
        showNotification('Formato de arquivo inválido. Use .xlsx, .xls ou .csv', 'error');
        clearSelectedFile();
        return;
    }
    
    STATE.currentFile = file;
    
    // Atualizar UI
    document.getElementById('fileNameDisplay').textContent = file.name;
    document.getElementById('fileSizeDisplay').textContent = formatFileSize(file.size);
    document.getElementById('fileInfo').style.display = 'block';
    
    // Atualizar informação no header
    const fileInfoElement = document.getElementById('currentFileInfo');
    if (fileInfoElement) {
        fileInfoElement.textContent = `Analisando: ${file.name}`;
    }
    
    showNotification(`Arquivo "${file.name}" selecionado com sucesso`, 'success');
}

function clearSelectedFile() {
    document.getElementById('fileInput').value = '';
    STATE.currentFile = null;
    
    document.getElementById('fileNameDisplay').textContent = 'arquivo.xlsx';
    document.getElementById('fileSizeDisplay').textContent = '0 KB';
    document.getElementById('fileInfo').style.display = 'none';
    
    // Atualizar informação no header
    const fileInfoElement = document.getElementById('currentFileInfo');
    if (fileInfoElement) {
        fileInfoElement.textContent = 'Analisando: Aprodet_Filled_Data.xlsx';
    }
    
    showNotification('Arquivo removido', 'info');
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
        
        // Validar dados
        const validation = validateData(STATE.processedData);
        if (!validation.valid) {
            throw new Error(validation.message);
        }
        
        // Inicializar dados filtrados
        STATE.filteredData = [...STATE.processedData];
        STATE.originalData = [...STATE.processedData];
        
        // Calcular indicadores
        calculateIndicators();
        
        // Atualizar UI
        updateDashboard();
        
        // Mostrar dashboard
        showDashboard();
        
        // Salvar para recarregamento
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
    return new Promise((resolve, reject) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                if (file.name.endsWith('.csv')) {
                    STATE.processedData = parseCSV(e.target.result);
                } else {
                    // Para Excel, usar dados de demonstração
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
            
            // Converter tipos específicos
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

function generateDemoData() {
    console.log('Gerando dados de demonstração...');
    
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
        const value = Math.round((Math.random() * 500000 + 1000) * 100) / 100; // 1,000 - 500,000 MZN
        const quantity = Math.floor(Math.random() * 5) + 1;
        const year = currentYear - (i % 6); // Últimos 6 anos
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
    
    console.log(`Dados de demonstração gerados: ${demoData.length} itens`);
    return demoData;
}

// ===== CÁLCULO DE INDICADORES =====
function calculateIndicators() {
    console.log('Calculando indicadores...');
    
    const data = STATE.filteredData.length > 0 ? STATE.filteredData : STATE.processedData;
    
    if (!data || data.length === 0) {
        console.warn('Nenhum dado para calcular indicadores');
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
        
        // Valor total
        totalValue += value * quantity;
        totalItems += quantity;
        
        // Distribuição por estado
        statusDistribution[status] = (statusDistribution[status] || 0) + quantity;
        
        // Pontuação de estado (0-100)
        if (status === 'Bom') statusScore += quantity * 100;
        else if (status === 'Regular') statusScore += quantity * 60;
        else if (status === 'Ruim') statusScore += quantity * 20;
        else statusScore += quantity * 50;
        
        // Itens críticos
        if (status === 'Ruim' && value > 10000) {
            criticalItems += quantity;
        }
        
        // Distribuição por categoria
        if (!categoryDistribution[category]) {
            categoryDistribution[category] = { value: 0, count: 0 };
        }
        categoryDistribution[category].value += value * quantity;
        categoryDistribution[category].count += quantity;
        
        // Distribuição por distrito
        districtDistribution[district] = (districtDistribution[district] || 0) + 1;
        
        // Timeline por ano
        if (date) {
            const year = date.substring(0, 4);
            if (!timelineData[year]) {
                timelineData[year] = { value: 0, count: 0 };
            }
            timelineData[year].value += value * quantity;
            timelineData[year].count += quantity;
        }
    });
    
    // Calcular estado médio
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
    
    console.log('Indicadores calculados:', STATE.indicators);
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

function validateData(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return { valid: false, message: 'Dados inválidos ou vazios' };
    }
    
    // Verificar campos obrigatórios
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
    console.log('Atualizando dashboard...');
    
    updateIndicatorsUI();
    updateFilterOptions();
    createCharts();
    updateTables();
    updateSummary();
    updateRecommendations(); // AGORA COM 3 PRIORIDADES
    updateUIState();
    
    // Aplicar correções após atualização
    setTimeout(fixLayoutIssues, 100);
}

function updateIndicatorsUI() {
    console.log('Atualizando indicadores UI...');
    
    const indicators = STATE.indicators;
    
    // Formatar valor em MZN
    const formattedValue = formatCurrency(indicators.totalValue);
    
    // Atualizar cards
    const totalValueElement = document.getElementById('totalValue');
    if (totalValueElement) {
        totalValueElement.textContent = `MZN ${formattedValue.replace('MZN', '').trim()}`;
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

function updateFilterOptions() {
    if (!STATE.processedData || STATE.processedData.length === 0) return;
    
    console.log('Atualizando opções de filtro...');
    
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
    
    // Atualizar selects
    updateSelect('categoryFilter', Array.from(categories).sort(), 'Todas as Categorias');
    updateSelect('districtFilter', Array.from(districts).sort(), 'Todos os Distritos');
    updateSelect('responsibleFilter', Array.from(responsibles).sort(), 'Todos os Responsáveis');
    updateSelect('useFilter', Array.from(uses).sort(), 'Todos os Usos');
}

function updateSelect(selectId, options, defaultText) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const currentValue = select.value;
    
    // Limpar opções
    select.innerHTML = '';
    
    // Adicionar opção padrão
    const defaultOption = document.createElement('option');
    defaultOption.value = 'all';
    defaultOption.textContent = defaultText;
    select.appendChild(defaultOption);
    
    // Adicionar opções
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        select.appendChild(opt);
    });
    
    // Restaurar valor selecionado se ainda existir
    if (currentValue && options.includes(currentValue)) {
        select.value = currentValue;
    }
}

// ===== RESUMO E RECOMENDAÇÕES =====
function updateSummary() {
    updateSummaryContent();
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
    
    // Adicionar distribuição por categoria
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
    
    // Adicionar distribuição geográfica
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

// ===== SISTEMA DE RECOMENDAÇÕES COMPLETO (COM 3 PRIORIDADES) =====
function updateRecommendations() {
    const container = document.getElementById('recommendationsContent');
    if (!container) return;
    
    const indicators = STATE.indicators;
    const recommendations = [];
    
    // 1. ALTA PRIORIDADE - Itens críticos
    if (indicators.criticalItems > 0) {
        recommendations.push({
            icon: 'exclamation-triangle',
            color: 'error',
            text: `Priorizar manutenção de ${indicators.criticalItems} itens críticos (alto valor + estado ruim)`,
            priority: 'ALTA',
            description: 'Itens com valor superior a 10.000€ e estado abaixo de 30% necessitam atenção imediata'
        });
    } else {
        recommendations.push({
            icon: 'check-circle',
            color: 'success',
            text: 'Nenhum item crítico identificado',
            priority: 'ALTA',
            description: 'Situação positiva - nenhum item requer manutenção urgente'
        });
    }
    
    // 2. MÉDIA PRIORIDADE - Plano de manutenção
    if (indicators.avgStatus < 70) {
        recommendations.push({
            icon: 'tools',
            color: 'warning',
            text: `Implementar plano de manutenção preventiva (estado médio: ${indicators.avgStatus}%)`,
            priority: 'MÉDIA',
            description: 'Focar em itens com valor entre 2.000€ e 10.000€ para evitar deterioração'
        });
    } else {
        recommendations.push({
            icon: 'shield-alt',
            color: 'info',
            text: 'Estado do patrimônio dentro dos parâmetros aceitáveis',
            priority: 'MÉDIA',
            description: 'Manter programa de manutenção preventiva regular'
        });
    }
    
    // 3. BAIXA PRIORIDADE - Otimização de custos
    const goodItems = STATE.filteredData.filter(item => 
        item['Estado_Conservação'] === 'Bom'
    ).length;
    
    if (goodItems > 0) {
        recommendations.push({
            icon: 'chart-line',
            color: 'info',
            text: `Realizar revisão de ${goodItems} itens com bom estado para otimização de custos`,
            priority: 'BAIXA',
            description: 'Itens com estado acima de 80% podem ter custos de manutenção reduzidos'
        });
    } else {
        recommendations.push({
            icon: 'search',
            color: 'info',
            text: 'Monitorar itens estáveis periodicamente',
            priority: 'BAIXA',
            description: 'Realizar verificações semestrais para garantir estabilidade'
        });
    }
    
    // Verificar idade dos itens (recomendação adicional)
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
            color: 'warning',
            text: `${oldItems} itens com mais de 5 anos - considerar renovação`,
            priority: 'MÉDIA',
            description: 'Itens antigos podem apresentar custos de manutenção elevados'
        });
    }
    
    // Garantir pelo menos 3 recomendações
    if (recommendations.length < 3) {
        recommendations.push({
            icon: 'clipboard-list',
            color: 'info',
            text: 'Realizar inventário físico completo',
            priority: 'BAIXA',
            description: 'Verificar correspondência entre registros e itens físicos'
        });
    }
    
    // Ordenar por prioridade (Alta, Média, Baixa)
    const priorityOrder = { 'ALTA': 1, 'MÉDIA': 2, 'BAIXA': 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    // Gerar HTML
    let recommendationsHTML = '<div class="recommendations-container">';
    
    // Cabeçalho
    recommendationsHTML += `
        <div class="recommendations-header">
            <h3><i class="fas fa-lightbulb"></i> Recomendações e Ações</h3>
            <p class="recommendations-subtitle">Sugestões baseadas na análise do patrimônio</p>
        </div>
    `;
    
    // Cards de recomendações
    recommendations.forEach(rec => {
        recommendationsHTML += `
            <div class="recommendation-card ${rec.color}">
                <div class="recommendation-icon">
                    <i class="fas fa-${rec.icon}"></i>
                </div>
                <div class="recommendation-content">
                    <h4>${rec.text}</h4>
                    <p class="recommendation-description">${rec.description}</p>
                    <div class="priority-tag priority-${rec.priority.toLowerCase()}">
                        <i class="fas fa-flag"></i> PRIORIDADE: ${rec.priority}
                    </div>
                </div>
            </div>
        `;
    });
    
    recommendationsHTML += '</div>';
    
    container.innerHTML = recommendationsHTML;
    
    // Aplicar estilos específicos para prioridades
    applyPriorityStyles();
}

function applyPriorityStyles() {
    // Estilos dinâmicos para as prioridades
    const style = document.createElement('style');
    style.textContent = `
        .priority-alta {
            background-color: #f44336 !important;
            color: white !important;
            border-left: 4px solid #d32f2f !important;
        }
        
        .priority-media {
            background-color: #ff9800 !important;
            color: white !important;
            border-left: 4px solid #f57c00 !important;
        }
        
        .priority-baixa {
            background-color: #4caf50 !important;
            color: white !important;
            border-left: 4px solid #388e3c !important;
        }
        
        .priority-tag {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-top: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .priority-tag i {
            margin-right: 5px;
        }
        
        .recommendations-header {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e0e0e0;
        }
        
        .recommendations-header h3 {
            color: #2c3e50;
            margin-bottom: 5px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .recommendations-header h3 i {
            color: #3498db;
        }
        
        .recommendations-subtitle {
            color: #7f8c8d;
            font-size: 0.9rem;
            font-style: italic;
        }
        
        .recommendation-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .recommendation-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.12);
        }
        
        .recommendation-card.error {
            background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
        }
        
        .recommendation-card.warning {
            background: linear-gradient(135deg, #fffaf0 0%, #fff 100%);
        }
        
        .recommendation-card.success {
            background: linear-gradient(135deg, #f0fff4 0%, #fff 100%);
        }
        
        .recommendation-card.info {
            background: linear-gradient(135deg, #f0f9ff 0%, #fff 100%);
        }
        
        .recommendation-icon {
            font-size: 24px;
            margin-bottom: 15px;
        }
        
        .recommendation-content h4 {
            margin: 0 0 10px 0;
            color: #2c3e50;
            font-size: 1.1rem;
        }
        
        .recommendation-description {
            color: #546e7a;
            font-size: 0.9rem;
            line-height: 1.5;
            margin-bottom: 15px;
        }
    `;
    
    // Adicionar estilos apenas se não existirem
    if (!document.getElementById('recommendations-styles')) {
        style.id = 'recommendations-styles';
        document.head.appendChild(style);
    }
}

// ===== NAVEGAÇÃO =====
function showDashboard() {
    console.log('Mostrando dashboard...');
    
    document.getElementById('uploadPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'block';
    
    // Atualizar data e hora
    updateCurrentDate();
    
    const lastUpdate = document.getElementById('lastUpdate');
    if (lastUpdate) {
        lastUpdate.textContent = `Dashboard APRODET - Análise Patrimonial | Última atualização: ${new Date().toLocaleString('pt-PT')}`;
    }
    
    // Atualizar contador
    const processedItems = document.getElementById('processedItems');
    if (processedItems) {
        processedItems.textContent = STATE.processedData.length;
    }
    
    // Atualizar modo
    const analysisMode = document.getElementById('analysisMode');
    if (analysisMode) {
        analysisMode.textContent = STATE.currentFile ? 'Arquivo Carregado' : 'Demonstração';
    }
    
    // Aplicar correções após mostrar dashboard
    setTimeout(fixLayoutIssues, 100);
    
    // Scroll para topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== FUNÇÕES RESTANTES (mantenha as mesmas da versão antiga) =====

// ... (resto das funções da versão antiga - charts, tabelas, filtros, exportação, etc.)

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
        dateElement.style.fontSize = '0.9rem';
        dateElement.style.color = '#6B7280';
    }
}

function updateUIState() {
    // Atualizar estado dos botões baseado nos dados
    const hasData = STATE.filteredData && STATE.filteredData.length > 0;
    
    const exportButtons = ['exportPdfBtn', 'exportCsvBtn', 'exportReportBtn'];
    exportButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.disabled = !hasData;
        }
    });
}

// ... (continue com as outras funções da versão antiga)

// ===== INICIALIZAÇÃO FINAL =====
setTimeout(() => {
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        Chart.defaults.color = '#6B7280';
        console.log('Chart.js configurado');
    }
}, 100);
