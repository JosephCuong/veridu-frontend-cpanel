// VERIDU Academic Research Knowledge Base & Methodology Framework
// Sổ tay phương pháp luận, ma trận khám phá đề tài & khoảng trống tri thức học thuật Công giáo

export interface ResearchCategory {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  color: string;
  gradient: string;
  badgeColor: string;
  heroImage: string;
  quote: string;
  scriptureRef: string;
  description: string;
  focalPoints: string[];
  methodology: {
    title: string;
    subtitle: string;
    frameworkName: string;
    steps: {
      step: number;
      name: string;
      desc: string;
      keyQuestions: string;
    }[];
    requiredSources: string[];
    structureTemplate: {
      section: string;
      guidance: string;
    }[];
    exemplaryQuestion: string;
  };
}

export interface ResearchSubject {
  id: string;
  name: string;
  role: string;
  testament: 'Cựu Ước' | 'Tân Ước' | 'Giáo Phụ & Tiến Sĩ';
  keyScriptures: string;
  hasArticle: boolean;
  articleSlug?: string;
}

export interface TheologicalTheme {
  id: string;
  title: string;
  scope: string;
  category: string;
  centralQuestion: string;
}

export interface HistoricalContext {
  id: string;
  period: string;
  yearRange: string;
  significance: string;
}

export interface KnowledgeGapItem {
  id: string;
  type: 'Nhân Vật Thánh' | 'Sách Kinh Thánh' | 'Tín Lý Trọng Tâm';
  title: string;
  importance: 'Khẩn Cấp' | 'Ưu Tiên Cao';
  reason: string;
  suggestedAngle: string;
  crossLink?: string;
}

export interface CuratedTopic {
  id: string;
  categoryId: string;
  categoryName: string;
  title: string;
  subtitle: string;
  priority: 'Khẩn Cấp' | 'Ưu Tiên Cao' | 'Mở Rộng';
  scope: string;
  methodologyBrief: string;
  targetBiblicalPassages: string[];
  tags: string[];
  relatedCharacter?: string;
  relatedEra?: string;
}

