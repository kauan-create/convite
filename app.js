// --- CONTROLLER DE TELAS ---
function switchTab(tabId) {
    document.getElementById('guest-view').classList.add('hidden');
    document.getElementById('admin-view').classList.add('hidden');
    document.getElementById(tabId).classList.remove('hidden');
    
    if(tabId === 'admin-view') {
        let senha = prompt("Digite a senha de administrador:");
        if(senha === "1234") { // Altere para a senha que você preferir
            loadAdminData();
        } else {
            alert("Senha incorreta!");
            switchTab('guest-view');
        }
    }
}

// --- CONTAGEM REGRESSIVA (Alvo: 28/06/2026) ---
const targetDate = new Date("June 28, 2026 18:00:00").getTime();

const countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference < 0) {
        clearInterval(countdownInterval);
        const elements = ["days", "hours", "minutes", "seconds"];
        elements.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.innerText = "00";
        });
        return;
    }

    const d = Math.floor(difference / (1000 * 60 * 60 * 24));
    const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((difference % (1000 * 60)) / 1000);

    if(document.getElementById("days")) {
        document.getElementById("days").innerText = d < 10 ? "0" + d : d;
        document.getElementById("hours").innerText = h < 10 ? "0" + h : h;
        document.getElementById("minutes").innerText = m < 10 ? "0" + m : m;
        document.getElementById("seconds").innerText = s < 10 ? "0" + s : s;
    }
}, 1000);


// --- LÓGICA DO CONVIDADO (ESTILO FRINPLE: SELEÇÃO RÁPIDA) ---
let currentGroupGuests = [];

async function searchGroup() {
    const nameInput = document.getElementById('search-name').value.trim();
    if (!nameInput) return alert("Por favor, digite seu nome.");

    try {
        // 1. Busca o convidado digitado (Insensível a maiúsculas/minúsculas)
        const { data: guestData, error: guestError } = await supabase
            .from('convidados')
            .select('*')
            .ilike('nome_convidado', `%${nameInput}%`);

        if (guestError || !guestData || guestData.length === 0) {
            return alert("Nome não encontrado na lista. Verifique a grafia ou fale com o organizador.");
        }

        // 2. Busca todos os membros do mesmo grupo familiar
        const groupName = guestData[0].nome_grupo;
        const { data: groupData, error: groupError } = await supabase
            .from('convidados')
            .select('*')
            .eq('nome_grupo', groupName);

        if (groupError) return alert("Erro ao buscar grupo familiar.");

        currentGroupGuests = groupData;
        renderGroupSelection();
    } catch (err) {
        console.error(err);
        alert("Erro de conexão com o banco de dados.");
    }
}

function renderGroupSelection() {
    const container = document.getElementById('group-members-list');
    if (!container) return;
    
    container.innerHTML = '';

    currentGroupGuests.forEach((guest, index) => {
        // Mapeando para o formato correto do banco (usando a coluna status_presenca)
        const isConfirmed = guest.status_presenca === 'Confirmado';
        const isRecused = guest.status_presenca === 'Ausente';
        
        container.innerHTML += `
            <div class="p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-[#D9C3B0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 transition-all hover:bg-white/80">
                <span class="font-bold text-sm text-[#3D2314]">${guest.nome_convidado}</span>
                <div class="flex gap-2 w-full sm:w-auto">
                    <label class="flex-1 sm:flex-none flex items-center justify-center gap-1 text-xs font-bold cursor-pointer bg-green-100 text-green-800 px-3 py-2 rounded-lg border border-green-300 transition-all active:scale-95">
                        <input type="radio" name="status-${index}" value="Confirmado" ${isConfirmed || (!isConfirmed && !isRecused) ? 'checked' : ''} class="accent-green-700"> Vai 🦖
                    </label>
                    <label class="flex-1 sm:flex-none flex items-center justify-center gap-1 text-xs font-bold cursor-pointer bg-red-100 text-red-800 px-3 py-2 rounded-lg border border-red-300 transition-all active:scale-95">
                        <input type="radio" name="status-${index}" value="Ausente" ${isRecused ? 'checked' : ''} class="accent-red-700"> Não vai 😢
                    </label>
                </div>
            </div>
        `;
    });

    document.getElementById('step-search').classList.add('hidden');
    document.getElementById('step-confirm').classList.remove('hidden');
    
    const checkoutStep = document.getElementById('step-checkout');
    if(checkoutStep) checkoutStep.classList.add('hidden');
}

async function submitRSVP() {
    const confirmedList = [];
    const stepConfirm = document.getElementById('step-confirm');

    try {
        for (let i = 0; i < currentGroupGuests.length; i++) {
            const guest = currentGroupGuests[i];
            const radioSelected = document.querySelector(`input[name="status-${i}"]:checked`);
            const selectedStatus = radioSelected ? radioSelected.value : 'Confirmado';

            if (selectedStatus === 'Confirmado') {
                confirmedList.push(guest.nome_convidado);
            }

            await supabase
                .from('convidados')
                .update({ status_presenca: selectedStatus })
                .eq('id', guest.id);
        }

        // Esconde o passo de confirmação e monta a tela de checkout sucesso
        if(stepConfirm) stepConfirm.classList.add('hidden');
        showCheckoutSuccess(confirmedList);

    } catch (err) {
        console.error(err);
        alert("Houve um problema ao salvar suas respostas. Tente novamente.");
    }
}

