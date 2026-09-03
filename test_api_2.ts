import { callDeepSeekAPI } from "./src/lib/analysis/extractor/deepseekClient";
import { buildExtractorPrompt } from "./src/lib/analysis/extractor/extractorPrompt";
import { preprocessConversation } from "./src/lib/analysis/preprocessor";
import fs from "fs";

const dataset = JSON.parse(fs.readFileSync("attatchment/attachment_signal_synthetic_20_v1_1.json", "utf-8"));
const c1 = dataset.cases.find((c: any) => c.case_id === "CASE_001");
const preprocessed = preprocessConversation(c1.conversation);
const prompt = buildExtractorPrompt(JSON.stringify(preprocessed), "SPEAKER_B");

console.log("PROMPT LENGTH:", prompt.length);

callDeepSeekAPI(prompt).then(r => console.log("RES:", r)).catch(e => console.error(e));
