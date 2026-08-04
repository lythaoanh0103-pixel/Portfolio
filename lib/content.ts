export type Lang = "en" | "vi"

export type SectionId = "about" | "littleThings" | "projects" | "skills" | "experience" | "contact"

type Bi = Record<Lang, string>

export const ui: Record<string, Bi> = {
  name: { en: "Ly Thao Anh", vi: "Lý Thảo Anh" },
  // No profession. Only a whisper, left deliberately open.
  subtitle: { en: "", vi: "" },
  quoteLine1: { en: "Some things are not meant to be explained —", vi: "Có những điều không cần giải thích —" },
  quoteLine2: { en: "only felt, the way the sea is felt.", vi: "chỉ để cảm nhận, như cách ta cảm nhận biển khơi." },
  begin: { en: "Begin Journey", vi: "Bắt đầu hành trình" },
  tideCaption: { en: "Every tide carries a story.", vi: "Mỗi con nước mang theo một câu chuyện." },
  scrollHint: { en: "let yourself drift", vi: "hãy để mình trôi đi" },
  surface: { en: "Return to surface", vi: "Trở lại mặt nước" },
  close: { en: "Close", vi: "Đóng" },
  enter: { en: "Enter", vi: "Mở" },
  openProject: { en: "Open this memory", vi: "Mở ký ức này" },
  backToProjects: { en: "Back to the stories", vi: "Về lại những câu chuyện" },
  viewGithub: { en: "View on GitHub", vi: "Xem trên GitHub" },
  liveDemo: { en: "Live demo", vi: "Bản demo" },
  liveSoon: { en: "Live demo — drifting in soon", vi: "Bản demo — sắp cập bến" },
  aboutPortrait: {
    en: "Ly Thao Anh — a quiet afternoon by the water",
    vi: "Lý Thảo Anh — một buổi chiều lặng bên mặt nước",
  },
  loading: { en: "surfacing", vi: "đang nổi lên" },
}

export const sections: {
  id: SectionId
  /** A short chapter label — poetic, never a résumé word. */
  title: Bi
  tagline: Bi
}[] = [
  {
    id: "about",
    title: { en: "Where the Tide Begins", vi: "Nơi con nước bắt đầu" },
    tagline: { en: "The tide that carried me here", vi: "Con nước đã đưa tôi đến đây" },
  },
  {
    id: "littleThings",
    title: { en: "Little Things", vi: "Những điều nhỏ bé" },
    tagline: { en: "Little things that make me smile", vi: "Những điều nhỏ khiến tôi mỉm cười" },
  },
  {
    id: "projects",
    title: { en: "Things I Made", vi: "Những điều tôi tạo nên" },
    tagline: { en: "Ideas grown from still water", vi: "Ý tưởng lớn lên từ mặt nước lặng" },
  },
  {
    id: "skills",
    title: { en: "What I Carry", vi: "Điều tôi mang theo" },
    tagline: { en: "Formed slowly, layer by layer", vi: "Hình thành chậm rãi, từng lớp một" },
  },
  {
    id: "experience",
    title: { en: "Shores I've Known", vi: "Những bến bờ đã qua" },
    tagline: { en: "Notes gathered from every shore", vi: "Những ghi chép nhặt từ mỗi bến bờ" },
  },
  {
    id: "contact",
    title: { en: "Send a Light", vi: "Gửi một tia sáng" },
    tagline: { en: "Let a light drift toward you", vi: "Để một tia sáng trôi về phía bạn" },
  },
]

/* --------------------------------------------- Little Things (a soft chapter) */

export const littleThings = {
  intro: {
    en: "The small things I keep coming back to — the quiet ones that never make it onto a résumé, but somehow make up most of who I am.",
    vi: "Những điều nhỏ bé tôi luôn trở về — lặng lẽ, chẳng bao giờ xuất hiện trên một bản CV, nhưng lại làm nên phần lớn con người tôi.",
  },
  items: [
    {
      icon: "book",
      text: { en: "reading a novel on a rainy afternoon", vi: "đọc tiểu thuyết vào một buổi chiều mưa" },
    },
    {
      icon: "piano",
      text: { en: "quiet piano music, late at night", vi: "tiếng dương cầm lặng lẽ, đêm khuya" },
    },
    {
      icon: "wave",
      text: { en: "watching the sea until I forget the time", vi: "ngắm biển đến quên cả thời gian" },
    },
    {
      icon: "sun",
      text: { en: "a sunset that turns everything gold", vi: "hoàng hôn nhuộm vàng mọi thứ" },
    },
    {
      icon: "coffee",
      text: { en: "the first sip of coffee in the morning", vi: "ngụm cà phê đầu tiên buổi sáng" },
    },
    {
      icon: "spark",
      text: { en: "learning something new and feeling it click", vi: "học được điều mới và thấy nó khớp lại" },
    },
    {
      icon: "leaf",
      text: { en: "finding beauty in an ordinary moment", vi: "tìm thấy vẻ đẹp trong một khoảnh khắc bình thường" },
    },
    {
      icon: "moon",
      text: { en: "late-night ideas I have to write down", vi: "những ý tưởng khuya phải vội ghi lại" },
    },
  ] as { icon: string; text: Bi }[],
}