// ─────────────────────────────────────────────────────────────
// 1. DANH MỤC 8 CHUYÊN MỤC HỌC THUẬT & PHƯƠNG PHÁP LUẬN ĐẶC THÙ
// ─────────────────────────────────────────────────────────────
export const RESEARCH_CATEGORIES: ResearchCategory[] = [
  {
    id: 'kinh-thanh',
    name: 'Kinh Thánh & Chú Giải',
    slug: 'kinh-thanh',
    iconName: 'BookOpen',
    color: '#d97706',
    gradient: 'from-amber-500/20 via-amber-600/10 to-transparent',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    heroImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1200&auto=format&fit=crop',
    quote: '“Lời Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường con đi.”',
    scriptureRef: 'Thánh Vịnh 119, 105',
    description: 'Nghiên cứu bản văn Lời Chúa dựa trên phương pháp chú giải lịch sử - phê bình (Historical-Critical), văn tự học Hy Lạp/Hebrew và tính hiệp nhất của toàn bộ Quy điển 73 Sách.',
    focalPoints: ['Ngữ nguyên học Hebrew/Hy Lạp', 'Cấu trúc Chiasmus & Văn chương', 'Quy điển Cựu & Tân Ước', 'Mối liên kết Tiên tri & Thiên Sai'],
    methodology: {
      title: 'Quy Trình Chú Giải Bản Văn Kinh Thánh 6 Tầng',
      subtitle: 'Áp dụng Huấn thị của Ủy Ban Kinh Thánh Giáo Hoàng về Chú Giải Kinh Thánh trong Hội Thánh',
      frameworkName: '6 Layers of Exegesis & Theological Synthesis',
      steps: [
        {
          step: 1,
          name: 'Phê bình Bản văn & Văn tự nguyên ngữ (Textual Criticism)',
          desc: 'Đối chiếu các thủ bản cổ (Masoretic, Septuaginta LXX, Qumran, Vulgata), tra cứu các từ khóa Hebrew/Aram/Hy Lạp cốt lõi để nhận diện trường nghĩa gốc.',
          keyQuestions: 'Thuật ngữ chính xác được tác giả sử dụng là gì? Các dị bản cổ nhất ghi nhận thế nào?'
        },
        {
          step: 2,
          name: 'Bối cảnh Lịch sử & Phong tục Đương thời (Historical Horizon)',
          desc: 'Đặt bản văn vào tọa độ thời gian, địa lý, chính trị và xã hội Cận Đông Cổ Đại (ANE) hoặc thời kỳ Hy-La để hiểu người nghe đầu tiên nghe thấy điều gì.',
          keyQuestions: 'Bản văn được viết vào thế kỷ nào? Ai là tác giả và đối tượng độc giả sơ khởi?'
        },
        {
          step: 3,
          name: 'Phân tích Văn thể & Cấu trúc Văn chương (Literary Analysis)',
          desc: 'Nhận diện thể loại văn học (Thơ ca, Sấm ngôn, Khải huyền, Tường thuật giao ước) và cấu trúc song đối (Chiasmus, Inclusio, Parallelism).',
          keyQuestions: 'Khối bản văn có cấu trúc trục đảo đối nào? Thể văn này chi phối thông điệp như thế nào?'
        },
        {
          step: 4,
          name: 'Nối kết Thần học Liên Văn Bản (Intra-canonical Typology)',
          desc: 'Đối chiếu bản văn với tiến trình Lịch sử Cứu Độ (Heilsgeschichte). Tìm kiếm hình bóng Tiền trưng (Typology) được kiện toàn nơi Chúa Kitô.',
          keyQuestions: 'Chi tiết này ứng nghiệm hoặc mở đường cho biến cố nào trong Tân Ước?'
        },
        {
          step: 5,
          name: 'Ánh sáng Huấn quyền & Truyền thống Giáo Phụ (Magisterium & Patristics)',
          desc: 'Soi rọi bản văn qua các Chú giải của các Thánh Giáo Phụ (Âu-tinh, Gioan Kim Khẩu, Giêrônimô) và các định tín của Công Đồng Chung.',
          keyQuestions: 'Giáo Hội qua dòng lịch sử đã giải thích đoạn Lời Chúa này theo bốn nghĩa Kinh Thánh như thế nào?'
        },
        {
          step: 6,
          name: 'Áp dụng Linh đạo & Hiện sinh Đương đại (Spiritual & Pastoral Application)',
          desc: 'Rút ra sứ điệp cứu độ sống động cho cộng đoàn tín hữu hôm nay, kết nối với đời sống luân lý và phụng vụ.',
          keyQuestions: 'Bản văn này đang chất vấn và hướng dẫn đời sống đức tin của chúng ta như thế nào?'
        }
      ],
      requiredSources: ['Bản dịch Lời Chúa bản Phổ thông / Bản dịch KTHCG', 'Thủ bản Nestle-Aland / BHS', 'Giáo Lý Hội Thánh Công Giáo (CCC)', 'Văn kiện Divino Afflante Spiritu & Dei Verbum'],
      structureTemplate: [
        { section: 'I. Dẫn nhập & Bản văn gốc', guidance: 'Trích dẫn nguyên văn, xác định vị trí đoạn trích trong toàn bộ cấu trúc sách.' },
        { section: 'II. Khảo sát Ngữ nguyên & Bối cảnh Lịch sử', guidance: 'Phân tích các từ vựng the chốt, phong tục và biến cố lịch sử gắn liền.' },
        { section: 'III. Luận điểm Thần học Cốt lõi', guidance: 'Phát triển từ 2 đến 3 luận đề thần học trọng tâm được bản văn công bố.' },
        { section: 'IV. Đối chiếu Tân Ước & Giáo Hội', guidance: 'Liên kết hình bóng với Đức Kitô và lời dạy của Huấn quyền.' },
        { section: 'V. Kết luận & Suy niệm Ứng dụng', guidance: 'Tổng kết sứ điệp và đúc kết lời nguyện hoặc hành động cụ thể.' }
      ],
      exemplaryQuestion: 'Đâu là sự chuyển biến thần học giữa Luật Mắt Đền Mắt (Lex Talionis) trong Xuất Hành 21 và Luật Bát Phúc của Chúa Giêsu trong Mát-thêu 5?'
    }
  },
  {
    id: 'khao-co',
    name: 'Khảo Cổ Kinh Thánh',
    slug: 'khao-co',
    iconName: 'Globe',
    color: '#0284c7',
    gradient: 'from-sky-500/20 via-sky-600/10 to-transparent',
    badgeColor: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
    heroImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop',
    quote: '“Thực tế khảo cổ học không tạo ra đức tin, nhưng minh chứng đức tin không hề xây trên huyền thoại.”',
    scriptureRef: 'Khảo Cổ Học Thánh Địa',
    description: 'Khám phá các bằng chứng thực nghiệm từ địa tầng, đồ gốm, di chỉ kiến trúc và văn khắc tại Đất Thánh (Levant, Ai Cập, Lưỡng Hà) củng cố tính lịch sử của Kinh Thánh.',
    focalPoints: ['Địa tầng học Levant', 'Văn khắc Tel Dan, Mesha, Ketef Hinnom', 'Cuộn Sách Biển Chết Qumran', 'Đền Thờ Giêrusalem & Cung Điện Vua'],
    methodology: {
      title: 'Phương Pháp Khảo Cứu Thực Chứng & Địa Tầng',
      subtitle: 'Đối chiếu khoa học khảo cổ học với các ký thuật lịch sử Kinh Thánh',
      frameworkName: 'Stratigraphic & Inscriptional Correlation Method',
      steps: [
        {
          step: 1,
          name: 'Xác định Di chỉ & Tọa độ Địa lý (Topographical Identification)',
          desc: 'Tra cứu tên gọi cổ (Semitic/Hebrew) và địa danh hiện đại (Ả Rập/Israel), xác định vị trí trên bản đồ địa lý Kinh Thánh.',
          keyQuestions: 'Di chỉ khảo cổ tương ứng chính xác với địa danh nào trong bản văn Kinh Thánh?'
        },
        {
          step: 2,
          name: 'Phân tích Địa tầng & Niên đại Hiện vật (Stratigraphy & Dating)',
          desc: 'Xem xét báo cáo khai quật về tầng văn hóa (Stratum), phân loại đồ gốm và phương pháp định tuổi Carbon-14.',
          keyQuestions: 'Hiện vật thuộc thời kỳ Đồ Đồng (Bronze Age) hay Đồ Sắt (Iron Age)? Có dấu hiệu hỏa hoạn/phá hủy không?'
        },
        {
          step: 3,
          name: 'Giải mã Văn khắc & Ngôn ngữ Cổ (Epigraphy)',
          desc: 'Phân tích các minh văn khắc trên đá, mảnh gốm (Ostraca) hoặc ấn triện (Bullae) bằng chữ tượng hình, Aram cổ hoặc Cổ Hebrew.',
          keyQuestions: 'Nội dung văn khắc có nhắc đến tên nhân vật, triều đại hay danh xưng Thiên Chúa (YHWH) không?'
        },
        {
          step: 4,
          name: 'Đối chiếu Khách quan với Bản văn Kinh Thánh (Biblical Correlation)',
          desc: 'So sánh dữ kiện khảo cổ với các biến cố được ghi chép trong Sách Các Vua, Sử Biên Niên hay sách Tin Mừng mà không khiên cưỡng áp đặt.',
          keyQuestions: 'Phát hiện này làm sáng tỏ hoặc thách thức những nhận định truyền thống nào?'
        }
      ],
      requiredSources: ['Báo cáo khảo cổ từ Israel Antiquities Authority (IAA)', 'Văn khố Albright Institute of Archaeological Research', 'Bản Đồ 3D Địa Danh Kinh Thánh VERIDU'],
      structureTemplate: [
        { section: 'I. Bối cảnh Khai quật & Vị trí Di chỉ', guidance: 'Giới thiệu lịch sử phát hiện, nhà khảo cổ chỉ đạo và vị trí địa lý.' },
        { section: 'II. Hiện vật & Dữ liệu Khoa học', guidance: 'Trình bày ảnh chụp, sơ đồ địa tầng, bản dịch văn khắc nguyên gốc.' },
        { section: 'III. Đối chiếu Ký thuật Kinh Thánh', guidance: 'Đặt hiện vật cạnh các chương mục sách Kinh Thánh tương quan.' },
        { section: 'IV. Ý nghĩa Thần học & Hộ giáo', guidance: 'Đánh giá giá trị củng cố đức tin và hiểu biết về thế giới cổ đại.' }
      ],
      exemplaryQuestion: 'Phát hiện ấn triện Bulla mang tên Vua Ê-dê-ki-a và Ngôn sứ Isaia tại Đồi Ophel có ý nghĩa gì đối với tính xác thực lịch sử của Cựu Ước?'
    }
  },
  {
    id: 'boi-canh',
    name: 'Bối Cảnh Lịch Sử & ANE',
    slug: 'boi-canh',
    iconName: 'Compass',
    color: '#8b5cf6',
    gradient: 'from-purple-500/20 via-purple-600/10 to-transparent',
    badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    heroImage: 'https://images.unsplash.com/photo-1548625361-9c8eb25c56df?q=80&w=1200&auto=format&fit=crop',
    quote: '“Muốn hiểu Lời Chúa phán với con người, phải hiểu thế giới mà con người đó đang sinh sống.”',
    scriptureRef: 'Lịch Sử Cứu Độ',
    description: 'Tái hiện không gian văn hóa, xã hội, luật pháp và tư tưởng của vùng Cận Đông Cổ Đại (Lưỡng Hà, Ai Cập, Canaan) và thế giới Hy-La thế kỷ thứ I.',
    focalPoints: ['Bộ Luật Hammurabi & Giao ước Hittite', 'Chế độ Nô lệ & Kinh tế Thế kỷ I', 'Các Đảng phái Do Thái (Pharisêu, Sa-đốc)', 'Chính sách Thuế khóa Đế chế La Mã'],
    methodology: {
      title: 'Phương Pháp Sử Liệu So Sánh Văn Hóa (Comparative Method)',
      subtitle: 'Tái hiện bức tranh xã hội học để thấu thị căn tính Do Thái giáo và bối cảnh Tin Mừng',
      frameworkName: 'Socio-Historical & ANE Comparative Framework',
      steps: [
        {
          step: 1,
          name: 'Thu thập Sử liệu Ngoài Kinh Thánh (Extrabiblical Sources)',
          desc: 'Nghiên cứu tác phẩm của các sử gia cổ đại (Josephus Flavius, Philo Alexandria, Tacitus, Suetonius) và các bia ký Ai Cập/Babylon.',
          keyQuestions: 'Thế giới bên ngoài ghi chép thế nào về thời kỳ này?'
        },
        {
          step: 2,
          name: 'So sánh Thiết chế Xã hội & Luật pháp (Legal & Social Structures)',
          desc: 'Đặt các điều khoản luân lý và nghi thức Kinh Thánh bên cạnh các bộ luật đồng thời để thấy tính siêu việt và nét đặc thù Do Thái giáo.',
          keyQuestions: 'Luật pháp Môsê có điểm gì giống và khác biệt hoàn toàn với luật Hammurabi hay luật Lipit-Ishtar?'
        },
        {
          step: 3,
          name: 'Khảo sát Cấu trúc Quyền lực & Đảng phái (Power Dynamics)',
          desc: 'Làm rõ sự tương tác giữa chính quyền đô hộ ngoại bang (Rôma, Ba Tư), giới quý tộc tư tế Đền Thờ và phong trào bình dân.',
          keyQuestions: 'Những căng thẳng tôn giáo - chính trị nào trực tiếp dẫn tới biến cố trảm quyết Gioan hay cuộc thương khó Chúa Giêsu?'
        }
      ],
      requiredSources: ['Tác phẩm của Josephus: Antiquities of the Jews', 'Bộ Luật Cận Đông: ANET (Ancient Near Eastern Texts)', 'Sách Giáo Lý CCC Phần Bối Cảnh Lịch Sử'],
      structureTemplate: [
        { section: 'I. Bức tranh Xã hội & Địa chính trị', guidance: 'Khắc họa hoàn cảnh lịch sử cụ thể của thế giới đương đại.' },
        { section: 'II. Khảo sát Thiết chế & Phong tục', guidance: 'Phân tích tập tục, ngôn ngữ giao tế và cấu trúc cộng đồng.' },
        { section: 'III. Sự Thâm nhập & Phản ứng của Dân Chúa', guidance: 'Cách dân Israel hoặc Giáo Hội sơ khai giữ vững căn tính đức tin.' },
        { section: 'IV. Ánh sáng Soi chiếu Bản văn Tin Mừng', guidance: 'Giải mã những câu nói của Chúa Giêsu vốn chỉ hiểu được qua bối cảnh thời đó.' }
      ],
      exemplaryQuestion: 'Chính sách thuế vụ và sự hiện diện của quân đội La Mã tại miền Galilê thời Chúa Giêsu đã định hình tâm lý mong chờ Đấng Cứu Thế ra sao?'
    }
  },
  {
    id: 'nhan-vat',
    name: 'Nhân Vật Thánh Kinh',
    slug: 'nhan-vat',
    iconName: 'UserCheck',
    color: '#10b981',
    gradient: 'from-emerald-500/20 via-emerald-600/10 to-transparent',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    heroImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1200&auto=format&fit=crop',
    quote: '“Họ là những con người bằng xương bằng thịt như chúng ta, nhưng đã được Thiên Chúa biến đổi bởi ơn gọi và lòng tín thác.”',
    scriptureRef: 'Thư Do Thái 11',
    description: 'Chân dung, tiến trình ơn gọi, đức hạnh anh hùng và vai trò cứu chuộc của các nhân vật Cựu Ước, các Tông đồ và chứng nhân Tân Ước trong dòng lịch sử cứu độ.',
    focalPoints: ['Tiến trình Ơn gọi & Thử thách', 'Ý nghĩa Danh xưng Nguyên ngữ', 'Khủng hoảng Đức tin & Sự Hoán cải', 'Hình bóng Tiền trưng Đức Kitô'],
    methodology: {
      title: 'Phương Pháp Khảo Luận Tiểu Sử Thần Học (Biblical Biography)',
      subtitle: 'Khám phá con người đức tin từ khủng hoảng nội tâm đến vai trò trung gian giao ước',
      frameworkName: 'Theological Biographical Analysis',
      steps: [
        {
          step: 1,
          name: 'Khảo sát Danh xưng & Gia phả (Name & Genealogies)',
          desc: 'Phân tích ý nghĩa tên gọi trong tiếng Hebrew/Hy Lạp, chi tộc xuất thân và những lời sấm gắn liền với sự sinh hạ.',
          keyQuestions: 'Tên gọi của nhân vật chứa đựng ơn gọi hay sứ vụ cứu chuộc nào?'
        },
        {
          step: 2,
          name: 'Khủng hoảng & Khúc quanh Hoán cải (Crisis & Conversion)',
          desc: 'Nhìn nhận chân thực các yếu đuối, lỗi lầm và sự sa ngã của nhân vật, từ đó làm nổi bật quyền năng biến đổi của Ơn Chúa.',
          keyQuestions: 'Biến cố nào là bước ngoặt quyết định cuộc đời đức tin của nhân vật?'
        },
        {
          step: 3,
          name: 'Mối tương quan với Đấng Cứu Độ (Typological Fulfillment)',
          desc: 'Chỉ ra nhân vật phản chiếu hình bóng nào của Đức Kitô: Ngôn sứ bị từ chối, Vua công chính, Tư tế chịu đau khổ, hay Bạn của chàng rể.',
          keyQuestions: 'Nhân vật này chuẩn bị tâm trí nhân loại đón nhận Chúa Giêsu ở khía cạnh nào?'
        }
      ],
      requiredSources: ['Bản văn Kinh Thánh theo quy điển', 'Mục lục 60 Nhân Vật Thánh Kinh VERIDU', 'Giáo lý về các Nhân Vật Cựu Ước của ĐTC Phanxicô & Bênađictô XVI'],
      structureTemplate: [
        { section: 'I. Căn cước & Tiếng Gọi Đầu Tiên', guidance: 'Xuất thân, hoàn cảnh gia đình và cuộc diện kiến Thiên Chúa đầu tiên.' },
        { section: 'II. Những Thử thách Giữa Sa mạc Cuộc đời', guidance: 'Các cuộc thanh luyện đức tin, sự cám dỗ và khủng hoảng nội tâm.' },
        { section: 'III. Đỉnh cao Sứ mạng & Di sản Đức tin', guidance: 'Chiến thắng của ơn sủng và di sản để lại cho muôn thế hệ Dân Chúa.' },
        { section: 'IV. Bài học Hiện sinh Cho Người Kitô Hữu', guidance: 'Những giá trị cốt lõi soi rọi cho cuộc sống đức tin hiện đại.' }
      ],
      exemplaryQuestion: 'Hành trình đức tin của Tổ phụ Áp-ra-ham từ lệnh truyền rời bỏ quê hương (St 12) đến biến cố hiến tế I-xa-ác trên núi Moriah (St 22) dạy chúng ta điều gì về sự vâng phục tuyệt đối?'
    }
  },
  {
    id: 'than-hoc',
    name: 'Thần Học & Tín Lý',
    slug: 'than-hoc',
    iconName: 'ScrollText',
    color: '#ea580c',
    gradient: 'from-orange-500/20 via-orange-600/10 to-transparent',
    badgeColor: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
    heroImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1200&auto=format&fit=crop',
    quote: '“Fides quaerens intellectum — Đức Tin tìm kiếm sự hiểu biết.”',
    scriptureRef: 'Thánh Anselmô',
    description: 'Đào sâu các mầu nhiệm cốt lõi của Đức tin Công giáo: Thiên Chúa Ba Ngôi, Kitô học, Thánh Mẫu học, Ân sủng luận và Cánh chung học dưới sự hướng dẫn của Huấn quyền.',
    focalPoints: ['Mầu nhiệm Thiên Chúa Ba Ngôi', 'Kitô Học & Sự Nhập Thể', 'Bốn Đặc Ân Thánh Mẫu', 'Ân Sủng & Ơn Công Chính Hóa'],
    methodology: {
      title: 'Phương Pháp Thần Học Kinh Viện & Tín Lý Học (Dogmatic Methodology)',
      subtitle: 'Hòa giải đức tin và lý trí theo truyền thống Thánh Tôma Aquinô',
      frameworkName: 'Thomistic & Magisterial Synthesis Framework',
      steps: [
        {
          step: 1,
          name: 'Xác định Hiện Tín & Vấn Nạn Thần Học (Status Quaestionis)',
          desc: 'Trình bày chính xác định đề thần học cần khảo sát, các hiểu lầm lịch sử hoặc các lạc giáo từng xuất hiện.',
          keyQuestions: 'Giáo lý này giải quyết nan đề nào về tương quan giữa Thiên Chúa và con người?'
        },
        {
          step: 2,
          name: 'Dẫn xuất Chứng cứ Thánh Kinh (Sed Contra / Scriptural Foundation)',
          desc: 'Thiết lập nền tảng không thể lay chuyển từ các bản văn Cựu và Tân Ước chuẩn xác.',
          keyQuestions: 'Chính Chúa Kitô và các Tông đồ đã khẳng định chân lý này như thế nào?'
        },
        {
          step: 3,
          name: 'Đối chiếu Giáo Phụ & Huấn Quyền Công Đồng (Tradition & Magisterium)',
          desc: 'Trích dẫn tuyên tín từ các Công Đồng chung (Nicêa, Êphêsô, Trentô, Vatican II) và Sách Giáo Lý CCC.',
          keyQuestions: 'Tín điều này đã được xác quyết qua những công thức định tín phụng vụ nào?'
        },
        {
          step: 4,
          name: 'Lập Luận Thần Học Bằng Lý Trí Siêu Nhiên (Respondeo / Speculative Reasoning)',
          desc: 'Sử dụng triết học Kitô giáo để làm sáng tỏ tính hợp lý và vẻ đẹp thánh thiêng của mầu nhiệm đức tin.',
          keyQuestions: 'Lý trí đức tin có thể nhận ra sự khôn ngoan vô biên của Thiên Chúa nơi tín điều này ra sao?'
        }
      ],
      requiredSources: ['Sách Giáo Lý Hội Thánh Công Giáo (CCC)', 'Bộ Sưu Tập Tín Điều Denzinger-Hünermann', 'Bộ Tổng Luận Thần Học (Summa Theologiae) của Thánh Tôma Aquinô'],
      structureTemplate: [
        { section: 'I. Đặt Vấn Đề & Bối Cảnh Lạc Giáo Lịch Sử', guidance: 'Nêu bật lý do Hội Thánh buộc phải ban hành tín lý rõ ràng.' },
        { section: 'II. Nền Tảng Thánh Kinh Cốt Lõi', guidance: 'Phân tích các câu Lời Chúa chứa đựng hạt giống chân lý.' },
        { section: 'III. Quá Trình Định Tín Của Huấn Quyền', guidance: 'Trích dẫn quyết định của các Công Đồng Chung.' },
        { section: 'IV. Chiều Sâu Triết Học & Thần Học Suy Lý', guidance: 'Phân tích bằng lý trí được đức tin chiếu soi.' },
        { section: 'V. Tầm Quan Trọng Cho Đời Sống Thiêng Liêng', guidance: 'Tín điều này củng cố lòng mến và hy vọng của chúng ta thế nào?' }
      ],
      exemplaryQuestion: 'Làm thế nào để diễn giải Tín Điều Đức Maria Vô Nhiễm Nguyên Tội mà vẫn giữ vững tính phổ quát của Ơn Cứu Chuộc duy nhất nơi Đức Giêsu Kitô?'
    }
  },
  {
    id: 'suy-niem',
    name: 'Linh Đạo & Suy Niệm',
    slug: 'suy-niem',
    iconName: 'Heart',
    color: '#e11d48',
    gradient: 'from-rose-500/20 via-rose-600/10 to-transparent',
    badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    heroImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1200&auto=format&fit=crop',
    quote: '“Không phải người ta biết nhiều làm cho tâm hồn no thỏa, nhưng là cảm nếm sự việc từ bên trong.”',
    scriptureRef: 'Thánh Inhaxiô Loyola',
    description: 'Nuôi dưỡng đời sống nội tâm qua việc thực hành cầu nguyện với Lời Chúa, kinh nghiệm các trường phái linh đạo Kitô giáo và nghệ thuật phân định thiêng liêng.',
    focalPoints: ['Phương Pháp Lectio Divina', 'Linh Thao Inhaxiô (Linh Điểm)', 'Linh Đạo Đan Tu Carmel & Têrêsa', 'Lời Nguyện Trầm Lắng & Chiêm Niệm'],
    methodology: {
      title: 'Quy Trình Cầu Nguyện Lectio Divina 4 Bước',
      subtitle: 'Nghệ thuật lắng nghe tiếng Chúa và biến đổi tâm hồn qua Lời Hằng Sống',
      frameworkName: 'Lectio Divina & Contemplative Framework',
      steps: [
        {
          step: 1,
          name: 'Lectio (Đọc Lời Chúa trong Lặng Câm)',
          desc: 'Đọc chậm rãi, lập đi lập lại bản văn Kinh Thánh với tâm thế cung kính, mở rộng tai lòng đón nhận từng chữ Lời Chúa.',
          keyQuestions: 'Bản văn này nói điều gì tự thân nó? Từ ngữ nào chạm sâu vào tâm khảm tôi?'
        },
        {
          step: 2,
          name: 'Meditatio (Suy Gẫm & Nghiền Ngẫm)',
          desc: 'Để Lời Chúa đối thoại với cuộc đời thực tế, đào sâu ý nghĩa và nhận diện xem Chúa đang phán dạy điều gì riêng cho tôi hôm nay.',
          keyQuestions: 'Chúa đang muốn tôi từ bỏ điều gì? Ngài đang mời gọi tôi sống nhân đức nào?'
        },
        {
          step: 3,
          name: 'Oratio (Cầu Nguyện & Thưa Chuyện)',
          desc: 'Từ suy gẫm biến thành lời cầu nguyện tự nhiên: chúc tụng, tạ ơn, thống hối và nài xin ơn thánh Chúa trợ lực.',
          keyQuestions: 'Tâm hồn tôi muốn dâng lên Chúa lời tâm sự gì lúc này?'
        },
        {
          step: 4,
          name: 'Contemplatio (Chiêm Niệm & Nghỉ An Trong Chúa)',
          desc: 'Vượt qua mọi ngôn từ, đắm chìm trong sự hiện diện bình an của Thiên Chúa và để Ngài biến đổi con tim.',
          keyQuestions: 'Tôi đang cảm nghiệm tình yêu Chúa chở che cuộc đời mình sâu đậm thế nào?'
        }
      ],
      requiredSources: ['Sách Tin Mừng & Thánh Vịnh Hằng Ngày', 'Linh Thao (Spiritual Exercises) Thánh Inhaxiô', 'Gương Chúa Giêsu (De Imitatione Christi)'],
      structureTemplate: [
        { section: 'I. Đoạn Bản Văn Linh Thao Trọng Tâm', guidance: 'Trích dẫn 1 câu Lời Chúa cốt tủy làm điểm tựa suy niệm.' },
        { section: 'II. Khơi Mở Cảnh Vực Tâm Linh', guidance: 'Dùng trí tưởng tượng thiêng liêng để hiện diện trong khung cảnh Kinh Thánh.' },
        { section: 'III. Những Xung Đột & Tiếng Vọng Tâm Hồn', guidance: 'Đối thoại chân thành giữa sự yếu đuối của bản thân và lòng từ bi của Chúa.' },
        { section: 'IV. Lời Nguyện Dâng Hiến & Hành Động Biến Đổi', guidance: 'Kết thúc bằng một lời nguyện thiết tha và một hành vi bác ái cụ thể trong ngày.' }
      ],
      exemplaryQuestion: 'Làm thế nào để bước vào sự thinh lặng chiêm niệm giữa sự ồn ào của nhịp sống hiện đại theo gương Thánh Têrêsa Avila?'
    }
  },
  {
    id: 'cac-thanh',
    name: 'Các Thánh & Giáo Phụ',
    slug: 'cac-thanh',
    iconName: 'Cross',
    color: '#059669',
    gradient: 'from-teal-500/20 via-teal-600/10 to-transparent',
    badgeColor: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30',
    heroImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1200&auto=format&fit=crop',
    quote: '“Hỡi linh hồn tôi, hãy tỉnh thức, các Thánh đã sống và đã chiến thắng nhờ Máu Chiên Thiên Chúa!”',
    scriptureRef: 'Phụng Vụ Các Thánh',
    description: 'Kho tàng tư tưởng của các Thánh Giáo phụ (Patristics) thời sơ khai, các vị Tử đạo anh dũng và các Thánh Tiến sĩ Hội Thánh định hình kho tàng văn hóa Kitô giáo.',
    focalPoints: ['Tác phẩm Tự Thuật (Confessiones)', 'Các Tông Phụ & Giáo Phụ Hy Lạp / Latinh', 'Linh Đạo Tử Đạo Sơ Khai', 'Các Nữ Tiến Sĩ Hội Thánh'],
    methodology: {
      title: 'Phương Pháp Giáo Phụ Học & Hạnh Tích Học (Patristic & Hagiographical Method)',
      subtitle: 'Khám phá đức tin sống động qua gương các nhân chứng lịch sử',
      frameworkName: 'Patristic & Hagiographical Framework',
      steps: [
        {
          step: 1,
          name: 'Nghiên cứu Văn kiện Nguyên bản (Primary Patristic Texts)',
          desc: 'Tiếp cận các bức thư, chuyên luận và bài giảng gốc của các Giáo Phụ (như Thánh Ignatiô Antiôkia, Thánh Irênê, Thánh Augustinô).',
          keyQuestions: 'Tác phẩm này được viết trong bối cảnh chống lại trào lưu sai lạc nào?'
        },
        {
          step: 2,
          name: 'Phân tích Nhân đức Anh hùng (Heroic Virtues)',
          desc: 'Khảo sát cách vị Thánh thực thi 3 nhân đức đối thần (Tin, Cậy, Mến) và 4 nhân đức nhân bản trong hoàn cảnh ngặt nghèo.',
          keyQuestions: 'Nét độc đáo trong con đường nên thánh của vị này là gì?'
        },
        {
          step: 3,
          name: 'Di sản Thần học Cho Hội Thánh (Doctor of the Church Legacy)',
          desc: 'Đánh giá những đóng góp trường tồn của vị Thánh đối với việc bảo vệ đức tin và làm phong phú kho tàng linh đạo Công giáo.',
          keyQuestions: 'Vì sao vị Thánh này được Hội Thánh tôn phong làm Tiến sĩ Hội Thánh (Doctor Ecclesiae)?'
        }
      ],
      requiredSources: ['Tuyển tập Patrologia Latina / Patrologia Graeca (Migne)', 'Tác phẩm Confessiones của Thánh Âu-tinh', 'Hạnh Các Thánh (Acta Sanctorum)'],
      structureTemplate: [
        { section: 'I. Cuộc Đời & Tiến Trình Hoán Cải', guidance: 'Tiểu sử tóm tắt, hoàn cảnh gia đình và bước ngoặt ơn gọi.' },
        { section: 'II. Cuộc Chiến Thiêng Liêng & Nhân Đức Anh Hùng', guidance: 'Những thách đố nội tâm, cuộc bách hại và sự kiên trì trung tín.' },
        { section: 'III. Tư Tưởng Thần Học Cốt Lõi', guidance: 'Trích dẫn và phân tích các áng văn phẩm tiêu biểu của vị Thánh.' },
        { section: 'IV. Di Sản & Ơn Cầu Bầu Cho Hôm Nay', guidance: 'Ý nghĩa của vị Thánh đối với người Kitô hữu thời đại mới.' }
      ],
      exemplaryQuestion: "Tác phẩm 'Chống Lạc Giáo' (Adversus Haereses) của Thánh Irênê thành Lyon đã đặt nền tảng thế nào cho quy tắc Đức Tin và Truyền Thống Tông Đồ?"
    }
  },
  {
    id: 'phung-vu',
    name: 'Phụng Vụ & Bí Tích',
    slug: 'phung-vu',
    iconName: 'Church',
    color: '#4f46e5',
    gradient: 'from-indigo-500/20 via-indigo-600/10 to-transparent',
    badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    heroImage: 'https://images.unsplash.com/photo-1548625361-9c8eb25c56df?q=80&w=1200&auto=format&fit=crop',
    quote: '“Phụng vụ là tột đỉnh mà mọi hoạt động của Hội Thánh hướng tới, đồng thời là nguồn mạch phát sinh mọi năng lực của Hội Thánh.”',
    scriptureRef: 'Sacrosanctum Concilium, 10',
    description: 'Khảo sát nguồn gốc, cử hành và thần học của 7 Bí tích, Năm Phụng vụ, Kinh Nguyện Thánh Thể và nghệ thuật thánh thiêng hiệp thông cùng Giáo Hội.',
    focalPoints: ['Thần học Bí tích Thánh Thể', 'Phương Pháp Dẫn Nhập Mầu Nhiệm (Mystagogy)', 'Năm Phụng Vụ & Các Chu Kỳ Lễ', 'Kiến Trúc & Nghệ Thuật Thánh'],
    methodology: {
      title: 'Phương Pháp Dẫn Nhập Mầu Nhiệm Phụng Vụ (Mystagogical Catechesis)',
      subtitle: 'Từ dấu chỉ hữu hình đi sâu vào thực tại thiêng liêng vô hình của Ơn Cứu Độ',
      frameworkName: 'Mystagogical & Sacramental Analysis Framework',
      steps: [
        {
          step: 1,
          name: 'Khảo sát Dấu chỉ Khả giác & Nghi thức (Rites & Visible Signs)',
          desc: 'Xem xét các cử điệu, chất thể (Nước, Dầu, Bánh, Rượu) và các lời mô thức thánh hiến trong nghi thức cử hành.',
          keyQuestions: 'Hành vi phụng vụ này mang biểu tượng nguyên sơ nào trong Cựu Ước?'
        },
        {
          step: 2,
          name: 'Mở khóa Thực tại Vô hình (Sacramental Grace)',
          desc: 'Giải thích ơn bí tích vô hình và sự biến đổi bản thể (Transubstantiatio) được thực hiện bởi Chúa Thánh Thần (Epiklesis).',
          keyQuestions: 'Chúa Kitô đang ban ơn thánh thần linh nào qua dấu chỉ khả giác này?'
        },
        {
          step: 3,
          name: 'Kết nối Phụng vụ với Đời sống Chứng tá (Lex Orandi, Lex Credendi, Lex Vivendi)',
          desc: 'Quy luật cầu nguyện định hình quy luật đức tin và dẫn tới quy luật đời sống luân lý dấn thân giữa trần thế.',
          keyQuestions: 'Cử hành phụng vụ này thúc đẩy người tín hữu sống tinh thần hiệp hành và loan báo Tin Mừng ra sao?'
        }
      ],
      requiredSources: ['Hiến chế Phụng Vụ Thánh Sacrosanctum Concilium', 'Quy Chế Tổng Quát Sách Lễ Rôma (GIRM)', 'Sách Giáo Lý Hội Thánh Công Giáo Phần II'],
      structureTemplate: [
        { section: 'I. Khởi Nguồn Thánh Kinh Của Nghi Thức', guidance: 'Tìm kiếm nguồn gốc biểu tượng trong Lịch sử Cứu Độ Cựu Ước.' },
        { section: 'II. Cấu Trúc Phụng Vụ & Diễn Tiến Cử Hành', guidance: 'Phân tích thứ tự các phần của nghi lễ thánh thiêng.' },
        { section: 'III. Thần Học Mầu Nhiệm Phụng Vụ', guidance: 'Giải mã ý nghĩa thần học sâu xa của các lời kinh và cử điệu.' },
        { section: 'IV. Sống Mầu Nhiệm Giữa Đời Thường', guidance: 'Đưa ân sủng bàn tiệc thánh vào môi trường công việc và gia đình.' }
      ],
      exemplaryQuestion: 'Kinh Khẩn Cầu Thánh Thần (Epiklesis) trong Kinh Nguyện Thánh Thể đóng vai trò quyết định như thế nào đối với hiệu năng của Bí tích Tạ Ơn?'
    }
  }
];

