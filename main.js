document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       VARIÁVEIS GLOBAIS
    ========================================================== */
    let dadosOriginais = [];
    let charts = {};

    /* =========================================================
       ELEMENTOS DO DOM
    ========================================================== */
    const excelFile = document.getElementById("fileInput");

    const filtroCategoria = document.getElementById("categoryFilter");
    const filtroDistrito = document.getElementById("districtFilter");
    const filtroEstado = document.getElementById("statusFilter");
    const filtroValorMin = document.getElementById("minValue");
    const filtroValorMax = document.getElementById("maxValue");

    const cardTotal = document.getElementById("totalValue");
    const cardTotalItens = document.getElementById("totalItems");
    const cardEstadoMedio = document.getElementById("avgStatus");
    const cardItensCriticos = document.getElementById("criticalItems");

    const btnDownload = document.getElementById("exportPdfBtn");

    /* =========================================================
       UPLOAD DO EXCEL
    ========================================================== */
    excelFile.addEventListener("change", e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = evt => {
            const data = new Uint8Array(evt.target.result);
            const wb = XLSX.read(data, { type: "array" });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            dadosOriginais = XLSX.utils.sheet_to_json(sheet, { defval: "" });

            if (!dadosOriginais.length) {
                alert("Ficheiro sem dados válidos.");
                return;
            }

            inicializarFiltros();
            aplicarFiltros();
        };
        reader.readAsArrayBuffer(file);
    });

    /* =========================================================
       FILTROS
    ========================================================== */
    [filtroCategoria, filtroDistrito, filtroEstado, filtroValorMin, filtroValorMax]
        .forEach(el => el.addEventListener("change", aplicarFiltros));

    function inicializarFiltros() {
        preencherSelect(filtroCategoria, "Categoria");
        preencherSelect(filtroDistrito, "Distrito");
        filtroEstado.innerHTML = `<option value="">Todos</option><option value="Bom">Bom</option><option value="Regular">Regular</option><option value="Ruim">Ruim</option>`;
        filtroValorMin.value = 0;
        filtroValorMax.value = 50000; // Ajuste para o intervalo do valor
    }

    /* =========================================================
       APLICAR FILTROS
    ========================================================== */
    function aplicarFiltros() {
        let base = dadosOriginais;

        if (filtroCategoria.value) {
            base = base.filter(d => d.Categoria === filtroCategoria.value);
        }

        if (filtroDistrito.value) {
            base = base.filter(d => d.Distrito === filtroDistrito.value);
        }

        if (filtroEstado.value) {
            base = base.filter(d => d.Estado_Conservação === filtroEstado.value);
        }

        if (filtroValorMin.value) {
            base = base.filter(d => d.Valor_Aquisição >= filtroValorMin.value);
        }

        if (filtroValorMax.value) {
            base = base.filter(d => d.Valor_Aquisição <= filtroValorMax.value);
        }

        atualizarIndicadores(base);
    }

    /* =========================================================
       INDICADORES
    ========================================================== */
    function atualizarIndicadores(d) {
        const total = d.length;

        const totalValor = d.reduce((acc, item) => acc + item.Valor_Aquisição, 0);
        const totalItens = d.length;
        const estadoMedio = (d.filter(x => x.Estado_Conservação === "Bom").length / total * 100).toFixed(2);

        const itensCriticos = d.filter(item => item.Estado_Conservação === "Ruim" && item.Valor_Aquisição > 10000).length;

        // Atualizando os indicadores em MZN
        cardTotal.textContent = `MZN ${totalValor.toLocaleString('pt-MZ')}`;
        cardTotalItens.textContent = totalItens;
        cardEstadoMedio.textContent = `${estadoMedio}%`;
        cardItensCriticos.textContent = itensCriticos;

        renderizarVisualizacoes(d);
    }

    /* =========================================================
       VISUALIZAÇÕES (GRÁFICOS E TABELAS)
    ========================================================== */
    function renderizarVisualizacoes(dados) {
        destruirGraficos();

        criarGrafico("categoryChart", "pie", calcularValorPorCategoria(dados), { area: false });
        criarGrafico("statusChart", "bar", calcularEstadoDeConservacao(dados), { horizontal: true });
    }

    /* =========================================================
       CALCULOS DE DADOS PARA GRÁFICOS
    ========================================================== */
    function calcularValorPorCategoria(dados) {
        return dados.reduce((acc, item) => {
            acc[item.Categoria] = (acc[item.Categoria] || 0) + item.Valor_Aquisição;
            return acc;
        }, {});
    }

    function calcularEstadoDeConservacao(dados) {
        return dados.reduce((acc, item) => {
            acc[item.Estado_Conservação] = (acc[item.Estado_Conservação] || 0) + 1;
            return acc;
        }, {});
    }

    /* =========================================================
       CRIAÇÃO DE GRÁFICOS
    ========================================================== */
    function criarGrafico(id, tipo, dados, cfg = {}) {
        const ctx = document.getElementById(id);
        if (!ctx || !Object.keys(dados).length) return;

        charts[id] = new Chart(ctx, {
            type: tipo,
            data: {
                labels: Object.keys(dados),
                datasets: [{
                    data: Object.values(dados),
                    backgroundColor: cfg.cor || 'rgba(46,216,195,0.35)',
                    borderColor: cfg.cor || '#2DD4BF',
                    fill: cfg.area || false,
                    tension: 0.4,
                    pointRadius: tipo === "line" ? 3 : 0,
                    pointBackgroundColor: "#2DD4BF",
                    borderRadius: 8
                }]
            },
            options: {
                maintainAspectRatio: false,
                indexAxis: cfg.horizontal ? "y" : "x",
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { grid: { display: false }, beginAtZero: true }
                }
            }
        });
    }

    function destruirGraficos() {
        Object.values(charts).forEach(c => c.destroy());
        charts = {};
    }

    /* =========================================================
       FUNÇÃO DE DOWNLOAD (PDF)
    ========================================================== */
    btnDownload.addEventListener("click", () => {
        html2pdf().set({
            margin: 0.5,
            filename: "Dashboard_Analise_Patrimonial.pdf",
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, backgroundColor: "#FFFFFF" },
            jsPDF: { unit: "in", format: "a4", orientation: "landscape" }
        }).from(document.querySelector(".container")).save();
    });

});