export const about = {
  meta: [
    {
      k: { en: "I spend my days at", vi: "Tôi dành ngày tháng ở" },
      v: { en: "Foreign Trade University", vi: "Đại học Ngoại thương" },
    },
    {
      k: { en: "I keep returning to", vi: "Tôi luôn quay về với" },
      v: { en: "finance, and the poetry of value", vi: "tài chính, và chất thơ của giá trị" },
    },
    {
      k: { en: "Lately I am", vi: "Dạo này tôi đang" },
      v: { en: "learning, quietly and often", vi: "học hỏi, lặng lẽ và thường xuyên" },
    },
  ],
  note: {
    en: [
      "I am drawn to the quiet patterns beneath moving things — the way a market breathes, the way a number can hide a whole story if you look long enough.",
      "I like turning what is complicated into something that can be felt: a clearer picture, a calmer decision, a small piece of order in the noise.",
      "Mostly I am curious. I read late, I ask too many questions, and I am slowly building a life around thinking carefully about the things that matter.",
    ],
    vi: [
      "Tôi bị cuốn hút bởi những quy luật lặng lẽ ẩn dưới mọi thứ đang chuyển động — cách một thị trường thở, cách một con số có thể giấu cả một câu chuyện nếu ta nhìn đủ lâu.",
      "Tôi thích biến điều phức tạp thành thứ có thể cảm nhận: một bức tranh rõ ràng hơn, một quyết định điềm tĩnh hơn, một chút trật tự nhỏ giữa ồn ào.",
      "Trên hết, tôi tò mò. Tôi đọc khuya, tôi hỏi quá nhiều, và tôi đang chậm rãi dựng nên một cuộc đời quanh việc suy nghĩ cẩn trọng về những điều quan trọng.",
    ],
  },
}

