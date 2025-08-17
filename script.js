document.addEventListener('DOMContentLoaded', () => {
    const contentContainer = document.getElementById('content');
    const controlsContainer = document.querySelector('.controls');

    // --- エラー表示用の関数 ---
    const showError = (message, error) => {
        console.error(message, error);
        contentContainer.innerHTML = `<p style="color: red; text-align: center;">${message}</p>`;
    };

    // --- プロンプト表示を更新する関数 ---
    const updatePromptVisibility = (mode) => {
        document.querySelectorAll('.prompt-section').forEach(el => el.style.display = 'none');
        
        if (mode === 'jp' || mode === 'both') {
            document.querySelectorAll('.prompt-jp').forEach(el => el.style.display = 'block');
        }
        if (mode === 'both') {
            document.querySelectorAll('.prompt-en').forEach(el => el.style.display = 'block');
        }

        // ボタンのアクティブ状態を更新
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
    };

    // --- 表示モード切り替えボタンを作成 ---
    const modes = [
        { mode: 'jp', label: '日本語のみ' },
        { mode: 'both', label: '日本語/英語' },
        { mode: 'none', label: 'プロンプト非表示' }
    ];

    modes.forEach(({ mode, label }) => {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.className = 'control-btn';
        btn.dataset.mode = mode;
        btn.addEventListener('click', () => updatePromptVisibility(mode));
        controlsContainer.appendChild(btn);
    });

    // --- Markdownをフェッチしてカードを生成 ---
    fetch('Image生成履歴.md')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        })
        .then(md => {
            if (!md) throw new Error('Markdown file is empty.');

            const lines = md.trim().split('\n').slice(2);
            lines.forEach((row, index) => {
                try {
                    const columns = row.split('|').map(cell => cell.trim());
                    if (columns.length < 6 || columns[1] === '') return;

                    const rawImageLink = columns[4];
                    const fileName = rawImageLink.substring(3, rawImageLink.length - 2);

                    const cardData = {
                        title: columns[1],
                        promptJp: columns[2],
                        promptEn: columns[3],
                        image: `images/${fileName}`,
                        ai: columns[5]
                    };

                    const card = document.createElement('div');
                    card.className = 'card';
                    // ★変更: 新しい2カラムのHTML構造
                    card.innerHTML = `
                        <div class="card-image-wrapper">
                            <img src="${cardData.image}" alt="${cardData.title}" class="card-image">
                        </div>
                        <div class="card-main-content">
                            <div class="card-content">
                                <h2 class="card-title">${cardData.title}</h2>
                                <div class="prompt-section prompt-jp">
                                    <p class="prompt-label">プロンプト (日本語)</p>
                                    <p class="prompt-text">${cardData.promptJp || 'N/A'}</p>
                                </div>
                                <div class="prompt-section prompt-en">
                                    <p class="prompt-label">Prompt (English)</p>
                                    <p class="prompt-text">${cardData.promptEn || 'N/A'}</p>
                                </div>
                            </div>
                            <div class="card-footer">
                                AI: ${cardData.ai}
                            </div>
                        </div>
                    `;
                    contentContainer.appendChild(card);
                } catch (e) {
                    console.error(`Error processing row ${index + 3}:`, e);
                }
            });

            // 初期表示を設定
            updatePromptVisibility('jp');

        })
        .catch(error => {
            showError('Failed to load or process markdown.', error);
        });
});