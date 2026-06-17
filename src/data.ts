export type Lang = 'zh' | 'en'
export type Variant = 'a' | 'b'
export type CatKey = 'all' | 'hot' | 'cold' | 'staple' | 'soup' | 'drink'
export type OrderStatus = 'new' | 'making' | 'done'
export type IconType =
  | 'noodle' | 'chicken' | 'soup' | 'veg' | 'rice' | 'bun' | 'drink'
  | 'bell' | 'back' | 'search' | 'gear' | 'globe' | 'pin' | 'cam'
  | 'file' | 'spark' | 'cart' | 'clip' | 'home' | 'menugrid'
  | 'edit' | 'download' | 'print'

export interface Dish {
  id: string
  zh: string
  en: string
  price: number
  cat: CatKey
  sold: number
  like: number
  icon: IconType
  feat?: boolean
  dzh: string
  den: string
}

/** [zh name, en name, qty] */
export type OrderLine = [string, string, number]

export interface Order {
  id: string
  table: string
  items: OrderLine[]
  /** [zh note, en note] */
  note: [string, string]
  time: string
  status: OrderStatus
}

export interface CartLine {
  id: string
  qty: number
}

export const CAT_KEYS: CatKey[] = ['all', 'hot', 'cold', 'staple', 'soup', 'drink']

export const MENU: Dish[] = [
  { id: 'm1', zh: '招牌牛肉面', en: 'Signature Beef Noodles', price: 28, cat: 'hot', sold: 128, like: 96, icon: 'noodle', feat: true, dzh: '秘制牛骨高汤，手工拉面，配大块牛腱肉，汤鲜面劲。', den: 'Hand-pulled noodles in slow-cooked beef bone broth with tender brisket.' },
  { id: 'm2', zh: '宫保鸡丁', en: 'Kung Pao Chicken', price: 32, cat: 'hot', sold: 88, like: 72, icon: 'chicken', dzh: '鲜嫩鸡丁搭配花生与干辣椒，麻辣鲜香、回味微甜。', den: 'Diced chicken with peanuts and chili — savory, spicy, slightly sweet.' },
  { id: 'm3', zh: '番茄鸡蛋面', en: 'Tomato Egg Noodles', price: 22, cat: 'staple', sold: 96, like: 48, icon: 'noodle', dzh: '酸甜番茄汤底，滑嫩鸡蛋，家常暖胃。', den: 'Tangy tomato broth with silky scrambled egg — comfort in a bowl.' },
  { id: 'm4', zh: '红烧牛肉饭', en: 'Braised Beef Rice', price: 32, cat: 'staple', sold: 75, like: 68, icon: 'rice', dzh: '软糯米饭浇上红烧牛肉，酱香浓郁。', den: 'Fluffy rice topped with rich braised beef.' },
  { id: 'm5', zh: '凉拌黄瓜', en: 'Smashed Cucumber', price: 16, cat: 'cold', sold: 53, like: 35, icon: 'veg', dzh: '爽脆开胃，蒜香十足，清爽解腻。', den: 'Crisp and refreshing, dressed with garlic and vinegar.' },
  { id: 'm6', zh: '小笼包', en: 'Soup Dumplings', price: 18, cat: 'staple', sold: 64, like: 80, icon: 'bun', dzh: '皮薄汁多，一口一个，鲜香满溢。', den: 'Thin-skinned, juicy steamed dumplings.' },
  { id: 'm7', zh: '西红柿蛋汤', en: 'Tomato Egg Soup', price: 18, cat: 'soup', sold: 46, like: 30, icon: 'soup', dzh: '酸甜暖胃，蛋花细腻，餐前一碗刚刚好。', den: 'Warm tangy soup with delicate egg ribbons.' },
  { id: 'm8', zh: '柠檬茶', en: 'Lemon Tea', price: 16, cat: 'drink', sold: 88, like: 40, icon: 'drink', dzh: '冰镇鲜柠檬，清爽回甘。', den: 'Iced fresh lemon tea, crisp and sweet.' },
]

