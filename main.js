// main.js - versão finalizada

document.addEventListener('DOMContentLoaded', function() {
    // Elementos
    const uploadPage = document.getElementById('uploadPage');
    const dashboardPage = document.getElementById('dashboardPage');
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const startAnalysisBtn = document.getElementById('startAnalysisBtn');
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    
    // Configurar upload
    selectFileBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            // Exibir as informações do arquivo selecionado
            const file = this.files[0];
            document.getElementById('fileNameDisplay').textContent = file.name;
            document.getElementById('fileSizeDisplay').textContent = `${(file.size / 1024).toFixed(2)} KB`;
            
            // Exibir informações do arquivo e esconder área de upload
            document.getElementById('fileInfo').style.display = 'block';
            document.getElementById('uploadArea').style.display = 'none';
        }
    });
    
    // Iniciar análise
    startAnalysisBtn.addEventListener('click', function() {
        // Selecione um arquivo para processamento ou gere dados de demonstração
        const file = fileInput.files[0];
        if (file) {
            processFile(file);
        } else {
            generateDemoData(); // Se nenhum arquivo for selecionado, gerar dados de demonstração
        }
        
        // Mostrar dashboard
        uploadPage.style.display = 'none';
        dashboardPage.style.display = 'block';
        
        // Atualizar o dashboard
        updateDashboard();
    });
    
    // Voltar para upload
    backToHomeBtn?.addEventListener('click', function() {
        dashboardPage.style.display = 'none';
        uploadPage.style.display = 'block';
    });
});

// Função para processar o arquivo carregado
function processFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const data = event.target.result;
        
        // Processar os dados do arquivo Excel/CSV
        const workbook = XLSX.read(data, {type: 'binary'});
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        window.demoData = XLSX.utils.sheet_to_json(sheet);
        
        // Atualizar dashboard
        updateDashboard();
    };
    
    reader.readAsBinaryString(file);
}

// Função para gerar dados de demonstração
function generateDemoData() {
    // Gerar dados de demonstração
    window.demoData = [
        { id: 'ITEM-001', nome: 'Computador', categoria: 'Equipamento', estado: 'Bom', valor: 2500 },
        { id: 'ITEM-002', nome: 'Mesa', categoria: 'Mobiliário', estado: 'Regular', valor: 800 },
        { id: 'ITEM-003', nome: 'Carro', categoria: 'Veículo', estado: 'Bom', valor: 150000 },
        { id: 'ITEM-004', nome: 'Cadeira', categoria: 'Mobiliário', estado: 'Bom', valor: 300 },
        { id: 'ITEM-005', nome: 'Projetor', categoria: 'Equipamento', estado: 'Ruim', valor: 5000 },
    ];
}

// Função para atualizar o dashboard com os dados
function updateDashboard() {
    const data = window.demoData || [];
    
    // Atualizar cards
    const totalValue = data.reduce((sum, item) => sum + item.valor, 0);
    document.getElementById('totalValue').textContent = `R$ ${totalValue.toLocaleString('pt-PT')}`;
    document.getElementById('totalItems').textContent = data.length;
    
    // Criar gráficos
    createCharts(data);
    
    // Popular tabela
    populateTable(data);
}

// Função para criar gráficos (exemplo com Chart.js)
function createCharts(data) {
    // Gráfico de categorias (Pizza)
    const ctx1 = document.getElementById('categoryChart').getContext('2d');
    
    const categories = data.reduce((acc, item) => {
        const category = item.categoria;
        acc[category] = (acc[category] || 0) + item.valor;
        return acc;
    }, {});
    
    new Chart(ctx1, {
        type: 'pie',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ['#3B82F6', '#10B981', '#F97316', '#EF4444'],
            }],
        },
    });

    // Gráfico de estados (Barra)
    const ctx2 = document.getElementById('statusChart').getContext('2d');
    const statusData = data.reduce((acc, item) => {
        const state = item.estado;
        acc[state] = (acc[state] || 0) + 1;
        return acc;
    }, {});

    new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: Object.keys(statusData),
            datasets: [{
                data: Object.values(statusData),
                backgroundColor: ['#10B981', '#F97316', '#EF4444'],
            }],
        },
    });
}

// Função para popular a tabela com dados
function populateTable(data) {
    const tbody = document.getElementById('itemsTableBody');
    tbody.innerHTML = ''; // Limpa a tabela antes de popular
    
    data.forEach(item => {
        const row = `<tr>
            <td>${item.id}</td>
            <td>${item.nome}</td>
            <td>${item.categoria}</td>
            <td>${item.estado}</td>
            <td>R$ ${item.valor.toLocaleString('pt-PT')}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}
