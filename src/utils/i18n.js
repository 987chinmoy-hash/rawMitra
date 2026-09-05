// Comprehensive multi-language dictionary for rawMitra
// Supporting English (en), Hindi (hi), and Assamese (as).
// Fully addresses the hackathon "Language problem" challenge across the entire portal.

import { useAppState } from '../context/AppContext.jsx'

export const TRANSLATIONS = {
  en: {
    // Nav
    portalTitle: 'Shared Raw Material Procurement & Cost Coordination Portal',
    searchPlaceholder: 'Search by material, name or location (≥ 2 fields)...',
    priceOutlook: 'Price outlook',
    guidebook: 'Guidebook',
    getStarted: 'Get started',
    switchRole: 'Switch role',
    logIn: 'Log in',
    signOut: 'Sign out',
    trustAudit: '🛡️ Trust Audit',

    // Stepper
    stepDetails: 'Your details',
    stepNeeds: 'Material needs',
    stepMatch: 'Match & buy',
    stepConfirm: 'Confirm',
    stepTrack: 'Track',
    stepStock: 'Details & stock',
    stepPricing: 'Pricing & logistics',
    stepCoordDetails: 'Coordinator details',
    stepCoordDash: 'Dashboard',

    // Welcome Hero & Steps
    
    welcomeHeroTitle: 'Welcome to rawMitra.',
    welcomeHeroSub: 'Small artisans working with bamboo, yarn, clay, dyes, metal or packaging materials rarely get bulk prices alone. rawMitra groups nearby artisans who need the same materials, connects them to suppliers for a fair bulk rate, and calculates each person\'s material cost and fair transport share — start to finish.',
    enterBtn: 'Enter rawMitra',
    readGuideBtn: 'Read the guidebook',
    howTitle: 'How a deal comes together',
    howStep1Title: 'List what you need',
    howStep1Desc: 'Artisans list material, quantity and required date. Suppliers list what they stock and wholesale prices.',
    howStep2Title: 'Get grouped automatically',
    howStep2Desc: 'Nearby artisans with matching material needs are grouped so the combined order qualifies for bulk pricing.',
    howStep3Title: 'Compare and confirm',
    howStep3Desc: 'Pick a supplier by price, quality rating and distance, review your fair transport share, and confirm.',
    howStep4Title: 'Ship and track',
    howStep4Desc: 'A coordinator takes the deal from confirmation through pickup or shipment to final delivery.',

    // Role Select
    roleSelectTitle: 'Who are you joining as?',
    roleSelectSub: 'Choose the role that fits what you\'re bringing to a deal. You can switch roles any time from the top bar.',
    artisanTitle: 'Artisan',
    artisanDesc: 'You make things by hand and need raw materials — bamboo, yarn, clay, dyes, metal or packaging — at a fair price.',
    artisanPoint1: 'List what you need',
    artisanPoint2: 'Get grouped with nearby artisans',
    artisanPoint3: 'Buy in bulk at a better rate',
    artisanCta: 'Continue as Artisan →',

    supplierTitle: 'Supplier',
    supplierDesc: 'You stock raw materials and want to sell in bulk to grouped artisans instead of one at a time.',
    supplierPoint1: 'List your stock and wholesale pricing',
    supplierPoint2: 'Reach grouped bulk orders',
    supplierPoint3: 'Offer pickup or shipment',
    supplierCta: 'Continue as Supplier →',

    coordinatorTitle: 'Coordinator',
    coordDesc: 'You handle logistics — you oversee a confirmed deal through pickup, shipment and delivery.',
    coordPoint1: 'Get matched to confirmed deals',
    coordPoint2: 'Track pickup and shipment',
    coordPoint3: 'Build a delivery track record',
    coordCta: 'Continue as Coordinator →',

    // Rules Banner
    rulesToggle: 'Violating / ignoring important rules',
    rule1: 'Every listing must use accurate, current details — Aadhar and phone number are used only to verify identity and are never shown publicly in full.',
    rule2: 'Material specifications, quantity and pricing must be honest. Deliberately misrepresenting quality or stock leads to account suspension.',
    rule3: 'Once an order is confirmed by all parties, cancelling it triggers the penalty charge described below — this protects everyone who already committed materials or transport.',
    rule4: 'Coordinators handling shipment or pickup are accountable for the condition of goods in transit and must update tracking status truthfully.',
    rule5: 'Abusive behaviour, fake reviews, or repeated no-shows toward a matched group can result in removal from rawMitra.',
    penaltyTitle: 'Cancellation penalty:',
    penaltyDesc: 'cancelling a confirmed order costs 10% of your share of the order value, paid to the other members of the group and the supplier to cover reserved materials. Repeated cancellations raise this rate and may suspend your account.',

    // Artisan Register
    artisanRegTitle: 'Tell us about your workshop',
    artisanRegSub: 'This is what suppliers and your matched artisan group will see about you.',
    fullName: 'Full name',
    aadharNum: 'Aadhar number',
    aadharHint: 'Used only to verify identity — never shown publicly in full.',
    storeLoc: 'Location of your store / workshop',
    phoneNum: 'Mobile phone number',
    phoneHint: 'Used for order coordination and delivery updates.',
    nextMaterialBtn: 'Next: List your material needs →',

    // Artisan Materials
    materialsTitle: 'What materials do you need?',
    materialsSub: 'Add one line per material. rawMitra groups these with matching requests from nearby artisans to unlock bulk pricing.',
    categoryLabel: 'Material category',
    specLabel: 'Specific grade, count or description',
    qtyLabel: 'Quantity needed',
    unitLabel: 'Unit',
    locLabel: 'Delivery / pickup location',
    reqDateLabel: 'Needed by date',
    addAnotherLine: '+ Add another material',
    findMatchesBtn: 'Find matching groups & bulk suppliers →',

    // Artisan Matching
    matchingTitle: 'Your matched groups',
    matchingSub: 'Requests are grouped by material, specification and nearby location so the combined order qualifies for bulk pricing.',
    groupBuy: 'Group Bulk Buy',
    buyAlone: 'Buy Alone',
    noMaterialsListed: 'You haven\'t listed a material requirement yet.',
    addMaterialReqBtn: 'Add a material request',
    combinedBulk: 'combined bulk',
    soloBuying: 'buying alone',
    groupedWith: 'Grouped participants',
    ruleEnforcedNotice: 'Rule Enforced: A participant withdrew from this group. Quantities and cost shares have been recalculated immediately per Important Rules.',
    noSupplierMatch: 'No supplier currently matches this material.',
    broadcastDealBtn: 'Broadcast an in-app pooled request instead →',
    colSupplier: 'Supplier',
    colUnitPrice: 'Unit Price',
    colTransport: 'Transport',
    colValidity: 'Quote Validity',
    colRating: 'Rating',
    colLogistics: 'Logistics',
    btnSelect: 'Select',
    btnSelected: 'Selected',
    soloHeading: 'Solo Purchase Comparison',
    soloDesc: 'Buying individually does not qualify for supplier wholesale pricing and incurs the full transport cost alone.',
    soloRetailBox: 'Buy Alone (Retail)',
    groupWholesaleBox: 'Group Bulk Buy (Wholesale)',
    soloSavingsCallout: 'You save',
    costSplitHeading: 'Live Cost & Fair Transport Split',
    colArtisan: 'Artisan',
    colQuantity: 'Quantity',
    materialCost: 'Material Cost',
    transportShare: 'Fair Transport Share',
    totalPayable: 'Total Payable',
    btnWithdraw: 'Withdraw',
    yourTotalShare: 'Your Total Share',
    quoteGuaranteedUntil: 'Quotation guaranteed until',
    btnProceedConfirm: 'Proceed to Confirm Order →',

    // Order Confirm
    confirmOrderTitle: 'Confirm Your Order & Cost Share',
    confirmOrderSub: 'Please review your individual material cost and fair transport share before placing this bulk order.',
    lblMaterialSpecs: 'Material & Specs',
    lblPurchaseMode: 'Purchase Mode',
    lblGroupTotalQty: 'Total Group Quantity',
    lblSelectedSupplier: 'Selected Supplier',
    lblQuoteValidity: 'Supplier Quotation Validity',
    lblLogistics: 'Logistics Arrangement',
    lblYourMaterialShare: 'Your Material Share',
    lblYourTransportShare: 'Your Fair Transport Share',
    lblTotalPayable: 'Total Payable Amount',
    btnBackToMatch: '← Back to matching',
    btnConfirmPlaceOrder: 'Confirm Participation & Place Order',

    // Tracking
    trackingTitle: 'Shipment tracking',
    noShipmentsTitle: 'No active shipments',
    noShipmentsSub: 'Once you confirm an order it will appear here with live tracking.',
    stage1: 'Order confirmed',
    stage2: 'Materials collected from supplier',
    stage3: 'In transit',
    stage4: 'Out for delivery',
    stage5: 'Delivered',
    currentStageBadge: 'Current stage',
    btnAdvanceStage: 'Advance to next stage ',
    btnCancelOrder: 'Cancel order (10% penalty applies)',

    // Demand Forecast
    forecastTitle: '3–4 Day Price Hike & Availability Forecast',
    forecastSub: 'A short-range demand model predicting price hike trends and raw material availability over the next 3–4 days across locations. Helps artisans time their bulk purchase before price spikes.',
    lblMaterialCat: 'Material category',
    lblLocation: 'Location',
    demandLabel: 'demand',
    highDemand: 'High',
    steadyDemand: 'Steady',
    lowDemand: 'Low',
    tightAvail: 'Tight',
    plentifulAvail: 'Plentiful',
    moderateAvail: 'Moderate',

    // Search
    searchTitle: 'Search results',
    searchPrompt: 'Try a material name (e.g. bamboo, yarn), a specification, a location, or an artisan/supplier name.',
    noMatches: 'No matches found yet. Try a broader material name or location.',

    // Broadcast Popup
    activePoolBadge: '⚡ Active Pool Request',
    joinGroupReqBtn: 'Join this group request →',
    notNowBtn: 'Not now',

    // Materials
    Bamboo: 'Bamboo',
    Yarn: 'Yarn',
    Clay: 'Clay',
    Dyes: 'Dyes',
    Metal: 'Metal',
    // Search & Orders
    lblOrders: 'Orders & Deals',
    lblSuppliers: 'Suppliers',
    lblArtisans: 'Artisans',
    lblCoordinators: 'Coordinators',
    lblOpenRequests: 'Open Material Requests',
    lblSupplies: 'Supplies:',
    lblNeededBy: 'needed by',
    lblFromSupplier: 'from',
    lblTrackOrder: 'Track this order →',
    searchIndexingInfo: 'Live indexing across Name, Material Specification, Category, Experience, Orders, and Location fields simultaneously.',
    dealsNeedingCoord: 'Deals needing a coordinator',
    noDealsNeedingCoord: 'No open deals right now — confirmed orders that need a coordinator will show up here.',
    yourActiveDeals: 'Your active deals',
    takeThisDeal: 'Take this deal',
  },

  hi: {
    // Nav
    portalTitle: 'साझा कच्चा माल खरीद एवं लागत समन्वय पोर्टल',
    searchPlaceholder: 'सामग्री, नाम या स्थान से खोजें (कम से कम 2 फ़ील्ड)...',
    priceOutlook: 'मूल्य रुझान (3-4 दिन)',
    guidebook: 'मार्गदर्शिका',
    getStarted: 'शुरू करें',
    switchRole: 'भूमिका बदलें',
    logIn: 'लॉग इन',
    signOut: 'साइन आउट',
    trustAudit: '🛡️ सुरक्षा ऑडिट',

    // Stepper
    stepDetails: 'विवरण',
    stepNeeds: 'सामग्री जरूरतें',
    stepMatch: 'मिलान और खरीद',
    stepConfirm: 'पुष्टि करें',
    stepTrack: 'ट्रैकिंग',
    stepStock: 'विवरण और स्टॉक',
    stepPricing: 'मूल्य और परिवहन',
    stepCoordDetails: 'समन्वयक विवरण',
    stepCoordDash: 'डैशबोर्ड',

    // Welcome Hero & Steps
    
    welcomeHeroTitle: ' rawMitra में आपका स्वागत है।',
    welcomeHeroSub: 'बांस, धागा, मिट्टी, रंग, धातु या पैकेजिंग सामग्री के साथ काम करने वाले छोटे कारीगरों को अकेले थोक मूल्य नहीं मिल पाता। rawMitra पास के कारीगरों को एक साथ लाता है, थोक दर पर आपूर्तिकर्ताओं से जोड़ता है, और उचित सामग्री लागत और परिवहन हिस्से की गणना करता है।',
    enterBtn: 'rawMitra में प्रवेश करें',
    readGuideBtn: 'मार्गदर्शिका पढ़ें',
    howTitle: 'सामूहिक खरीद कैसे काम करती है',
    howStep1Title: 'अपनी आवश्यकता दर्ज करें',
    howStep1Desc: 'कारीगर आवश्यक सामग्री, मात्रा और तारीख दर्ज करते हैं। आपूर्तिकर्ता अपने स्टॉक और थोक मूल्य सूचीबद्ध करते हैं।',
    howStep2Title: 'स्वतः समूह मिलान',
    howStep2Desc: 'समान सामग्री की आवश्यकता वाले नजदीकी कारीगरों का स्वतः समूह बनाया जाता है ताकि थोक दर का लाभ मिल सके।',
    howStep3Title: 'तुलना करें और पुष्टि करें',
    howStep3Desc: 'मूल्य, गुणवत्ता रेटिंग और दूरी के आधार पर आपूर्तिकर्ता चुनें, अपना साझा परिवहन खर्च देखें और पुष्टि करें।',
    howStep4Title: 'परिवहन और ट्रैकिंग',
    howStep4Desc: 'एक समन्वयक ऑर्डर की पुष्टि से लेकर सामान उठाने, भेजने और कारीगरों तक पहुँचाने की जिम्मेदारी संभालता है।',

    // Role Select
    roleSelectTitle: 'आप किस रूप में शामिल हो रहे हैं?',
    roleSelectSub: 'अपनी भूमिका चुनें। आप ऊपर दिए गए बार से किसी भी समय भूमिका बदल सकते हैं।',
    artisanTitle: 'कारीगर (Artisan)',
    artisanDesc: 'आप हाथ से उत्पाद बनाते हैं और आपको बांस, धागा, मिट्टी, रंग, धातु या पैकेजिंग सामग्री उचित मूल्य पर चाहिए।',
    artisanPoint1: 'अपनी आवश्यकताएं दर्ज करें',
    artisanPoint2: 'नजदीकी कारीगरों के साथ समूह बनाएं',
    artisanPoint3: 'थोक दरों पर सस्ती सामग्री खरीदें',
    artisanCta: 'कारीगर के रूप में जारी रखें →',

    supplierTitle: 'आपूर्तिकर्ता (Supplier)',
    supplierDesc: 'आप कच्चा माल रखते हैं और एक-एक करके बेचने के बजाय सामूहिक कारीगरों को थोक में बेचना चाहते हैं।',
    supplierPoint1: 'अपना स्टॉक और थोक मूल्य सूचीबद्ध करें',
    supplierPoint2: 'बड़े सामूहिक ऑर्डरों तक पहुंचें',
    supplierPoint3: 'पिकअप या डिलीवरी की सुविधा दें',
    supplierCta: 'आपूर्तिकर्ता के रूप में जारी रखें →',

    coordinatorTitle: 'समन्वयक (Coordinator)',
    coordDesc: 'आप रसद और लॉजिस्टिक्स संभालते हैं — ऑर्डर उठाए जाने से लेकर कारीगरों तक पहुँचाने की देखरेख करते हैं।',
    coordPoint1: 'पुष्ट ऑर्डरों से जुड़ें',
    coordPoint2: 'पिकअप और शिपमेंट ट्रैक करें',
    coordPoint3: 'अपनी विश्वसनीयता रेटिंग बनाएं',
    coordCta: 'समन्वयक के रूप में जारी रखें →',

    // Rules Banner
    rulesToggle: 'महत्वपूर्ण नियमों का उल्लंघन / अनदेखी',
    rule1: 'प्रत्येक प्रविष्टि सटीक और वर्तमान होनी चाहिए — आधार और फोन नंबर केवल पहचान सत्यापन के लिए हैं और कभी सार्वजनिक रूप से नहीं दिखाए जाते।',
    rule2: 'सामग्री का विवरण, मात्रा और मूल्य ईमानदार होना चाहिए। गुणवत्ता या स्टॉक के बारे में गलत जानकारी देने पर खाता निलंबित किया जा सकता है।',
    rule3: 'एक बार ऑर्डर की पुष्टि होने के बाद, रद्द करने पर 10% जुर्माना लागू होगा — यह अन्य कारीगरों और आपूर्तिकर्ता की सुरक्षा के लिए है।',
    rule4: 'शिपमेंट या पिकअप संभालने वाले समन्वयक माल की स्थिति के लिए जिम्मेदार हैं और उन्हें ट्रैकिंग स्थिति ईमानदारी से अपडेट करनी होगी।',
    rule5: 'अनुचित व्यवहार या बार-बार अनुपस्थित रहने पर rawMitra से हटाया जा सकता है।',
    penaltyTitle: 'रद्दीकरण जुर्माना:',
    penaltyDesc: 'पुष्ट ऑर्डर रद्द करने पर आपके हिस्से के मूल्य का 10% जुर्माना लगेगा, जो अन्य सदस्यों और आपूर्तिकर्ता को दिया जाएगा।',

    // Artisan Register
    artisanRegTitle: 'अपनी कार्यशाला के बारे में बताएं',
    artisanRegSub: 'यह जानकारी आपूर्तिकर्ताओं और आपके समूह के साथी कारीगरों को दिखाई देगी।',
    fullName: 'पूरा नाम',
    aadharNum: 'आधार संख्या',
    aadharHint: 'केवल सत्यापन के लिए प्रयुक्त — कभी सार्वजनिक रूप से नहीं दिखाया जाता।',
    storeLoc: 'कार्यशाला / दुकान का स्थान',
    phoneNum: 'मोबाइल फोन नंबर',
    phoneHint: 'ऑर्डर समन्वय और डिलीवरी सूचनाओं के लिए प्रयुक्त।',
    nextMaterialBtn: 'अगला: अपनी सामग्री आवश्यकताएं दर्ज करें →',

    // Artisan Materials
    materialsTitle: 'आपको किन सामग्रियों की आवश्यकता है?',
    materialsSub: 'प्रत्येक सामग्री के लिए एक पंक्ति जोड़ें। rawMitra नजदीकी कारीगरों के साथ थोक छूट दिलाने के लिए इन्हें जोड़ता है।',
    categoryLabel: 'सामग्री श्रेणी',
    specLabel: 'विशिष्ट विवरण या ग्रेड',
    qtyLabel: 'आवश्यक मात्रा',
    unitLabel: 'इकाई (Unit)',
    locLabel: 'डिलीवरी / पिकअप स्थान',
    reqDateLabel: 'कब तक आवश्यकता है (तारीख)',
    addAnotherLine: '+ एक और सामग्री जोड़ें',
    findMatchesBtn: 'समूह मिलान एवं आपूर्तिकर्ता खोजें →',

    // Artisan Matching
    matchingTitle: 'आपके मेल खाते समूह',
    matchingSub: 'थोक मूल्य और साझा परिवहन का लाभ उठाने के लिए आवश्यकताओं को सामग्री और स्थान के अनुसार समूहीकृत किया गया है।',
    groupBuy: 'सामूहिक थोक खरीद',
    buyAlone: 'अकेले खरीदें',
    noMaterialsListed: 'आपने अभी तक कोई सामग्री सूचीबद्ध नहीं की है।',
    addMaterialReqBtn: 'सामग्री अनुरोध जोड़ें',
    combinedBulk: 'संयुक्त थोक मात्रा',
    soloBuying: 'अकेले खरीद रहे हैं',
    groupedWith: 'समूह के प्रतिभागी',
    ruleEnforcedNotice: 'नियम लागू: एक प्रतिभागी इस समूह से वापस हुआ। महत्वपूर्ण नियमों के अनुसार मात्रा और लागत का तुरंत पुनः परिकलन किया गया है।',
    noSupplierMatch: 'वर्तमान में कोई आपूर्तिकर्ता इस सामग्री से मेल नहीं खाता है।',
    broadcastDealBtn: 'इसके बजाय एक इन-ऐप सामूहिक अनुरोध प्रसारित करें →',
    colSupplier: 'आपूर्तिकर्ता',
    colUnitPrice: 'इकाई मूल्य',
    colTransport: 'परिवहन शुल्क',
    colValidity: 'कोटेशन वैधता',
    colRating: 'रेटिंग',
    colLogistics: 'लॉजिस्टिक्स',
    btnSelect: 'चुनें',
    btnSelected: 'चयनित',
    soloHeading: 'अकेले खरीद की तुलना',
    soloDesc: 'अकेले खरीदने पर थोक छूट नहीं मिलती और पूरा परिवहन खर्च स्वयं वहन करना पड़ता है।',
    soloRetailBox: 'अकेले खरीद (खुदरा मूल्य)',
    groupWholesaleBox: 'सामूहिक खरीद (थोक मूल्य)',
    soloSavingsCallout: 'आपकी बचत',
    costSplitHeading: 'लाइव लागत एवं उचित परिवहन विभाजन',
    colArtisan: 'कारीगर',
    colQuantity: 'मात्रा',
    materialCost: 'सामग्री लागत',
    transportShare: 'उचित परिवहन हिस्सा',
    totalPayable: 'कुल देय राशि',
    btnWithdraw: 'वापस लें',
    yourTotalShare: 'आपका कुल हिस्सा',
    quoteGuaranteedUntil: 'कोटेशन गारंटी वैधता तिथि',
    btnProceedConfirm: 'ऑर्डर पुष्टि के लिए आगे बढ़ें →',

    // Order Confirm
    confirmOrderTitle: 'अपने ऑर्डर और लागत हिस्से की पुष्टि करें',
    confirmOrderSub: 'ऑर्डर देने से पहले कृपया अपनी व्यक्तिगत सामग्री लागत और परिवहन हिस्से की समीक्षा करें।',
    lblMaterialSpecs: 'सामग्री और विवरण',
    lblPurchaseMode: 'खरीद का प्रकार',
    lblGroupTotalQty: 'समूह की कुल मात्रा',
    lblSelectedSupplier: 'चयनित आपूर्तिकर्ता',
    lblQuoteValidity: 'आपूर्तिकर्ता कोटेशन वैधता',
    lblLogistics: 'लॉजिस्टिक्स व्यवस्था',
    lblYourMaterialShare: 'आपकी सामग्री का हिस्सा',
    lblYourTransportShare: 'आपका उचित परिवहन हिस्सा',
    lblTotalPayable: 'कुल देय राशि',
    btnBackToMatch: '← मिलान पर वापस जाएं',
    btnConfirmPlaceOrder: 'भागीदारी की पुष्टि करें और ऑर्डर दें',

    // Tracking
    trackingTitle: 'शिपमेंट ट्रैकिंग',
    noShipmentsTitle: 'कोई सक्रिय शिपमेंट नहीं',
    noShipmentsSub: 'ऑर्डर की पुष्टि होने पर यह लाइव ट्रैकिंग के साथ यहां दिखाई देगा।',
    stage1: 'ऑर्डर की पुष्टि हुई',
    stage2: 'आपूर्तिकर्ता से सामग्री एकत्र की गई',
    stage3: 'परिवहन में (In Transit)',
    stage4: 'वितरण के लिए निकला',
    stage5: 'कारीगरों तक पहुँचाया गया',
    currentStageBadge: 'वर्तमान चरण',
    btnAdvanceStage: 'अगले चरण पर जाएं ',
    btnCancelOrder: 'ऑर्डर रद्द करें (10% जुर्माना लागू)',

    // Demand Forecast
    forecastTitle: '3-4 दिन मूल्य रुझान एवं उपलब्धता पूर्वानुमान',
    forecastSub: 'अगले 3-4 दिनों में कच्चे माल की उपलब्धता और मूल्य वृद्धि का अनुमान। कारीगरों को मूल्य बढ़ने से पहले थोक खरीद की योजना बनाने में मदद करता है।',
    lblMaterialCat: 'सामग्री श्रेणी',
    lblLocation: 'स्थान',
    demandLabel: 'मांग',
    highDemand: 'अधिक मांग',
    steadyDemand: 'स्थिर मांग',
    lowDemand: 'कम मांग',
    tightAvail: 'सीमित स्टॉक',
    plentifulAvail: 'पर्याप्त स्टॉक',
    moderateAvail: 'मध्यम स्टॉक',

    // Search
    searchTitle: 'खोज परिणाम',
    searchPrompt: 'सामग्री का नाम (जैसे बांस, धागा), विवरण, स्थान या कारीगर/आपूर्तिकर्ता का नाम खोजें।',
    noMatches: 'कोई परिणाम नहीं मिला। कृपया अन्य शब्द या स्थान खोजें।',

    // Broadcast Popup
    activePoolBadge: '⚡ सक्रिय सामूहिक पूल',
    joinGroupReqBtn: 'इस समूह अनुरोध में शामिल हों →',
    notNowBtn: 'अभी नहीं',

    // Materials
    Bamboo: 'बांस (Bamboo)',
    Yarn: 'धागा / सूत (Yarn)',
    Clay: 'मिट्टी (Clay)',
    Dyes: 'रंग / डाई (Dyes)',
    Metal: 'धातु (Metal)',
    'Packaging materials': 'पैकेजिंग सामग्री (Packaging)',
    // Search & Orders
    lblOrders: 'ऑर्डर एवं सौदे (Orders)',
    lblSuppliers: 'आपूर्तिकर्ता (Suppliers)',
    lblArtisans: 'कारीगर (Artisans)',
    lblCoordinators: 'समन्वयक (Coordinators)',
    lblOpenRequests: 'सक्रिय सामग्री आवश्यकताएँ (Requests)',
    lblSupplies: 'आपूर्ति सामग्री:',
    lblNeededBy: 'आवश्यकता तिथि:',
    lblFromSupplier: 'आपूर्तिकर्ता:',
    lblTrackOrder: 'इस ऑर्डर को ट्रैक करें →',
    searchIndexingInfo: 'नाम, सामग्री विवरण, श्रेणी, अनुभव, ऑर्डर और स्थान फ़ील्ड में एक साथ लाइव खोज।',
    dealsNeedingCoord: 'समन्वयक की आवश्यकता वाले सौदे',
    noDealsNeedingCoord: 'फिलहाल कोई खुला सौदा नहीं है — पुष्ट ऑर्डर यहां दिखाई देंगे।',
    yourActiveDeals: 'आपके सक्रिय सौदे',
    takeThisDeal: 'यह सौदा लें',
  },

  as: {
    // Nav
    portalTitle: 'উমৈহতীয়া কেঁচামাল ক্ৰয় আৰু ব্যয় সমন্বয় পৰ্টেল',
    searchPlaceholder: 'সামগ্ৰী, নাম বা স্থান অনুসৰি সন্ধান কৰক...',
    priceOutlook: 'মূল্যৰ পূৰ্বাভাস (৩-৪ দিন)',
    guidebook: 'নিৰ্দেশিকা',
    getStarted: 'আৰম্ভ কৰক',
    switchRole: 'ভূমিকা সলনি কৰক',
    logIn: 'লগ ইন',
    signOut: 'ছাইন আউট',
    trustAudit: '🛡️ বিশ্বাস নিৰীক্ষণ',

    // Stepper
    stepDetails: 'আপোনাৰ বিৱৰণ',
    stepNeeds: 'কেঁচামালৰ প্ৰয়োজনীয়তা',
    stepMatch: 'দল গঠন আৰু ক্ৰয়',
    stepConfirm: 'নিশ্চিতকৰণ',
    stepTrack: 'ট্ৰেকিং',
    stepStock: 'বিৱৰণ আৰু মজুত',
    stepPricing: 'দৰ আৰু পৰিবহণ',
    stepCoordDetails: 'সমন্বয়কৰ বিৱৰণ',
    stepCoordDash: 'ডেশ্ববৰ্ড',

    // Welcome Hero & Steps
    
    welcomeHeroTitle: 'rawMitra লৈ স্বাগতম।',
    welcomeHeroSub: 'বাঁহ, সূতা, মাটি, ৰং, ধাতু বা পেকেজিং সামগ্ৰীৰ কাম কৰা ক্ষুদ্ৰ শিপিনী আৰু কাৰিকৰসকলে অকলশৰে পাইকাৰী দৰ নাপায়। rawMitra-ই ওচৰৰ কাৰিকৰসকলক একেলগ কৰে, পাইকাৰী দৰত যোগানকাৰীৰ লগত সংযোগ কৰে আৰু পৰিবহণ ব্যয় সমভাৱে ভাগ কৰে।',
    enterBtn: 'rawMitra ত প্ৰৱেশ কৰক',
    readGuideBtn: 'নিৰ্দেশিকা পঢ়ক',
    howTitle: 'উমৈহতীয়া ক্ৰয় প্ৰক্ৰিয়া কেনেদৰে চলে',
    howStep1Title: 'প্ৰয়োজনীয় সামগ্ৰী তালিকাভুক্ত কৰক',
    howStep1Desc: 'কাৰিকৰসকলে প্ৰয়োজনীয় সামগ্ৰী আৰু পৰিমাণ দিয়ে। যোগানকাৰীয়ে মজুত থকা সামগ্ৰী আৰু পাইকাৰী দৰ দিয়ে।',
    howStep2Title: 'স্বয়ংক্ৰিয় দলীয় সংহতি',
    howStep2Desc: 'একে সামগ্ৰী বিচৰা কাষৰীয়া কাৰিকৰসকলক স্বয়ংক্ৰিয়ভাৱে দলবদ্ধ কৰি পাইকাৰী ৰেহাইৰ সুবিধা দিয়া হয়।',
    howStep3Title: 'দৰ তুলনা আৰু নিশ্চিতকৰণ',
    howStep3Desc: 'দৰ আৰু মানদণ্ড অনুসৰি যোগানকাৰী বাছক, আপোনাৰ পৰিবহণ অংশ চাওক আৰু নিশ্চিত কৰক।',
    howStep4Title: 'পৰিবহণ আৰু ডেলিভাৰী',
    howStep4Desc: 'এজন স্থানীয় সমন্বয়কে সামগ্ৰী সংগ্ৰহৰ পৰা ডেলিভাৰীলৈকে সকলো পৰ্য্যায় পৰিচালনা কৰে।',

    // Role Select
    roleSelectTitle: 'আপুনি কি ভূমিকাত যোগ দিছে?',
    roleSelectSub: 'আপোনাৰ সুবিধা অনুসৰি ভূমিকা নিৰ্বাচন কৰক। আপুনি যিকোনো সময়তে ইয়াক সলনি কৰিব পাৰে।',
    artisanTitle: 'কাৰিকৰ / শিপিনী (Artisan)',
    artisanDesc: 'আপুনি হাতেৰে সামগ্ৰী তৈয়াৰ কৰে আৰু কম দৰত বাঁহ, সূতা, মাটি, ৰং বা পেকেজিং সামগ্ৰী বিচাৰিছে।',
    artisanPoint1: 'প্ৰয়োজনীয় সামগ্ৰীৰ তালিকা দিয়ক',
    artisanPoint2: 'ওচৰৰ কাৰিকৰৰ লগত দল বান্ধক',
    artisanPoint3: 'পাইকাৰী সুলভ দৰত ক্ৰয় কৰক',
    artisanCta: 'কাৰিকৰ হিচাপে আগবাঢ়ক →',

    supplierTitle: 'যোগানকাৰী (Supplier)',
    supplierDesc: 'আপোনাৰ কেঁচামাল মজুত আছে আৰু পাইকাৰী হিচাপে একলগে বিক্ৰী কৰিব বিচাৰে।',
    supplierPoint1: 'মজুত সামগ্ৰী আৰু দৰ তালিকাভুক্ত কৰক',
    supplierPoint2: 'বৃহৎ দলীয় অৰ্ডাৰ লাভ কৰক',
    supplierPoint3: 'ডেলিভাৰী বা পিকআপৰ ব্যৱস্থা কৰক',
    supplierCta: 'যোগানকাৰী হিচাপে আগবাঢ়ক →',

    coordinatorTitle: 'সমন্বয়ক (Coordinator)',
    coordDesc: 'আপুনি সামগ্ৰী কঢ়িওৱা আৰু ডেলিভাৰীৰ দায়িত্ব লয়।',
    coordPoint1: 'অৰ্ডাৰসমূহৰ দায়িত্ব লওক',
    coordPoint2: 'পৰিবহণ ট্ৰেক কৰক',
    coordPoint3: 'সেৱাৰ মানদণ্ড বৃদ্ধি কৰক',
    coordCta: 'সমন্বয়ক হিচাপে আগবাঢ়ক →',

    // Rules Banner
    rulesToggle: 'গুৰুত্বপূৰ্ণ নিয়মসমূহ আৰু উলংঘন',
    rule1: 'প্ৰতিটো বিৱৰণ সঠিক হ\'ব লাগিব — আধাৰ আৰু ফোন নম্বৰ কেৱল পৰিচয় নিশ্চিত কৰিবলৈ ব্যৱহাৰ কৰা হয়।',
    rule2: 'সামগ্ৰীৰ মানদণ্ড আৰু দৰ সত্য হ\'ব লাগিব। মিছা তথ্য দিলে একাউন্ট বাতিল হ\'ব পাৰে।',
    rule3: 'অৰ্ডাৰ নিশ্চিত কৰাৰ পাছত বাতিল কৰিলে ১০% জৰিমনা ভৰিব লাগিব — যাতে আন কাৰিকৰ আৰু যোগানকাৰীৰ ক্ষতি নহয়।',
    rule4: 'সমন্বয়কসকলে সামগ্ৰীৰ সুৰক্ষাৰ বাবে দায়িত্ব ল\'ব লাগিব আৰু ট্ৰেকিং আপডেট দিব লাগিব।',
    rule5: 'অনুপযুক্ত আচৰণৰ বাবে rawMitra ৰ পৰা আঁতৰাই দিয়া হ\'ব পাৰে।',
    penaltyTitle: 'বাতিলকৰণ জৰিমনা:',
    penaltyDesc: 'অৰ্ডাৰ নিশ্চিত কৰাৰ পাছত বাতিল কৰিলে আপোনাৰ অংশৰ ১০% জৰিমনা আন সদস্য আৰু যোগানকাৰীক ক্ষতিপূৰণ হিচাপে দিয়া হ\'ব।',

    // Artisan Register
    artisanRegTitle: 'আপোনাৰ কৰ্মশালাৰ বিৱৰণ দিয়ক',
    artisanRegSub: 'এই তথ্য যোগানকাৰী আৰু আন দলীয় সতীৰ্থসকলে দেখিব।',
    fullName: 'সম্পূৰ্ণ নাম',
    aadharNum: 'আধাৰ নম্বৰ',
    aadharHint: 'কেৱল সত্যতা পৰীক্ষাৰ বাবে — সম্পূৰ্ণ নম্বৰ কেতিয়াও ৰাজহুৱা কৰা নহয়।',
    storeLoc: 'কৰ্মশালা বা দোকানৰ ঠিকনা',
    phoneNum: 'মোবাইল ফোন নম্বৰ',
    phoneHint: 'অৰ্ডাৰ আৰু ডেলিভাৰীৰ খবৰ পাবলৈ প্ৰয়োজন।',
    nextMaterialBtn: 'পৰৱৰ্তী: কেঁচামালৰ তালিকা দিয়ক →',

    // Artisan Materials
    materialsTitle: 'আপোনাক কি কি কেঁচামালৰ প্ৰয়োজন?',
    materialsSub: 'প্ৰতিটো সামগ্ৰীৰ বাবে এটা শাৰী যোগ কৰক। rawMitra-ই ওচৰৰ কাৰিকৰৰ লগত মিলাই পাইকাৰী দৰ দিয়ে।',
    categoryLabel: 'সামগ্ৰীৰ শ্ৰেণী',
    specLabel: 'নিৰ্দিষ্ট বিৱৰণ বা গ্ৰেড',
    qtyLabel: 'প্ৰয়োজনীয় পৰিমাণ',
    unitLabel: 'একক (Unit)',
    locLabel: 'পিকআপ বা ডেলিভাৰীৰ স্থান',
    reqDateLabel: 'কেতিয়াকৈ লাগে (তাৰিখ)',
    addAnotherLine: '+ আন এটা সামগ্ৰী যোগ কৰক',
    findMatchesBtn: 'দলীয় সংহতি আৰু যোগানকাৰী সন্ধান কৰক →',

    // Artisan Matching
    matchingTitle: 'আপোনাৰ বাবে সংহত দল',
    matchingSub: 'পাইকাৰী ৰেহাই আৰু সমভাৱে পৰিবহণ খৰচ ভগাবলৈ ওচৰৰ কাৰিকৰসকলক সামগ্ৰী অনুসৰি দলবদ্ধ কৰা হৈছে।',
    groupBuy: 'উমৈহতীয়া পাইকাৰী ক্ৰয়',
    buyAlone: 'এককভাৱে ক্ৰয় কৰক',
    noMaterialsListed: 'আপুনি এতিয়ালৈকে কোনো সামগ্ৰী তালিকাভুক্ত কৰা নাই।',
    addMaterialReqBtn: 'কেঁচামালৰ প্ৰয়োজনীয়তা দিয়ক',
    combinedBulk: 'মুঠ পাইকাৰী পৰিমাণ',
    soloBuying: 'অকলশৰে ক্ৰয় কৰিছে',
    groupedWith: 'দলৰ অংশগ্ৰহণকাৰীসকল',
    ruleEnforcedNotice: 'নিয়ম বলবৎ: এজন অংশগ্ৰহণকাৰী আঁতৰি গ\'ল। গুৰুত্বপূৰ্ণ নিয়ম অনুসৰি পৰিমাণ আৰু খৰচৰ পুনৰ গণনা কৰা হ\'ল।',
    noSupplierMatch: 'এই মুহূৰ্তত কোনো যোগানকাৰী উপলব্ধ নাই।',
    broadcastDealBtn: 'অন্য কাৰিকৰৰ বাবে উমৈহতীয়া পুল অনুৰোধ প্ৰেৰণ কৰক →',
    colSupplier: 'যোগানকাৰী',
    colUnitPrice: 'একক দৰ',
    colTransport: 'পৰিবহণ মাচুল',
    colValidity: 'দৰৰ বৈধতা',
    colRating: 'ৰেটিং',
    colLogistics: 'পৰিবহণ ব্যৱস্থা',
    btnSelect: 'বাছক',
    btnSelected: 'নিৰ্বাচিত',
    soloHeading: 'একক ক্ৰয়ৰ তুলনা',
    soloDesc: 'অকলশৰে ক্ৰয় কৰিলে পাইকাৰী ৰেহাই নাপায় আৰু সমগ্ৰ পৰিবহণ খৰচ অকলেই ভৰিব লাগে।',
    soloRetailBox: 'একক ক্ৰয় (খুচুৰা দৰ)',
    groupWholesaleBox: 'উমৈহতীয়া ক্ৰয় (পাইকাৰী দৰ)',
    soloSavingsCallout: 'আপোনাৰ সঞ্চয়',
    costSplitHeading: 'প্ৰকৃত খৰচ আৰু পৰিবহণ ব্যয়ৰ ভাগ',
    colArtisan: 'কাৰিকৰ',
    colQuantity: 'পৰিমাণ',
    materialCost: 'কেঁচামালৰ খৰচ',
    transportShare: 'ন্যায্য পৰিবহণ অংশ',
    totalPayable: 'সৰ্বমুঠ পৰিশোধ',
    btnWithdraw: 'প্ৰত্যাহাৰ',
    yourTotalShare: 'আপোনাৰ মুঠ অংশ',
    quoteGuaranteedUntil: 'দৰৰ নিশ্চিত বৈধতা তাৰিখ',
    btnProceedConfirm: 'অৰ্ডাৰ নিশ্চিত কৰিবলৈ আগবাঢ়ক →',

    // Order Confirm
    confirmOrderTitle: 'আপোনাৰ অৰ্ডাৰ আৰু খৰচৰ অংশ নিশ্চিত কৰক',
    confirmOrderSub: 'অৰ্ডাৰ নিশ্চিত কৰাৰ আগতে অনুগ্ৰহ কৰি আপোনাৰ কেঁচামালৰ ব্যয় আৰু পৰিবহণ ভাগ পৰীক্ষা কৰক।',
    lblMaterialSpecs: 'সামগ্ৰী আৰু নিৰ্দিষ্ট বিৱৰণ',
    lblPurchaseMode: 'ক্ৰয়ৰ প্ৰকাৰ',
    lblGroupTotalQty: 'দলৰ সৰ্বমুঠ পৰিমাণ',
    lblSelectedSupplier: 'নিৰ্বাচিত যোগানকাৰী',
    lblQuoteValidity: 'যোগানকাৰীৰ দৰৰ বৈধতা',
    lblLogistics: 'পৰিবহণ ব্যৱস্থা',
    lblYourMaterialShare: 'আপোনাৰ কেঁচামালৰ অংশ',
    lblYourTransportShare: 'আপোনাৰ পৰিবহণ ভাগ',
    lblTotalPayable: 'সৰ্বমুঠ পৰিশোধযোগ্য ধন',
    btnBackToMatch: '← দলীয় সংহতিলৈ ঘূৰি যাওক',
    btnConfirmPlaceOrder: 'অংশগ্ৰহণ নিশ্চিত কৰক আৰু অৰ্ডাৰ দিয়ক',

    // Tracking
    trackingTitle: 'পৰিবহণ ট্ৰেকিং',
    noShipmentsTitle: 'কোনো সক্ৰিয় পৰিবহণ নাই',
    noShipmentsSub: 'অৰ্ডাৰ নিশ্চিত কৰাৰ পাছত ইয়াত লাইভ ট্ৰেকিং দেখা যাব।',
    stage1: 'অৰ্ডাৰ নিশ্চিত হ\'ল',
    stage2: 'যোগানকাৰীৰ পৰা সামগ্ৰী সংগ্ৰহ কৰা হ\'ল',
    stage3: 'পৰিবহণত আছে (In transit)',
    stage4: 'ডেলিভাৰীৰ বাবে ওলাইছে',
    stage5: 'কাৰিকৰসকলক অৰ্পণ কৰা হ\'ল',
    currentStageBadge: 'বৰ্তমান পৰ্য্যায়',
    btnAdvanceStage: 'পৰৱৰ্তী পৰ্য্যায়লৈ যাওক ',
    btnCancelOrder: 'অৰ্ডাৰ বাতিল কৰক (১০% জৰিমনা হ\'ব)',

    // Demand Forecast
    forecastTitle: '৩-৪ দিনীয়া মূল্যৰ পূৰ্বাভাস আৰু মজুত',
    forecastSub: 'অহা ৩-৪ দিনত সামগ্ৰীৰ মূল্য বৃদ্ধি আৰু মজুতৰ পূৰ্বাভাস। ই কাৰিকৰসকলক দৰ বৃদ্ধিৰ আগতেই পাইকাৰী ক্ৰয় কৰাত সহায় কৰে।',
    lblMaterialCat: 'সামগ্ৰীৰ শ্ৰেণী',
    lblLocation: 'স্থান',
    demandLabel: 'চাহিদা',
    highDemand: 'অধিক চাহিদা',
    steadyDemand: 'নিয়মীয়া চাহিদা',
    lowDemand: 'কম চাহিদা',
    tightAvail: 'সীমিত মজুত',
    plentifulAvail: 'পৰ্যাপ্ত মজুত',
    moderateAvail: 'মধ্যমীয়া মজুত',

    // Search
    searchTitle: 'সন্ধান ফলাফল',
    searchPrompt: 'সামগ্ৰীৰ নাম (যেনে বাঁহ, সূতা), স্থান বা কাৰিকৰ/যোগানকাৰীৰ নাম সন্ধান কৰক।',
    noMatches: 'কোনো ফলাফল পোৱা নগ\'ল। অন্য নামেৰে চেষ্টা কৰক।',

    // Broadcast Popup
    activePoolBadge: '⚡ সক্ৰিয় উমৈহতীয়া পুল',
    joinGroupReqBtn: 'এই অনুৰোধত অংশ লওক →',
    notNowBtn: 'এতিয়া নহয়',

    // Materials
    Bamboo: 'বাঁহ (Bamboo)',
    Yarn: 'সূতা (Yarn)',
    Clay: 'মাটি (Clay)',
    Dyes: 'ৰং (Dyes)',
    Metal: 'ধাতু (Metal)',
    'Packaging materials': 'পেকেজিং সামগ্ৰী (Packaging)',
    // Search & Orders
    lblOrders: 'অৰ্ডাৰ আৰু চুক্তি (Orders)',
    lblSuppliers: 'যোগানকাৰীসকল (Suppliers)',
    lblArtisans: 'কাৰিকৰসকল (Artisans)',
    lblCoordinators: 'সমন্বয়কসকল (Coordinators)',
    lblOpenRequests: 'মুক্ত কেঁচামালৰ অনুৰোধসমূহ (Requests)',
    lblSupplies: 'যোগান ধৰা সামগ্ৰী:',
    lblNeededBy: 'প্ৰয়োজনীয় তাৰিখ:',
    lblFromSupplier: 'যোগানকাৰী:',
    lblTrackOrder: 'এই অৰ্ডাৰ ট্ৰেক কৰক →',
    searchIndexingInfo: 'নাম, কেঁচামালৰ বিৱৰণ, শ্ৰেণী, অভিজ্ঞতা, অৰ্ডাৰ আৰু স্থানৰ সকলো তথ্যত একেলগে সন্ধান।',
    dealsNeedingCoord: 'সমন্বয়কৰ প্ৰয়োজন থকা অৰ্ডাৰসমূহ',
    noDealsNeedingCoord: 'বৰ্তমান কোনো খোলা অৰ্ডাৰ নাই — পুষ্ট অৰ্ডাৰ ইয়াত দেখা যাব।',
    yourActiveDeals: 'আপোনাৰ সক্ৰিয় অৰ্ডাৰসমূহ',
    takeThisDeal: 'এই অৰ্ডাৰটো লওক',
  },
}

