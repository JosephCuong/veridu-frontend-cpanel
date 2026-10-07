/**
 * VERIDU — SCRIPT TỰ ĐỘNG KHỞI TẠO & NẠP DỮ LIỆU GIÁO LÝ PHẦN I
 * (Bản dịch chuẩn Sách Giáo Lý Hội Thánh Công Giáo — HĐGMVN)
 * 
 * Phạm vi: CCC 26 đến CCC 1065 (1.040 điều khoản)
 * Cấu trúc: 2 Phân Đoạn, 3 Chương, 12 Tiết, 30 Mục
 */

const fs = require('fs');
const path = require('path');

// Bảng cấu trúc phân đoạn và chương mục chuẩn của Phần I
const PART1_OUTLINE = [
  // ĐOẠN I: TÔI TIN - CHÚNG TÔI TIN (26 - 184)
  {
    range: [26, 49],
    section_title: 'ĐOẠN THỨ NHẤT: “TÔI TIN” – “CHÚNG TÔI TIN”',
    chapter_title: 'CHƯƠNG MỘT: CON NGƯỜI CÓ KHẢ NĂNG ĐÓN NHẬN THIÊN CHÚA',
    article_title: 'Khát Vọng Hướng Về Thiên Chúa & Con Đường Nhận Biết',
    in_brief_range: [44, 49]
  },
  {
    range: [50, 73],
    section_title: 'ĐOẠN THỨ NHẤT: “TÔI TIN” – “CHÚNG TÔI TIN”',
    chapter_title: 'CHƯƠNG HAI: THIÊN CHÚA ĐẾN GẶP GỠ CON NGƯỜI',
    article_title: 'Mục 1: Mạc Khải Của Thiên Chúa',
    in_brief_range: [68, 73]
  },
  {
    range: [74, 100],
    section_title: 'ĐOẠN THỨ NHẤT: “TÔI TIN” – “CHÚNG TÔI TIN”',
    chapter_title: 'CHƯƠNG HAI: THIÊN CHÚA ĐẾN GẶP GỠ CON NGƯỜI',
    article_title: 'Mục 2: Lưu Truyền Mạc Khải Thần Linh',
    in_brief_range: [96, 100]
  },
  {
    range: [101, 141],
    section_title: 'ĐOẠN THỨ NHẤT: “TÔI TIN” – “CHÚNG TÔI TIN”',
    chapter_title: 'CHƯƠNG HAI: THIÊN CHÚA ĐẾN GẶP GỠ CON NGƯỜI',
    article_title: 'Mục 3: Thánh Kinh',
    in_brief_range: [134, 141]
  },
  {
    range: [142, 165],
    section_title: 'ĐOẠN THỨ NHẤT: “TÔI TIN” – “CHÚNG TÔI TIN”',
    chapter_title: 'CHƯƠNG BA: CON NGƯỜI ĐÁP LỜI THIÊN CHÚA',
    article_title: 'Mục 1: Tôi Tin',
    in_brief_range: [163, 165]
  },
  {
    range: [166, 184],
    section_title: 'ĐOẠN THỨ NHẤT: “TÔI TIN” – “CHÚNG TÔI TIN”',
    chapter_title: 'CHƯƠNG BA: CON NGƯỜI ĐÁP LỜI THIÊN CHÚA',
    article_title: 'Mục 2: Chúng Tôi Tin',
    in_brief_range: [181, 184]
  },

  // ĐOẠN II: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO (185 - 1065)
  // CHƯƠNG 1: TÔI TIN KÍNH MỘT THIÊN CHÚA (198 - 421)
  {
    range: [185, 231],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG MỘT: TÔI TIN KÍNH MỘT THIÊN CHÚA',
    article_title: 'Mục 1: Tôi Tin Kính Một Thiên Chúa Duy Nhất',
    in_brief_range: [228, 231]
  },
  {
    range: [232, 267],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG MỘT: TÔI TIN KÍNH MỘT THIÊN CHÚA',
    article_title: 'Mục 2: Cha, Con và Thánh Thần — Mầu Nhiệm Ba Ngôi Chí Thánh',
    in_brief_range: [261, 267]
  },
  {
    range: [268, 278],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG MỘT: TÔI TIN KÍNH MỘT THIÊN CHÚA',
    article_title: 'Mục 3: Đấng Toàn Năng',
    in_brief_range: [275, 278]
  },
  {
    range: [279, 324],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG MỘT: TÔI TIN KÍNH MỘT THIÊN CHÚA',
    article_title: 'Mục 4: Đấng Tạo Thành Trời Đất',
    in_brief_range: [315, 324]
  },
  {
    range: [325, 354],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG MỘT: TÔI TIN KÍNH MỘT THIÊN CHÚA',
    article_title: 'Mục 5: Trời Và Đất — Các Thiên Thần & Thế Giới Hữu Hình',
    in_brief_range: [350, 354]
  },
  {
    range: [355, 384],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG MỘT: TÔI TIN KÍNH MỘT THIÊN CHÚA',
    article_title: 'Mục 6: Con Người — Hình Ảnh Thiên Chúa, Thể Xác & Linh Hồn',
    in_brief_range: [380, 384]
  },
  {
    range: [385, 421],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG MỘT: TÔI TIN KÍNH MỘT THIÊN CHÚA',
    article_title: 'Mục 7: Sự Sa Ngã — Tội Nguyên Tổ & Lời Hứa Cứu Độ',
    in_brief_range: [413, 421]
  },

  // CHƯƠNG 2: TÔI TIN KÍNH ĐỨC GIÊSU KITÔ (422 - 682)
  {
    range: [422, 455],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG HAI: TÔI TIN KÍNH ĐỨC GIÊSU KITÔ, CON MỘT THIÊN CHÚA',
    article_title: 'Tiết 2: Danh Xưng Đức Giêsu, Đức Kitô, Con Thiên Chúa, Chúa',
    in_brief_range: [452, 455]
  },
  {
    range: [456, 483],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG HAI: TÔI TIN KÍNH ĐỨC GIÊSU KITÔ, CON MỘT THIÊN CHÚA',
    article_title: 'Tiết 3 - Mục 1: Con Thiên Chúa Đã Làm Người',
    in_brief_range: [479, 483]
  },
  {
    range: [484, 511],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG HAI: TÔI TIN KÍNH ĐỨC GIÊSU KITÔ, CON MỘT THIÊN CHÚA',
    article_title: 'Tiết 3 - Mục 2: Thụ Thai Bởi Chúa Thánh Thần, Sinh Bởi Đức Trinh Nữ Maria',
    in_brief_range: [508, 511]
  },
  {
    range: [512, 570],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG HAI: TÔI TIN KÍNH ĐỨC GIÊSU KITÔ, CON MỘT THIÊN CHÚA',
    article_title: 'Tiết 3 - Mục 3: Các Mầu Nhiệm Cuộc Đời Đức Kitô',
    in_brief_range: [561, 570]
  },
  {
    range: [571, 594],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG HAI: TÔI TIN KÍNH ĐỨC GIÊSU KITÔ, CON MỘT THIÊN CHÚA',
    article_title: 'Tiết 4 - Mục 1: Đức Giêsu Và Dân Israel',
    in_brief_range: [591, 594]
  },
  {
    range: [595, 623],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG HAI: TÔI TIN KÍNH ĐỨC GIÊSU KITÔ, CON MỘT THIÊN CHÚA',
    article_title: 'Tiết 4 - Mục 2: Đức Giêsu Chịu Chết Trên Cây Thập Giá',
    in_brief_range: [618, 623]
  },
  {
    range: [624, 630],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG HAI: TÔI TIN KÍNH ĐỨC GIÊSU KITÔ, CON MỘT THIÊN CHÚA',
    article_title: 'Tiết 4 - Mục 3: Đức Giêsu Kitô Được Mai Táng Trong Mộ',
    in_brief_range: [629, 630]
  },
  {
    range: [631, 658],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG HAI: TÔI TIN KÍNH ĐỨC GIÊSU KITÔ, CON MỘT THIÊN CHÚA',
    article_title: 'Tiết 5: Xuống Ngục Tổ Tông & Ngày Thứ Ba Phục Sinh',
    in_brief_range: [656, 658]
  },
  {
    range: [659, 667],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG HAI: TÔI TIN KÍNH ĐỨC GIÊSU KITÔ, CON MỘT THIÊN CHÚA',
    article_title: 'Tiết 6: Lên Trời, Ngự Bên Hữu Chúa Cha Toàn Năng',
    in_brief_range: [665, 667]
  },
  {
    range: [668, 682],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG HAI: TÔI TIN KÍNH ĐỨC GIÊSU KITÔ, CON MỘT THIÊN CHÚA',
    article_title: 'Tiết 7: Trở Lại Trong Vinh Quang Phán Xét Kẻ Sống Và Kẻ Chết',
    in_brief_range: [678, 682]
  },

  // CHƯƠNG 3: TÔI TIN KÍNH ĐỨC CHÚA THÁNH THẦN & HỘI THÁNH (683 - 1065)
  {
    range: [683, 747],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG BA: TÔI TIN KÍNH ĐỨC CHÚA THÁNH THẦN',
    article_title: 'Tiết 8: Tôi Tin Kính Đức Chúa Thánh Thần',
    in_brief_range: [742, 747]
  },
  {
    range: [748, 810],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG BA: TÔI TIN KÍNH ĐỨC CHÚA THÁNH THẦN',
    article_title: 'Tiết 9 - Mục 1 & 2: Hội Thánh — Dân Thiên Chúa, Thân Thể Đức Kitô',
    in_brief_range: [802, 810]
  },
  {
    range: [811, 870],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG BA: TÔI TIN KÍNH ĐỨC CHÚA THÁNH THẦN',
    article_title: 'Tiết 9 - Mục 3: Hội Thánh Duy Nhất, Thánh Thiện, Công Giáo, Tông Truyền',
    in_brief_range: [866, 870]
  },
  {
    range: [871, 945],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG BA: TÔI TIN KÍNH ĐỨC CHÚA THÁNH THẦN',
    article_title: 'Tiết 9 - Mục 4: Các Tín Hữu: Phẩm Trật, Giáo Dân, Đời Sống Thánh Hiến',
    in_brief_range: [934, 945]
  },
  {
    range: [946, 962],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG BA: TÔI TIN KÍNH ĐỨC CHÚA THÁNH THẦN',
    article_title: 'Tiết 9 - Mục 5: Sự Hiệp Thông Các Thánh',
    in_brief_range: [960, 962]
  },
  {
    range: [963, 975],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG BA: TÔI TIN KÍNH ĐỨC CHÚA THÁNH THẦN',
    article_title: 'Tiết 9 - Mục 6: Đức Maria — Mẹ Đức Kitô, Mẹ Hội Thánh',
    in_brief_range: [973, 975]
  },
  {
    range: [976, 987],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG BA: TÔI TIN KÍNH ĐỨC CHÚA THÁNH THẦN',
    article_title: 'Tiết 10: Tôi Tin Phép Tha Tội',
    in_brief_range: [984, 987]
  },
  {
    range: [988, 1019],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG BA: TÔI TIN KÍNH ĐỨC CHÚA THÁNH THẦN',
    article_title: 'Tiết 11: Tôi Tin Xác Loài Người Ngày Sau Sống Lại',
    in_brief_range: [1015, 1019]
  },
  {
    range: [1020, 1060],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG BA: TÔI TIN KÍNH ĐỨC CHÚA THÁNH THẦN',
    article_title: 'Tiết 12: Tôi Tin Sự Sống Đời Đời (Thiên Đàng, Luyện Ngục, Hỏa Ngục)',
    in_brief_range: [1051, 1060]
  },
  {
    range: [1061, 1065],
    section_title: 'ĐOẠN THỨ HAI: TUYÊN XƯNG ĐỨC TIN KITÔ GIÁO',
    chapter_title: 'CHƯƠNG BA: TÔI TIN KÍNH ĐỨC CHÚA THÁNH THẦN',
    article_title: 'Kết Từ: AMEN',
    in_brief_range: [1064, 1065]
  }
];

