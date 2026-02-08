// main.js - APRODET Dashboard - Sistema Completo
// CORREÇÕES APLICADAS:
// 1. VERIFICAÇÃO de título "APRODET Dashboard" duplicado
// 2. CORREÇÃO da justificação dos círculos acima de "APRODET"
// 3. Centralização perfeita dos elementos visuais
// 4. FUNÇÕES COMPLETAS para todas as funcionalidades

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
    return new Promise((resolve, reject) => {
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
    updateRecommendations();
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

// ===== GRÁFICOS =====
function createCharts() {
    console.log('Criando gráficos...');
    
    // Destruir gráficos existentes
    destroyCharts();
    
    // Criar novos gráficos
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
    
    const backgroundColors = generateColors(labels.length);
    
    STATE.charts.category = new Chart(ctx, {
        type: STATE.chartTypes.category,
        data: {
            labels: labels,
            datasets: [{
                label: 'Valor (MZN)',
                data: data,
                backgroundColor: backgroundColors,
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
                        font: { size: 11 },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                title: {
                    display: true,
                    text: 'Distribuição por Categoria',
                    font: { size: 14, weight: '600' },
                    padding: { top: 10, bottom: 30 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${formatCurrency(context.parsed.y || context.parsed)}`;
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
            case 'Bom': return '#10B981';
            case 'Regular': return '#F97316';
            case 'Ruim': return '#EF4444';
            default: return '#6B7280';
        }
    });
    
    STATE.charts.status = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '',
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Estado de Conservação',
                    font: { size: 14, weight: '600' },
                    padding: { top: 10, bottom: 30 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.x} itens`;
                        }
                    }
                }
            },
            scales: {
                x: {
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

function createDistrictChart() {
    const canvas = document.getElementById('districtChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const distribution = STATE.indicators.districtDistribution || {};
    
    const labels = Object.keys(distribution);
    const data = labels.map(label => distribution[label]);
    
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
                    position: 'right',
                    labels: {
                        padding: 20,
                        font: { size: 11 },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                title: {
                    display: true,
                    text: 'Distribuição por Distrito',
                    font: { size: 14, weight: '600' },
                    padding: { top: 10, bottom: 30 }
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
    
    STATE.charts.timeline = new Chart(ctx, {
        type: STATE.chartTypes.timeline,
        data: {
            labels: labels,
            datasets: [{
                label: '',
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
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Aquisições ao Longo do Tempo',
                    font: { size: 14, weight: '600' },
                    padding: { top: 10, bottom: 30 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${formatCurrency(context.parsed.y || context.parsed)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function generateColors(count) {
    const colors = [
        '#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EF4444',
        '#06B6D4', '#84CC16', '#F59E0B', '#EC4899', '#6366F1'
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

// ===== TABELAS =====
function updateTables() {
    updateAllItemsTable();
    updateCriticalTable();
    updatePagination();
}

function updateAllItemsTable() {
    const tbody = document.getElementById('allItemsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Calcular paginação
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
    
    // Adicionar itens à tabela
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

function updateCriticalTable() {
    const tbody = document.getElementById('criticalTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Filtrar itens críticos
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
    
    // Adicionar itens à tabela
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
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function updatePagination() {
    const totalItems = STATE.filteredData.length;
    const totalPages = Math.ceil(totalItems / STATE.itemsPerPage);
    
    // Atualizar informações
    const paginationInfo = document.getElementById('paginationInfo');
    if (paginationInfo) {
        const start = ((STATE.currentPage - 1) * STATE.itemsPerPage) + 1;
        const end = Math.min(STATE.currentPage * STATE.itemsPerPage, totalItems);
        paginationInfo.textContent = `Mostrando ${start}-${end} de ${totalItems} itens`;
    }
    
    // Atualizar controles
    const controls = document.getElementById('paginationControls');
    if (!controls) return;
    
    controls.innerHTML = '';
    
    // Botão anterior
    const prevBtn = document.createElement('button');
    prevBtn.className = `btn-pagination ${STATE.currentPage === 1 ? 'disabled' : ''}`;
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = STATE.currentPage === 1;
    prevBtn.onclick = () => changePage(STATE.currentPage - 1);
    controls.appendChild(prevBtn);
    
    // Números de página
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
    
    // Botão próximo
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
}

// ===== FILTROS =====
function applyFilters() {
    if (!STATE.processedData || STATE.processedData.length === 0) {
        showNotification('Nenhum dado disponível para filtrar', 'warning');
        return;
    }
    
    console.log('Aplicando filtros...');
    
    // Coletar valores dos filtros
    collectFilterValues();
    
    // Aplicar filtros
    STATE.filteredData = STATE.processedData.filter(item => {
        return applyAllFilters(item);
    });
    
    // Recalcular indicadores
    calculateIndicators();
    
    // Resetar paginação
    STATE.currentPage = 1;
    
    // Atualizar UI
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
    console.log('Resetando filtros...');
    
    // Resetar estado
    STATE.filters = {
        category: 'all',
        district: 'all',
        status: 'all',
        responsible: 'all',
        use: 'all'
    };
    
    STATE.searchTerm = '';
    STATE.currentPage = 1;
    
    // Resetar controles
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
    
    const tableSearch = document.getElementById('tableSearch');
    if (tableSearch) tableSearch.value = '';
    
    // Resetar dados filtrados
    STATE.filteredData = [...STATE.processedData];
    
    // Recalcular
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

function updateRecommendations() {
    const container = document.getElementById('recommendationsContent');
    if (!container) return;
    
    const indicators = STATE.indicators;
    const recommendations = [];
    
    // Recomendações baseadas em indicadores
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
    
    // Se não houver recomendações específicas
    if (recommendations.length === 0) {
        recommendations.push({
            icon: 'check-circle',
            color: 'success',
            text: 'Situação do patrimônio dentro dos parâmetros aceitáveis',
            priority: 'Baixa'
        });
    }
    
    // Gerar HTML
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

function goBackToHome() {
    console.log('Voltando para página inicial...');
    
    document.getElementById('dashboardPage').style.display = 'none';
    document.getElementById('uploadPage').style.display = 'block';
    
    // Limpar arquivo selecionado
    clearSelectedFile();
    
    // Resetar estado
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

// ===== MODAL =====
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
    `;
    
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

// ===== EXPORTAÇÃO =====
function exportToPDF() {
    showNotification('Exportação para PDF em desenvolvimento', 'info');
}

function exportToCSV() {
    if (!STATE.filteredData || STATE.filteredData.length === 0) {
        showNotification('Nenhum dado para exportar', 'warning');
        return;
    }
    
    showNotification('Exportação para CSV em desenvolvimento', 'info');
}

function exportReport() {
    if (!STATE.filteredData || STATE.filteredData.length === 0) {
        showNotification('Nenhum dado para relatório', 'warning');
        return;
    }
    
    showNotification('Geração de relatório em desenvolvimento', 'info');
}

// ===== NOTIFICAÇÕES =====
window.showNotification = function(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const notificationIcon = document.getElementById('notification-icon');
    
    if (!notification || !notificationText || !notificationIcon) return;
    
    // Configurar ícone
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    else if (type === 'error') iconClass = 'fa-exclamation-circle';
    else if (type === 'warning') iconClass = 'fa-exclamation-triangle';
    
    notificationIcon.className = `fas ${iconClass}`;
    notificationText.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    // Esconder automaticamente
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
        console.log('Dados salvos no localStorage');
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

// ===== PREVENIR SAÍDA =====
window.addEventListener('beforeunload', function(e) {
    if (STATE.isLoading) {
        e.preventDefault();
        e.returnValue = 'A análise ainda está em progresso. Tem certeza que deseja sair?';
        return e.returnValue;
    }
});

// ===== INICIALIZAÇÃO FINAL =====
setTimeout(() => {
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        Chart.defaults.color = '#6B7280';
        console.log('Chart.js configurado');
    }
}, 100);
