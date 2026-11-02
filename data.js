window.WS_DATA = {
  traditions: [
    {slug:"christianity", name:"Bible", faith:"Christianity", symbol:"✝", languages:[
      {key:"en",label:"English",short:"EN",locale:"en-US",source:"King James Version (1611)"},
      {key:"es",label:"Español",short:"ES",locale:"es-ES",source:"Reina-Valera (public domain)"},
      {key:"hi",label:"हिन्दी",short:"HI",locale:"hi-IN",source:"Scroll My Faith rendering — review before publication"}
    ]},
    {slug:"islam", name:"Qur’an", faith:"Islam", symbol:"☾", languages:[
      {key:"en",label:"English",short:"EN",locale:"en-US",source:"Pickthall (1930)"},
      {key:"ar",label:"العربية",short:"AR",locale:"ar-SA",source:"Original Arabic"},
      {key:"ur",label:"اردو",short:"UR",locale:"ur-PK",source:"Scroll My Faith rendering — review before publication"},
      {key:"hi",label:"हिन्दी",short:"HI",locale:"hi-IN",source:"Scroll My Faith rendering — review before publication"}
    ]},
    {slug:"hinduism", name:"Bhagavad Gita", faith:"Hinduism", symbol:"ॐ", languages:[
      {key:"en",label:"English",short:"EN",locale:"en-US",source:"Besant & Das (1905)"},
      {key:"hi",label:"हिन्दी",short:"HI",locale:"hi-IN",source:"Scroll My Faith rendering — review before publication"},
      {key:"sa",label:"संस्कृत",short:"SA",locale:"sa-IN",source:"Original Sanskrit"}
    ]},
    {slug:"buddhism", name:"Dhammapada", faith:"Buddhism", symbol:"☸", languages:[
      {key:"en",label:"English",short:"EN",locale:"en-US",source:"F. Max Müller (1881)"},
      {key:"pi",label:"Pāli",short:"PI",locale:"pi",source:"Pāli text"},
      {key:"hi",label:"हिन्दी",short:"HI",locale:"hi-IN",source:"Scroll My Faith rendering — review before publication"}
    ]},
    {slug:"judaism", name:"Tanakh", faith:"Judaism", symbol:"✡", languages:[
      {key:"en",label:"English",short:"EN",locale:"en-US",source:"JPS (1917)"},
      {key:"he",label:"עברית",short:"HE",locale:"he-IL",source:"Hebrew text"}
    ]},
    {slug:"sikhism", name:"Guru Granth Sahib", faith:"Sikhism", symbol:"ੴ", languages:[
      {key:"en",label:"English",short:"EN",locale:"en-US",source:"Macauliffe (1909)"},
      {key:"pa",label:"ਪੰਜਾਬੀ",short:"PA",locale:"pa-IN",source:"Gurmukhi text"},
      {key:"hi",label:"हिन्दी",short:"HI",locale:"hi-IN",source:"Scroll My Faith rendering — review before publication"}
    ]},
    {slug:"taoism", name:"Tao Te Ching", faith:"Taoism", symbol:"☯", languages:[
      {key:"en",label:"English",short:"EN",locale:"en-US",source:"James Legge (1891)"},
      {key:"zh",label:"中文",short:"ZH",locale:"zh-CN",source:"Classical Chinese text"}
    ]}
  ],
  passages: [
    {id:1,tradition:"christianity",citation:"Psalm 23:1",topics:["comfort","grief","trust"],context:"A psalm of trust that pictures God as a shepherd who provides and guides.",text:{en:"The LORD is my shepherd; I shall not want.",es:"Jehová es mi pastor; nada me faltará.",hi:"प्रभु मेरा चरवाहा है; मुझे किसी बात की कमी न होगी।"}},
    {id:2,tradition:"christianity",citation:"Matthew 5:9",topics:["peace","forgiveness","community"],context:"From the Beatitudes in the Sermon on the Mount, praising those who actively make peace.",text:{en:"Blessed are the peacemakers: for they shall be called the children of God.",es:"Bienaventurados los pacificadores, porque ellos serán llamados hijos de Dios.",hi:"धन्य हैं वे जो मेल कराते हैं, क्योंकि वे परमेश्वर के पुत्र कहलाएँगे।"}},
    {id:3,tradition:"christianity",citation:"Romans 12:21",topics:["anger","forgiveness","discipline"],context:"Paul closes a section on responding to hostility without revenge.",text:{en:"Be not overcome of evil, but overcome evil with good.",es:"No seas vencido de lo malo; mas vence con el bien el mal.",hi:"बुराई से मत हारो, बल्कि भलाई से बुराई पर विजय पाओ।"}},

    {id:4,tradition:"islam",citation:"Qur’an 94:5",topics:["hope","grief","anxiety"],context:"A short assurance from Surat Ash-Sharh that hardship is accompanied by relief.",text:{en:"But lo! with hardship goeth ease,",ar:"فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",ur:"پس بے شک مشکل کے ساتھ آسانی ہے۔",hi:"निस्संदेह कठिनाई के साथ आसानी है।"}},
    {id:5,tradition:"islam",citation:"Qur’an 2:286",topics:["responsibility","anxiety","purpose"],context:"The closing verse of Al-Baqarah emphasizes responsibility within human capacity.",text:{en:"Allah tasketh not a soul beyond its scope.",ar:"لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا",ur:"اللہ کسی جان پر اس کی طاقت سے بڑھ کر بوجھ نہیں ڈالتا۔",hi:"अल्लाह किसी प्राणी पर उसकी क्षमता से अधिक भार नहीं डालता।"}},
    {id:6,tradition:"islam",citation:"Qur’an 49:13",topics:["community","diversity","purpose"],context:"A passage addressing humanity and framing diversity as a basis for mutual recognition.",text:{en:"We have made you nations and tribes that ye may know one another.",ar:"وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا",ur:"اور ہم نے تمہیں قومیں اور قبیلے بنایا تاکہ تم ایک دوسرے کو پہچانو۔",hi:"हमने तुम्हें जातियों और क़बीलों में बनाया ताकि तुम एक-दूसरे को पहचानो।"}},

    {id:7,tradition:"hinduism",citation:"Bhagavad Gita 2:47",topics:["duty","action","detachment"],context:"Krishna teaches Arjuna to focus on right action rather than attachment to outcomes.",text:{en:"Thy business is with the action only, never with its fruits.",hi:"तुम्हारा अधिकार केवल कर्म करने में है, उसके फलों में कभी नहीं।",sa:"कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।"}},
    {id:8,tradition:"hinduism",citation:"Bhagavad Gita 6:5",topics:["discipline","mind","purpose"],context:"A teaching on self-mastery and the mind as a force that can elevate or diminish a person.",text:{en:"Let him raise himself by his Self, and not degrade himself.",hi:"मनुष्य को अपने द्वारा अपना उत्थान करना चाहिए, स्वयं को गिराना नहीं चाहिए।",sa:"उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।"}},
    {id:9,tradition:"hinduism",citation:"Bhagavad Gita 12:13",topics:["love","compassion","anger"],context:"From Krishna’s description of the qualities of a devoted person.",text:{en:"He who beareth no ill-will to any being, who is friendly and compassionate.",hi:"जो किसी प्राणी से द्वेष नहीं करता, जो मित्रवत और करुणामय है।",sa:"अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च।"}},

    {id:10,tradition:"buddhism",citation:"Dhammapada 1",topics:["mind","intention","discipline"],context:"The opening of the Dhammapada emphasizes the formative role of mind and intention.",text:{en:"All that we are is the result of what we have thought.",pi:"Manopubbaṅgamā dhammā, manoseṭṭhā manomayā.",hi:"हम जो कुछ हैं, वह हमारे विचारों का परिणाम है।"}},
    {id:11,tradition:"buddhism",citation:"Dhammapada 5",topics:["peace","anger","love"],context:"An early Dhammapada teaching on breaking cycles of hostility through non-hatred.",text:{en:"Hatred does not cease by hatred at any time: hatred ceases by love.",pi:"Na hi verena verāni sammantīdha kudācanaṃ; averena ca sammanti.",hi:"घृणा से घृणा कभी समाप्त नहीं होती; प्रेम से ही समाप्त होती है।"}},
    {id:12,tradition:"buddhism",citation:"Dhammapada 183",topics:["discipline","goodness","mind"],context:"A concise summary of Buddhist ethical practice: restraint, wholesome action, and mental cultivation.",text:{en:"Not to commit any sin, to do good, and to purify one's mind.",pi:"Sabbapāpassa akaraṇaṃ, kusalassa upasampadā, sacittapariyodapanaṃ.",hi:"बुराई न करना, भलाई करना और अपने मन को शुद्ध करना।"}},

    {id:13,tradition:"judaism",citation:"Proverbs 3:5",topics:["trust","anxiety","purpose"],context:"A proverb counseling trust in God rather than relying exclusively on one’s own judgment.",text:{en:"Trust in the LORD with all thy heart, and lean not upon thine own understanding.",he:"בְּטַח אֶל־יְהוָה בְּכָל־לִבֶּךָ וְאֶל־בִּינָתְךָ אַל־תִּשָּׁעֵן׃"}},
    {id:14,tradition:"judaism",citation:"Psalm 34:15",topics:["peace","discipline","goodness"],context:"A psalmic instruction combining moral restraint with active pursuit of peace.",text:{en:"Depart from evil, and do good; seek peace, and pursue it.",he:"סוּר מֵרָע וַעֲשֵׂה־טוֹב בַּקֵּשׁ שָׁלוֹם וְרָדְפֵהוּ׃"}},
    {id:15,tradition:"judaism",citation:"Micah 6:8",topics:["justice","mercy","humility"],context:"The prophet Micah condenses religious duty into justice, mercy, and humility.",text:{en:"Do justly, and to love mercy, and to walk humbly with thy God.",he:"עֲשׂוֹת מִשְׁפָּט וְאַהֲבַת חֶסֶד וְהַצְנֵעַ לֶכֶת עִם־אֱלֹהֶיךָ׃"}},

    {id:16,tradition:"sikhism",citation:"Mool Mantar",topics:["truth","oneness","purpose"],context:"The opening creed of Sikh scripture begins by describing the oneness and attributes of the Divine.",text:{en:"There is but one God, whose name is True, the Creator, devoid of fear and enmity.",pa:"ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ",hi:"एक परम सत्य है; उसका नाम सत्य है, वह सृष्टिकर्ता है, निर्भय और निर्वैर है।"}},
    {id:17,tradition:"sikhism",citation:"Japji Sahib 1",topics:["truth","discipline","purpose"],context:"Guru Nanak poses the central question of truthful living at the beginning of Japji Sahib.",text:{en:"How shall man become true before God? How shall the veil of falsehood be rent?",pa:"ਕਿਵ ਸਚਿਆਰਾ ਹੋਈਐ ਕਿਵ ਕੂੜੈ ਤੁਟੈ ਪਾਲਿ ॥",hi:"मनुष्य सत्यवान कैसे बने? असत्य का पर्दा कैसे हटे?"}},
    {id:18,tradition:"sikhism",citation:"Japji Sahib 1 — Hukam",topics:["acceptance","purpose","discipline"],context:"The answer points toward living in harmony with hukam, the Divine order or command.",text:{en:"By walking, O Nanak, according to the will of the Commander as pre-ordained.",pa:"ਹੁਕਮਿ ਰਜਾਈ ਚਲਣਾ ਨਾਨਕ ਲਿਖਿਆ ਨਾਲਿ ॥",hi:"नानक कहते हैं: हुक्म के अनुसार चलना ही मार्ग है।"}},

    {id:19,tradition:"taoism",citation:"Tao Te Ching 8",topics:["humility","peace","purpose"],context:"Water becomes an image for benefiting others without striving for status or dominance.",text:{en:"The highest excellence is like that of water.",zh:"上善若水。"}},
    {id:20,tradition:"taoism",citation:"Tao Te Ching 33",topics:["self-knowledge","wisdom","purpose"],context:"A contrast between knowledge of others and deeper self-knowledge.",text:{en:"He who knows other men is discerning; he who knows himself is intelligent.",zh:"知人者智，自知者明。"}},
    {id:21,tradition:"taoism",citation:"Tao Te Ching 64",topics:["discipline","beginnings","purpose"],context:"A familiar image about beginning large undertakings through small, concrete action.",text:{en:"A journey of a thousand li commenced with a single step.",zh:"千里之行，始於足下。"}}
  ],
  topics:["peace","anxiety","grief","purpose","love","forgiveness","discipline","justice","compassion","trust"]
};