export const INITIAL_ORDERS: Order[] = [
  { id: 'o1', table: 'A2', items: [['牛肉面', 'Beef Noodles', 2], ['凉拌黄瓜', 'Cucumber', 1]], note: ['不要香菜', 'No cilantro'], time: '09:41', status: 'new' },
  { id: 'o2', table: 'B1', items: [['宫保鸡丁', 'Kung Pao Chicken', 1], ['米饭', 'Rice', 2]], note: ['少辣', 'Less spicy'], time: '09:40', status: 'making' },
  { id: 'o3', table: 'C3', items: [['番茄鸡蛋面', 'Tomato Noodles', 1], ['可乐', 'Cola', 1]], note: ['少冰', 'Less ice'], time: '09:30', status: 'new' },
  { id: 'o4', table: 'A1', items: [['番茄鸡蛋面', 'Tomato Noodles', 1], ['可乐', 'Cola', 1]], note: ['', ''], time: '09:38', status: 'done' },
]

export type Seats = 'seats2' | 'seats4' | 'seats6'
export type TableStatus = 'inUse' | 'idle' | 'cleaning'

export interface Table {
  /** stable identifier used in the scan URL (?table=<id>) */
  id: string
  name: string
  seats: Seats
  status: TableStatus
}

export const INITIAL_TABLES: Table[] = [
  { id: '01', name: '01', seats: 'seats2', status: 'inUse' },
  { id: '02', name: '02', seats: 'seats4', status: 'idle' },
  { id: '03', name: '03', seats: 'seats4', status: 'inUse' },
  { id: '04', name: '04', seats: 'seats6', status: 'idle' },
  { id: '05', name: '05', seats: 'seats2', status: 'cleaning' },
]

export interface Dict {
  tagline: string; merchantLabel: string; customerLabel: string
  variantA: string; variantB: string
  welcomeSub: string; start: string; haveAccount: string; login: string
  loginTitle: string; loginSub: string; phone: string; pwd: string; loginBtn: string; noAccount: string; register: string; demoHint: string
  navHome: string; navOrders: string; navMenu: string; navSettings: string
  greeting: string; greetingSub: string
  todayOverview: string; revenue: string; validOrders: string; tablesInUse: string; pendingOrders: string; vsYst: string
  quick: string; menuMgmt: string; qr: string; orderCenter: string; bizSet: string
  liveOrders: string; viewAll: string
  menuTitle: string; totalDishes: string; dishesUnit: string; manageCat: string; edit: string; off: string; on: string; addDish: string; soldLab: string; likeLab: string; featured: string
  catAll: string; catHot: string; catCold: string; catStaple: string; catSoup: string; catDrink: string
  addTitle: string; mManual: string; mFile: string; mPhoto: string
  fName: string; fNamePh: string; fPrice: string; fCat: string; fDesc: string; fDescPh: string; fImg: string
  fileTitle: string; fileFormats: string; fileSmart: string
  photoTitle: string; photoHint: string; photoSmart: string
  saveManual: string; saveFile: string; savePhoto: string
  qrTitle: string; batch: string; inUse: string; idle: string; cleaning: string; addTable: string; downloadAll: string; seats2: string; seats4: string; seats6: string
  ordersTitle: string; accept: string; complete: string; noteLab: string; sNew: string; sMaking: string; sDone: string; portions: string
  settingsTitle: string; langSection: string; language: string; bizSection: string; logout: string; version: string; restName: string
  bizHours: string; bizHoursVal: string; profile: string; profileVal: string; notif: string; notifVal: string; account: string; accountVal: string
  cWelcome: string; cTable: string; cQty: string; cartTitle: string; cEmpty: string; cNoteLab: string; cNotePh: string; cToCart: string; cGoCart: string; cSubmit: string
  placedTitle: string; placedSub: string; trackTitle: string; yourOrder: string; backMenu: string
  tNew: string; tNewSub: string; tMaking: string; tMakingSub: string; tDone: string; tDoneSub: string
}

