import * as cheerio from "cheerio";
import { writeFileSync } from "fs";
import { resolve } from "path";


const urls = [
  "https://www.qigushi.com/qi/1669845584183773.html",
  "https://www.qigushi.com/qi/1669845589183852.html",
  "https://www.qigushi.com/qi/1669845701184896.html",
  "https://www.qigushi.com/qi/1669845756185245.html",
  "https://www.qigushi.com/qi/1669845604184013.html",
  "https://www.qigushi.com/qi/1669845701184889.html",
  "https://www.qigushi.com/qi/1669845401183545.html",
  "https://www.qigushi.com/qi/1669845651184374.html",
  "https://www.qigushi.com/qi/1669845657184420.html",
];

const main = async () => {
  const seen = new Set();
  const allWords = [];

  for (const url of urls) {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    $("#newsnr p").each((_, el) => {
      const text = $(el).text().trim();
      const match = text.match(
        /\d+[、.．]\s*[【]?(.+?)[】]?\s*[—\-–]+\s*[【]?(.+?)[】]?\s*$/,
      );
      if (match) {
        const word1 = match[1].trim();
        const word2 = match[2].trim().replace(/[()（）]/g, "");
        // 跳过脏数据（含数字序号说明解析错误）
        if (/\d/.test(word2) && word2.length > 10) return;
        // 去重：正反序都算重复
        const key = [word1, word2].sort().join("|");
        if (seen.has(key)) return;
        seen.add(key);
        allWords.push({ common: word1, undercover: word2 });
      }
    });
  }

  const outPath = resolve(process.cwd(), "words.json");
  writeFileSync(outPath, JSON.stringify(allWords, null, 2), "utf-8");
  console.log(`共获取 ${allWords.length} 组词语（已去重），写入 ${outPath}`);
};

main();
