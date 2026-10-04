const express = require('express');
const cors = require('cors');
const path = require('path');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Curated high-quality relationship psychology articles and web resources
const CURATED_RESOURCES = [
  {
    id: 1,
    title: 'ทฤษฎี The Four Horsemen 4 สัญญาณอันตรายทำลายชีวิตคู่ โดย ดร.จอห์น กอตต์แมน',
    category: 'conflict',
    categoryLabel: 'การสื่อสาร & แก้ปัญหา',
    source: 'The Gottman Institute / จิตวิทยาชีวิตคู่',
    url: 'https://www.gottman.com/blog/the-four-horsemen-recognizing-criticism-contempt-defensiveness-and-stonewalling/',
    snippet: 'รู้จัก 4 พฤติกรรมอันตราย: การวิพากษ์วิจารณ์ (Criticism), การดูถูกเหยียดหยาม (Contempt), การแก้ตัวปกป้องตัวเอง (Defensiveness), และการปิดกั้นตัดขาด (Stonewalling) พร้อมวิธีแก้ปัญหาอย่างตรงจุด',
    readTime: '6 นาที',
    tag: 'จิตวิทยาแนะนำ'
  },
  {
    id: 2,
    title: 'Attachment Styles 4 รูปแบบความผูกพัน: ทำไมเราถึงรักและเจ็บปวดในแบบที่เป็นอยู่',
    category: 'psychology',
    categoryLabel: 'จิตวิทยาความรัก',
    source: 'จิตวิทยาความสัมพันธ์ & ทฤษฎีความผูกพัน',
    url: 'https://www.psychologytoday.com/us/basics/attachment',
    snippet: 'ทำความเข้าใจตนเองและคู่รักผ่าน Secure (มั่นคง), Anxious (วิตกกังวล), Avoidant (หลีกเลี่ยง), และ Fearful-Avoidant ช่วยให้เข้าใจว่าทำไมแฟนถึงชอบถอยหนีหรือทำไมเราถึงต้องการความมั่นใจตลอดเวลา',
    readTime: '8 นาที',
    tag: 'ทฤษฎีสำคัญ'
  },
  {
    id: 3,
    title: '5 ภาษารัก (The 5 Love Languages) กุญแจสื่อสารความรักให้ตรงใจอีกฝ่าย',
    category: 'dating',
    categoryLabel: 'ความเข้าใจ & ภาษารัก',
    source: 'Gary Chapman / 5lovelanguages.com',
    url: 'https://5lovelanguages.com/',
    snippet: 'คนเราแสดงออกและต้องการความรักต่างกัน 5 แบบ: คำพูดให้กำลังใจ, การใช้เวลาร่วมกัน, การให้ของขวัญ, การช่วยเหลือดูแล, และการสัมผัสทางกาย รู้จักภาษารักของคู่ตนเองลดความเข้าใจผิดได้มหาศาล',
    readTime: '5 นาที',
    tag: 'คู่รักต้องรู้'
  },
  {
    id: 4,
    title: 'วิธีฮีลใจและฟื้นฟูตัวเองหลังการเลิกรา (The Stages of Grief in Breakup)',
    category: 'healing',
    categoryLabel: 'ฮีลใจ & รักษาแผลใจ',
    source: 'Mental Health & Self-Care',
    url: 'https://www.healthline.com/health/stages-of-grief-after-breakup',
    snippet: 'เข้าใจระยะของความเสียใจ 5 ขั้นตอน การหยุดโทษตัวเอง การตัดวงจรโซเชียลมีเดีย และวิธีสร้างคุณค่าในตนเองกลับคืนมาอย่างเข้มแข็งและสง่างาม',
    readTime: '7 นาที',
    tag: 'ฟื้นฟูจิตใจ'
  },
  {
    id: 5,
    title: '10 สัญญาณ Red Flags (ธงแดง) ในความสัมพันธ์ที่บ่งบอกว่าคุณควรถอยออกมา',
    category: 'conflict',
    categoryLabel: 'สัญญาณอันตราย',
    source: 'Relationship Safety & Boundaries',
    url: 'https://www.psychologytoday.com/us/blog/in-flux/202111/10-relationship-red-flags-you-should-never-ignore',
    snippet: 'แยกให้ออกระหว่างข้อบกพร่องทั่วไปกับพฤติกรรม Toxic เช่น Gaslighting, การควบคุมจำกัดอิสรภาพ, Love Bombing, และการไม่เคารพขอบเขตส่วนบุคคล',
    readTime: '6 นาที',
    tag: 'เตือนภัยความสัมพันธ์'
  },
  {
    id: 6,
    title: 'แอบชอบเพื่อน หรือ คนคุยไม่ชัดเจน: จิตวิทยาการสารภาพรักและสร้างขอบเขต',
    category: 'dating',
    categoryLabel: 'แอบรัก & คนคุย',
    source: 'Dating Advice & Social Dynamics',
    url: 'https://pantip.com/topic/32449691',
    snippet: 'เมื่อสถานะคลุมเครือ ควรทำอย่างไร? ศิลปะแห่งการเปิดใจโดยไม่ทำลายมิตรภาพ และวิธีเช็คว่าอีกฝ่ายมีใจหรือแค่บริหารเสน่ห์',
    readTime: '5 นาที',
    tag: 'สถานะคนคุย'
  },
  {
    id: 7,
    title: 'ความรักระยะไกล (Long-Distance Relationship) ดูแลความผูกพันอย่างไรให้ไม่จืดจาง',
    category: 'trust',
    categoryLabel: 'ความไว้วางใจ & ระยะทาง',
    source: 'LDR Psychology Guide',
    url: 'https://www.psychologytoday.com/us/blog/meet-catch-and-keep/201402/how-make-long-distance-relationships-work',
    snippet: 'เทคนิคการรักษาความใกล้ชิดทางอารมณ์ การจัดตารางเวลา การสื่อสารที่มีคุณภาพ และการตั้งเป้าหมายร่วมกันเพื่อให้อนาคตชัดเจน',
    readTime: '6 นาที',
    tag: 'รักทางไกล'
  },
  {
    id: 8,
    title: 'การสร้างความไว้ใจใหม่หลังการนอกใจหรือผิดสัญญา เป็นไปได้จริงหรือไม่?',
    category: 'trust',
    categoryLabel: 'ความซื่อสัตย์ & การให้อภัย',
    source: 'Couples Therapy & Trust Building',
    url: 'https://www.gottman.com/blog/reviving-trust-after-an-affair/',
    snippet: 'กระบวนการ Atone-Attune-Attach ที่คู่รักต้องผ่านร่วมกัน หากต้องการเยียวยาบาดแผลการนอกใจอย่างแท้จริง',
    readTime: '9 นาที',
    tag: 'การฟื้นฟูความไว้ใจ'
  }
];

