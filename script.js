
document.addEventListener('DOMContentLoaded', () => {
    const contentContainer = document.getElementById('content');
    const controlsContainer = document.querySelector('.controls');

    // 言語切り替えボタンを作成・追加
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = '英語プロンプトを表示';
    toggleBtn.className = 'lang-toggle-btn';
    toggleBtn.dataset.lang = 'jp'; // 現在の表示言語を保持 (jp/en)
    controlsContainer.appendChild(toggleBtn);

    // プロンプトの表示を切り替える関数
    const toggleLanguage = () => {
        const cards = document.querySelectorAll('.card');
        const currentLang = toggleBtn.dataset.lang;

        if (currentLang === 'jp') {
            cards.forEach(card => {
                card.querySelector('.prompt-jp').style.display = 'none';
                card.querySelector('.prompt-en').style.display = 'block';
            });
            toggleBtn.textContent = '日本語';
            toggleBtn.dataset.lang = 'en';
        } else {
            cards.forEach(card => {
                card.querySelector('.prompt-jp').style.display = 'block';
                card.querySelector('.prompt-en').style.display = 'none';
            });
            toggleBtn.textContent = '英語';
            toggleBtn.dataset.lang = 'jp';
        }
    };

    toggleBtn.addEventListener('click', toggleLanguage);

    // Markdownをフェッチして処理
    fetch('Image生成履歴.md')
        .then(response => {
            if (!response.ok) {
                throw new Error('Markdownファイルの読み込みに失敗しました。');
            }
            return response.text();
        })
        .then(md => {
            const lines = md.trim().split('\n');
            // ヘッダーと区切り行を除外 (最初の2行)
            const dataRows = lines.slice(2);

            dataRows.forEach(row => {
                const columns = row.split('|').map(cell => cell.trim());
                // 空の行はスキップ
                if (columns.length < 5 || columns[1] === '') return;

                const cardData = {
                    title: columns[1],
                    promptJp: columns[2],
                    promptEn: columns[3],
                    // Obsidian形式 `![[...]]` から標準形式 `images/...` へ変換
                    image: `images/${columns[4].replace(/![\[\]]/g, '')}`,
                    ai: columns[5]
                };

                // カードHTMLを生成
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <img src="${cardData.image}" alt="${cardData.title}" class="card-image">
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
            });
        })
        .catch(error => {
            console.error(error);
            contentContainer.innerHTML = `<p style="color: red; text-align: center;">${error.message}</p>`;
        });
});
