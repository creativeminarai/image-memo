document.addEventListener('DOMContentLoaded', () => {
    const contentContainer = document.getElementById('content');
    const controlsContainer = document.querySelector('.controls');

    // --- デバッグ用の関数 ---
    const showError = (message, error) => {
        console.error(message, error);
        contentContainer.innerHTML = `
            <div style="padding: 20px; background-color: #fff0f0; border: 1px solid #ffcccc; border-radius: 8px;">
                <h3 style="color: #d92626;">エラーが発生しました</h3>
                <p><strong>メッセージ:</strong> ${message}</p>
                <pre style="white-space: pre-wrap; word-wrap: break-word; background-color: #f8f8f8; padding: 10px; border-radius: 4px;">${error ? error.stack : '詳細情報なし'}</pre>
            </div>
        `;
    };

    // 言語切り替えボタンを作成・追加
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = '英語プロンプトを表示';
    toggleBtn.className = 'lang-toggle-btn';
    toggleBtn.dataset.lang = 'jp'; // jp/en
    controlsContainer.appendChild(toggleBtn);

    toggleBtn.addEventListener('click', () => {
        const isJp = toggleBtn.dataset.lang === 'jp';
        document.querySelectorAll('.prompt-jp').forEach(el => el.style.display = isJp ? 'none' : 'block');
        document.querySelectorAll('.prompt-en').forEach(el => el.style.display = isJp ? 'block' : 'none');
        toggleBtn.textContent = isJp ? '日本語プロンプトを表示' : '英語プロンプトを表示';
        toggleBtn.dataset.lang = isJp ? 'en' : 'jp';
    });

    // Markdownをフェッチして処理
    fetch('Image生成履歴.md')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Markdownファイルの読み込みに失敗しました。(HTTPステータス: ${response.status})`);
            }
            return response.text();
        })
        .then(md => {
            if (!md) {
                showError('Markdownファイルが空か、正しく読み込めませんでした。', new Error('Markdown content is empty.'));
                return;
            }

            const lines = md.trim().split('\n');
            const dataRows = lines.slice(2);

            dataRows.forEach((row, index) => {
                try {
                    const columns = row.split('|').map(cell => cell.trim());
                    if (columns.length < 6 || columns[1] === '') return;

                    const cardData = {
                        title: columns[1],
                        promptJp: columns[2],
                        promptEn: columns[3],
                        // ★修正点: Obsidian形式 `![[...]]` から標準形式 `images/...` へ変換する正規表現を修正
                        image: `images/${columns[4].replace(/![[|]]/g, '')}`,
                        ai: columns[5]
                    };

                    const card = document.createElement('div');
                    card.className = 'card';
                    card.innerHTML = `
                        <img src="${cardData.image}" alt="${cardData.title}" class="card-image" onerror="this.style.display='none'">
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
                    `;
                    contentContainer.appendChild(card);
                } catch (e) {
                    // 行ごとのエラーをキャッチして表示
                    showError(`Markdownの ${index + 3} 行目の処理中にエラーが発生しました。`, e);
                    // 1つのエラーで処理を止めない
                }
            });
        })
        .catch(error => {
            showError('Markdownの処理中に予期せぬエラーが発生しました。', error);
        });
});