// In-memory fast cache for queries
const searchCache = new Map();

// Helper to scrape real web results via DuckDuckGo with fast timeout & fallbacks
async function searchWebReal(query) {
  const cacheKey = query.trim().toLowerCase();
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  // Fallback function: Query Thai Wikipedia API (super fast, < 300ms)
  const fetchWiki = async () => {
    try {
      const wUrl = `https://th.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=4&namespace=0&format=json`;
      const wRes = await fetch(wUrl, { signal: AbortSignal.timeout(2000) });
      const wData = await wRes.json();
      const wikiResults = [];
      if (wData && wData[1]) {
        for (let i = 0; i < wData[1].length; i++) {
          if (wData[1][i] && wData[3][i]) {
            wikiResults.push({
              title: wData[1][i],
              link: wData[3][i],
              snippet: wData[2][i] || `บทความสารานุกรมและงานวิจัยเกี่ยวกับ ${wData[1][i]}`,
              domain: 'th.wikipedia.org'
            });
          }
        }
      }
      return wikiResults;
    } catch (e) {
      return [];
    }
  };

  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' ความรัก จิตวิทยา pantip')}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500); // 2.5s max

    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'th,en-US;q=0.9,en;q=0.8'
      }
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const results = [];

    $('.result').each((i, el) => {
      if (results.length >= 6) return false;
      const title = $(el).find('.result__title a').text().trim();
      let link = $(el).find('.result__title a').attr('href');
      const snippet = $(el).find('.result__snippet').text().trim();

      if (title && link) {
        if (link.includes('uddg=')) {
          const match = link.match(/uddg=([^&]+)/);
          if (match) link = decodeURIComponent(match[1]);
        }
        let domain = '';
        try {
          const u = new URL(link);
          domain = u.hostname.replace('www.', '');
        } catch (e) {
          domain = 'web';
        }
        results.push({
          title,
          link,
          snippet,
          domain
        });
      }
    });

    if (results.length > 0) {
      searchCache.set(cacheKey, results);
      return results;
    }

    // If DDG returned empty (e.g. rate-limit or captcha), fallback to Wikipedia
    const wikiResults = await fetchWiki();
    if (wikiResults.length > 0) {
      searchCache.set(cacheKey, wikiResults);
      return wikiResults;
    }

    return [];
  } catch (err) {
    console.warn('Real web search DDG fallback:', err.message);
    const wikiResults = await fetchWiki();
    if (wikiResults.length > 0) {
      searchCache.set(cacheKey, wikiResults);
      return wikiResults;
    }
    return [];
  }
}