// ─────────────────────────────────────────────────────────────
// 2. MA TRẬN 3 TRỤC CHO SMART RESEARCH EXPLORER (HỆ THỐNG GỢI Ý)
// ─────────────────────────────────────────────────────────────

export const RESEARCH_SUBJECTS: ResearchSubject[] = [
  { id: 'sub-01', name: 'Tổ phụ Áp-ra-ham', role: 'Cha của những kẻ tin', testament: 'Cựu Ước', keyScriptures: 'St 12 - 25', hasArticle: false },
  { id: 'sub-02', name: 'Ông Môsê', role: 'Nhà lập pháp & Ngôn sứ giao ước', testament: 'Cựu Ước', keyScriptures: 'Xh, Lv, Ds, Đnl', hasArticle: true, articleSlug: 'hanh-trinh-mose-va-israel-tuong-tac' },
  { id: 'sub-03', name: 'Vua Đa-vít', role: 'Vị vua theo lòng Chúa mong ước', testament: 'Cựu Ước', keyScriptures: '1-2 Sm, Tv', hasArticle: false },
  { id: 'sub-04', name: 'Ngôn sứ Isaia', role: 'Ngôn sứ của Đấng Thiên Sai & Tôi Tớ Đau Khổ', testament: 'Cựu Ước', keyScriptures: 'Is 1 - 66', hasArticle: false },
  { id: 'sub-05', name: 'Ngôn sứ Êlia', role: 'Ngọn lửa bảo vệ độc thần giáo', testament: 'Cựu Ước', keyScriptures: '1 V 17 - 2 V 2', hasArticle: true, articleSlug: 'ngon-su-elia' },
  { id: 'sub-06', name: 'Bà Rút (Ruth)', role: 'Tổ mẫu ngoại bang & Mầu nhiệm Goel', testament: 'Cựu Ước', keyScriptures: 'Sách Rút 1 - 4', hasArticle: true, articleSlug: 'phan-tich-sach-rut-quyen-thua-ke-va-hinh-bong-dang-cuu-the' },
  { id: 'sub-07', name: 'Thánh Gioan Tẩy Giả', role: 'Tiền hô dọn đường & Tiếng kêu sa mạc', testament: 'Tân Ước', keyScriptures: 'Mt 3, Ga 1, 3', hasArticle: true, articleSlug: 'tai-sao-gioan-tay-gia-bi-tram-quyet' },
  { id: 'sub-08', name: 'Đức Trinh Nữ Maria', role: 'Mẹ Thiên Chúa (Theotokos) & Hòm Bia Mới', testament: 'Tân Ước', keyScriptures: 'Lc 1 - 2, Ga 2, 19', hasArticle: true, articleSlug: 'duc-maria-co-thuc-su-duoc-hon-xac-len-troi' },
  { id: 'sub-09', name: 'Thánh Phaolô Tông Đồ', role: 'Tông đồ dân ngoại & Tiến sĩ ân sủng', testament: 'Tân Ước', keyScriptures: 'Cv 9 - 28, Các Thư tín', hasArticle: false },
  { id: 'sub-10', name: 'Thánh Phêrô Tông Đồ', role: 'Thủ lãnh tông đồ & Đá tảng Hội Thánh', testament: 'Tân Ước', keyScriptures: 'Mt 16, Ga 21, 1-2 Pr', hasArticle: false },
  { id: 'sub-11', name: 'Thánh Gioan Tông Đồ', role: 'Môn đệ Chúa yêu & Thần học gia Ngôi Lời', testament: 'Tân Ước', keyScriptures: 'Tin Mừng Ga, Kh', hasArticle: false },
  { id: 'sub-12', name: 'Thánh Maria Mác-đa-la', role: 'Tông đồ của các Tông đồ (Apostola Apostolorum)', testament: 'Tân Ước', keyScriptures: 'Lc 8, Ga 20', hasArticle: true, articleSlug: 'thanh-maria-magdalena' },
  { id: 'sub-13', name: 'Thánh Augustinô', role: 'Tiến sĩ Hội Thánh & Nhà tư tưởng ân sủng', testament: 'Giáo Phụ & Tiến Sĩ', keyScriptures: 'Confessiones, De Civitate Dei', hasArticle: true, articleSlug: 'thanh-augustino-la-ai' },
  { id: 'sub-14', name: 'Thánh Tôma Aquinô', role: 'Tiến sĩ Thiên Thần & Tổng Luận Thần Học', testament: 'Giáo Phụ & Tiến Sĩ', keyScriptures: 'Summa Theologiae', hasArticle: false },
  { id: 'sub-15', name: 'Thánh Irênê Lyon', role: 'Tiến sĩ Hiệp Nhất & Chống lạc giáo Gnosticism', testament: 'Giáo Phụ & Tiến Sĩ', keyScriptures: 'Adversus Haereses', hasArticle: false }
];