function showCheckoutSuccess(confirmedMembers) {
    const checkoutStep = document.getElementById('step-checkout');
    const summaryList = document.getElementById('checkout-summary-list');
    
    if (!checkoutStep) {
        // Fallback caso o HTML não tenha a nova div de checkout ainda
        alert("Presença respondida com sucesso! Obrigado! 🎉");
        resetFlow();
        return;
    }

    summaryList.innerHTML = '';

    if (confirmedMembers.length === 0) {
        summaryList.innerHTML = `<li class="text-red-700 list-none font-medium">Nenhum membro do grupo foi confirmado.</li>`;
    } else {
        confirmedMembers.forEach(name => {
            summaryList.innerHTML += `<li class="flex items-center gap-1">✅ ${name}</li>`;
        });
    }

    checkoutStep.classList.remove('hidden');
}

function resetFlow() {
    document.getElementById('search-name').value = '';
    document.getElementById('step-search').classList.remove('hidden');
    
    const confirmStep = document.getElementById('step-confirm');
    const checkoutStep = document.getElementById('step-checkout');
    
    if(confirmStep) confirmStep.classList.add('hidden');
    if(checkoutStep) checkoutStep.classList.add('hidden');
}


// --- LÓGICA DO ADMINISTRADOR ---
async function loadAdminData() {
    try {
        const { data, error } = await supabase
            .from('convidados')
            .select('*')
            .order('nome_grupo', { ascending: true });

        if (error) throw error;

        const tbody = document.getElementById('admin-table-body');
        if(!tbody) return;
        
        tbody.innerHTML = '';

        let totalGuests = data.length;
        let confirmedCount = 0;

        data.forEach(guest => {
            let badgeColor = "bg-gray-100 text-gray-600";
            if(guest.status_presenca === 'Confirmado') {
                badgeColor = "bg-green-100 text-green-700 font-bold";
                confirmedCount++;
            }
            if(guest.status_presenca === 'Ausente') badgeColor = "bg-red-100 text-red-700";

            tbody.innerHTML += `
                <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td class="p-3 font-medium text-gray-800">${guest.nome_grupo}</td>
                    <td class="p-3 text-gray-600">${guest.nome_convidado}</td>
                    <td class="p-3 text-center">
                        <span class="px-2 py-1 text-xs rounded-full ${badgeColor}">
                            ${guest.status_presenca || 'Pendente'}
                        </span>
                    </td>
                    <td class="p-3 text-center">
                        <button onclick="deleteGuest('${guest.id}')" class="text-xs text-red-500 hover:text-red-700 hover:underline font-semibold">Excluir</button>
                    </td>
                </tr>
            `;
        });

        // Atualiza painéis numéricos se existirem no HTML
        const elConfirmed = document.getElementById('admin-counter-confirmed');
        const elTotal = document.getElementById('admin-counter-total');
        
        if(elConfirmed) elConfirmed.innerText = confirmedCount;
        if(elTotal) elTotal.innerText = totalGuests;

    } catch (err) {
        console.error(err);
        alert("Erro ao carregar dados do painel.");
    }
}

async function addGuestFromAdmin() {
    const groupName = document.getElementById('admin-group-name').value.trim();
    const guestName = document.getElementById('admin-guest-name').value.trim();

    if(!groupName || !guestName) return alert("Preencha todos os campos.");

    const { error } = await supabase
        .from('convidados')
        .insert([{ nome_grupo: groupName, nome_convidado: guestName, status_presenca: 'Pendente' }]);

    if(error) {
        alert("Erro ao adicionar convidado.");
    } else {
        document.getElementById('admin-guest-name').value = '';
        loadAdminData();
    }
}

async function deleteGuest(id) {
    if(!confirm("Tem certeza que deseja remover este convidado?")) return;
    
    const { error } = await supabase
        .from('convidados')
        .delete()
        .eq('id', id);

    if(!error) {
        loadAdminData();
    } else {
        alert("Erro ao deletar do servidor.");
    }
}

/*
==================================================
ATUALIZAÇÕES DO SISTEMA
- Organização por famílias
- Monitoramento de confirmados
- Cadastro em grupo
- Envio individual/família preparado
==================================================
*/

async function addGuestFromAdmin() {

    const groupName = document.getElementById('admin-group-name').value.trim();
    const guestName = document.getElementById('admin-guest-name').value.trim();

    if(!groupName || !guestName) {
        return alert("Preencha os campos.");
    }

    const guests = guestName.split(',').map(name => name.trim());

    const payload = guests.map(name => ({
        nome_grupo: groupName,
        nome_convidado: name,
        status_presenca: 'Pendente'
    }));

    const { error } = await supabase
        .from('convidados')
        .insert(payload);

    if(error) {
        console.error(error);
        return alert("Erro ao adicionar convidados.");
    }

    alert("Família/grupo adicionado com sucesso.");

    loadAdminData();
}