export const SEARCH_SYNONYMS = {
  // Bamboo
  'বাঁহ': ['bamboo', 'bhaluka', 'pole'],
  'বাৰ': ['bamboo'],
  'বাঁহৰ': ['bamboo'],
  'बांस': ['bamboo'],
  'bamboo': ['বাঁহ', 'বাৰ', 'बांस'],

  // Silk / Yarn
  'সূতা': ['yarn', 'silk', 'muga'],
  'মুগা': ['muga', 'silk', 'yarn'],
  'চিল্ক': ['silk', 'muga'],
  'धागा': ['yarn', 'thread'],
  'सूत': ['yarn', 'silk'],
  'रेशम': ['silk', 'muga'],
  'yarn': ['সূতা', 'धागा', 'মুগা'],
  'muga': ['মুগা', 'সূতা'],

  // Clay
  'মাটি': ['clay', 'terracotta'],
  'টেৰাকোটা': ['terracotta', 'clay'],
  'टेराकोटा': ['terracotta', 'clay'],
  'मिट्टी': ['clay'],
  'clay': ['মাটি', 'मिट्टी'],

  // Dyes
  'ৰং': ['dyes', 'indigo'],
  'রং': ['dyes', 'indigo'],
  'रंग': ['dyes', 'indigo'],
  'dyes': ['ৰং', 'रंग'],

  // Metal
  'ধাতু': ['metal', 'brass'],
  'धातु': ['metal', 'brass'],
  'metal': ['ধাতু', 'धातु'],

  // Packaging
  'পেকেজিং': ['packaging', 'box', 'boxes'],
  'বাকচ': ['box', 'corrugated'],
  'पैकेजिंग': ['packaging', 'box'],
  'डिब्बा': ['box'],
  'packaging': ['পেকেজিং', 'पैकेजिंग'],

  // Locations
  'সুৱালকুছি': ['sualkuchi'],
  'সুয়ালকুচি': ['sualkuchi'],
  'सुवालकुची': ['sualkuchi'],
  'sualkuchi': ['সুৱালকুছি', 'সুয়ালকুচি', 'सुवालकुची'],

  'গুৱাহাটী': ['guwahati'],
  'গুয়াহাটি': ['guwahati'],
  'गुवाहाटी': ['guwahati'],
  'guwahati': ['গুৱাহাটী', 'গুয়াহাটি', 'गुवाहाटी'],

  'হাজো': ['hajo'],
  'हाजो': ['hajo'],
  'hajo': ['হাজো', 'हाजो'],

  'অসম': ['assam'],
  'असम': ['assam'],
  'assam': ['অসম', 'असम'],

  // Orders
  'অৰ্ডাৰ': ['order', 'confirmed', 'o-'],
  'অৰ্দাৰ': ['order'],
  'দৰদস্তাবেজ': ['order', 'deal'],
  'ऑर्डर': ['order', 'confirmed', 'o-'],
  'order': ['অৰ্ডাৰ', 'ऑर्डर'],

  // Roles
  'শিপিনী': ['artisan', 'deepa', 'rukmini'],
  'কাৰিকৰ': ['artisan', 'bipul', 'tarun'],
  'कारीगर': ['artisan'],
  'artisan': ['কাৰিকৰ', 'শিপিনী', 'कारीगर'],

  'যোগানকাৰী': ['supplier', 'brahmaputra', 'kamrup', 'depot', 'syndicate'],
  'আपूर्तिकर्ता': ['supplier'],
  'supplier': ['যোগানকাৰী', 'आपूर्तिकर्ता'],

  'সমন্বয়ক': ['coordinator', 'manash'],
  'समन्वयक': ['coordinator'],
  'coordinator': ['সমন্বয়ক', 'समन्वयक'],
}