export const THEOLOGICAL_THEMES: TheologicalTheme[] = [
  {
    id: 'theme-01',
    title: 'Giao Ước & Lời Hứa Cứu Độ (Berit & Covenant)',
    scope: 'Sự tiến triển từ Giao ước Nô-ê, Áp-ra-ham, Sinai đến Giao Ước Mới vĩnh cửu trong Máu Đức Kitô.',
    category: 'Kinh Thánh',
    centralQuestion: 'Làm thế nào tính bất biến của Giao ước Thiên Chúa làm nền tảng cho sự trung tín và hy vọng Kitô giáo?'
  },
  {
    id: 'theme-02',
    title: "Năm Toàn Xá (Yovel) & Sự Chuộc Lại Đất Đai (Ge'ullah)",
    scope: 'Chiều kích kinh tế - thần học của Luật Lêvi 25 hướng tới công bình xã hội và giải thoát thiêng liêng.',
    category: 'Bối Cảnh & Luật Pháp',
    centralQuestion: 'Định chế Năm Toàn Xá dạy chúng ta điều gì về quyền sở hữu đất đai và mối quan tâm tới người nghèo?'
  },
  {
    id: 'theme-03',
    title: 'Bí Tích Thánh Thể & Hy Tế Tạ Ơn (Eucharistia & Anamnesis)',
    scope: 'Mầu nhiệm Tiệc Ly, cuộc khổ nạn Canvê và sự hiện diện thực sự (Real Presence) của Chúa Kitô.',
    category: 'Phụng Vụ & Tín Lý',
    centralQuestion: 'Khái niệm Tưởng niệm (Zikkaron / Anamnesis) đưa biến cố Canvê hiện tại hóa trong mỗi Thánh Lễ ra sao?'
  },
  {
    id: 'theme-04',
    title: 'Ân Sủng & Ơn Công Chính Hóa (Gratia & Justificatio)',
    scope: 'Tương quan giữa Ơn ban nhưng không của Thiên Chúa và sự đáp trả tự do bằng đức tin và đức ái.',
    category: 'Thần Học & Tín Lý',
    centralQuestion: 'Thần học Phaolô và Công đồng Trentô định vị sự hòa hợp giữa đức tin và việc làm như thế nào?'
  },
  {
    id: 'theme-05',
    title: 'Cộng Đoàn Qumran & Các Bản Văn Biển Chết',
    scope: 'Bối cảnh tận thế luận của phái Essenes và ảnh hưởng tới việc hiểu thế giới Tân Ước sơ khai.',
    category: 'Khảo Cổ Kinh Thánh',
    centralQuestion: 'Những điểm tương đồng và phân biệt căn bản giữa đạo đức Qumran và Lời giảng của Chúa Giêsu là gì?'
  },
  {
    id: 'theme-06',
    title: 'Thánh Mẫu Học & Các Tín Điều Mẹ Thiên Chúa',
    scope: 'Vai trò của Mẹ Maria trong mầu nhiệm Nhập Thể, Ơn Cứu Chuộc và sự hiệp thông các Thánh.',
    category: 'Thần Học & Các Thánh',
    centralQuestion: 'Bốn đặc ân Thánh Mẫu (Mẹ Thiên Chúa, Trọn Đời Đồng Trinh, Vô Nhiễm Nguyên Tội, Hồn Xác Lên Trời) liên kết thế nào với Kitô học?'
  },
  {
    id: 'theme-07',
    title: 'Chiến Tranh Thiêng Liêng & Phân Định Thần Khí',
    scope: 'Kinh nghiệm vượt qua cám dỗ, đêm tối đức tin và nghệ thuật nhận biết ý Chúa trong cuộc sống.',
    category: 'Linh Đạo & Suy Niệm',
    centralQuestion: 'Quy tắc phân định thần khí của Thánh Inhaxiô giúp nhận diện các an ủi và sầu khổ thiêng liêng ra sao?'
  }
];