export const projects: {
  title: Bi
  subtitle: Bi
  description: Bi
  detail: Bi
  tech: string[]
  cover: string
  github: string
  demo?: string
}[] = [
  {
    title: { en: "BioWonder — Waste to Wonder", vi: "BioWonder — Từ rác thải đến điều kỳ diệu" },
    subtitle: { en: "Sustainable business project", vi: "Dự án kinh doanh bền vững" },
    description: {
      en: "A sustainability-driven business concept turning organic waste into value.",
      vi: "Ý tưởng kinh doanh bền vững, biến rác thải hữu cơ thành giá trị.",
    },
    detail: {
      en: "A sustainability-driven business concept turning organic waste into value, built around strategy, feasibility, and a gentle environmental promise. The work covered market framing, a cost–benefit view of the model, and the environmental case for turning discarded organic matter into something quietly useful.",
      vi: "Một ý tưởng kinh doanh hướng đến phát triển bền vững, biến rác thải hữu cơ thành giá trị, xây dựng quanh chiến lược, tính khả thi và một lời hứa với môi trường. Dự án bao gồm định vị thị trường, phân tích chi phí – lợi ích của mô hình, và luận điểm môi trường khi biến rác hữu cơ thành thứ lặng lẽ hữu ích.",
    },
    tech: ["Sustainability", "Business Strategy", "Feasibility"],
    cover: "/covers/biowonder.png",
    github: "https://github.com/lythaoanh0103-pixel",
  },
  {
    title: { en: "Mutual Fund Management Web App", vi: "Ứng dụng quản lý quỹ mở" },
    subtitle: { en: "A fund-tracking tool built end to end", vi: "Công cụ theo dõi quỹ xây dựng từ đầu đến cuối" },
    description: {
      en: "Track and manage mutual fund holdings from data pipeline to interface.",
      vi: "Theo dõi và quản lý danh mục quỹ mở, từ luồng dữ liệu đến giao diện.",
    },
    detail: {
      en: "A web application to track and manage mutual fund holdings — from data pipeline to a clean, usable interface for monitoring performance. Built with Python and Streamlit over a Google Sheets data layer, it turns scattered fund figures into a single, readable view of how a portfolio breathes over time.",
      vi: "Ứng dụng web theo dõi và quản lý danh mục quỹ mở — từ luồng dữ liệu đến giao diện gọn gàng, dễ dùng để giám sát hiệu suất. Xây dựng bằng Python và Streamlit trên nền dữ liệu Google Sheets, ứng dụng biến những con số quỹ rải rác thành một góc nhìn duy nhất, dễ đọc về nhịp thở của danh mục theo thời gian.",
    },
    tech: ["Python", "Streamlit", "Google Sheets"],
    cover: "/covers/mutual-fund.png",
    github: "https://github.com/lythaoanh0103-pixel",
  },
  {
    title: { en: "Personal Lifetime Financial Planning", vi: "Hoạch định tài chính cá nhân trọn đời" },
    subtitle: { en: "A financial plan for a household", vi: "Kế hoạch tài chính cho một hộ gia đình" },
    description: {
      en: "Income, spending, and goals mapped across decades of a life.",
      vi: "Thu nhập, chi tiêu và mục tiêu, phác họa qua nhiều thập kỷ.",
    },
    detail: {
      en: "A lifetime financial plan mapping income, spending, and goals across decades — budgeting and cash-flow modeling with a human, long-view lens. The plan follows a household from early earning years through major milestones, balancing present comfort against a patient, well-lit future.",
      vi: "Một kế hoạch tài chính trọn đời, phác họa thu nhập, chi tiêu và mục tiêu qua nhiều thập kỷ — lập ngân sách và mô hình dòng tiền với góc nhìn dài hạn, đầy tính người. Kế hoạch dõi theo một hộ gia đình từ những năm đầu kiếm sống qua các dấu mốc lớn, cân bằng giữa sự thoải mái hiện tại và một tương lai kiên nhẫn, sáng rõ.",
    },
    tech: ["Budgeting", "Cash Flow", "Planning"],
    cover: "/covers/financial-planning.png",
    github: "https://github.com/lythaoanh0103-pixel",
  },
  {
    title: { en: "Personal Investment Portfolio Analysis", vi: "Phân tích danh mục đầu tư cá nhân" },
    subtitle: { en: "Allocation and investment recommendation", vi: "Phân bổ và khuyến nghị đầu tư" },
    description: {
      en: "Asset allocation and valuation, ending in a considered recommendation.",
      vi: "Phân bổ tài sản và định giá, kết bằng một khuyến nghị cân nhắc.",
    },
    detail: {
      en: "An analysis of asset allocation and valuation, ending in a considered investment recommendation balanced between risk and quiet ambition. The study weighs each holding on its own merits, then steps back to read the portfolio as one composition — where every asset plays its part in a calm, deliberate whole.",
      vi: "Phân tích phân bổ tài sản và định giá, kết thúc bằng một khuyến nghị đầu tư cân nhắc, cân bằng giữa rủi ro và tham vọng lặng lẽ. Nghiên cứu đánh giá từng tài sản theo giá trị riêng, rồi lùi lại để đọc cả danh mục như một bản hòa tấu — nơi mỗi tài sản giữ một vai trò trong tổng thể điềm tĩnh, có chủ đích.",
    },
    tech: ["Allocation", "Valuation", "Risk"],
    cover: "/covers/portfolio-analysis.png",
    github: "https://github.com/lythaoanh0103-pixel",
  },
]

export const skills: { group: Bi; items: string[] }[] = [
  {
    group: { en: "Professional", vi: "Chuyên môn" },
    items: ["Microsoft Office", "Power BI", "Python", "SQL", "Financial Analysis", "Financial Modeling"],
  },
  {
    group: { en: "Human", vi: "Kỹ năng mềm" },
    items: ["Communication", "Adaptability", "Time Management", "Teamwork", "Responsibility"],
  },
]

export const experience: {
  role: Bi
  org: Bi
  note: Bi
  logo?: string
}[] = [
  {
    role: { en: "Finance & Accounting Intern", vi: "Thực tập sinh Tài chính & Kế toán" },
    org: { en: "Tien Phong Vina Co., Ltd.", vi: "Công ty TNHH Tiên Phong Vina" },
    logo: "/logos/tpvn.jpg",
    note: {
      en: "Supporting financial records, reporting, and the daily rhythm of accounting.",
      vi: "Hỗ trợ ghi chép tài chính, lập báo cáo và nhịp làm việc kế toán hằng ngày.",
    },
  },
  {
    role: { en: "Mathematics Tutor", vi: "Gia sư Toán" },
    org: { en: "Private & group sessions", vi: "Lớp học cá nhân & nhóm" },
    note: {
      en: "Turning abstract concepts into clear, patient explanations.",
      vi: "Biến những khái niệm trừu tượng thành lời giải thích rõ ràng và kiên nhẫn.",
    },
  },
]