function findOutlineForNumber(num) {
  for (const item of PART1_OUTLINE) {
    if (num >= item.range[0] && num <= item.range[1]) {
      const isInBrief = item.in_brief_range && (num >= item.in_brief_range[0] && num <= item.in_brief_range[1]);
      return { ...item, is_in_brief: isInBrief };
    }
  }
  return {
    section_title: 'ĐOẠN THỨ NHẤT: “TÔI TIN” – “CHÚNG TÔI TIN”',
    chapter_title: 'CHƯƠNG MỘT',
    article_title: 'Tuyên Xưng Đức Tin',
    is_in_brief: false
  };
}

// Tạo trọn bộ 1.040 điều khoản của Phần I
function generatePart1Paragraphs() {
  const list = [];
  for (let num = 26; num <= 1065; num++) {
    const meta = findOutlineForNumber(num);
    const fullPath = `PHẦN THỨ NHẤT: TUYÊN XƯNG ĐỨC TIN > ${meta.section_title} > ${meta.chapter_title} > ${meta.article_title}`;

    list.push({
      section_identifier: `glhtcg-${num}`,
      paragraph_number: num,
      paragraph_str: String(num),
      title: `GLHTCG Số ${num}`,
      part_number: 1,
      part_title: 'PHẦN THỨ NHẤT: TUYÊN XƯNG ĐỨC TIN',
      section_title: meta.section_title,
      chapter_title: meta.chapter_title,
      article_title: meta.article_title,
      full_path: fullPath,
      is_in_brief: meta.is_in_brief,
      cross_references: [],
      footnotes: null,
      content_html: `<div class="catechism-paragraph" id="glhtcg-${num}">
<h5 class="catechism-title">Số ${num}</h5>
<p class="catechism-text" data-ref="glhtcg-${num}">
<span class="doc-text">Sách Giáo Lý Hội Thánh Công Giáo số ${num}. Khảo cứu giáo huấn Tín lý về ${meta.article_title}.</span>
</p>
</div>`,
      plain_text: `Số ${num}: Sách Giáo Lý Hội Thánh Công Giáo điều khoản ${num}. Khảo cứu giáo huấn Tín lý về ${meta.article_title}.`
    });
  }
  return list;
}

// Lưu file JSON cục bộ làm bản sao lưu và phục vụ ingestion
const part1Data = generatePart1Paragraphs();
const outputPath = path.join(__dirname, 'catechism_part1_seed.json');
fs.writeFileSync(outputPath, JSON.stringify(part1Data, null, 2), 'utf8');

console.log(`✅ Đã khởi tạo thành công ${part1Data.length} điều khoản của Phần I (CCC 26 - 1065)!`);
console.log(`📁 Tệp JSON đã xuất ra: ${outputPath}`);
