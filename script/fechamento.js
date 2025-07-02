// Verificador de bibliotecas
document.addEventListener('DOMContentLoaded', () => {
    console.log("PizZip carregado:", typeof PizZip !== "undefined" ? "Sim" : "Não");
    console.log("docxtemplater carregado:", typeof docxtemplater !== "undefined" ? "Sim" : "Não");
    console.log("FileSaver carregado:", typeof saveAs !== "undefined" ? "Sim" : "Não");
});

const SUPABASE_URL = 'https://gwnyspolzwzghbyzpwcu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bnlzcG9send6Z2hieXpwd2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTkzMjgsImV4cCI6MjA2NzAzNTMyOH0.2UZSsiw2gwYLXzVnT15baO2iM6btwiMp7rhEHCG_LH0';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const vendedorSelect = document.getElementById('vendedor');
const compradorSelect = document.getElementById('comprador');
const btnGenerate = document.querySelector('.btn-generate');

// Referências aos novos boxes de preview
const vendedorPreviewBox = document.getElementById('vendedor-preview');
const compradorPreviewBox = document.getElementById('comprador-preview');


// Variáveis para armazenar os dados completos dos clientes selecionados
let dadosCompletosVendedor = null;
let dadosCompletosComprador = null;

/**
 * Atualiza o box de preview com os dados do cliente.
 * @param {HTMLElement} boxElement O elemento do box de preview a ser atualizado.
 * @param {object | null} clientData O objeto com os dados do cliente ou null para esconder o box.
 */
function updatePreviewBox(boxElement, clientData) {
    if (!clientData) {
        boxElement.style.display = 'none';
        return;
    }

    const nameSpan = boxElement.querySelector('.preview-name');
    const cnpjSpan = boxElement.querySelector('.preview-cnpj');
    const contatoSpan = boxElement.querySelector('.preview-contato');

    nameSpan.textContent = clientData.nome || 'Nome não disponível';
    cnpjSpan.textContent = `CNPJ: ${clientData.cnpj || 'Não informado'}`;
    contatoSpan.textContent = `Contato: ${clientData.telefone || 'Não informado'}`;

    boxElement.style.display = 'flex'; // Mostra o box
}


async function loadClientes() {
    vendedorSelect.innerHTML = '<option value="">Selecione um vendedor</option>';
    compradorSelect.innerHTML = '<option value="">Selecione um comprador</option>';

    let { data: vendedores } = await supabaseClient.from('clientes').select('*').eq('tipo_cliente', 'vendedor');
    if (vendedores) {
        vendedores.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.id;
            opt.textContent = v.nome;
            vendedorSelect.append(opt);
        });
    }

    let { data: compradores } = await supabaseClient.from('clientes').select('*').eq('tipo_cliente', 'comprador');
    if (compradores) {
        compradores.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.nome;
            compradorSelect.append(opt);
        });
    }
}

vendedorSelect.addEventListener('change', async () => {
    const id = vendedorSelect.value;
    if (!id) {
        dadosCompletosVendedor = null;
        updatePreviewBox(vendedorPreviewBox, null); // Esconde o preview
        // Limpar campos de retirada
        document.getElementById('retirada-endereco').value = '';
        document.getElementById('retirada-municipio').value = '';
        document.getElementById('retirada-cep').value = '';
        document.getElementById('retirada-cnpj').value = '';
        document.getElementById('retirada-ie').value = '';
        return;
    }
    let { data: v } = await supabaseClient.from('clientes').select('*').eq('id', id).single();
    
    dadosCompletosVendedor = v;
    updatePreviewBox(vendedorPreviewBox, v); // Atualiza o preview do vendedor

    // Preenche os campos de RETIRADA
    document.getElementById('retirada-endereco').value = v.endereco || '';
    document.getElementById('retirada-municipio').value = v.cidade || '';
    document.getElementById('retirada-cep').value = v.cep || '';
    document.getElementById('retirada-cnpj').value = v.cnpj || '';
    document.getElementById('retirada-ie').value = v.ie || '';
});

compradorSelect.addEventListener('change', async () => {
    const id = compradorSelect.value;
    if (!id) {
        dadosCompletosComprador = null;
        updatePreviewBox(compradorPreviewBox, null); // Esconde o preview
        // Limpar campos de descarga
        document.getElementById('descarga-comprador').value = '';
        document.getElementById('descarga-endereco').value = '';
        document.getElementById('descarga-municipio').value = '';
        document.getElementById('descarga-cep').value = '';
        document.getElementById('descarga-cnpj').value = '';
        document.getElementById('descarga-ie').value = '';
        return;
    }
    let { data: c } = await supabaseClient.from('clientes').select('*').eq('id', id).single();
    
    dadosCompletosComprador = c;
    updatePreviewBox(compradorPreviewBox, c); // Atualiza o preview do comprador

    // Preenche os campos de DESCARGA
    document.getElementById('descarga-comprador').value = c.nome || '';
    document.getElementById('descarga-endereco').value = c.endereco || '';
    document.getElementById('descarga-municipio').value = c.cidade || '';
    document.getElementById('descarga-cep').value = c.cep || '';
    document.getElementById('descarga-cnpj').value = c.cnpj || '';
    document.getElementById('descarga-ie').value = c.ie || '';
});