// Intelligent Psychological Knowledge Base & Synthesis Engine
function analyzeLoveQuery(query) {
  const q = query.toLowerCase();

  // Keyword intents
  const isBreakup = q.includes('อกหัก') || q.includes('เลิก') || q.includes('ลืม') || q.includes('ตัดใจ') || q.includes('โดนทิ้ง') || q.includes('เสียใจ');
  const isSilentTreatment = q.includes('เงียบ') || q.includes('ไม่ตอบ') || q.includes('ดองแชท') || q.includes('หายไป') || q.includes('ไม่ง้อ');
  const isCrush = q.includes('แอบชอบ') || q.includes('จีบ') || q.includes('สารภาพ') || q.includes('บอกรัก') || q.includes('เพื่อน') || q.includes('คนคุย');
  const isCheating = q.includes('นอกใจ') || q.includes('มีคนอื่น') || q.includes('มือที่สาม') || q.includes('ซ่อนแชท') || q.includes('โกหก');
  const isToxic = q.includes('toxic') || q.includes('เหนื่อย') || q.includes('อึดอัด') || q.includes('ทำร้าย') || q.includes('ทะเลาะบ่อย') || q.includes('ควบคุม');
  const isUncertain = q.includes('ชัดเจน') || q.includes('สถานะ') || q.includes('จริงจัง') || q.includes('แฟน') || q.includes('คิดยังไง');
  const isLDR = q.includes('ไกล') || q.includes('ระยะทาง') || q.includes('ไม่มีเวลา') || q.includes('ห่าง');

  let topic = 'general';
  let emotionalTone = 'อบอุ่น เข้าใจ และชวนคิดอย่างมีสติ';
  let psychologicalConcept = '';
  let coreAdvice = [];
  let scriptExamples = [];
  let actionSteps = [];

  if (isBreakup) {
    topic = 'breakup';
    emotionalTone = 'โอบกอดและเยียวยาหัวใจอย่างลึกซึ้ง';
    psychologicalConcept = 'ทฤษฎีวงจรความสูญเสีย (5 Stages of Grief) & การหลั่งสาร Dopamine Withdrawal เมื่อความสัมพันธ์ยุติ';
    coreAdvice = [
      'ความเจ็บปวดในตอนนี้คือเรื่องจริงและเป็นธรรมชาติ สมองของคุณกำลังปรับตัวจากการขาดฮอร์โมนแห่งความสุขที่เคยได้รับจากเขา',
      'อย่าบังคับตัวเองให้ "ต้องหายดีทันที" อนุญาตให้ตัวเองร้องไห้หรือเสียใจได้ แต่กำหนดเวลาในการอยู่กับความเศร้า',
      'ใช้กฎ No Contact Rule (งดติดต่อ 30-60 วัน) เพื่อให้สารเคมีในสมองและหัวใจได้มีพื้นที่ฟื้นฟูกลับสู่สภาวะสมดุล',
      'เปลี่ยนคำถามจาก "ทำไมเขาถึงทำแบบนี้" เป็น "วันนี้เราจะดูแลตัวเองให้มีความสุขได้อย่างไร"'
    ];
    actionSteps = [
      'เก็บหรือซ่อนรูปภาพและสิ่งของที่กระตุ้นความทรงจำชั่วคราว',
      'เขียนความรู้สึกลงกระดาษ (Emotional Dumping) แล้วเผาหรือทิ้งไป',
      'ออกกำลังกายหรือทำกิจกรรมที่เหงื่อออกเพื่อกระตุ้น Endorphin ทดแทน',
      'นัดเจอเพื่อนสนิทหรือคนในครอบครัวที่พร้อมรับฟังโดยไม่ตัดสิน'
    ];
    scriptExamples = [
      'ประโยคเตือนสติตัวเอง: "การที่เขาไม่ได้อยู่ตรงนี้ ไม่ได้แปลว่าคุณค่าในตัวเราลดลงแม้แต่น้อย"',
      'เมื่ออยากทักหาเขา: "รอพรุ่งนี้เช้าก่อน ถ้าตื่นมายังอยากทัก ค่อยถามตัวเองอีกครั้งว่าทักไปเพื่ออะไร"'
    ];
  } else if (isSilentTreatment) {
    topic = 'stonewalling';
    emotionalTone = 'สร้างความสงบ ลดการตอบโต้ทางอารมณ์';
    psychologicalConcept = 'พฤติกรรม Stonewalling (กำแพงความเงียบ) และความต่างของ Attachment Style (Anxious vs Avoidant)';
    coreAdvice = [
      'คนที่เงียบมักเกิดภาวะ "Emotional Flooding" คืออารมณ์ล้นเกินจนสมองปิดกั้น ไม่ใช่ว่าเขาไม่แคร์เสมอไป แต่อาจเป็นกลไกป้องกันตัว',
      'การยิ่งจี้ถาม ยิ่งส่งข้อความรัวๆ จะยิ่งผลักให้คนหลีกเลี่ยง (Avoidant) ถอยหนีและสร้างกำแพงหนาขึ้น',
      'เปลี่ยนจาก "เธอเป็นอะไร ทำไมไม่พูด!" เป็นการให้พื้นที่ปลอดภัยพร้อมกำหนดกรอบเวลา'
    ];
    actionSteps = [
      'หยุดส่งข้อความซ้ำๆ วางโทรศัพท์ลงอย่างน้อย 2-3 ชั่วโมง',
      'สังเกตอารมณ์ของตนเองว่าความเงียบของเขากำลังกระตุ้นความกลัวการถูกทอดทิ้งหรือไม่',
      'ส่งข้อความเปิดทางแบบไม่กดดันเพียง 1 ข้อความ แล้วปล่อยให้เขาใช้เวลา'
    ];
    scriptExamples = [
      'ประโยคเปิดทาง: "เรารู้สึกว่าตอนนี้เราทั้งคู่อาจจะกำลังอารมณ์ร้อนหรือเหนื่อย เราขอให้เธอได้มีเวลาอยู่กับตัวเองนะ ถ้าเธอพร้อมคุยเมื่อไหร่ เราพร้อมรับฟังเสมอนะ"',
      'ประโยคกำหนดเวลา: "ถ้าเย็นนี้หรือพรุ่งนี้สะดวก ค่อยโทรคุยกันสัก 10 นาทีเพื่อหาทางออกด้วยกันนะ"'
    ];
  } else if (isCheating) {
    topic = 'infidelity';
    emotionalTone = 'หนักแน่น เห็นคุณค่าในตัวเอง และมีสติ';
    psychologicalConcept = 'การพังทลายของพันธสัญญาความเชื่อมั่น (Betrayal Trauma) & ทฤษฎี Atone-Attune-Attach';
    coreAdvice = [
      'การนอกใจคือทางเลือกของผู้กระทำ ไม่ใช่ความผิดหรือความไม่ดีพอของคุณโดยเด็ดขาด',
      'อย่าเพิ่งตัดสินใจใหญ่ในชั่วโมงที่อารมณ์กำลังปั่นป่วนที่สุด ให้ความสำคัญกับความปลอดภัยทางจิตใจตนเองก่อน',
      'หากจะให้โอกาส อีกฝ่ายต้องแสดงความสำนึกผิดอย่างจริงใจ ยินยอมโปร่งใส 100% โดยไม่โทษคุณหรือสถานการณ์'
    ];
    actionSteps = [
      'รวบรวมหลักฐานและข้อเท็จจริงอย่างเงียบๆ โดยไม่โวยวายให้อีกฝ่ายทำลายหลักฐาน',
      'แยกห้องนอนหรือขอพื้นที่ห่างกันชั่วคราวเพื่อประเมินใจตนเอง',
      'ตั้งคำถามตรงๆ: "คุณมองเห็นอนาคตกับคนที่ทำลายความไว้ใจของคุณไปแล้วได้อย่างไร"'
    ];
    scriptExamples = [
      'ประโยคเปิดประเด็น: "เรารู้เรื่องทั้งหมดแล้ว และเราจะไม่ยอมรับการแก้ตัวหรือโทษสิ่งอื่น ความซื่อสัตย์คือสิ่งพื้นฐานที่สุดสำหรับเรา"',
      'ประโยคกำหนดเงื่อนไข: "ถ้าคุณอยากให้ความสัมพันธ์นี้ไปต่อ คุณต้องบอกความจริงทั้งหมด และยินยอมที่จะโปร่งใสโดยไม่มีข้อแม้"'
    ];
  } else if (isCrush) {
    topic = 'crush';
    emotionalTone = 'สดใส ให้กำลังใจ และมีลูกเล่นอย่างมีชั้นเชิง';
    psychologicalConcept = 'ทฤษฎีความใกล้ชิด (Proximity Effect) & กฎ Mirroring (การสะท้อนภาษากายและอารมณ์)';
    coreAdvice = [
      'การแสดงความสนใจทีละน้อย ดีกว่าการทุ่มเทสุดตัวจนทำให้อีกฝ่ายรู้สึกอึดอัด',
      'สร้าง "จุดร่วม" (Common Ground) เช่น เพลงที่ชอบ อาหาร หนัง หรืองานอดิเรก เพื่อให้บทสนทนาลื่นไหลเป็นธรรมชาติ',
      'อย่าทำตัวพร้อมตลอดเวลา (Be slightly unavailable) ให้มีชีวิตและเป้าหมายของตัวเองที่น่าดึงดูดใจ'
    ];
    actionSteps = [
      'หยอดบทสนทนาจาก Story ใน IG หรือสิ่งที่เขาโพสต์แบบเป็นธรรมชาติ',
      'ถามคำถามปลายเปิดที่เกี่ยวกับความชอบหรือความเห็นของเขา (คนเราชอบพูดเรื่องของตัวเอง)',
      'สังเกตสัญญาณไฟเขียว: สบตานาน ยิ้มตาม ทักมาก่อน หรือพยายามต่อบทสนทนา'
    ];
    scriptExamples = [
      'เปิดบทสนทนา: "เห็นร้านกาแฟ/ที่เที่ยวที่เธอลง สวยมากเลย อยู่แถวไหนเหรอ อยากไปตามบ้าง"',
      'หยอดแบบเนียนๆ: "คุยกับเธอแล้วสบายใจดีจัง วันนี้เหนื่อยๆ มาเจอเรื่องเล่าเธอแล้วยิ้มได้เลย"'
    ];
  } else if (isToxic) {
    topic = 'toxic';
    emotionalTone = 'ปกป้อง ให้กำลังใจ และเตือนสติตรงประเด็น';
    psychologicalConcept = 'ภาวะ Gaslighting & วงจรความรุนแรงทางอารมณ์ (Cycle of Abuse & Intermittent Reinforcement)';
    coreAdvice = [
      'ความรักที่ดีควรทำให้คุณรู้สึก "ปลอดภัยและสงบสุข" ไม่ใช่รู้สึกหวาดระแวงหรือต้องคอยเดินบนสะเก็ดแก้วตลอดเวลา',
      'หากคุณเริ่มสงสัยในสติตนเอง หรือรู้สึกว่าทุกเรื่องเป็นความผิดของคุณคนเดียว นั่นคือสัญญาณอันตราย',
      'คุณไม่สามารถเปลี่ยนคนที่ไม่คิดว่าตัวเองมีปัญหาได้ ความหวังว่า "เขาจะเปลี่ยนเพื่อเรา" มักนำไปสู่ความเจ็บปวดซ้ำซาก'
    ];
    actionSteps = [
      'จดบันทึกเหตุการณ์จริง (Facts vs Claims) เพื่อไม่ให้หลงกลการบิดเบือนความจริง',
      'ตั้งขอบเขตส่วนบุคคล (Boundaries) ที่ชัดเจน เช่น ถ้าตะคอกหรือด่าทอ เราจะไม่คุยต่อ',
      'ปรึกษาผู้เชี่ยวชาญหรือคนรอบข้างที่ไว้ใจได้ อย่าเก็บตัวอยู่คนเดียว'
    ];
    scriptExamples = [
      'ตั้งขอบเขต: "เรารักเธอนะ แต่เราไม่ยอมรับการใช้อารมณ์หรือคำพูดทำร้ายจิตใจแบบนี้ ถ้ายังคุยดีๆ ไม่ได้ เราขอหยุดคุยก่อน"',
      'รับมือการบิดเบือน: "เราจำเหตุการณ์ที่เกิดขึ้นได้ชัดเจน และความรู้สึกของเราก็มีอยู่จริง อย่าบอกว่าเราคิดไปเอง"'
    ];
  } else {
    topic = 'general';
    emotionalTone = 'สุขุม อบอุ่น และมองรอบด้าน';
    psychologicalConcept = 'สามเหลี่ยมแห่งความรักของสเติร์นเบิร์ก (Sternberg’s Triangular Theory of Love) และการสื่อสารเชิงบวก';
    coreAdvice = [
      'ความรักที่ยั่งยืนประกอบด้วย 3 เสาหลัก: ความหลงใหล (Passion), ความสนิทสนมผูกพัน (Intimacy), และพันธสัญญา (Commitment)',
      'ปัญหาในความสัมพันธ์กว่า 69% ตามการวิจัยของ Gottman คือปัญหาที่ไม่สามารถแก้ให้หายขาดได้ แต่เรียนรู้ที่จะอยู่ร่วมกันได้ผ่านความเข้าใจ',
      'ฟังเพื่อเข้าใจ (Listening to Understand) ไม่ใช่ฟังเพื่อรอจังหวะเถียงหรือแก้ตัว'
    ];
    actionSteps = [
      'หาสาเหตุที่แท้จริงใต้ภูเขาน้ำแข็งแห่งอารมณ์ (ความเหงา, ความกลัว, หรือความต้องการความสำคัญ)',
      'หาเวลาคุณภาพ (Quality Time) ร่วมกันสัปดาห์ละ 1 ครั้งโดยไม่แตะโทรศัพท์มือถือ',
      'กล่าวคำขอบคุณและชื่นชมสิ่งเล็กๆ น้อยๆ ที่อีกฝ่ายทำให้เป็นประจำ'
    ];
    scriptExamples = [
      'เริ่มต้นคุยแบบนุ่มนวล (Soft Startup): "เรารู้สึกเหงานิดหน่อยเวลาที่เราไม่ได้คุยกัน เราอยากรู้ว่าช่วงนี้เธอมีอะไรเหนื่อยใจไหม"',
      'ขอความร่วมมือ: "เราอยากให้ความสัมพันธ์ของเรามีความสุขมากขึ้น เรามาลองช่วยกันปรับตรงนี้ดูไหม"'
    ];
  }

  return {
    topic,
    emotionalTone,
    psychologicalConcept,
    coreAdvice,
    actionSteps,
    scriptExamples
  };
}

