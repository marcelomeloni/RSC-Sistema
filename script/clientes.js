  // Configuração do Supabase - Substitua com suas credenciais
  const SUPABASE_URL = 'https://gwnyspolzwzghbyzpwcu.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bnlzcG9send6Z2hieXpwd2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTkzMjgsImV4cCI6MjA2NzAzNTMyOH0.2UZSsiw2gwYLXzVnT15baO2iM6btwiMp7rhEHCG_LH0';
  
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  
  // Elementos DOM
  const clientsList = document.getElementById('clients-list');
  const clientForm = document.getElementById('client-form');
  const clientId = document.getElementById('client-id');
  const clientType = document.getElementById('client-type');
  const clientName = document.getElementById('client-name');
  const clientCnpj = document.getElementById('client-cnpj');
  const clientIe = document.getElementById('client-ie');
  const clientPhone = document.getElementById('client-phone');
  const clientEmail = document.getElementById('client-email');
  const clientAddress = document.getElementById('client-address');
  const clientCity = document.getElementById('client-city');
  const clientState = document.getElementById('client-state');
  const clientCep = document.getElementById('client-cep');
  const clientNotes = document.getElementById('client-notes');
  const formTitle = document.getElementById('form-title');
  const saveBtn = document.getElementById('save-btn');
  const resetBtn = document.getElementById('reset-btn');
  const newClientBtn = document.getElementById('new-client-btn');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const notification = document.getElementById('notification');
  const notificationMessage = document.getElementById('notification-message');
  
  // Estado do aplicativo
  let editingClientId = null;
  
  // Função para mostrar notificação
  function showNotification(message, isError = false) {
      notificationMessage.textContent = message;
      notification.classList.toggle('error', isError);
      notification.classList.add('show');
      
      setTimeout(() => {
          notification.classList.remove('show');
      }, 3000);
  }
  
  // Carregar clientes ao iniciar
  async function loadClients() {
      try {
          let { data: clientes, error } = await supabaseClient
              .from('clientes')
              .select('*');
          
          if (error) throw error;
          
          renderClients(clientes);
      } catch (error) {
          console.error('Erro ao carregar clientes:', error);
          showNotification('Erro ao carregar clientes', true);
      }
  }
  
  // Renderizar clientes na lista
  function renderClients(clientes) {
      if (!clientes || clientes.length === 0) {
          clientsList.innerHTML = `
              <div class="no-clients">
                  <i class="fas fa-users-slash"></i>
                  <h3>Nenhum cliente encontrado</h3>
                  <p>Cadastre um novo cliente usando o formulário ao lado</p>
              </div>
          `;
          return;
      }
      
      clientsList.innerHTML = clientes.map(cliente => `
          <div class="client-card" data-id="${cliente.id}">
              <div class="client-type">${cliente.tipo_cliente.toUpperCase()}</div>
              <div class="client-name">
                  <i class="fas ${cliente.tipo_cliente === 'vendedor' ? 'fa-user-tie' : cliente.tipo_cliente === 'comprador' ? 'fa-user-tag' : 'fa-user-friends'}"></i> 
                  ${cliente.nome}
              </div>
              <div class="client-info">
                  <div>
                      <span class="label">CNPJ:</span>
                      <span>${cliente.cnpj}</span>
                  </div>
                  <div>
                      <span class="label">Telefone:</span>
                      <span>${cliente.telefone}</span>
                  </div>
                  <div>
                      <span class="label">Cidade:</span>
                      <span>${cliente.cidade} - ${cliente.estado}</span>
                  </div>
                  <div>
                      <span class="label">Endereço:</span>
                      <span>${cliente.endereco}</span>
                  </div>
                  ${cliente.observacoes ? `
                  <div>
                      <span class="label">Observações:</span>
                      <span>${cliente.observacoes}</span>
                  </div>` : ''}
              </div>
              <div class="client-actions">
                  <button class="btn btn-secondary edit-btn">
                      <i class="fas fa-edit"></i> Editar
                  </button>
                  <button class="btn btn-danger delete-btn">
                      <i class="fas fa-trash-alt"></i> Excluir
                  </button>
              </div>
          </div>
      `).join('');
      
      // Adicionar event listeners aos botões
      document.querySelectorAll('.edit-btn').forEach(btn => {
          btn.addEventListener('click', function() {
              const clientCard = this.closest('.client-card');
              const id = clientCard.dataset.id;
              editClient(id);
          });
      });
      
      document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', function() {
              const clientCard = this.closest('.client-card');
              const id = clientCard.dataset.id;
              deleteClient(id);
          });
      });
  }
  
  // Editar cliente
  async function editClient(id) {
      try {
          let { data: cliente, error } = await supabaseClient
              .from('clientes')
              .select('*')
              .eq('id', id)
              .single();
          
          if (error) throw error;
          
          // Preencher o formulário
          clientId.value = cliente.id;
          clientType.value = cliente.tipo_cliente;
          clientName.value = cliente.nome;
          clientCnpj.value = cliente.cnpj;
          clientIe.value = cliente.ie || '';
          clientPhone.value = cliente.telefone;
          clientEmail.value = cliente.email || '';
          clientAddress.value = cliente.endereco;
          clientCity.value = cliente.cidade;
          clientState.value = cliente.estado;
          clientCep.value = cliente.cep;
          clientNotes.value = cliente.observacoes || '';
          
          // Atualizar título do formulário
          formTitle.textContent = 'Editar Cliente';
          
          // Scroll para o formulário
          document.querySelector('.card-title').scrollIntoView({ behavior: 'smooth' });
          
      } catch (error) {
          console.error('Erro ao carregar cliente:', error);
          showNotification('Erro ao carregar cliente', true);
      }
  }
  
  // Excluir cliente
  async function deleteClient(id) {
      if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
      
      try {
          const { error } = await supabaseClient
              .from('clientes')
              .delete()
              .eq('id', id);
          
          if (error) throw error;
          
          showNotification('Cliente excluído com sucesso');
          loadClients();
      } catch (error) {
          console.error('Erro ao excluir cliente:', error);
          showNotification('Erro ao excluir cliente', true);
      }
  }
  
  // Salvar cliente (criar ou atualizar)
  async function saveClient() {
      // Validação
      const requiredFields = [
          clientType, clientName, clientCnpj, 
          clientPhone, clientAddress, clientCity, 
          clientState, clientCep
      ];
      
      let isValid = true;
      
      requiredFields.forEach(field => {
          if (!field.value.trim()) {
              field.style.borderColor = 'var(--error)';
              isValid = false;
          } else {
              field.style.borderColor = '';
          }
      });
      
      if (!isValid) {
          showNotification('Preencha todos os campos obrigatórios', true);
          return;
      }
      
      // Dados do cliente
      const clienteData = {
          tipo_cliente: clientType.value,
          nome: clientName.value,
          cnpj: clientCnpj.value,
          ie: clientIe.value,
          telefone: clientPhone.value,
          email: clientEmail.value,
          endereco: clientAddress.value,
          cidade: clientCity.value,
          estado: clientState.value,
          cep: clientCep.value,
          observacoes: clientNotes.value
      };
      
      try {
          if (clientId.value) {
              // Atualizar cliente existente
              const { error } = await supabaseClient
                  .from('clientes')
                  .update(clienteData)
                  .eq('id', clientId.value);
              
              if (error) throw error;
              
              showNotification('Cliente atualizado com sucesso');
          } else {
              // Criar novo cliente
              const { error } = await supabaseClient
                  .from('clientes')
                  .insert([clienteData]);
              
              if (error) throw error;
              
              showNotification('Cliente cadastrado com sucesso');
          }
          
          // Limpar formulário e recarregar lista
          clientForm.reset();
          clientId.value = '';
          formTitle.textContent = 'Cadastrar Novo Cliente';
          loadClients();
          
      } catch (error) {
          console.error('Erro ao salvar cliente:', error);
          showNotification('Erro ao salvar cliente', true);
      }
  }
  
  // Pesquisar clientes
  async function searchClients(term) {
      try {
          let { data: clientes, error } = await supabaseClient
              .from('clientes')
              .select('*')
              .or(`nome.ilike.%${term}%,cnpj.ilike.%${term}%,cidade.ilike.%${term}%`);
          
          if (error) throw error;
          
          renderClients(clientes);
      } catch (error) {
          console.error('Erro na pesquisa:', error);
          showNotification('Erro na pesquisa', true);
      }
  }
  
  // Event Listeners
  clientForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveClient();
  });
  
  resetBtn.addEventListener('click', function() {
      clientId.value = '';
      formTitle.textContent = 'Cadastrar Novo Cliente';
  });
  
  newClientBtn.addEventListener('click', function() {
      clientForm.reset();
      clientId.value = '';
      formTitle.textContent = 'Cadastrar Novo Cliente';
      document.querySelector('.card-title').scrollIntoView({ behavior: 'smooth' });
  });
  
  searchBtn.addEventListener('click', function() {
      const term = searchInput.value.trim();
      if (term) {
          searchClients(term);
      } else {
          loadClients();
      }
  });
  
  searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
          const term = searchInput.value.trim();
          if (term) {
              searchClients(term);
          } else {
              loadClients();
          }
      }
  });
  
  // Resetar cor da borda quando o usuário começa a digitar
  document.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('input', function() {
          if (this.style.borderColor === 'rgb(244, 67, 54)') {
              this.style.borderColor = '';
          }
      });
  });
  
  // Inicializar
  document.addEventListener('DOMContentLoaded', () => {
      loadClients();
  });