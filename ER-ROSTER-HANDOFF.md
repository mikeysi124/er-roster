# ER-ROSTER — HANDOFF

Fork ของ PleumA/PleumA.github.io (ตารางเวรแพทย์ client-side, Monte Carlo greedy ×300) เพื่อใช้กับเวร ER ศิริราช (เช้า/บ่าย/ดึก 8 ชม.)
- repo: github.com/mikeysi124/er-roster · upstream ตอน fork = PleumA/PleumA.github.io · ตั้งแต่ 10 ก.ย. 2026 โค้ดจัดเวรของต้นทางอยู่ที่ PleumA/doctor-scheduler ส่วน main ของ repo เดิมเป็นเว็บประวัติของผู้ทำ remote `upstream` ในเครื่องยังชี้ที่เดิม
- รัน: `npm install && npm run build && npx serve .` · test: `npm test` (22 suites)

## กฎเหล็ก
- ใช้งานจริงให้ติ๊ก **Allow Blank Days = ON** เสมอ — ไม่งั้น cascade ระดับ 2–5 จะผ่อนกฎพัก คู่ conflict และกฎห้ามเวรวันก่อนวันหยุดเงียบๆ ตัววันขอหยุดเองไม่ถูกจัดเวร · ตรวจโค้ด 11 พ.ย. 2026 เดิมเขียนว่าทับ off request
- ตารางกับการตั้งค่าอยู่ในแท็บที่เปิดกับไฟล์ JSON ที่ export เอง `localStorage` เก็บแค่ธีม ภาษา และ flag คู่มือ ปิดแท็บก่อน export แล้วข้อมูลหาย · ห้ามเพิ่ม backend ที่ส่งชื่อ/วันลาออกนอกเครื่อง · แก้ 11 พ.ย. 2026 จากเดิมที่เขียนว่าข้อมูลอยู่ใน localStorage
- แก้ solver ต้องมีเทสต์ใน `tests/*.test.js` (harness = eval app.js + mock DOM ดู `tests/nightCap.test.js`)
- SheetJS โหลด 0.18.5 จาก cdnjs ที่ `index.html` กับ `sw.js` ใช้ export อย่างเดียว ถ้าจะเพิ่มนำเข้า Excel ให้เปลี่ยนเป็น 0.20.2 ขึ้นไปจาก cdn.sheetjs.com ก่อน รุ่นเดิมโดน CVE-2023-30533 ตอนอ่านไฟล์ · ที่มา [[2026-11-06-buu-ai-workshop-design-card-html-data-app]] ใน vault

## การตัดสินใจ
- 30 ส.ค. 2026: เลือก fork+patch แทนเขียนใหม่/OR-Tools เพราะกะ 8 ชม. ตรงกับ Shift-Based Mode เดิม ขาดแค่ cap เวรดึก

## STATUS

### 11 พ.ย. 2026
- ต้นทางออกตัวจัดเวรรุ่นใหม่ commit `00d6a91` วันที่ 10 พ.ย. 2026 ห่างจากฐานของ fork 82 commit · จดและแสดงทุกกฎที่ผ่อน ปฏิเสธพร้อมตัวเลขเมื่อจัดไม่ได้ ผลซ้ำได้ ตรวจการแก้มือ ส่งต่อกฎพักข้ามเดือน ส่งออก .ics เทสต์ 52 ชุด
- ต้นทางยังไม่มี cap เวรดึกต่อคน มีแต่ขั้นต่ำเวรต่อคน ค่าเริ่มต้น 14 · โหมดกะคู่กับ role ยังใช้ตัวจัดเวรเดิม
- ลอง cherry-pick `b93a86d` ลง `00d6a91` ใน scratch clone ชน `app.js` 5 จุด `translations.js` และ `dist/output.css` ต้องเขียน cap ใหม่ ไม่ใช่ย้ายแพตช์
- รายละเอียดกับหลักฐานอยู่โน้ต `2026-11-11-pleuma-doctor-scheduler-v2` ใน vault
- [ ] mike เคาะเวลาย้ายฐานไป `PleumA/doctor-scheduler` · agent แนะนำย้ายพร้อมรอบที่มีข้อมูลเวรจริง · ขั้นตอนเมื่อย้าย branch แยก เปลี่ยน remote `upstream` เขียน cap เวรดึกใหม่ที่ตัวกรอง Hard Quota Ceiling ตั้งขั้นต่ำเวรเป็น 0 แล้วรันเทสต์ทั้งชุด
- [ ] mike ส่งข้อมูลจริงมาลอง รายชื่อกับ role คนต่อกะ เดือนกับวัน off cap เวรดึก quota conflict หรือ Excel เดือนก่อน · รัน local ด้วย `python3 -m http.server 3000` เพราะ npx serve ไม่ขึ้นบนเครื่องนี้
- [ ] mike เปิด GitHub Pages ของ fork ที่ Settings → Pages → branch main ถ้าจะใช้ผ่านเว็บ

### 30 ส.ค. 2026
- ✅ patch `inputNightCap` = เวรดึกสูงสุดต่อคน (0 = ไม่จำกัด) hard filter ทุก cascade level + save/load JSON + TH/EN + 3 tests — ทั้งชุด 22 suites ผ่าน — push แล้ว
- งานค้าง 2 ข้อของวันนี้ คือเปิด GitHub Pages กับลองข้อมูลจริง ย้ายไปเป็น `- [ ]` ใน STATUS 11 พ.ย. 2026
- idea ถัดไป: วันไม่ว่างซ้ำทุกสัปดาห์ต่อคน (OPD/สอน), max วันติดกัน
