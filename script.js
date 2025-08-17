document.addEventListener('DOMContentLoaded', () => {
    fetch('Image生成履歴.md')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            const tableHtml = markdownTableToHtml(text);
            const container = document.getElementById('table-container');
            if (tableHtml) {
                container.innerHTML = tableHtml;
            } else {
                container.innerHTML = '<p>Markdownファイルからテーブルを生成できませんでした。</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching or parsing Markdown:', error);
            document.getElementById('table-container').innerHTML = `<p>ファイルの読み込みに失敗しました: ${error.message}</p>`;
        });
});

function markdownTableToHtml(markdown) {
    const lines = markdown.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return '';

    // Helper to parse a markdown table row
    const parseRow = (rowString) => rowString.split('|').map(s => s.trim()).slice(1, -1);

    // Extract headers, skipping the separator line
    const headers = parseRow(lines[0]);
    const rows = lines.slice(2);

    // Start building the HTML table
    let html = '<table>\n';
    html += '  <thead>\n    <tr>\n';
    headers.forEach(header => {
        if (header) html += `      <th>${header}</th>\n`;
    });
    html += '    </tr>\n  </thead>\n';

    // Build the table body
    html += '  <tbody>\n';
    rows.forEach(row => {
        const cells = parseRow(row);
        // Only create a row if it has some content
        if (cells.length > 0 && cells.some(c => c !== '')) {
            html += '    <tr>\n';
            cells.forEach(cell => {
                let cellContent = cell
                    .replace(/!\\[\\[(.*?)\\]\\]/g, '<img src="images/$1" alt="$1">') // Convert Obsidian image links
                    .replace(/\n/g, '<br>'); // Convert newlines to <br> for multi-line content

                html += `      <td>${cellContent}</td>\n`;
            });
            html += '    </tr>\n';
        }
    });
    html += '  </tbody>\n';
    html += '</table>';

    return html;
}
