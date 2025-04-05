window.rakutenReportStart = async function () {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const allData = [];

  // ✅ ステータス表示用ボックス
  const statusBox = document.createElement("div");
  Object.assign(statusBox.style, {
    position: "fixed", bottom: "20px", right: "20px", zIndex: "9999",
    background: "#000a", color: "#fff", padding: "10px 14px",
    borderRadius: "8px", fontSize: "14px", fontFamily: "sans-serif"
  });
  statusBox.textContent = "処理開始...";
  document.body.appendChild(statusBox);

  let currentPage = 1;

  async function processPage() {
    statusBox.textContent = `📄 ページ ${currentPage} を処理中...`;
    const shopRows = Array.from(document.querySelectorAll("table tbody tr"))
      .filter(row => row.querySelector("a.table-collapse"));

    for (let i = 0; i < shopRows.length; i++) {
      const row = shopRows[i];
      const btn = row.querySelector("a.table-collapse");
      const shopName = row.querySelectorAll("td")[1]?.textContent.trim() || "ショップ名不明";

      statusBox.textContent = `📄 ページ ${currentPage}\n🏪 ショップ ${i + 1} / ${shopRows.length}：${shopName}`;

      if (btn.classList.contains("collapsed")) {
        btn.click();
        await sleep(1500);
      }

      const table = document.querySelector("table:not(.original-shop-table)");
      if (!table) continue;

      const rows = table.querySelectorAll("tbody tr");
      rows.forEach(r => {
        if (r.classList.contains("table-total")) return;
        const tds = r.querySelectorAll("td");
        if (tds.length === 5) {
          const 発生日 = tds[0].textContent.trim();
          const 成果報酬 = tds[1].textContent.trim();
          const クリック数 = tds[2].textContent.trim();
          const 売上件数 = tds[3].textContent.trim();
          const 売上金額 = tds[4].textContent.trim();
          allData.push([shopName, 発生日, 成果報酬, クリック数, 売上件数, 売上金額]);
        }
      });

      if (!btn.classList.contains("collapsed")) {
        btn.click();
        await sleep(300);
      }
    }
  }

  while (true) {
    await processPage();

    const nextBtn = document.querySelector("a.raf-pagenation__btn.-next:not(.-disabled)");
    if (!nextBtn) break;

    nextBtn.click();
    currentPage++;
    await sleep(2000);
  }

  // CSV出力
  statusBox.textContent = "📥 CSV生成中...";
  let csv = "ショップ名,発生日,成果報酬,クリック数,売上件数,売上金額\n";
  allData.forEach(row => {
    csv += row.map(v => `"${v}"`).join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rakuten_shop_report.csv";
  a.click();

  statusBox.textContent = "✅ 完了！CSVをダウンロードしました 🎉";
};
window.rakutenReportStart();
