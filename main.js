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
            
            document.getElementById('fileInfo').style.display = 'block';
        }
    });
    
    // Iniciar análise
    startAnalysisBtn.addEventListener('click', function() {
        const file = fileInput.files[0];
        if (file) {
            processFile(file);
        } else {
            generateDemoData(); // Gerar dados de demonstração se não houver arquivo
        }
        
        uploadPage.style.display = 'none';
        dashboardPage.style.display = 'block';
        
        updateDashboard();
    });
    
    // Voltar para upload
    backToHomeBtn.addEventListener('click', function() {
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
        
        updateDashboard();
    };
    
    reader.readAsBinaryString(file);
}

// Função para gerar dados de demonstração
function generateDemoData() {
    window.demoData = [
        { id: 'ITEM-001', nome: 'Computador', categoria: 'Equipamento', estado: 'Bom', valor: 2500 },
        { id: 'ITEM-002', nome: 'Mesa', categoria: 'Mobiliário', estado: 'Regular', valor: 800 },
        { id: 'ITEM-003', nome: 'Carro', categoria: 'Veículo', estado: 'Bom', valor: 150000 },
        { id: 'ITEM-004', nome: 'Cadeira', categoria: 'Mobiliário', estado: 'Bom', valor: 300 },
        { id: 'ITEM-005', nome: 'Projetor', categoria: 'Equipamento', estado: 'Ruim', valor: 5000 },
        // ... Mais dados
    ];
}

// Função para atualizar o dashboard
function updateDashboard() {
    const data = window.demoData || [];
    
    // Atualizar cards
    const totalValue = data.reduce((sum, item) => sum + item.valor, 0);
    document.getElementById('totalValue').textContent = `R$ ${totalValue.toLocaleString('pt-PT')}`;
    
    createCharts(data);
}

// Função para criar gráficos
function createCharts(data) {
    // Gráfico de categorias
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
}
