import { ComponentSpec, CameraPreset, ComponentId, HardwareComponentId, DeviceType, DeviceMetadata } from '../types';

export const HARDWARE_COMPONENTS: Record<ComponentId, ComponentSpec> = {
  case: {
    id: 'case',
    assemblyOrder: 1,
    nameAr: 'الهيكل واللوح الزجاجي (Case)',
    nameEn: 'Cyber-Glass Mid-Tower Chassis',
    categoryAr: 'الدرع الخارجي وقاعدة البناء',
    categoryEn: 'Exoskeleton Chassis Baseline',
    descriptionAr:
      'الهيكل الفولاذي الأساسي الذي يحتضن جميع المكونات. يحتوي على مسامير المباعدة (Standoffs)، وحجرة سفلية لعزل مزود الطاقة والأسلاك، ولوح جانبي زجاجي مقاوم للخدوش.',
    descriptionEn:
      'The foundational structural steel chassis with integrated standoffs, dual front 140mm intake fans, cable-routing grommets, and a tempered glass window.',
    humanAnalogyTitleAr: 'الهيكل العظمي والجلد',
    humanAnalogyTitleEn: 'The Skeleton & Skin',
    humanAnalogyAr:
      'الدرع والهيكل العظمي 🛡️ — يحمي الأعضاء الداخلية الحساسة من الصدمات والغبار، وينظم التنفس والحرارة عبر مسارات هوائية مدروسة.',
    humanAnalogyEn:
      'The Skeleton & Protective Skin — shields delicate internal organs from trauma, provides physical posture, and regulates thermal breathability.',
    humanIcon: '🛡️',
    assemblyInstructionAr:
      'الخطوة 1: فك اللوح الزجاجي الجانبي، وتأكد من تثبيت مسامير المباعدة (Standoffs) في أماكنها الصحيحة المتوافقة مع حجم اللوحة الأم ATX.',
    assemblyInstructionEn:
      'Step 1: Detach the glass side panel and ensure all ATX motherboard standoff screws are securely aligned in the tray.',
    assemblyTipAr: 'نصيحة: ابدأ دائماً بفك جميع الألواح لتسهيل الوصول للأجزاء الداخلية.',
    assemblyTipEn: 'Tip: Strip down panels first for uninhibited workspace access.',
    keySpecs: [
      { labelAr: 'المواد المصنعة', labelEn: 'Materials', value: 'SGCC Steel, Aluminum & 4mm Glass' },
      { labelAr: 'مراوح السحب', labelEn: 'Intake Fans', value: '2 × 140mm ARGB PWM' },
      { labelAr: 'اللوح الجانبي', labelEn: 'Side Panel', value: 'Quick-Release Tempered Glass' },
      { labelAr: 'الأبعاد', labelEn: 'Dimensions', value: '480 × 225 × 495 mm' },
    ],
    accentColor: '#9D00FF',
    explodedOffset: [18.0, 0, 0],
    centerOffset: [0, 2, 0],
  },
  psu: {
    id: 'psu',
    assemblyOrder: 2,
    nameAr: 'مزود الطاقة (PSU)',
    nameEn: '1000W Platinum Modular PSU',
    categoryAr: 'قلب الطاقة ومحطة التغذية',
    categoryEn: 'Power Reactor Core',
    descriptionAr:
      'وحدة إمداد الطاقة المعيارية بقدرة 1000 واط. تحول التيار المتردد إلى نبضات مستمرة دقيقة (+12V, +5V, +3.3V) لتغذية كل خلية حاسوبية.',
    descriptionEn:
      'Fully modular 1000W Platinum power supply supplying pure DC voltage lines with smart zero-RPM fan curve.',
    humanAnalogyTitleAr: 'القلب النابض',
    humanAnalogyTitleEn: 'The Beating Heart',
    humanAnalogyAr:
      'القلب النابض ❤️ — يضخ تيار الطاقة (الدم الكهربائي) عبر الشرايين (الكابلات) إلى كل عضو بدقة متناهية وبدون انقطاع.',
    humanAnalogyEn:
      'The Beating Heart — continuously pumps vital electrical blood through high-voltage arterial cables into every cell and organ.',
    humanIcon: '❤️',
    assemblyInstructionAr:
      'الخطوة 2: أدخل مزود الطاقة في الحجرة السفلية مع توجيه المروحة للأسفل لسحب الهواء البارد، وثبّته بالبراغي الخلفية الأربعة ووصّل الكابلات الأساسية مسبقاً.',
    assemblyInstructionEn:
      'Step 2: Slide the PSU into the lower basement with the fan facing downwards for cool air intake, fasten four rear screws, and pre-attach main modular cables.',
    assemblyTipAr: 'نصيحة: توصيل الكابلات الضرورية (24-pin وCPU 8-pin) قبل تثبيت المزود يوفر عليك جهداً كبيراً.',
    assemblyTipEn: 'Tip: Plug in required power cables into the PSU modular backplate prior to seating.',
    keySpecs: [
      { labelAr: 'القدرة القصوى', labelEn: 'Wattage', value: '1000 Watts Sustained' },
      { labelAr: 'شهادة الكفاءة', labelEn: 'Efficiency', value: '80 PLUS Platinum (92%+)' },
      { labelAr: 'نظام الأسلاك', labelEn: 'Modularity', value: 'Full Modular Cyber Ribbons' },
      { labelAr: 'مروحة التبريد', labelEn: 'Cooling Fan', value: '135mm Fluid Dynamic Bearing' },
    ],
    accentColor: '#00F0FF',
    explodedOffset: [0, 0, -12.0],
    centerOffset: [0, -14, -6],
  },
  motherboard: {
    id: 'motherboard',
    assemblyOrder: 3,
    nameAr: 'اللوحة الأم (Motherboard)',
    nameEn: 'ATX Mainboard (Z790 / X670E)',
    categoryAr: 'الجهاز العصبي المركزي',
    categoryEn: 'Central Nervous System',
    descriptionAr:
      'اللوحة الرئيسية التي تستقر على مسامير المباعدة وتربط كل أجزاء الحاسوب ببعضها عبر مسارات نحاسية متوهجة ومكثفات عالية الاستقرار.',
    descriptionEn:
      'Multi-layer server-grade PCB interconnecting CPU, GPU, memory, and storage across high-speed bus lines.',
    humanAnalogyTitleAr: 'الجهاز العصبي والعمود الفقري',
    humanAnalogyTitleEn: 'The Central Nervous System',
    humanAnalogyAr:
      'الجهاز العصبي والعمود الفقري 🧬 — يربط جميع الأعضاء ببعضها، وينقل الإشارات الكهربائية ونبضات البيانات بين الدماغ والحواس.',
    humanAnalogyEn:
      'The Nervous System & Spinal Cord — establishes seamless biological pathways linking all organs and shuttling synaptic electrical pulses.',
    humanIcon: '🧬',
    assemblyInstructionAr:
      'الخطوة 3: وجّه اللوحة الأم نحو درع المنافذ الخلفي (I/O Shield) واجعلها تستقر على مسامير المباعدة، ثم اربطها بـ 9 براغي دون شد مفرط.',
    assemblyInstructionEn:
      'Step 3: Align the rear I/O shield with the chassis cutout, lower the motherboard onto standoffs, and tighten nine mounting screws in an alternating pattern.',
    assemblyTipAr: 'نصيحة: احذر من ملامسة المفك للدوائر الإلكترونية أثناء ربط البراغي.',
    assemblyTipEn: 'Tip: Never over-tighten standoff screws to prevent multi-layer PCB micro-fractures.',
    keySpecs: [
      { labelAr: 'المعيار والحجم', labelEn: 'Form Factor', value: 'ATX (305 × 244 mm)' },
      { labelAr: 'مراحل الطاقة', labelEn: 'VRM Phases', value: '20+1+2 Digital Power Stages' },
      { labelAr: 'سرعة المسارات', labelEn: 'PCIe Bus', value: 'PCIe 5.0 x16 (128 GB/s)' },
      { labelAr: 'طبقات اللوحة', labelEn: 'PCB Layers', value: '8-Layer Heavy Copper' },
    ],
    accentColor: '#00F0FF',
    explodedOffset: [0, 0, 0],
    centerOffset: [-5.5, 2, 0],
  },
  cpu: {
    id: 'cpu',
    assemblyOrder: 4,
    nameAr: 'المعالج المركزي (CPU)',
    nameEn: 'Processor Core (Cyber-9 9950X)',
    categoryAr: 'عقل المنظومة الرقمية',
    categoryEn: 'Central Processing Engine',
    descriptionAr:
      'وحدة المعالجة المركزية، الدماغ الرقمي للحاسوب. يوضع داخل المقبس بحذر شديد مع مطابقة مؤشر السهم الذهبي.',
    descriptionEn:
      '16-core 32-thread high-frequency computing silicon resting directly in the precision socket.',
    humanAnalogyTitleAr: 'الدماغ والعقل المفكر',
    humanAnalogyTitleEn: 'The Brain & Logic Center',
    humanAnalogyAr:
      'الدماغ والعقل المفكر 🧠 — يفكر، يحسب، يقرر، ويصدر مليارات الأوامر في كل ثانية لتنسيق حركة كل المكونات.',
    humanAnalogyEn:
      'The Brain & Cognitive Core — calculates, reasons, and issues billions of instructions every microsecond to orchestrate the entire machine.',
    humanIcon: '🧠',
    assemblyInstructionAr:
      'الخطوة 4: ارفع ذراع قفل المقبس، وطابق مؤشر السهم الذهبي في زاوية المعالج مع سهم المقبس، ثم أنزل المعالج عمودياً دون ضغط وأعد إغلاق الذراع.',
    assemblyInstructionEn:
      'Step 4: Lift the socket retention lever, align the golden corner triangle with the socket mark, drop the CPU zero-insertion-force, and lock the tension arm down.',
    assemblyTipAr: 'نصيحة: لا تلمس السنون الذهبية أسفل المعالج أو في المقبس لتجنب انحنائها.',
    assemblyTipEn: 'Tip: Never touch socket contact pins; let gravity seat the processor naturally.',
    keySpecs: [
      { labelAr: 'الأنوية والمسارات', labelEn: 'Cores / Threads', value: '16 Cores / 32 Threads' },
      { labelAr: 'التردد الأقصى', labelEn: 'Boost Clock', value: '5.70 GHz' },
      { labelAr: 'ذاكرة الكاش', labelEn: 'L3 Cache', value: '64 MB 3D V-Cache' },
      { labelAr: 'دقة التصنيع', labelEn: 'Process Node', value: '4nm FinFET' },
    ],
    accentColor: '#9D00FF',
    explodedOffset: [4.5, 0, 0],
    centerOffset: [-5.6, 7.5, -1.0],
  },
  cooler: {
    id: 'cooler',
    assemblyOrder: 5,
    nameAr: 'المشتت الحراري والمروحة (Cooler)',
    nameEn: 'Tower Heatsink & High-Static Fan',
    categoryAr: 'منظومة التبديد والتبريد',
    categoryEn: 'Thermal Dissipation Matrix',
    descriptionAr:
      'مشتت التبريد مع قاعدة نحاسية و6 أنابيب حرارية ومروحة PWM تدفع الهواء الساخن للخارج، يتطلب معجوناً حرارياً لنقل الحرارة.',
    descriptionEn:
      'Twin-tower thermal heatsink with direct-contact copper coldplate and high-static airflow fan.',
    humanAnalogyTitleAr: 'الرئتان ومنظومة التنفس',
    humanAnalogyTitleEn: 'The Lungs & Respiratory System',
    humanAnalogyAr:
      'الرئتان والعرق البارد 🫁 — يمتص حرارة الدماغ العالية أثناء التفكير الشاق، ويطرد السخونة ليبقى العقل بارداً ومركزاً.',
    humanAnalogyEn:
      'The Lungs & Thermoregulatory System — breathes out computational heat exhaustion and circulates cool oxygen to prevent biological thermal throttling.',
    humanIcon: '🫁',
    assemblyInstructionAr:
      'الخطوة 5: ضع نقطة صغيرة من المعجون الحراري بحجم حبة البازلاء في منتصف غطاء المعالج، ثم ركب برج المشتت واربط براغيه بالتساوي ووصّل كابل المروحة بمنفذ CPU_FAN.',
    assemblyInstructionEn:
      'Step 5: Apply a pea-sized dot of thermal paste onto the IHS center, mount the cooler bracket, fasten retention screws diagonally, and plug into CPU_FAN header.',
    assemblyTipAr: 'نصيحة: تأكد من إزالة الملصق البلاستيكي الشفاف عن قاعدة المشتت النحاسية قبل التركيب!',
    assemblyTipEn: 'Tip: Crucial: peel off the clear protective plastic peel under the coldplate!',
    keySpecs: [
      { labelAr: 'أنابيب الحرارة', labelEn: 'Heatpipes', value: '6 × 6mm Sintered Copper' },
      { labelAr: 'عدد الزعانف', labelEn: 'Aluminum Fins', value: '42 Matrix Fins' },
      { labelAr: 'قدرة التبريد', labelEn: 'TDP Rating', value: '250W Dissipation' },
      { labelAr: 'مروحة التبريد', labelEn: 'Fan Specs', value: '140mm Fluid Dynamic PWM' },
    ],
    accentColor: '#00F0FF',
    explodedOffset: [12.5, 0, 0],
    centerOffset: [-2.5, 7.5, -1.0],
  },
  ram: {
    id: 'ram',
    assemblyOrder: 6,
    nameAr: 'الذاكرة العشوائية (RAM)',
    nameEn: 'Dual-Channel DDR5 RGB',
    categoryAr: 'الذاكرة اللحظية فائقة السرعة',
    categoryEn: 'High-Bandwidth Volatile Memory',
    descriptionAr:
      'شريحتا DDR5 بسرعة 6400MT/s. تُركبان في الشقين 2 و4 (Channel A2 & B2) للحصول على أفضل أداء مزدوج القناة.',
    descriptionEn:
      'Dual-channel high-frequency DDR5 memory modules protected by anodized heat armor with RGB glow.',
    humanAnalogyTitleAr: 'الذاكرة قصيرة المدى والانتباه',
    humanAnalogyTitleEn: 'Short-Term Working Memory',
    humanAnalogyAr:
      'الذاكرة قصيرة المدى ⚡ — تحتفظ بما تركز عليه وتفعله في هذه اللحظة بالذات، وتفرغ محتواها بمجرد النوم (إطفاء الجهاز).',
    humanAnalogyEn:
      'Short-Term Working Memory — stores what you are consciously interacting with right now; ultra-fast access, cleared whenever you sleep (shut down).',
    humanIcon: '⚡',
    assemblyInstructionAr:
      'الخطوة 6: افتح أقفال شقوق الذاكرة 2 و4، طابق فجوة الشريحة مع نتوء الشق، واضغط بالتساوي من الجانبين حتى تسمع نقرة القفل الأوتوماتيكية.',
    assemblyInstructionEn:
      'Step 6: Release clips on DIMM slots 2 & 4, align the module notch with the slot key, and press firmly on both ends until the locks snap in place.',
    assemblyTipAr: 'نصيحة: استخدام الشقين 2 و4 يضمن تفعيل تقنية Dual Channel بأعلى سرعات XMP/EXPO.',
    assemblyTipEn: 'Tip: Always use slots 2 and 4 (A2/B2) for optimum signal integrity and XMP stability.',
    keySpecs: [
      { labelAr: 'السعة الكلية', labelEn: 'Total Capacity', value: '64 GB (2 × 32 GB)' },
      { labelAr: 'التردد وسرعة النقل', labelEn: 'Speed', value: 'DDR5-6400 MT/s' },
      { labelAr: 'توقيت الاستجابة', labelEn: 'CAS Latency', value: 'CL32-38-38-96' },
      { labelAr: 'فولتية التشغيل', labelEn: 'Voltage', value: '1.35V Intel XMP / EXPO' },
    ],
    accentColor: '#FF007A',
    explodedOffset: [0, 8.0, 0],
    centerOffset: [-5.0, 7.5, 1.8],
  },
  ssd: {
    id: 'ssd',
    assemblyOrder: 7,
    nameAr: 'وحدة التخزين (M.2 NVMe SSD)',
    nameEn: 'Gen5 M.2 NVMe Storage',
    categoryAr: 'مستودع البيانات فائق السرعة',
    categoryEn: 'Ultra-Fast PCIe 5.0 Flash',
    descriptionAr:
      'قرص تخزين صلب PCIe 5.0 x4 فائق السرعة، يركب في شق M.2 الأساسي المرتبط مباشرة بالمعالج ومغطى بمشتت ألمنيوم.',
    descriptionEn:
      'PCIe 5.0 x4 NVMe solid state drive equipped with high-conductivity thermal pads and aluminum heat armor.',
    humanAnalogyTitleAr: 'الذاكرة طويلة المدى والذكريات',
    humanAnalogyTitleEn: 'Long-Term Memory & Archives',
    humanAnalogyAr:
      'الذاكرة طويلة المدى 💾 — دفتر ذكرياتك الدائم؛ يحفظ صورك، برامجك، وسنوات حياتك ويبقى صامداً حتى عند انقطاع الكهرباء.',
    humanAnalogyEn:
      'Long-Term Memory & Lifelong Archive — stores your indelible memories, files, and dreams securely even across decades of slumber.',
    humanIcon: '💾',
    assemblyInstructionAr:
      'الخطوة 7: ارفع مشتت M.2 المعدني، وأدخل القرص في المنفذ بزاوية 30 درجة حتى يستقر، ثم اخفضه وثبته بالبرغي أو القفل السريع وأعد المشتت مكانه.',
    assemblyInstructionEn:
      'Step 7: Remove the motherboard M.2 armor plate, insert the SSD at a 30-degree angle, press down flush, fasten the retention screw, and reinstall the heatsink.',
    assemblyTipAr: 'نصيحة: تأكد من نزع الغلاف الأزرق عن الوسادة الحرارية (Thermal Pad) أسفل المشتت.',
    assemblyTipEn: 'Tip: Peel off the protective film from the pre-applied thermal pad beneath the heatsink.',
    keySpecs: [
      { labelAr: 'السعة التخزينية', labelEn: 'Capacity', value: '4,000 GB (4 TB)' },
      { labelAr: 'سرعة القراءة', labelEn: 'Seq. Read', value: '12,400 MB/s' },
      { labelAr: 'سرعة الكتابة', labelEn: 'Seq. Write', value: '11,800 MB/s' },
      { labelAr: 'واجهة التوصيل', labelEn: 'Interface', value: 'PCIe Gen5 x4 NVMe 2.0' },
    ],
    accentColor: '#9D00FF',
    explodedOffset: [2.5, -2.5, 3.5],
    centerOffset: [-5.2, -2.5, 2.0],
  },
  gpu: {
    id: 'gpu',
    assemblyOrder: 8,
    nameAr: 'كرت الشاشة (GPU)',
    nameEn: 'Cyber-Titan RTX GPU',
    categoryAr: 'محرك المعالجة الرسومية والذكاء الاصطناعي',
    categoryEn: 'Visual & Tensor Compute Engine',
    descriptionAr:
      'أكبر قطعة تُركب في الحاسوب. تتصل بشق PCIe 5.0 x16 الأساسي وتُثبت ببراغي الهيكل الخلفية وتتطلب كابل 12VHPWR عالي الطاقة.',
    descriptionEn:
      'Heavyweight triple-slot graphics card with vapor chamber cooling, dual fans, and 24GB GDDR6X VRAM.',
    humanAnalogyTitleAr: 'العين والخيال الإبداعي',
    humanAnalogyTitleEn: 'The Eyes & Creative Imagination',
    humanAnalogyAr:
      'العين والخيال البصري 👁️ — يرسم الصور، ينسج العوالم ثلاثية الأبعاد، ويحول الأرقام الحسابية المجردة إلى مشاعر وألوان تراها.',
    humanAnalogyEn:
      'The Eyes & Visual Imagination — paints reality in real-time, renders vibrant 3D dreams, and translates raw numbers into visible light and beauty.',
    humanIcon: '👁️',
    assemblyInstructionAr:
      'الخطوة 8: انزع أغطية شقوق الهيكل الخلفية، وافتح قفل شق PCIe 5.0 x16، ثم ادفع الكارت حتى يستقر ويُغلق القفل، وثبته ببراغي الهيكل وصل كابل الطاقة 16-Pin.',
    assemblyInstructionEn:
      'Step 8: Remove two chassis expansion brackets, release PCIe slot latch, push the GPU down until click, screw into chassis bracket, and plug in the 12VHPWR cable.',
    assemblyTipAr: 'نصيحة: تأكد من إحكام إدخال كابل الطاقة 12VHPWR بالكامل حتى لا يترك أي فراغ لتجنب ارتفاع الحرارة.',
    assemblyTipEn: 'Tip: Ensure the 12VHPWR power cable is fully seated flush with no bend near the plug.',
    keySpecs: [
      { labelAr: 'ذاكرة الفيديو', labelEn: 'VRAM', value: '24 GB GDDR6X (384-bit)' },
      { labelAr: 'أنوية المعالجة', labelEn: 'Cores', value: '16,384 CUDA / Stream' },
      { labelAr: 'عرض النطاق', labelEn: 'Bandwidth', value: '1,008 GB/s' },
      { labelAr: 'منفذ الطاقة', labelEn: 'Power Cable', value: '16-Pin 12VHPWR (450W)' },
    ],
    accentColor: '#00F0FF',
    explodedOffset: [0, -4.5, 9.5],
    centerOffset: [0, -4.5, 4.0],
  },
  internet: {
    id: 'internet',
    assemblyOrder: 9,
    nameAr: 'شبكة الإنترنت والكرة الأرضية (Internet)',
    nameEn: 'Global Network & Cloud Cyber-Link',
    categoryAr: 'حواس الاتصال الكوني',
    categoryEn: 'Planetary Sensory Link',
    descriptionAr:
      'كابل الإيثرنت والألياف الضوئية المتصلة باللوحة الأم، تمتد إلى خارج الهيكل وتتصل بالكرة الأرضية الافتراضية، لنقل حزم البيانات حول العالم.',
    descriptionEn:
      'Fiber-optic ultra-broadband network interface streaming packet telemetry to the global holographic Earth sphere.',
    humanAnalogyTitleAr: 'الحواس والاتصال بالعالم',
    humanAnalogyTitleEn: 'The Senses & Global Consciousness',
    humanAnalogyAr:
      'الحواس والاتصال بالعالم 🌐 — نافذة الكائن على الكون؛ يربطه بمليارات العقول الأخرى عبر المحيطات والأقمار الصناعية.',
    humanAnalogyEn:
      'The Senses & Cosmic Network — the organism window to the globe, uniting its consciousness with billions of minds across continents.',
    humanIcon: '🌐',
    assemblyInstructionAr:
      'توصيل كابل الألياف الضوئية من منفذ الإيثرنت 10GbE باللوحة الأم نحو البوابة الكونية.',
    assemblyInstructionEn:
      'Connect high-bandwidth optical line from motherboard 10GbE port to the planetary cyber link.',
    assemblyTipAr: 'نصيحة: الاتصال السلكي يضمن أدنى زمن تأخير (Ping) واستقرار الحزم.',
    assemblyTipEn: 'Tip: Wired optical connects guarantee microsecond packet latencies.',
    keySpecs: [
      { labelAr: 'سرعة الشبكة', labelEn: 'Throughput', value: '10,000 Mbps (10GbE Fiber)' },
      { labelAr: 'زمن الاستجابة', labelEn: 'Ping / Latency', value: '1 ms Ultra-Low' },
      { labelAr: 'البروتوكول', labelEn: 'Protocol', value: 'TCP/IP IPv6 Encrypted' },
      { labelAr: 'نطاق الاتصال', labelEn: 'Coverage', value: 'Planetary Cyber Grid' },
    ],
    accentColor: '#00F0FF',
    explodedOffset: [0, 0, 0],
    centerOffset: [22.0, 14.0, -14.0],
  },
  battery: {
    id: 'battery',
    assemblyOrder: 2,
    nameAr: 'بطارية الليثيوم المدمجة (Battery Pack)',
    nameEn: '99.9Wh High-Density Li-Polymer Battery',
    categoryAr: 'مستودع الطاقة الحيوية المتنقلة',
    categoryEn: 'Mobile Energy Cell Reservoir',
    descriptionAr:
      'حزمة بطارية ليثيوم بوليمر عالية الكثافة بقدرة 99.9 واط/ساعة مدمجة أسفل مسند اليدين، تمنح اللابتوب قدرة العمل لساعات طويلة مع نظام شحن ذكي بقوة 140 واط عبر منفذ USB-C.',
    descriptionEn:
      'Ultra-thin 99.9Wh smart lithium-polymer 4-cell battery pack seated underneath the trackpad and palm-rest area.',
    humanAnalogyTitleAr: 'مخزون الطاقة والدهون الحيوية',
    humanAnalogyTitleEn: 'The Energy Reserves & Bio-Lipids',
    humanAnalogyAr:
      'مخزون الطاقة والدهون 🔋 — يختزن الطاقة ليمنح الكائن حرية الحركة والانطلاق في العالم دون أن يظل مقيداً بمقبس الكهرباء الثابت.',
    humanAnalogyEn:
      'Energy Reserves & Vital Stamina — stores chemical energy, freeing the digital organism to roam and think untethered from wall outlets.',
    humanIcon: '🔋',
    assemblyInstructionAr:
      'الخطوة 2: ثبّت خلايا البطارية في التجويف المخصص أسفل مسند اليدين ووصّل الشريط الإلكتروني باللوحة الأم وأحكم ربط مسامير التثبيت.',
    assemblyInstructionEn:
      'Step 2: Align the multi-cell battery into the lower tray and secure the ribbon connector to the mainboard.',
    assemblyTipAr: 'نصيحة: احذر من ثني أو ثقب خلايا الليثيوم، وتأكد من قفل شريط التوصيل بحذر.',
    assemblyTipEn: 'Tip: Handle lithium pouches with care and ensure the battery latch clicks securely.',
    keySpecs: [
      { labelAr: 'السعة الإجمالية', labelEn: 'Capacity', value: '99.9 Wh (FAA Maximum)' },
      { labelAr: 'بنية الخلايا', labelEn: 'Cell Chemistry', value: '4-Cell Lithium-Polymer' },
      { labelAr: 'سرعة الشحن', labelEn: 'Fast Charging', value: '140W USB-PD 3.1 SuperCharge' },
      { labelAr: 'نظام الحماية', labelEn: 'BMS Protection', value: 'Dual-Channel Smart Temp Matrix' },
    ],
    accentColor: '#10B981',
    explodedOffset: [0, -3.5, 3.5],
    centerOffset: [0, -0.6, 3.5],
  },
  display: {
    id: 'display',
    assemblyOrder: 8,
    nameAr: 'شاشة العرض والمفصلة (OLED Screen & Hinge)',
    nameEn: '16-inch 240Hz OLED Display & Hinge Assembly',
    categoryAr: 'مرآة الرؤية ونافذة التعبير',
    categoryEn: 'Visual Projection Matrix',
    descriptionAr:
      'لوحة OLED مذهلة بدقة 3.2K ومعدل تحديث 240Hz متصلة بمفصلتين ميكانيكيتين من سبائك الزنك والتيتانيوم تسمحان بطي وفتح الشاشة بسلاسة فائقة.',
    descriptionEn:
      'Razor-thin 16-inch 3.2K 240Hz OLED panel mounted on dual high-torque zinc-alloy hinges capable of 180-degree articulation.',
    humanAnalogyTitleAr: 'مرآة الروح ونافذة التعبير',
    humanAnalogyTitleEn: 'The Face & Window to the Soul',
    humanAnalogyAr:
      'مرآة الروح والوجه 💻 — تعبر عما يدور في أعماق العقل الرقمي؛ تنفتح وتغلق لتتواصل بصرياً مع العالم الخارجي بألوان حية.',
    humanAnalogyEn:
      'The Face & Expression — opens and closes to reflect the inner consciousness and vivid dreams of the machine to the observer.',
    humanIcon: '💻',
    assemblyInstructionAr:
      'الخطوة 8: ثبت مسامير المفصلتين الميكانيكيتين بهيكل القاعدة، ووصّل كابل eDP عالي السرعة وكابل الكاميرا بمقبس اللوحة الأم.',
    assemblyInstructionEn:
      'Step 8: Fasten the dual display hinges to the chassis mounts and connect the high-bandwidth eDP ribbon cable.',
    assemblyTipAr: 'نصيحة: تأكد من تمرير كابل الشاشة داخل المجرى المخصص لمنع احتكاكه مع المفصلة أثناء الفتح والإغلاق.',
    assemblyTipEn: 'Tip: Route the display cable through the stress-relief channel before tightening hinge screws.',
    keySpecs: [
      { labelAr: 'نوع اللوحة', labelEn: 'Panel Type', value: '16.0" 3.2K OLED Nano-Edge' },
      { labelAr: 'معدل التحديث', labelEn: 'Refresh Rate', value: '240Hz (0.2ms GtG Response)' },
      { labelAr: 'المفصلة الميكانيكية', labelEn: 'Hinge Design', value: 'Precision Zinc-Alloy 180°' },
      { labelAr: 'تغطية الألوان', labelEn: 'Color Gamut', value: '100% DCI-P3 (Delta-E < 1)' },
    ],
    accentColor: '#9D00FF',
    explodedOffset: [0, 8.0, -8.0],
    centerOffset: [0, 8.0, -5.0],
  },
};