export function expandSearchTokens(query = '') {
  const normalized = query.toLowerCase().trim()
  if (!normalized) return []
  const tokens = normalized.split(/\s+/)
  const expanded = new Set([normalized, ...tokens])

  for (const token of tokens) {
    for (const [key, synonyms] of Object.entries(SEARCH_SYNONYMS)) {
      if (token.includes(key.toLowerCase()) || key.toLowerCase().includes(token)) {
        synonyms.forEach((s) => expanded.add(s.toLowerCase()))
      }
    }
  }
  return Array.from(expanded)
}

export function localizeLocation(loc = '', lang = 'en') {
  if (lang === 'as') {
    if (loc.includes('Sualkuchi')) return 'সুৱালকুছি, অসম (Sualkuchi, Assam)'
    if (loc.includes('Guwahati')) return 'গুৱাহাটী, অসম (Guwahati, Assam)'
    if (loc.includes('Hajo')) return 'হাজো, অসম (Hajo, Assam)'
  } else if (lang === 'hi') {
    if (loc.includes('Sualkuchi')) return 'सुवालकुची, असम (Sualkuchi, Assam)'
    if (loc.includes('Guwahati')) return 'गुवाहाटी, असम (Guwahati, Assam)'
    if (loc.includes('Hajo')) return 'हाजो, असम (Hajo, Assam)'
  }
  return loc
}

export function localizeStatus(status = '', lang = 'en') {
  if (status === 'confirmed') return lang === 'as' ? 'নিশ্চিত (Confirmed)' : lang === 'hi' ? 'पुष्ट (Confirmed)' : 'Confirmed'
  if (status === 'fulfilled') return lang === 'as' ? 'সম্পূৰ্ণ (Fulfilled)' : lang === 'hi' ? 'पूर्ण (Fulfilled)' : 'Fulfilled'
  if (status === 'open') return lang === 'as' ? 'মুক্ত (Open)' : lang === 'hi' ? 'सक्रिय (Open)' : 'Open'
  if (status === 'cancelled') return lang === 'as' ? 'বাতিল (Cancelled)' : lang === 'hi' ? 'रद्द (Cancelled)' : 'Cancelled'
  return status
}

export function t(key, lang = 'en') {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en?.[key] || key
}

export function useTranslation() {
  const state = useAppState()
  const lang = state?.language || 'en'
  return {
    t: (key) => t(key, lang),
    lang,
  }
}