export const HISTORICAL_CONTEXTS: HistoricalContext[] = [
  {
    id: 'era-01',
    period: 'Thời Kỳ Các Tổ Phụ & Cận Đông Cổ Đại',
    yearRange: 'Khoảng thế kỷ XX - XIII TCN',
    significance: 'Hình thành lời hứa giao ước gia tộc giữa bối cảnh văn minh Lưỡng Hà và Canaan sơ kỳ.'
  },
  {
    id: 'era-02',
    period: 'Thời Xuất Hành & Lập Quốc',
    yearRange: 'Thế kỷ XIII - X TCN',
    significance: 'Giao ước Sinai, bộ luật Torah và sự thiết lập vương triều Đa-vít tại Giêrusalem.'
  },
  {
    id: 'era-03',
    period: 'Thời Kỳ Lưu Đày Babylon & Hậu Lưu Đày',
    yearRange: 'Năm 586 - 332 TCN',
    significance: 'Cuộc khủng hoảng đức tin mất đền thờ, sự bùng nổ của các ngôn sứ và sự hình thành quy điển kinh thánh.'
  },
  {
    id: 'era-04',
    period: 'Thời Kỳ Hy Lạp Hóa & Đế Chế La Mã Thế Kỷ I',
    yearRange: 'Năm 332 TCN - 100 SCN',
    significance: 'Bối cảnh Chúa Giêsu giáng sinh, hoạt động của các Tông đồ và cuộc khai sinh Hội Thánh sơ khai.'
  },
  {
    id: 'era-05',
    period: 'Thời Kỳ Các Thánh Giáo Phụ & Các Công Đồng Chung',
    yearRange: 'Thế kỷ II - VIII SCN',
    significance: 'Bảo vệ đức tin trước các lạc giáo, định hình Kinh Tin Kính Nicêa - Constantinôpôli và nền thần học cổ điển.'
  }
];