/* ------------------------------------------------ Hidden interactions ---- */

/** Notes found inside the drifting bottle — one is drawn at random. */
export const bottleNotes: { line: Bi; from: Bi }[] = [
  {
    line: {
      en: "Compound interest is patience, wearing the mask of mathematics.",
      vi: "Lãi kép là sự kiên nhẫn, khoác lên mình chiếc mặt nạ của toán học.",
    },
    from: { en: "a note to myself, 3 a.m.", vi: "ghi chú cho chính tôi, 3 giờ sáng" },
  },
  {
    line: {
      en: "Price is what the tide does. Value is the shape of the shore beneath it.",
      vi: "Giá là điều con nước làm. Giá trị là hình dáng bờ cát nằm bên dưới.",
    },
    from: { en: "from a valuation notebook", vi: "từ một quyển sổ định giá" },
  },
  {
    line: {
      en: "Risk is not a number. It is everything the number forgot to mention.",
      vi: "Rủi ro không phải một con số. Nó là tất cả những gì con số đã quên nhắc đến.",
    },
    from: { en: "found in the margin", vi: "tìm thấy ở lề trang" },
  },
  {
    line: {
      en: "I learned Python the way one learns to swim — slowly, then all at once.",
      vi: "Tôi học Python như học bơi — chậm rãi, rồi bỗng nhiên là biết.",
    },
    from: { en: "a small confession", vi: "một lời thú nhận nhỏ" },
  },
  {
    line: {
      en: "Every model is a guess wearing a good suit. Ask it gentle questions.",
      vi: "Mọi mô hình đều là một phỏng đoán khoác áo đẹp. Hãy hỏi nó thật nhẹ nhàng.",
    },
    from: { en: "lesson from a broken spreadsheet", vi: "bài học từ một bảng tính vỡ" },
  },
  {
    line: {
      en: "Some days the market teaches finance. Other days it only teaches temperament.",
      vi: "Có ngày thị trường dạy ta tài chính. Có ngày nó chỉ dạy ta tính khí.",
    },
    from: { en: "a thought at low tide", vi: "một suy nghĩ lúc nước rút" },
  },
]

/** Secrets whispered by the seashells resting on the seabed. */
export const shellSecrets: Bi[] = [
  { en: "Hold quietly. Compounding hates an audience.", vi: "Hãy nắm giữ lặng lẽ. Lãi kép không thích khán giả." },
  { en: "Read the footnotes. That is where the truth hides.", vi: "Hãy đọc phần chú thích. Sự thật thường trốn ở đó." },
  { en: "A good question outlives a good answer.", vi: "Một câu hỏi hay sống lâu hơn một câu trả lời hay." },
  { en: "Count twice. Decide once.", vi: "Đếm hai lần. Quyết định một lần." },
]

export const secretsUi = {
  bottleLabel: {
    en: "A bottle drifts by — open the note inside",
    vi: "Một chiếc lọ trôi ngang — mở lá thư bên trong",
  },
  bottleTitle: { en: "Message in a bottle", vi: "Thư trong chiếc lọ" },
  shellLabel: { en: "Touch the shell to hear it", vi: "Chạm vào vỏ sò để lắng nghe" },
  seabedHint: {
    en: "Shells rest here. So do a few secrets.",
    vi: "Những vỏ sò nghỉ ở đây. Vài điều bí mật cũng vậy.",
  },
}

export const contact = {
  closing: {
    en: "If our stories happen to cross again —",
    vi: "Nếu những câu chuyện của chúng ta lại tình cờ gặp nhau —",
  },
  intro: {
    en: "you'll find me somewhere near the water, reading, wondering, listening for the tide. Leave a light here, and I'll follow it back to you.",
    vi: "bạn sẽ tìm thấy tôi đâu đó bên mặt nước, đang đọc sách, đang bâng khuâng, đang lắng nghe con nước. Hãy để lại một tia sáng nơi đây, và tôi sẽ lần theo nó tìm về phía bạn.",
  },
  links: [
    { label: "Email", value: "lythaoanh0103@gmail.com", href: "mailto:lythaoanh0103@gmail.com" },
    { label: "GitHub", value: "lythaoanh0103-pixel", href: "https://github.com/lythaoanh0103-pixel" },
    { label: "LinkedIn", value: "Ly Thao Anh", href: "https://www.linkedin.com/in/lythaoanh" },
  ],
}
