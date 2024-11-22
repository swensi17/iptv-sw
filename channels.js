// Загрузка и обработка каналов
document.addEventListener('DOMContentLoaded', async () => {
    const channelsList = document.getElementById('channelsList');
    const searchInput = document.getElementById('searchInput');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const channelModal = new bootstrap.Modal(document.getElementById('channelModal'));
    
    // Загрузка списка каналов из m3u файлов
    async function loadChannels() {
        const response = await fetch('/api/channels');
        const channels = await response.json();
        return channels;
    }

    // Создание карточки канала
    function createChannelCard(channel) {
        const col = document.createElement('div');
        col.className = 'col-md-3 col-sm-6 mb-4';
        
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.innerHTML = `
            <img src="${channel.logo || 'placeholder.png'}" class="channel-logo" alt="${channel.name}">
            <h5 class="channel-name">${channel.name}</h5>
            <p class="channel-category">${channel.category || 'Разное'}</p>
        `;
        
        card.addEventListener('click', () => showChannelDetails(channel));
        col.appendChild(card);
        return col;
    }

    // Показ деталей канала в модальном окне
    function showChannelDetails(channel) {
        const modal = document.getElementById('channelModal');
        modal.querySelector('.modal-title').textContent = channel.name;
        modal.querySelector('.channel-logo').src = channel.logo || 'placeholder.png';
        modal.querySelector('.stream-url').textContent = channel.url;
        
        const copyButton = modal.querySelector('#copyM3u');
        copyButton.onclick = () => {
            navigator.clipboard.writeText(channel.url)
                .then(() => {
                    copyButton.textContent = 'Скопировано!';
                    setTimeout(() => {
                        copyButton.textContent = 'Копировать M3U';
                    }, 2000);
                });
        };
        
        channelModal.show();
    }

    // Фильтрация каналов
    function filterChannels(channels, category, searchTerm) {
        return channels.filter(channel => {
            const matchesCategory = category === 'all' || channel.category === category;
            const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }

    // Обработка поиска
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        const activeCategory = document.querySelector('.category-btn.active').dataset.category;
        const filteredChannels = filterChannels(allChannels, activeCategory, searchTerm);
        displayChannels(filteredChannels);
    });

    // Обработка фильтров категорий
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const category = button.dataset.category;
            const searchTerm = searchInput.value;
            const filteredChannels = filterChannels(allChannels, category, searchTerm);
            displayChannels(filteredChannels);
        });
    });

    // Отображение каналов
    function displayChannels(channels) {
        channelsList.innerHTML = '';
        channels.forEach(channel => {
            const card = createChannelCard(channel);
            channelsList.appendChild(card);
        });
    }

    // Инициализация
    try {
        const channels = await loadChannels();
        window.allChannels = channels; // Сохраняем для глобального доступа
        displayChannels(channels);
    } catch (error) {
        console.error('Ошибка загрузки каналов:', error);
        channelsList.innerHTML = '<div class="alert alert-danger">Ошибка загрузки каналов</div>';
    }
});