const zh: Dict = {
  tagline: '扫码点餐 · 后台接单 · 轻松经营', merchantLabel: '商家后台 · MERCHANT', customerLabel: '顾客扫码点餐 · CUSTOMER',
  variantA: '方案A', variantB: '方案B',
  welcomeSub: '让点餐更简单，让生意更轻松', start: '开始使用', haveAccount: '已有账号？', login: '去登录',
  loginTitle: '欢迎回来', loginSub: '登录管理你的餐厅', phone: '手机号', pwd: '密码', loginBtn: '登录', noAccount: '还没有账号？', register: '立即注册', demoHint: '演示模式 · 任意信息即可登录',
  navHome: '首页', navOrders: '订单', navMenu: '菜单', navSettings: '设置',
  greeting: '下午好，店长', greetingSub: '今天是美好的一天，生意加油呀！',
  todayOverview: '今日营业概览', revenue: '今日营业额', validOrders: '有效订单', tablesInUse: '桌台使用中', pendingOrders: '待处理订单', vsYst: '较昨日',
  quick: '快捷功能', menuMgmt: '菜单管理', qr: '桌台二维码', orderCenter: '订单管理', bizSet: '营业设置',
  liveOrders: '最近订单', viewAll: '查看全部',
  menuTitle: '菜单管理', totalDishes: '共', dishesUnit: '个菜品', manageCat: '管理分类', edit: '编辑', off: '下架', on: '上架', addDish: '添加菜品', soldLab: '月售', likeLab: '赞', featured: '招牌',
  catAll: '全部', catHot: '招牌推荐', catCold: '凉菜', catStaple: '主食', catSoup: '汤品', catDrink: '饮品',
  addTitle: '添加菜品', mManual: '手动添加', mFile: '上传文件', mPhoto: '拍照添加',
  fName: '菜品名称', fNamePh: '例如：招牌牛肉面', fPrice: '价格', fCat: '分类', fDesc: '菜品描述', fDescPh: '简单介绍这道菜的特色…', fImg: '菜品图片',
  fileTitle: '上传菜单文件', fileFormats: '拖入文件，或点击从相册/文件中选择', fileSmart: '智能识别菜名与价格，自动生成整份菜单，省去逐个录入。',
  photoTitle: '拍照导入菜单', photoHint: '对准纸质菜单拍照', photoSmart: 'AI 自动识别菜品名称与价格，一拍即生成菜单。',
  saveManual: '保存菜品', saveFile: '上传并识别', savePhoto: '拍照并识别',
  qrTitle: '桌台管理', batch: '批量下载', inUse: '使用中', idle: '空闲', cleaning: '清洁中', addTable: '添加桌台', downloadAll: '下载全部二维码', seats2: '2人桌', seats4: '4人桌', seats6: '6人桌',
  ordersTitle: '订单管理', accept: '接单', complete: '完成出餐', noteLab: '备注', sNew: '待接单', sMaking: '制作中', sDone: '已完成', portions: '份',
  settingsTitle: '设置', langSection: '通用', language: '语言', bizSection: '营业设置', logout: '退出登录', version: '版本', restName: 'Momo小馆',
  bizHours: '营业时间', bizHoursVal: '09:00 - 21:00', profile: '餐厅资料', profileVal: '已完善', notif: '消息通知', notifVal: '已开启', account: '账号与安全', accountVal: '',
  cWelcome: '欢迎光临，扫码点餐', cTable: '桌号', cQty: '数量', cartTitle: '我的订单', cEmpty: '还没有选择菜品，去看看吧～', cNoteLab: '备注', cNotePh: '口味偏好、忌口等…（选填）', cToCart: '加入购物车', cGoCart: '去结算', cSubmit: '提交订单',
  placedTitle: '订单已提交', placedSub: '厨房已收到，请耐心等候', trackTitle: '订单状态', yourOrder: '你的订单', backMenu: '继续点餐',
  tNew: '已下单', tNewSub: '餐厅正在确认', tMaking: '制作中', tMakingSub: '厨房正在备餐', tDone: '可取餐', tDoneSub: '请到取餐口领取',
}