btnGenerate.addEventListener('click', async () => {
    // Validação
    if (!dadosCompletosVendedor || !dadosCompletosComprador) {
        return alert('Por favor, selecione um vendedor e um comprador da lista.');
    }
    const required = document.querySelectorAll('input[required], select[required], textarea[required]');
    let valid = true;
    required.forEach(f => {
        if (!f.value.trim()) {
            f.style.borderColor = 'var(--error)';
            valid = false;
        } else {
            f.style.borderColor = '';
        }
    });
    if (!valid) {
        return alert('Por favor, preencha todos os campos obrigatórios (*).');
    }

    // Cria o objeto final para o template
    const dadosParaTemplate = {
        vendedor_nome: dadosCompletosVendedor.nome || '',
        vendedor_cnpj: dadosCompletosVendedor.cnpj || '',
        vendedor_ie: dadosCompletosVendedor.ie || '',
        vendedor_endereco: dadosCompletosVendedor.endereco || '',
        vendedor_cidade: dadosCompletosVendedor.cidade || '',
        vendedor_cep: dadosCompletosVendedor.cep || '',
        vendedor_telefone: dadosCompletosVendedor.telefone || '',
        comprador_nome: dadosCompletosComprador.nome || '',
        comprador_cnpj: dadosCompletosComprador.cnpj || '',
        comprador_ie: dadosCompletosComprador.ie || '',
        comprador_endereco: dadosCompletosComprador.endereco || '',
        comprador_cidade: dadosCompletosComprador.cidade || '',
        comprador_cep: dadosCompletosComprador.cep || '',
        comprador_telefone: dadosCompletosComprador.telefone || '',
        retirada_endereco: document.getElementById('retirada-endereco').value,
        retirada_municipio: document.getElementById('retirada-municipio').value,
        retirada_cep: document.getElementById('retirada-cep').value,
        retirada_cnpj: document.getElementById('retirada-cnpj').value,
        retirada_ie: document.getElementById('retirada-ie').value,
        descarga_nome_local: document.getElementById('descarga-comprador').value,
        descarga_endereco: document.getElementById('descarga-endereco').value,
        descarga_municipio: document.getElementById('descarga-municipio').value,
        descarga_cep: document.getElementById('descarga-cep').value,
        descarga_cnpj: document.getElementById('descarga-cnpj').value,
        descarga_ie: document.getElementById('descarga-ie').value,
        preco_saca: document.getElementById('preco').value,
        sacaria: document.getElementById('sacaria').value,
        quantidade: document.getElementById('quantidade').value,
        modalidade: document.getElementById('modalidade').options[document.getElementById('modalidade').selectedIndex].text,
        descricao: document.getElementById('descricao').value,
        pagamento: document.getElementById('pagamento').value,
        bancarios: document.getElementById('bancarios').value,
        observacoes: document.getElementById('observacoes').value,
        data_fechamento: new Date().toLocaleDateString('pt-BR')
    };
    
    gerarFechamentoWord(dadosParaTemplate);
});

async function gerarFechamentoWord(dados) {
    try {
        const response = await fetch('modelo.docx');
        if (!response.ok) throw new Error(`Erro HTTP! status: ${response.status}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const zip = new window.PizZip(arrayBuffer);
        
        const doc = new docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            parser: window.angularParser,
            delimiters: { start: "${", end: "}" }
        });

        doc.setData(dados);
        
        try {
            doc.render();
        } catch (error) {
            let errorMsg = "Erro no template: " + (error.message || '');
            if (error.properties && error.properties.errors) {
                error.properties.errors.forEach(e => {
                    errorMsg += `\n- ${e.stack || e.message}`;
                });
            }
            throw new Error(errorMsg);
        }
        
        const out = doc.getZip().generate({
            type: "blob",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        });
        
        const fileName = `CONFIRMACAO_${dados.vendedor_nome}_${dados.comprador_nome}_${new Date().getTime()}.docx`;
        saveAs(out, fileName);
        
    } catch (error) {
        console.error("Erro ao gerar documento:", error);
        alert("ERRO: " + error.message);
    }
}

document.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
        if (field.style.borderColor === 'rgb(244, 67, 54)') {
            field.style.borderColor = '';
        }
    });
});

document.addEventListener('DOMContentLoaded', loadClientes);