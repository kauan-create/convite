// --- CONTROLLER DE TELAS ---
function switchTab(tabId) {
    document.getElementById('guest-view').classList.add('hidden');
    document.getElementById('admin-view').classList.add('hidden');
    document.getElementById(tabId).classList.remove('hidden');
    
    if(tabId === 'admin-view') {
        let senha = prompt("Digite a senha de administrador:");
        if(senha === "1234") { // Altere "1234" para a senha que você preferir
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
        document.getElementById("days").innerText = "00";
        document.getElementById("hours").innerText = "00";
        document.getElementById("minutes").innerText = "00";
        document.getElementById("seconds").innerText = "00";
        return;
    }

    const d = Math.floor(difference / (1000 * 60 * 60 * 24));
    const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = d < 10 ? "0" + d : d;
    document.getElementById("hours").innerText = h < 10 ? "0" + h : h;
    document.getElementById("minutes").innerText = m < 10 ? "0" + m : m;
    document.getElementById("seconds").innerText = s < 10 ? "0" + s : s;
}, 1000);


// --- LÓGICA DO CONVIDADO (BUSCA, CONFIRMAÇÃO & CHECKOUT) ---
let currentGroupGuests = [];

async function searchGroup() {
    const nameInput = document.getElementById('search-name').value.trim();
    if (!nameInput) return alert("Por favor, digite seu nome.");

    // 1. Busca o convidado digitado
    const { data: guestData, error: guestError } = await supabase
        .from('convidados')
        .select('*')
        .ilike('nome_convidado', `%${nameInput}%`);

    if (guestError || guestData.length === 0) {
        return alert("Nome não encontrado na lista. Verifique a grafia ou fale com o organizador.");
    }

    // 2. Busca todos os membros que pertencem ao mesmo grupo daquele convidado
    const groupName = guestData[0].nome_grupo;
    const { data: groupData, error: groupError } = await supabase
        .from('convidados')
        .select('*')
        .eq('nome_grupo', groupName);

    if (groupError) return alert("Erro ao buscar grupo.");

    currentGroupGuests = groupData;
    renderGroupSelection();
}

function renderGroupSelection() {
    const container = document.getElementById('group-members-list');
    container.innerHTML = '';

    currentGroupGuests.forEach((guest, index) => {
        const isConfirmed = guest.status_presenca === 'Confirmado';
        const isRecused = guest.status_presenca === 'Ausente';
        
        container.innerHTML += `
            <div class="p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span class="font-bold text-sm text-gray-700">${guest.nome_convidado}</span>
                <div class="flex gap-2">
                    <label class="flex items-center gap-1 text-xs cursor-pointer bg-green-50 px-2 py-1 rounded border border-green-300">
                        <input type="radio" name="status-${index}" value="Confirmado" ${isConfirmed || (!isConfirmed && !isRecused) ? 'checked' : ''}> Vai 🦖
                    </label>
                    <label class="flex items-center gap-1 text-xs cursor-pointer bg-red-50 px-2 py-1 rounded border border-red-300">
                        <input type="radio" name="status-${index}" value="Ausente" ${isRecused ? 'checked' : ''}> Não vai 😢
                    </label>
                </div>
            </div>
        `;
    });

    document.getElementById('step-search').classList.add('hidden');
    document.getElementById('step-confirm').classList.remove('hidden');
    document.getElementById('step-checkout').classList.add('hidden');
}

async function submitRSVP() {
    const confirmedList = [];

    for (let i = 0; i < currentGroupGuests.length; i++) {
        const guest = currentGroupGuests[i];
        const selectedStatus = document.querySelector(`input[name="status-${i}"]:checked`).value;

        // Guarda os nomes de quem realizou o checkout positivo para o resumo
        if (selectedStatus === 'Confirmado') {
            confirmedList.push(guest.nome_convidado);
        }

        await supabase
            .from('convidados')
            .update({ status_presenca: selectedStatus })
            .eq('id', guest.id);
    }

    // Exibe a tela de Checkout de Sucesso
    showCheckoutSuccess(confirmedList);
}

function showCheckoutSuccess(confirmedMembers) {
    document.getElementById('step-confirm').classList.add('hidden');
    const checkoutStep = document.getElementById('step-checkout');
    const summaryList = document.getElementById('checkout-summary-list');
    
    summaryList.innerHTML = '';

    if (confirmedMembers.length === 0) {
        summaryList.innerHTML = `<li class="text-red-600 list-none">Nenhum membro do grupo foi confirmado.</li>`;
    } else {
        confirmedMembers.forEach(name => {
            summaryList.innerHTML += `<li>${name}</li>`;
        });
    }

    checkoutStep.classList.remove('hidden');
}

function resetFlow() {
    document.getElementById('search-name').value = '';
    document.getElementById('step-search').classList.remove('hidden');
    document.getElementById('step-confirm').classList.add('hidden');
    document.getElementById('step-checkout').classList.add('hidden');
}


// --- LÓGICA DO ADMINISTRADOR ---
async function loadAdminData() {
    const { data, error } = await supabase
        .from('convidados')
        .select('*')
        .order('nome_grupo', { ascending: true });

    if (error) return alert("Erro ao carregar dados do admin.");

    const tbody = document.getElementById('admin-table-body');
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
            <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="p-3 font-medium">${guest.nome_grupo}</td>
                <td class="p-3">${guest.nome_convidado}</td>
                <td class="p-3 text-center"><span class="px-2 py-1 text-xs rounded-full ${badgeColor}">${guest.status_presenca || 'Pendente'}</span></td>
                <td class="p-3 text-center">
                    <button onclick="deleteGuest('${guest.id}')" class="text-xs text-red-500 hover:underline">Excluir</button>
                </td>
            </tr>
        `;
    });

    // Atualiza os contadores numéricos na parte superior do painel admin
    document.getElementById('admin-counter-confirmed').innerText = confirmedCount;
    document.getElementById('admin-counter-total').innerText = totalGuests;
}

async function addGuestFromAdmin() {
    const groupName = document.getElementById('admin-group-name').value.trim();
    const guestName = document.getElementById('admin-guest-name').value.trim();

    if(!groupName || !guestName) return alert("Preencha todos os campos.");

    const { error } = await supabase
        .from('convidados')
        .insert([{ nome_grupo: groupName, nome_convidado: guestName, status_presenca: 'Pendente' }]);

    if(error) {
        alert("Erro ao adicionar.");
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
        alert("Erro ao remover o convidado.");
    }
}