const en: Dict = {
  tagline: 'Scan · Receive · Run with ease', merchantLabel: 'MERCHANT BACK OFFICE', customerLabel: 'CUSTOMER · SCAN TO ORDER',
  variantA: 'Layout A', variantB: 'Layout B',
  welcomeSub: 'Make ordering simpler, make business easier', start: 'Get Started', haveAccount: 'Already have an account?', login: 'Log in',
  loginTitle: 'Welcome back', loginSub: 'Sign in to manage your restaurant', phone: 'Phone', pwd: 'Password', loginBtn: 'Log in', noAccount: 'No account yet?', register: 'Sign up', demoHint: 'Demo mode · any details will log you in',
  navHome: 'Home', navOrders: 'Orders', navMenu: 'Menu', navSettings: 'Settings',
  greeting: 'Good afternoon, boss', greetingSub: 'It is a lovely day — good luck with business!',
  todayOverview: 'Today at a glance', revenue: 'Revenue today', validOrders: 'Valid orders', tablesInUse: 'Tables in use', pendingOrders: 'Pending orders', vsYst: 'vs yest.',
  quick: 'Quick actions', menuMgmt: 'Menu', qr: 'Table QR', orderCenter: 'Orders', bizSet: 'Settings',
  liveOrders: 'Recent orders', viewAll: 'View all',
  menuTitle: 'Menu', totalDishes: '', dishesUnit: 'dishes', manageCat: 'Categories', edit: 'Edit', off: 'Hide', on: 'Show', addDish: 'Add dish', soldLab: 'Sold', likeLab: 'Likes', featured: 'Signature',
  catAll: 'All', catHot: 'Recommended', catCold: 'Cold', catStaple: 'Staples', catSoup: 'Soups', catDrink: 'Drinks',
  addTitle: 'Add dish', mManual: 'Manual', mFile: 'Upload file', mPhoto: 'Photo',
  fName: 'Dish name', fNamePh: 'e.g. Signature Beef Noodles', fPrice: 'Price', fCat: 'Category', fDesc: 'Description', fDescPh: 'Briefly describe this dish…', fImg: 'Photo',
  fileTitle: 'Upload menu file', fileFormats: 'Drag a file in, or tap to choose from files', fileSmart: 'Auto-detect dish names and prices to build your whole menu in one step.',
  photoTitle: 'Scan a paper menu', photoHint: 'Point at your paper menu', photoSmart: 'AI reads dish names and prices, building the menu from one photo.',
  saveManual: 'Save dish', saveFile: 'Upload & scan', savePhoto: 'Capture & scan',
  qrTitle: 'Tables', batch: 'Download', inUse: 'In use', idle: 'Idle', cleaning: 'Cleaning', addTable: 'Add table', downloadAll: 'Download all QR codes', seats2: '2 seats', seats4: '4 seats', seats6: '6 seats',
  ordersTitle: 'Orders', accept: 'Accept', complete: 'Mark ready', noteLab: 'Note', sNew: 'New', sMaking: 'Cooking', sDone: 'Done', portions: '×',
  settingsTitle: 'Settings', langSection: 'General', language: 'Language', bizSection: 'Restaurant', logout: 'Log out', version: 'Version', restName: 'Momo Diner',
  bizHours: 'Opening hours', bizHoursVal: '09:00 - 21:00', profile: 'Restaurant profile', profileVal: 'Complete', notif: 'Notifications', notifVal: 'On', account: 'Account & security', accountVal: '',
  cWelcome: 'Welcome — scan to order', cTable: 'Table', cQty: 'Quantity', cartTitle: 'My order', cEmpty: 'No dishes yet — take a look!', cNoteLab: 'Note', cNotePh: 'Allergies, preferences… (optional)', cToCart: 'Add to cart', cGoCart: 'Checkout', cSubmit: 'Place order',
  placedTitle: 'Order placed', placedSub: 'The kitchen has it — please wait', trackTitle: 'Order status', yourOrder: 'Your order', backMenu: 'Order more',
  tNew: 'Placed', tNewSub: 'Restaurant confirming', tMaking: 'Cooking', tMakingSub: 'Kitchen is preparing', tDone: 'Ready', tDoneSub: 'Collect at pickup counter',
}

export const DICTS: Record<Lang, Dict> = { zh, en }

export function catLabel(d: Dict, k: CatKey): string {
  return { all: d.catAll, hot: d.catHot, cold: d.catCold, staple: d.catStaple, soup: d.catSoup, drink: d.catDrink }[k]
}