// ─────────────────────────────────────────────────────────────
// 3. KHOẢNG TRỐNG TRI THỨC TRÊN VERIDU (KNOWLEDGE GAPS RADAR)
// ─────────────────────────────────────────────────────────────
export const KNOWLEDGE_GAPS: KnowledgeGapItem[] = [
  {
    id: 'gap-01',
    type: 'Nhân Vật Thánh',
    title: 'Tổ Phụ Áp-ra-ham: Hành Trình Bỏ Xứ Đi Theo Tiếng Chúa',
    importance: 'Khẩn Cấp',
    reason: 'VERIDU đã có bài viết về Môsê, Rút, Gioan Tẩy Giả nhưng chưa có công trình khảo cứu chuyên sâu về Tổ phụ Áp-ra-ham — cội rễ đức tin của toàn bộ Cựu & Tân Ước.',
    suggestedAngle: 'Khảo sát giao ước cắt bì (St 17), sự cầu thay cho thành Sô-đôm (St 18) và mầu nhiệm núi Moriah (St 22).'
  },
  {
    id: 'gap-02',
    type: 'Nhân Vật Thánh',
    title: 'Thánh Phaolô: Thần Học Về Thập Giá Và Quyền Năng Phục Sinh',
    importance: 'Khẩn Cấp',
    reason: 'Thư Rôma và Galát của Phaolô là xương sống cho thần học ân sủng, hiện thư viện mới chỉ có bài ngắn về Tội Tổ Tông.',
    suggestedAngle: 'Phân tích trải nghiệm hoán cải Đamát và chiến lược loan báo Tin Mừng cho các thành bang ngoại giáo.'
  },
  {
    id: 'gap-03',
    type: 'Sách Kinh Thánh',
    title: 'Sách Khải Huyền: Bức Tranh Toàn Triệt Về Chiên Thiên Chúa Thắng Trận',
    importance: 'Ưu Tiên Cao',
    reason: 'Đây là sách duy nhất mang thể loại khải huyền thuần túy trong Tân Ước, rất dễ bị hiểu lầm nếu thiếu chú giải chính thống Công giáo.',
    suggestedAngle: 'Khảo sát phụng vụ thiên quốc, ý nghĩa 7 dấu ấn và sự hiện diện của Hội Thánh chiến đấu trên trần thế.'
  },
  {
    id: 'gap-04',
    type: 'Tín Lý Trọng Tâm',
    title: 'Thần Học Về Luyện Ngục & Các Bí Tích Sau Cùng',
    importance: 'Ưu Tiên Cao',
    reason: 'Độc giả thường xuyên tìm kiếm câu trả lời về Luyện ngục và việc cầu nguyện cho các linh hồn đã qua đời dưới lăng kính Lòng Thương Xót.',
    suggestedAngle: 'Đối chiếu sách Macabê 2 (12:38-46), giáo huấn Công đồng Trentô và Sách Giáo Lý CCC 1030-1032.'
  },
  {
    id: 'gap-05',
    type: 'Sách Kinh Thánh',
    title: "Sách Giảng Viên (Qohelet): 'Phù Vân Của Mọi Phù Vân' Và Ý Nghĩa Đời Người",
    importance: 'Ưu Tiên Cao',
    reason: 'Dòng văn chương khôn ngoan sâu sắc nhất Cựu Ước chất vấn sự hữu hạn của đời sống dưới ánh mặt trời.',
    suggestedAngle: 'Phân tích nghịch lý giữa kiếp nhân sinh ngắn ngủi và mệnh lệnh kính sợ Thiên Chúa.'
  }
];

