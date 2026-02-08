// main.js - versão simplificada

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
            document.getElementById('fileInfo').style.display = 'block';
            document.getElementById('uploadArea').style.display = 'none';
        }
    });
    
    // Iniciar análise
    startAnalysisBtn.addEventListener('click', function() {
        // Gerar dados de demonstração
        generateDemoData();
        
        // Mostrar dashboard
        uploadPage.style.display = 'none';
        dashboardPage.style.display = 'block';
        
        // Atualizar dashboard
        updateDashboard();
    });
    
    // Voltar para upload
    backToHomeBtn?.addEventListener('click', function() {
        dashboardPage.style.display = 'none';
        uploadPage.style.display = 'block';
    });
});

function generateDemoData() {
    // Gerar dados de demonstração
    window.demoData = [
        { id: 'ITEM-001', nome: 'Computador', categoria: 'Equipamento', estado: 'Bom', valor: 2500 },
        { id: 'ITEM-002', nome: 'Mesa', categoria: 'Mobiliário', estado: 'Regular', valor: 800 },
        { id: 'ITEM-003', nome: 'Carro', categoria: 'Veículo', estado: 'Bom', valor: 150000 },
        // ... mais dados
    ];
}

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

function createCharts(data) {
    // Gráfico de categorias
    const ctx1 = document.getElementById('categoryChart').getContext('2d');
    // ... código do gráfico
    
    // Gráfico de estados
    const ctx2 = document.getElementById('statusChart').getContext('2d');
    // ... código do gráfico
}

function populateTable(data) {
    const tbody = document.getElementById('itemsTableBody');
    tbody.innerHTML = '';
    
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