export const DEVICE_CONFIGS: Record<DeviceType, DeviceMetadata> = {
  desktop: {
    id: 'desktop',
    nameAr: 'كمبيوتر مكتبي (Desktop)',
    nameEn: 'Tower Desktop',
    icon: '🖥️',
    descriptionAr: 'حاسوب برجي متكامل بمساحة تهوية واسعة وقوة معالجة خارقة قابلة للترقية الكاملة.',
    descriptionEn: 'Full-tower workstation chassis with maximum modularity and cooling volume.',
    cameraDefault: {
      position: [28, 22, 32],
      target: [0, 0, 0],
      minDistance: 6,
      maxDistance: 120,
    },
    assemblySequence: ['case', 'psu', 'motherboard', 'cpu', 'cooler', 'ram', 'ssd', 'gpu'],
  },
  laptop: {
    id: 'laptop',
    nameAr: 'لابتوب فائق النحافة (Laptop)',
    nameEn: 'Cyber-Ultrabook',
    icon: '💻',
    descriptionAr: 'هندسة تكديس مدمجة فائقة الدقة تجمع المعالجة والشاشة والبطارية في هيكل نحيف محمول.',
    descriptionEn: 'Ultra-dense precision engineering fusing battery, display, and mobile silicon.',
    cameraDefault: {
      position: [18, 14, 20],
      target: [0, 2, 0],
      minDistance: 4,
      maxDistance: 80,
    },
    assemblySequence: ['case', 'battery', 'motherboard', 'cpu', 'cooler', 'ram', 'ssd', 'display'],
  },
  minipc: {
    id: 'minipc',
    nameAr: 'ميني بي سي (Mini-PC)',
    nameEn: 'Compact NUC Node',
    icon: '🔲',
    descriptionAr: 'صندوق مكعب مصغر 4×4 مكدس بالعتاد عالي الكفاءة مع تهوية موجهة ومروحة طرد مركزية.',
    descriptionEn: 'Ultra-small-form-factor 4x4 node packed with high-density server silicon.',
    cameraDefault: {
      position: [14, 12, 16],
      target: [0, 0, 0],
      minDistance: 3,
      maxDistance: 60,
    },
    assemblySequence: ['case', 'psu', 'motherboard', 'cpu', 'cooler', 'ram', 'ssd', 'gpu'],
  },
};