// ─────────────────────────────────────────────────────────────
// 4. DANH MỤC 24 ĐỀ TÀI NGHIÊN CỨU TUYỂN CHỌN TRỌNG ĐIỂM
// ─────────────────────────────────────────────────────────────
export const CURATED_RESEARCH_TOPICS: CuratedTopic[] = [
  // Kinh Thánh
  {
    id: 'top-kb-01',
    categoryId: 'kinh-thanh',
    categoryName: 'Kinh Thánh & Chú Giải',
    title: 'Thần Học Giao Ước (Berit): Từ Sinai Đến Bàn Tiệc Ly Của Đấng Thiên Sai',
    subtitle: 'Khảo sát cấu trúc hiệp ước Cận Đông và đỉnh cao Giao ước mới trong Máu Đức Kitô',
    priority: 'Khẩn Cấp',
    scope: 'Đối chiếu sách Xuất Hành 24 với Thư gửi tín hữu Do Thái 9, làm rõ tính liên tục và sự kiện toàn của Lời hứa cứu độ qua các thế kỷ.',
    methodologyBrief: 'Áp dụng chú giải liên văn bản (Typology) và khảo sát ngữ nguyên học từ Berit (Hebrew) sang Diatheke (Hy Lạp).',
    targetBiblicalPassages: ['Xh 24:1-11', 'Gr 31:31-34', 'Dt 9:11-28', 'Mt 26:26-29'],
    tags: ['Giao Ước', 'Berit', 'Xuất Hành', 'Thư Do Thái', 'Tiệc Ly'],
    relatedCharacter: 'Môsê',
    relatedEra: 'Thời Kỳ Các Tổ Phụ & Cận Đông Cổ Đại'
  },
  {
    id: 'top-kb-02',
    categoryId: 'kinh-thanh',
    categoryName: 'Kinh Thánh & Chú Giải',
    title: "Bốn Bài Ca 'Người Tôi Tớ Đau Khổ' Trong Sách Ngôn Sứ Isaia",
    subtitle: 'Nền tảng Cựu Ước cho mầu nhiệm Thập Giá và ơn cứu độ muôn dân',
    priority: 'Ưu Tiên Cao',
    scope: 'Phân tích bản văn Isaia 42, 49, 50 và đặc biệt Isaia 52:13 - 53:12. Làm sáng tỏ sự đối lập giữa đau thương tột cùng và vinh quang phục sinh.',
    methodologyBrief: 'Phân tích văn thể thi ca Hebrew, cấu trúc song đối đảo ngược và cách các tác giả Tin Mừng viện dẫn.',
    targetBiblicalPassages: ['Is 42:1-4', 'Is 49:1-6', 'Is 50:4-9', 'Is 52:13-53:12', '1 Pr 2:21-25'],
    tags: ['Isaia', 'Tôi Tớ Đau Khổ', 'Khổ Nạn', 'Kitô Học'],
    relatedCharacter: 'Ngôn sứ Isaia',
    relatedEra: 'Thời Kỳ Lưu Đày Babylon & Hậu Lưu Đày'
  },
  {
    id: 'top-kb-03',
    categoryId: 'kinh-thanh',
    categoryName: 'Kinh Thánh & Chú Giải',
    title: 'Diễn Từ Bánh Ban Sự Sống (Gioan 6): Ngôn Ngữ Hy Lạp Và Sự Hiện Diện Thực Sự',
    subtitle: 'Khảo sát văn tự Sarx vs Soma, Trogo vs Phago khẳng định Bí tích Thánh Thể',
    priority: 'Khẩn Cấp',
    scope: 'Chứng minh ngôn ngữ của Chúa Giêsu mang tính hiện thực bí tích tuyệt đối, không thể giải thích như biểu tượng ẩn dụ đơn thuần.',
    methodologyBrief: 'Phê bình văn tự nguyên ngữ Hy Lạp (Koine Greek), phân tích cấu trúc bài giảng tại hội đường Capharnaum.',
    targetBiblicalPassages: ['Ga 6:22-59', '1 Cr 11:23-29'],
    tags: ['Gioan 6', 'Thánh Thể', 'Bản Hy Lạp', 'Sarx', 'Trogo'],
    relatedCharacter: 'Thánh Gioan Tông Đồ',
    relatedEra: 'Thời Kỳ Hy Lạp Hóa & Đế Chế La Mã Thế Kỷ I'
  },

  // Khảo Cổ
  {
    id: 'top-kc-01',
    categoryId: 'khao-co',
    categoryName: 'Khảo Cổ Kinh Thánh',
    title: "Bia Đá Tel Dan: Khẳng Định Về 'Nhà Đa-vít' Trong Lịch Sử Trung Đông Cổ",
    subtitle: 'Văn khắc Aram thế kỷ IX TCN và giá trị phá vỡ các thuyết hoài nghi lịch sử',
    priority: 'Khẩn Cấp',
    scope: "Khảo cứu phát hiện năm 1993 tại miền bắc Israel, phân tích cụm từ 'Bayt Dawid' (Nhà Đavít) và mối tương quan với chiến dịch của vua Hazael thành Damascus.",
    methodologyBrief: 'Phương pháp cổ tự học (Paleography), đối chiếu với 1 Các Vua 15 và 2 Các Vua 8.',
    targetBiblicalPassages: ['1 V 15:16-22', '2 V 8:28-29', '2 Sm 7:12-16'],
    tags: ['Tel Dan', 'Nhà Đavít', 'Văn Khắc', 'Aram', 'Levant'],
    relatedCharacter: 'Vua Đa-vít',
    relatedEra: 'Thời Xuất Hành & Lập Quốc'
  },
  {
    id: 'top-kc-02',
    categoryId: 'khao-co',
    categoryName: 'Khảo Cổ Kinh Thánh',
    title: 'Cuộn Sách Biển Chết (Dead Sea Scrolls): Cầu Nối Giữa Hai Thời Đại',
    subtitle: 'Phát hiện tại 11 hang động Qumran và hành trình bảo tồn bản văn Cựu Ước',
    priority: 'Ưu Tiên Cao',
    scope: 'So sánh bản sao Isaia cuộn A (1QIsa) với bản chép Masoretic sau đó 1000 năm để chứng minh tính trung tín phi thường của Lời Chúa.',
    methodologyBrief: 'Phê bình thủ bản, phương pháp xác định niên đại bằng Carbon phóng xạ và cổ tự học.',
    targetBiblicalPassages: ['Is 40:1-8', 'Tv 22:16-18', 'Is 53:1-12'],
    tags: ['Qumran', 'Cuộn Sách Biển Chết', 'Bản Masoretic', 'Bản Thảo'],
    relatedEra: 'Thời Kỳ Hy Lạp Hóa & Đế Chế La Mã Thế Kỷ I'
  },
  {
    id: 'top-kc-03',
    categoryId: 'khao-co',
    categoryName: 'Khảo Cổ Kinh Thánh',
    title: 'Thành Giêrusalem Thời Vua Khôn Ngoan Salômôn Và Đệ Nhất Đền Thờ',
    subtitle: 'Các di chỉ Cổng Thành Megiddo, Hazor và Đồi Ophel củng cố ký thuật 1 Các Vua',
    priority: 'Mở Rộng',
    scope: 'Khảo sát kiến trúc cổng thành 6 phòng (Six-chambered gates) và di chỉ mỏ đồng Timna minh chứng cho sự thịnh vượng thời vương quốc thống nhất.',
    methodologyBrief: 'Địa tầng học thời kỳ Đồ Sắt IIA, đối chiếu bản vẽ kiến trúc Đền Thờ với các đền đài đương thời ở Syria (Ain Dara).',
    targetBiblicalPassages: ['1 V 6:1-38', '1 V 9:15-19', '2 Sb 3:1-17'],
    tags: ['Salômôn', 'Đền Thờ', 'Ophel', 'Hazor', 'Megiddo'],
    relatedEra: 'Thời Xuất Hành & Lập Quốc'
  },

  // Bối Cảnh
  {
    id: 'top-bc-01',
    categoryId: 'boi-canh',
    categoryName: 'Bối Cảnh Lịch Sử & ANE',
    title: 'Bộ Luật Hammurabi Và Luật Pháp Trong Bộ Ngũ Kinh (Torah)',
    subtitle: 'Khảo sát tính tương đồng văn hóa và nét thánh thiện siêu việt của luật Môsê',
    priority: 'Khẩn Cấp',
    scope: 'So sánh phiến đá đen Susa với Xuất Hành 21-23. Làm rõ sự khác biệt triệt để: Luật Kinh Thánh bảo vệ phẩm giá con người vượt trên quyền tư hữu tài sản.',
    methodologyBrief: 'Sử liệu học pháp lý so sánh, phân tích bối cảnh xã hội Lưỡng Hà và thần học giao ước dân được tuyển chọn.',
    targetBiblicalPassages: ['Xh 21:1-36', 'Lv 19:1-18', 'Đnl 15:1-18'],
    tags: ['Hammurabi', 'Luật Môsê', 'Torah', 'Công Bằng Xã Hội', 'ANE'],
    relatedCharacter: 'Ông Môsê',
    relatedEra: 'Thời Kỳ Các Tổ Phụ & Cận Đông Cổ Đại'
  },
  {
    id: 'top-bc-02',
    categoryId: 'boi-canh',
    categoryName: 'Bối Cảnh Lịch Sử & ANE',
    title: 'Xã Hội Do Thái Dưới Ách Thống Trị La Mã Thế Kỷ I: Pharisêu, Sa-đốc Và Phong Trào Nhiệt Thành',
    subtitle: 'Căng thẳng chính trị - tôn giáo định hình những đối thoại kịch tính trong Tin Mừng',
    priority: 'Ưu Tiên Cao',
    scope: 'Khảo sát quyền lực của Thượng Hội Đồng Sanhedrin, hệ thống thu thuế và nỗi thống khổ của tầng lớp Am ha-Aretz (dân đen nghèo khổ).',
    methodologyBrief: 'Xã hội học tôn giáo, đối chiếu văn bản Josephus và các tranh luận trong Tin Mừng Nhất Lãm.',
    targetBiblicalPassages: ['Mt 22:15-22', 'Mc 12:18-27', 'Lc 20:20-26', 'Ga 11:47-53'],
    tags: ['La Mã', 'Pharisêu', 'Sa-đốc', 'Sanhedrin', 'Thế Kỷ I'],
    relatedEra: 'Thời Kỳ Hy Lạp Hóa & Đế Chế La Mã Thế Kỷ I'
  },

  // Nhân Vật
  {
    id: 'top-nv-01',
    categoryId: 'nhan-vat',
    categoryName: 'Nhân Vật Thánh Kinh',
    title: 'Áp-ra-ham: Niềm Hy Vọng Nghịch Lý Khi Mọi Nẻo Đường Trông Cậy Đều Bế Tắc',
    subtitle: 'Khảo sát thần học ơn gọi, giao ước cắt bì và cuộc thử thách tột cùng trên Núi Moriah',
    priority: 'Khẩn Cấp',
    scope: "Theo sát tiến trình biến đổi tâm thức từ người du mục Ur xứ Can-đê thành 'Cha của muôn dân'. Làm sáng tỏ lời ngợi khen của Thánh Phaolô trong Thư Rôma 4.",
    methodologyBrief: 'Phương pháp phân tích diễn tiến tiểu sử thần học, làm sáng tỏ 7 chặng đường thử thách của tổ phụ.',
    targetBiblicalPassages: ['St 12:1-4', 'St 15:1-6', 'St 17:1-14', 'St 22:1-19', 'Rm 4:18-25'],
    tags: ['Áp-ra-ham', 'Đức Tin', 'Moriah', 'Hy Vọng', 'Giao Ước'],
    relatedCharacter: 'Tổ phụ Áp-ra-ham',
    relatedEra: 'Thời Kỳ Các Tổ Phụ & Cận Đông Cổ Đại'
  },
  {
    id: 'top-nv-02',
    categoryId: 'nhan-vat',
    categoryName: 'Nhân Vật Thánh Kinh',
    title: 'Thánh Phaolô: Cuộc Hoán Cải Đamát Và Chiến Lược Truyền Giáo Vượt Biên Giới',
    subtitle: 'Hành trình 3 chuyến truyền giáo và tầm nhìn thần học mở cửa Dân Ngoại',
    priority: 'Khẩn Cấp',
    scope: 'Từ một Pharisêu nhiệt thành bắt bớ đạo đến người tôi tớ sẵn sàng chịu xiềng xích vì danh Chúa Kitô. Phân tích bài diễn từ tại Đồi Areopagus (Athens).',
    methodologyBrief: 'Khảo sát đối chiếu sách Công Vụ Tông Đồ với các lời tự sự trong Thư Galát 1-2 và 2 Cô-rin-tô 11.',
    targetBiblicalPassages: ['Cv 9:1-19', 'Cv 17:16-34', 'Gl 1:11-24', '2 Cr 11:21-33'],
    tags: ['Thánh Phaolô', 'Đamát', 'Truyền Giáo', 'Areopagus', 'Dân Ngoại'],
    relatedCharacter: 'Thánh Phaolô Tông Đồ',
    relatedEra: 'Thời Kỳ Hy Lạp Hóa & Đế Chế La Mã Thế Kỷ I'
  },
  {
    id: 'top-nv-03',
    categoryId: 'nhan-vat',
    categoryName: 'Nhân Vật Thánh Kinh',
    title: 'Thánh Maria Mác-đa-la: Tông Đồ Của Các Tông Đồ Và Chứng Nhân Đầu Tiên Của Sự Sống',
    subtitle: 'Lấy lại vị thế danh dự cho người phụ nữ đầu tiên chiêm ngắm Chúa Kitô Phục Sinh',
    priority: 'Ưu Tiên Cao',
    scope: 'Giải mã những ngộ nhận lịch sử giữa Maria Mác-đa-la, người phụ nữ tội lỗi xức dầu và Maria làng Bêtania. Đọc lại Gioan 20 dưới ánh sáng sắc lệnh Tòa Thánh 2016.',
    methodologyBrief: 'Phê bình đối chiếu bốn Tin Mừng và sắc lệnh Apostolorum Apostola của Bộ Phụng Tự.',
    targetBiblicalPassages: ['Lc 8:1-3', 'Mt 28:1-10', 'Ga 20:1-18'],
    tags: ['Maria Mác-đa-la', 'Phục Sinh', 'Apostola Apostolorum', 'Gioan 20'],
    relatedCharacter: 'Thánh Maria Mác-đa-la',
    relatedEra: 'Thời Kỳ Hy Lạp Hóa & Đế Chế La Mã Thế Kỷ I'
  },

  // Thần Học
  {
    id: 'top-th-01',
    categoryId: 'than-hoc',
    categoryName: 'Thần Học & Tín Lý',
    title: 'Mầu Nhiệm Đức Maria Hồn Xác Lên Trời (Munificentissimus Deus): Nền Tảng Tín Lý & Thánh Kinh',
    subtitle: 'Sự thông phần trọn vẹn vào vinh quang phục sinh của Đấng Chiến Thắng Tội Lỗi',
    priority: 'Khẩn Cấp',
    scope: 'Khảo sát Tông hiến năm 1950 của ĐTC Piô XII, đối chiếu Khải Huyền 12 và truyền thống Phụng vụ Đông - Tây phương (Dormitio Mariae).',
    methodologyBrief: 'Phương pháp tín lý học lịch sử, phân tích mối dây liên kết hữu cơ với tín điều Vô Nhiễm Nguyên Tội.',
    targetBiblicalPassages: ['Kh 12:1-6', 'Lc 1:46-55', '1 Cr 15:20-23'],
    tags: ['Hồn Xác Lên Trời', 'Theotokos', 'Đức Maria', 'Munificentissimus Deus', 'Tín Điều'],
    relatedCharacter: 'Đức Trinh Nữ Maria',
    relatedEra: 'Thời Kỳ Các Thánh Giáo Phụ & Các Công Đồng Chung'
  },
  {
    id: 'top-th-02',
    categoryId: 'than-hoc',
    categoryName: 'Thần Học & Tín Lý',
    title: 'Tổng Luận Thần Học Của Thánh Tôma Aquinô: Năm Con Đường Nhận Biết Thiên Chúa',
    subtitle: 'Sự gặp gỡ mẫu mực giữa triết học Aristotle và Mặc khải Kitô giáo',
    priority: 'Ưu Tiên Cao',
    scope: 'Tóm lược ngũ luận (Quinque Viae): Vận động, Nguyên nhân đệ nhất, Tính tất yếu, Cấp độ hoàn hảo và Cứu cánh luận. Trả lời các vấn nạn vô thần học thời nay.',
    methodologyBrief: 'Triết học kinh viện (Scholasticism), phương pháp phân tích câu hỏi - vấn bác - phản bác (Quaestio Disputata).',
    targetBiblicalPassages: ['Kn 13:1-9', 'Rm 1:19-20', 'Tv 19:1-5'],
    tags: ['Tôma Aquinô', 'Tổng Luận', 'Quinque Viae', 'Triết Học', 'Đức Tin & Lý Trí'],
    relatedCharacter: 'Thánh Tôma Aquinô',
    relatedEra: 'Thời Kỳ Các Thánh Giáo Phụ & Các Công Đồng Chung'
  },
  {
    id: 'top-th-03',
    categoryId: 'than-hoc',
    categoryName: 'Thần Học & Tín Lý',
    title: 'Thần Học Về Tội Tổ Tông Trong Thư Gửi Tín Hữu Rôma: Adong Thứ Nhất Và Adong Thứ Hai',
    subtitle: 'Nguồn gốc đau khổ trần gian và sự dư tràn vô biên của Ân Sủng Cứu Chuộc',
    priority: 'Ưu Tiên Cao',
    scope: 'Phân tích Rôma 5:12-21, cách Thánh Augustinô bảo vệ ơn sủng trước lạc giáo Pelagius và định tín Công đồng Trentô.',
    methodologyBrief: 'Cánh chung luận & Nhân học Kitô giáo, đối chiếu bản dịch Latinh Vulgata và nguyên văn Hy Lạp.',
    targetBiblicalPassages: ['St 3:1-19', 'Rm 5:12-21', '1 Cr 15:45-49'],
    tags: ['Tội Tổ Tông', 'Thư Rôma', 'Adong Mới', 'Ân Sủng', 'Trentô'],
    relatedCharacter: 'Thánh Augustinô',
    relatedEra: 'Thời Kỳ Các Thánh Giáo Phụ & Các Công Đồng Chung'
  },

  // Suy Niệm
  {
    id: 'top-sn-01',
    categoryId: 'suy-niem',
    categoryName: 'Linh Đạo & Suy Niệm',
    title: 'Nghệ Thuật Cầu Nguyện Lectio Divina: 4 Bậc Thang Tiến Vào Thánh Điện Lời Chúa',
    subtitle: 'Cẩm nang thực hành cho Kitô hữu giữa cơn lốc của sự bận rộn hiện đại',
    priority: 'Khẩn Cấp',
    scope: 'Hướng dẫn cụ thể cách chọn đoạn Kinh Thánh, thanh lọc không gian nội tâm, đọc chậm, ghi nhận xúc cảm thiêng liêng và giữ gìn ngọn lửa chiêm niệm suốt ngày sống.',
    methodologyBrief: 'Linh đạo Đan tu Biển Đức và giáo huấn Tông huấn Verbum Domini của ĐTC Bênêđictô XVI.',
    targetBiblicalPassages: ['Tv 1:1-3', 'Lc 10:38-42', 'Dt 4:12-13'],
    tags: ['Lectio Divina', 'Cầu Nguyện', 'Chiêm Niệm', 'Linh Đạo', 'Verbum Domini'],
    relatedEra: 'Thời Kỳ Các Thánh Giáo Phụ & Các Công Đồng Chung'
  },
  {
    id: 'top-sn-02',
    categoryId: 'suy-niem',
    categoryName: 'Linh Đạo & Suy Niệm',
    title: 'Mầu Nhiệm Thập Giá: Chiêm Ngắm 14 Chặng Đàng Thánh Giá Dưới Ánh Sáng Lòng Thương Xót',
    subtitle: 'Nối kết đau khổ bệnh tật của con người với Hy Tế Đền Tội của Chúa Kitô',
    priority: 'Ưu Tiên Cao',
    scope: 'Gợi ý suy niệm chiều sâu theo từng chặng đàng thương khó, đưa các nan đề xã hội và khủng hoảng tâm linh vào cuộc khổ nạn của Đấng Vô Tội.',
    methodologyBrief: 'Linh đạo Thánh Tâm và linh đạo Lòng Thương Xót Thánh Faustina.',
    targetBiblicalPassages: ['Is 53:3-7', 'Mt 27:27-50', 'Ga 19:17-30'],
    tags: ['Thập Giá', '14 Chặng Đàng', 'Lòng Thương Xót', 'Khổ Nạn', 'Tuần Thánh'],
    relatedEra: 'Thời Kỳ Hy Lạp Hóa & Đế Chế La Mã Thế Kỷ I'
  },

  // Các Thánh
  {
    id: 'top-ct-01',
    categoryId: 'cac-thanh',
    categoryName: 'Các Thánh & Giáo Phụ',
    title: 'Thánh Âu-tinh Và Tác Phẩm Tự Thuật (Confessiones): Tiếng Kêu Của Linh Hồn Khát Chúa',
    subtitle: 'Hành trình từ bóng tối dục vọng và thuyết Manichaeism đến ánh sáng chân lý',
    priority: 'Khẩn Cấp',
    scope: "Khảo cứu biến cố vườn Milan ('Tolle lege' - Cầm lấy mà đọc), lời cầu nguyện của mẹ Mônica và triết lý 'Trái tim khắc khoải cho đến khi được nghỉ an trong Chúa'.",
    methodologyBrief: 'Tâm lý học hoán cải Kitô giáo, phân tích văn phẩm tự sự triết học cổ điển.',
    targetBiblicalPassages: ['Rm 13:13-14', 'Tv 42:1-3', 'Tv 139:1-12'],
    tags: ['Thánh Âu-tinh', 'Tự Thuật', 'Confessiones', 'Hoán Cải', 'Mônica'],
    relatedCharacter: 'Thánh Augustinô',
    relatedEra: 'Thời Kỳ Các Thánh Giáo Phụ & Các Công Đồng Chung'
  },
  {
    id: 'top-ct-02',
    categoryId: 'cac-thanh',
    categoryName: 'Các Thánh & Giáo Phụ',
    title: 'Thánh Irênê Lyon: Người Canh Giữ Sự Hiệp Nhất Và Nền Thần Học Tông Truyền',
    subtitle: "Tác phẩm Chống Lạc Giáo (Adversus Haereses) và định nghĩa 'Vinh quang Thiên Chúa là con người sống động'",
    priority: 'Ưu Tiên Cao',
    scope: 'Làm sáng tỏ cách Thánh Irênê đánh bại thuyết Ngộ đạo (Gnosticism), khẳng định sự thánh thiêng của thân xác vật chất và sự toàn vẹn của đức tin Công giáo.',
    methodologyBrief: 'Giáo phụ học thế kỷ II, phân tích khái niệm Tái tổng kết (Recapitulatio / Anakephalaiosis).',
    targetBiblicalPassages: ['Ep 1:9-10', '1 Ga 4:1-6', 'Cl 1:15-20'],
    tags: ['Thánh Irênê', 'Chống Lạc Giáo', 'Gnosticism', 'Recapitulatio', 'Giáo Phụ'],
    relatedCharacter: 'Thánh Irênê Lyon',
    relatedEra: 'Thời Kỳ Các Thánh Giáo Phụ & Các Công Đồng Chung'
  },

  // Phụng Vụ
  {
    id: 'top-pv-01',
    categoryId: 'phung-vu',
    categoryName: 'Phụng Vụ & Bí Tích',
    title: 'Hiến Chế Sacrosanctum Concilium: Tinh Thần Canh Tân Phụng Vụ Của Vatican II',
    subtitle: 'Sự tham gia tích cực (Participatio Actuosa) và bản chất siêu nhiên của Thánh Lễ',
    priority: 'Khẩn Cấp',
    scope: 'Khảo sát tiến trình chuyển biến phụng vụ, mối tương quan giữa Lời Chúa và Bàn Tiệc Thánh Thể, khắc phục quan niệm thụ động xem lễ của giáo dân.',
    methodologyBrief: 'Thần học phụng vụ so sánh, phân tích các văn kiện hậu Công Đồng và Quy chế Tổng quát Sách Lễ Rôma (GIRM).',
    targetBiblicalPassages: ['1 Cr 10:16-17', 'Cv 2:42-47', 'Dt 10:19-25'],
    tags: ['Vatican II', 'Sacrosanctum Concilium', 'Thánh Lễ', 'Canh Tân Phụng Vụ', 'GIRM'],
    relatedEra: 'Thời Kỳ Các Thánh Giáo Phụ & Các Công Đồng Chung'
  },
  {
    id: 'top-pv-02',
    categoryId: 'phung-vu',
    categoryName: 'Phụng Vụ & Bí Tích',
    title: 'Ý Nghĩa Thần Học Và Biểu Tượng Của Năm Phụng Vụ Trong Đời Sống Người Kitô Hữu',
    subtitle: 'Hành trình cùng Chúa Kitô bước qua các mầu nhiệm Cứu Độ suốt 365 ngày',
    priority: 'Ưu Tiên Cao',
    scope: 'Khảo sát linh đạo Mùa Vọng, Mùa Giáng Sinh, Mùa Chay, Tam Nhật Vượt Qua, Mùa Phục Sinh và Mùa Thường Niên. Ý nghĩa biểu tượng của các sắc phục thánh.',
    methodologyBrief: 'Thời gian học phụng vụ (Liturgical Temporality), đối chiếu chu kỳ lễ Đông - Tây phương.',
    targetBiblicalPassages: ['Gl 4:4-5', 'Ep 1:3-10', 'Cl 3:1-4'],
    tags: ['Năm Phụng Vụ', 'Màu Phụng Vụ', 'Mùa Chay', 'Phục Sinh', 'Mùa Vọng'],
    relatedEra: 'Thời Kỳ Các Thánh Giáo Phụ & Các Công Đồng Chung'
  }
];
