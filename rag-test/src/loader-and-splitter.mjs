import "dotenv/config";
import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
const cheerioLoader = new CheerioWebBaseLoader(
  "https://juejin.cn/post/7233327509919547452",
  {
    selector: ".main-area p",
  },
);
const documents = await cheerioLoader.load();
const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 400,
    chunkOverlap: 50,
    separators: ["。","！","？"], // 优先使用段落分割 分割符是优先 。 其次 ！？
})
const splitDocuments = await textSplitter.splitDocuments(documents);
console.log(splitDocuments);