export const ASSEMBLY_SEQUENCE: HardwareComponentId[] = [
  'case',
  'psu',
  'motherboard',
  'cpu',
  'cooler',
  'ram',
  'ssd',
  'gpu',
];

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'iso',
    labelAr: 'منظور بطولي (Iso)',
    labelEn: 'Isometric Hero',
    position: [28, 22, 32],
    target: [0, 0, 0],
  },
  {
    id: 'front',
    labelAr: 'المقدمة (Front)',
    labelEn: 'Front View',
    position: [0, 2, 42],
    target: [0, 0, 0],
  },
  {
    id: 'side',
    labelAr: 'الجانب الداخلي (Side)',
    labelEn: 'Internal Side',
    position: [40, 2, 0],
    target: [0, 0, 0],
  },
  {
    id: 'top',
    labelAr: 'من الأعلى (Top)',
    labelEn: 'Top-Down Planar',
    position: [0, 44, 4],
    target: [0, 0, 0],
  },
  {
    id: 'macro_cpu',
    labelAr: 'المعالج (CPU Close-Up)',
    labelEn: 'CPU Close-Up',
    position: [12, 6, 8],
    target: [0, 4, 0],
  },
  {
    id: 'macro_gpu',
    labelAr: 'كرت الشاشة (GPU Macro)',
    labelEn: 'GPU Close-Up',
    position: [14, -6, 16],
    target: [0, -5, 6],
  },
  {
    id: 'globe',
    labelAr: 'الإنترنت والكرة الأرضية',
    labelEn: 'Global Network',
    position: [28, 16, -14],
    target: [22, 14, -14],
  },
];
