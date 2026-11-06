# ER-ROSTER — HANDOFF

Fork ของ PleumA/PleumA.github.io (ตารางเวรแพทย์ client-side, Monte Carlo greedy ×300) เพื่อใช้กับเวร ER ศิริราช (เช้า/บ่าย/ดึก 8 ชม.)
- repo: github.com/mikeysi124/er-roster · upstream = PleumA/PleumA.github.io
- รัน: `npm install && npm run build && npx serve .` · test: `npm test` (22 suites)

## กฎเหล็ก
- ใช้งานจริงให้ติ๊ก **Allow Blank Days = ON** เสมอ — ไม่งั้น cascade ระดับ 4–5 จะทับ off request เงียบๆ
- ข้อมูลอยู่ใน localStorage/JSON บนเครื่องเท่านั้น ห้ามเพิ่ม backend ที่ส่งชื่อ/วันลาออกนอกเครื่อง
- แก้ solver ต้องมีเทสต์ใน `tests/*.test.js` (harness = eval app.js + mock DOM ดู `tests/nightCap.test.js`)
- SheetJS โหลด 0.18.5 จาก cdnjs ที่ `index.html` กับ `sw.js` ใช้ export อย่างเดียว ถ้าจะเพิ่มนำเข้า Excel ให้เปลี่ยนเป็น 0.20.2 ขึ้นไปจาก cdn.sheetjs.com ก่อน รุ่นเดิมโดน CVE-2023-30533 ตอนอ่านไฟล์ · ที่มา [[2026-11-06-buu-ai-workshop-design-card-html-data-app]] ใน vault

## การตัดสินใจ
- 30 ส.ค. 2026: เลือก fork+patch แทนเขียนใหม่/OR-Tools เพราะกะ 8 ชม. ตรงกับ Shift-Based Mode เดิม ขาดแค่ cap เวรดึก

## STATUS (30 ส.ค. 2026)
- ✅ patch `inputNightCap` = เวรดึกสูงสุดต่อคน (0 = ไม่จำกัด) hard filter ทุก cascade level + save/load JSON + TH/EN + 3 tests — ทั้งชุด 22 suites ผ่าน — push แล้ว
- ⏳ ยังไม่เปิด GitHub Pages ของ fork (mike กดเองที่ Settings → Pages → branch main) · ใช้ local ผ่าน `npx serve .` ได้เลย
- ⏳ ยังไม่ได้ลองกับข้อมูลจริง — รอ mike ให้: รายชื่อ+role, คนต่อกะ, เดือน+วัน off, cap เวรดึก/quota/conflict (หรือ Excel เดือนก่อน) · รัน local: `python3 -m http.server 3000` (npx serve ไม่ขึ้นบนเครื่องนี้)
- idea ถัดไป: วันไม่ว่างซ้ำทุกสัปดาห์ต่อคน (OPD/สอน), max วันติดกัน
