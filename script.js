document.addEventListener('DOMContentLoaded', () => {
    const contentContainer = document.getElementById('content');
    const controlsContainer = document.querySelector('.controls');

    // --- アイコン定義 ---
    const copyIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    const checkIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    // --- エラー表示 ---
    const showError = (message, error) => {
        console.error(message, error);
        contentContainer.innerHTML = `<p style="color: red; text-align: center;">${message}</p>`;
    };

    // --- モーダル表示 ---
    const showModal = (src) => {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `<span class="image-modal-close">&times;</span><img src="${src}" class="image-modal-content">`;
        const close = () => {
            document.body.classList.remove('modal-open');
            modal.remove();
        };
        modal.querySelector('.image-modal-close').addEventListener('click', close);
        modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
        document.body.appendChild(modal);
        document.body.classList.add('modal-open');
    };

    // --- プロンプト表示切替 ---
    const updatePromptVisibility = (mode) => {
        contentContainer.classList.toggle('no-prompt-mode', mode === 'none');
        document.querySelectorAll('.prompt-section').forEach(el => el.style.display = 'none');
        if (mode === 'jp' || mode === 'both') document.querySelectorAll('.prompt-jp').forEach(el => el.style.display = 'block');
        if (mode === 'both') document.querySelectorAll('.prompt-en').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.control-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
    };

    // --- 表示モードボタン作成 ---
    // ★変更: ボタンのラベルを「画像一覧表示」に変更
    const modes = [{ mode: 'jp', label: '日本語のみ' }, { mode: 'both', label: '日本語/英語' }, { mode: 'none', label: '画像一覧表示' }];
    modes.forEach(({ mode, label }) => {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.className = 'control-btn';
        btn.dataset.mode = mode;
        btn.addEventListener('click', () => updatePromptVisibility(mode));
        controlsContainer.appendChild(btn);
    });

    // --- Markdownからカード生成 ---
    fetch('Image生成履歴.md')
        .then(response => response.ok ? response.text() : Promise.reject(`HTTP error! status: ${response.status}`))
        .then(md => {
            if (!md) throw new Error('Markdown file is empty.');
            const lines = md.trim().split('\n').slice(2);
            lines.forEach((row, index) => {
                try {
                    const columns = row.split('|').map(cell => cell.trim());
                    if (columns.length < 6 || columns[1] === '') return;

                    const rawImageLink = columns[4];
                    const fileName = rawImageLink.substring(3, rawImageLink.length - 2);
                    const cardData = { title: columns[1], promptJp: columns[2], promptEn: columns[3], image: `images/${fileName}`, ai: columns[5] };

                    const card = document.createElement('div');
                    card.className = 'card';
                    card.innerHTML = `
                        <div class="card-image-wrapper">
                            <img src="${cardData.image}" alt="${cardData.title}" class="card-image">
                        </div>
                        <div class="card-main-content">
                            <div class="card-content">
                                <h2 class="card-title">${cardData.title}</h2>
                                <div class="prompt-section prompt-jp"><p class="prompt-label">プロンプト (日本語)</p><button class="copy-btn">${copyIconSVG}</button><p class="prompt-text">${cardData.promptJp || 'N/A'}</p></div>
                                <div class="prompt-section prompt-en"><p class="prompt-label">Prompt (English)</p><button class="copy-btn">${copyIconSVG}</button><p class="prompt-text">${cardData.promptEn || 'N/A'}</p></div>
                            </div>
                            <div class="card-footer">AI: ${cardData.ai}</div>
                        </div>
                    `;
                    contentContainer.appendChild(card);
                } catch (e) {
                    console.error(`Error processing row ${index + 3}:`, e);
                }
            });

            // --- イベントリスナー設定 ---
            document.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', e => {
                    const button = e.currentTarget;
                    const text = button.closest('.prompt-section').querySelector('.prompt-text').innerText;
                    navigator.clipboard.writeText(text).then(() => {
                        button.innerHTML = checkIconSVG;
                        setTimeout(() => { button.innerHTML = copyIconSVG; }, 2000);
                    });
                });
            });

            document.querySelectorAll('.card-image').forEach(img => {
                img.addEventListener('click', e => showModal(e.currentTarget.src));
            });

            updatePromptVisibility('jp');

        })
        .catch(error => showError('Failed to load or process markdown.', error));
});