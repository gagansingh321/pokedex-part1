const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
let nextUrl = API_URL + '?offset=0&limit=20';
let caughtPokemon = JSON.parse(localStorage.getItem('caughtPokemon')) || [];

const gallery = document.getElementById('pokemon-gallery');
const loadMoreBtn = document.getElementById('load-more');
const detailsPanel = document.getElementById('pokemon-details');

// Helper to get ID from URL
function parseUrl(url) {
    return url.substring(url.substring(0, url.length - 2).lastIndexOf('/') + 1, url.length - 1);
}

// Render Pokemon Cards
function renderPokemon(pokemonList) {
    pokemonList.forEach(pokemon => {
        const id = parseUrl(pokemon.url);
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        if (caughtPokemon.includes(id)) card.classList.add('caught');
        card.dataset.id = id;
        card.innerHTML = `
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png" alt="${pokemon.name}">
            <h3>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
            <button class="catch-btn">${caughtPokemon.includes(id) ? 'Release' : 'Catch'}</button>
        `;
        gallery.appendChild(card);
    });
}

// Fetch and display next batch
async function loadPokemon() {
    loadMoreBtn.disabled = true;
    const res = await fetch(nextUrl);
    const data = await res.json();
    nextUrl = data.next;
    renderPokemon(data.results);
    if (!nextUrl) loadMoreBtn.style.display = 'none';
    loadMoreBtn.disabled = false;
}

// Show details panel
async function showDetails(id) {
    detailsPanel.innerHTML = '<button class="close-btn">&times;</button><p>Loading...</p>';
    detailsPanel.classList.remove('hidden');
    const res = await fetch(API_URL + id + '/');
    const data = await res.json();
    detailsPanel.innerHTML = `
        <button class="close-btn">&times;</button>
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png" alt="${data.name}" style="width:150px;">
        <h2>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h2>
        <p><strong>Types:</strong> ${data.types.map(t => t.type.name).join(', ')}</p>
        <p><strong>Abilities:</strong> ${data.abilities.map(a => a.ability.name).join(', ')}</p>
        <button class="catch-btn" data-id="${id}">${caughtPokemon.includes(id) ? 'Release' : 'Catch'}</button>
    `;
}

// Catch/Release logic
function toggleCatch(id) {
    if (caughtPokemon.includes(id)) {
        caughtPokemon = caughtPokemon.filter(pid => pid !== id);
    } else {
        caughtPokemon.push(id);
    }
    localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon));
    // Update UI
    document.querySelectorAll(`.pokemon-card[data-id="${id}"]`).forEach(card => {
        card.classList.toggle('caught');
        card.querySelector('.catch-btn').textContent = caughtPokemon.includes(id) ? 'Release' : 'Catch';
    });
    // Update details panel if open
    if (!detailsPanel.classList.contains('hidden')) {
        const btn = detailsPanel.querySelector('.catch-btn');
        if (btn && btn.dataset.id === id) {
            btn.textContent = caughtPokemon.includes(id) ? 'Release' : 'Catch';
        }
    }
}

// Event Listeners
gallery.addEventListener('click', e => {
    const card = e.target.closest('.pokemon-card');
    if (!card) return;
    const id = card.dataset.id;
    if (e.target.classList.contains('catch-btn')) {
        toggleCatch(id);
    } else {
        showDetails(id);
    }
});

detailsPanel.addEventListener('click', e => {
    if (e.target.classList.contains('close-btn')) {
        detailsPanel.classList.add('hidden');
    }
    if (e.target.classList.contains('catch-btn')) {
        toggleCatch(e.target.dataset.id);
    }
});

loadMoreBtn.addEventListener('click', loadPokemon);

// Initial load
loadPokemon();