// API: Search real web articles on love & relationship
app.get('/api/search', async (req, res) => {
  const query = req.query.q || '';
  if (!query) {
    return res.json({ results: CURATED_RESOURCES });
  }

  try {
    const realResults = await searchWebReal(query);
    // Combine with curated resources matching query
    const lowerQ = query.toLowerCase();
    const matchedCurated = CURATED_RESOURCES.filter(c =>
      c.title.toLowerCase().includes(lowerQ) ||
      c.snippet.toLowerCase().includes(lowerQ) ||
      c.categoryLabel.toLowerCase().includes(lowerQ)
    );

    res.json({
      query,
      results: realResults.length > 0 ? realResults : matchedCurated,
      curatedCount: matchedCurated.length,
      realWebCount: realResults.length
    });
  } catch (err) {
    console.error('Search API error:', err);
    res.status(500).json({ error: 'Failed to search web articles', details: err.message });
  }
});

// API: Curated articles list
app.get('/api/curated', (req, res) => {
  const category = req.query.category;
  if (category && category !== 'all') {
    return res.json({ articles: CURATED_RESOURCES.filter(a => a.category === category) });
  }
  res.json({ articles: CURATED_RESOURCES });
});

// API: Main Consultation Chatbot (Intelligent + Real Web Scraped Grounding)
app.post('/api/consult', async (req, res) => {
  const { message, history, apiKey } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'กรุณาระบุข้อความคำถาม' });
  }

  const userQuery = message.trim();

  try {
    // 1. Fetch real web data regarding this exact relationship question
    const webSearchResults = await searchWebReal(userQuery);

    // 2. Perform psychological analysis
    const analysis = analyzeLoveQuery(userQuery);

    // 3. Fallback/Complementary curated articles if web results are sparse
    const relevantCurated = CURATED_RESOURCES.slice(0, 3);

    // 4. Construct response payload
    const responsePayload = {
      query: userQuery,
      consultation: {
        tone: analysis.emotionalTone,
        theory: analysis.psychologicalConcept,
        empathyMessage: `พี่อุ่นใจเข้าใจดีเลยครับว่าสถานการณ์นี้ทำให้คุณรู้สึกสับสนหรือไม่สบายใจ ขอให้รู้ไว้ว่าความรู้สึกของคุณมีคุณค่าเสมอ ไม่ว่าจะสุขหรือทุกข์ เราพร้อมอยู่เคียงข้างคุณตรงนี้ครับ`,
        adviceList: analysis.coreAdvice,
        actionSteps: analysis.actionSteps,
        scripts: analysis.scriptExamples,
        summary: `จำไว้เสมอครับว่า ความสัมพันธ์ที่ดีไม่จำเป็นต้องสมบูรณ์แบบ แต่ต้องการคนที่พร้อมจะจับมือและเติบโตไปด้วยกัน และที่สำคัญที่สุด อย่าลืมรักและเคารพคุณค่าในตัวเองด้วยนะครับ`
      },
      sources: webSearchResults.length > 0 ? webSearchResults : relevantCurated.map(c => ({
        title: c.title,
        link: c.url,
        snippet: c.snippet,
        domain: c.source
      })),
      timestamp: new Date().toISOString()
    };

    // If user provided a Gemini API Key in the UI, we can optionally enhance the synthesis with LLM!
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{
                  text: `คุณคือ 'พี่อุ่นใจ' ที่ปรึกษาปัญหาความรักและจิตวิทยาความสัมพันธ์ที่มีความเห็นอกเห็นใจสูง อบอุ่น สุภาพ และให้คำแนะนำที่นำไปใช้ได้จริงตามหลักจิตวิทยา
ผู้ใช้ถามว่า: "${userQuery}"
ข้อมูลอ้างอิงจากเว็บจริงที่ค้นพบ: ${JSON.stringify(webSearchResults.slice(0, 3))}

กรุณาตอบเป็นภาษาไทยด้วยโครงสร้างที่อบอุ่นและชัดเจน:
1. การโอบกอดและรับฟังความรู้สึก (Empathy)
2. วิเคราะห์สาเหตุตามหลักจิตวิทยาความสัมพันธ์
3. 3-4 สิ่งที่ควรทำ (Action Steps)
4. ตัวอย่างคำพูด/ประโยคที่ควรใช้สื่อสารกับอีกฝ่าย
5. สรุปให้กำลังใจ`
                }]
              }
            ]
          })
        });

        const geminiData = await geminiRes.json();
        if (geminiData.candidates && geminiData.candidates[0]?.content?.parts[0]?.text) {
          responsePayload.llmEnhanced = true;
          responsePayload.customText = geminiData.candidates[0].content.parts[0].text;
        }
      } catch (geminiErr) {
        console.warn('Gemini enhancement skipped:', geminiErr.message);
      }
    }

    res.json(responsePayload);
  } catch (err) {
    console.error('Consultation error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการประมวลผลคำปรึกษา', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🌸 AunJai Love Clinic Server running at http://localhost:${PORT}`);
});
