document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const numberInput = document.getElementById('number');
    const validationMessage = document.getElementById('validationMessage');
    const submitButton = document.getElementById('submitButton');
    let numberDebounceTimer;
    let isNumberTaken = null;

    // --- LÓGICA DE JUGADORES ---
    numberInput.addEventListener('input', () => {
        clearTimeout(numberDebounceTimer);
        validationMessage.innerHTML = `<span class="text-muted">Verificando...</span>`;
        numberDebounceTimer = setTimeout(async () => {
            const number = numberInput.value;
            if (!number) {
                validationMessage.innerHTML = '';
                return;
            }
            try {
                const response = await fetch(`/api/players/check-number?number=${number}`);
                const data = await response.json();
                isNumberTaken = data.isTaken;
                if (isNumberTaken) {
                    validationMessage.innerHTML = `<span class="text-danger">❌ Ocupado</span>`;
                    numberInput.classList.add('is-invalid');
                    numberInput.classList.remove('is-valid');
                    submitButton.disabled = true;
                } else {
                    validationMessage.innerHTML = `<span class="text-success">✅ Disponible</span>`;
                    numberInput.classList.add('is-valid');
                    numberInput.classList.remove('is-invalid');
                    submitButton.disabled = false;
                }
            } catch (error) {
                validationMessage.innerHTML = '';
                submitButton.disabled = false;
            }
        }, 500);
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isNumberTaken) {
            alert('El número de camiseta ya está ocupado.');
            return;
        }
        const formData = {
            name: document.getElementById('name').value,
            number: parseInt(numberInput.value),
            size: document.getElementById('size').value
        };
        try {
            const response = await fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                alert('¡Jugador registrado!');
                registerForm.reset();
                numberInput.classList.remove('is-valid', 'is-invalid');
                validationMessage.innerHTML = '';
                if (document.getElementById('adminPanel').classList.contains('d-block')) {
                    fetchAndRenderPlayers();
                }
            } else {
                const err = await response.json();
                alert(`Error: ${err.error}`);
            }
        } catch (error) {
            alert('Ocurrió un error al registrar.');
        }
    });

    // --- LÓGICA DE ADMINISTRADOR ---
    const loginForm = document.getElementById('loginForm');
    const adminPanel = document.getElementById('adminPanel');
    const playersList = document.getElementById('playersList');
    const loginModalEl = document.getElementById('loginModal');
    const loginModal = new bootstrap.Modal(loginModalEl);
    const editModalEl = document.getElementById('editModal');
    const editModal = new bootstrap.Modal(editModalEl);

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        if (user === 'staff' && pass === 'staff') {
            adminPanel.classList.remove('d-none');
            adminPanel.classList.add('d-block');
            document.querySelector('.staff-icon').classList.add('d-none');
            fetchAndRenderPlayers();
            loginModal.hide();
        } else {
            alert('Credenciales incorrectas.');
        }
    });

    async function fetchAndRenderPlayers() {
        const response = await fetch('/api/players');
        const data = await response.json();
        playersList.innerHTML = '';
        if (data.players && data.players.length > 0) {
            data.players.forEach(player => {
                playersList.innerHTML += `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 player-card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <h5 class="card-title">${player.name}</h5>
                                    <span class="badge bg-primary rounded-pill fs-6">${player.number}</span>
                                </div>
                                <p class="card-subtitle mb-3 text-muted">${player.size}</p>
                                <button class="btn btn-sm btn-outline-secondary copy-btn" data-player='${JSON.stringify(player)}'><i class="bi bi-clipboard"></i></button>
                                <button class="btn btn-sm btn-outline-primary edit-btn" data-player='${JSON.stringify(player)}'><i class="bi bi-pencil"></i></button>
                                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${player.id}"><i class="bi bi-trash"></i></button>
                            </div>
                        </div>
                    </div>`;
            });
        } else {
            playersList.innerHTML = '<p class="text-center text-muted">No hay jugadores registrados.</p>';
        }
    }

    playersList.addEventListener('click', async (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        if (target.classList.contains('copy-btn')) {
            const player = JSON.parse(target.dataset.player);
            const text = `${player.name} - ${player.number} - ${player.size}`;
            navigator.clipboard.writeText(text).then(() => alert('Copiado al portapapeles.'));
        }

        if (target.classList.contains('delete-btn')) {
            const id = target.dataset.id;
            if (confirm('¿Seguro que quieres eliminar a este jugador?')) {
                await fetch(`/api/players/${id}`, { method: 'DELETE' });
                fetchAndRenderPlayers();
            }
        }
        
        if (target.classList.contains('edit-btn')) {
            const player = JSON.parse(target.dataset.player);
            document.getElementById('editPlayerId').value = player.id;
            document.getElementById('editName').value = player.name;
            document.getElementById('editNumber').value = player.number;
            document.getElementById('editSize').value = player.size;
            editModal.show();
        }
    });
    
    document.getElementById('editForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editPlayerId').value;
        const updatedData = {
            name: document.getElementById('editName').value,
            number: parseInt(document.getElementById('editNumber').value),
            size: document.getElementById('editSize').value,
        };
        const response = await fetch(`/api/players/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        if (response.ok) {
            editModal.hide();
            fetchAndRenderPlayers();
        } else {
            const err = await response.json();
            alert(`Error al actualizar: ${err.error}`);
        }
    });
});