/* ============================================================
   配置区：日常只需要改这一段
   ============================================================ */

const OWNER  = 'xiejy0';
const REPO   = 'lihe';
const BRANCH = 'main';

const DIR     = 'images';   // 图片所在文件夹
const USE_CDN = true;       // 走 jsDelivr 加速，失败自动回退 GitHub raw

/* 系列列表 = 页面从上到下的显示顺序
   ⚠️ 这里的顺序只影响显示，不影响归到哪一组 */
const SERIES = [
    { id: 'xingzuo',     title: '＆ 12星座系列' },
    { id: 'aurora7',     title: '⚡ 极光7' },
    { id: 'aurora7pro',  title: '⚡ 极光7 Pro' },
    { id: 'aurora50',    title: '⚡ 极光50' },
    { id: 'auroraOther', title: '⚡ 极光其他' },
    { id: 'bluebird',    title: '🐦 青鸟系列' },
    { id: 'rebar',       title: '🔩 螺纹钢系列' },
    { id: 'dingfengbo',  title: '🎋 国风系列' },
    { id: 'art',         title: '🎨 艺术·联名·限定' },
    { id: 'other',       title: '🎁 其他主题礼盒' },
];

/* 分类规则 = 从上往下匹配，命中即停
   ⚠️ 极光7pro 必须排在极光7 前面，否则 Pro 会被「极光7」抢走
   ⚠️ 极光兜底必须排最后 */
const RULES = [
    { id: 'xingzuo',     re: /星座|白羊|金牛|双子|巨蟹|狮子|处女|天秤|天蝎|射手|摩羯|水瓶|双鱼/ },
    { id: 'aurora7pro',  re: /极光\s*7\s*pro/i },
    { id: 'aurora50',    re: /极光\s*50/ },
    { id: 'aurora7',     re: /极光\s*7/ },
    { id: 'auroraOther', re: /极光/ },
    { id: 'bluebird',    re: /青鸟/ },
    { id: 'rebar',       re: /螺纹钢/ },
    { id: 'dingfengbo',  re: /定风波|赤壁赋|金榜题名|竹影|凤栖/ },
    { id: 'art',         re: /莫奈|梵高|达芬奇|星月夜|麦田|睡莲|鸢尾|向日葵|岩间圣母|丝柏|联名/ },
];

/* 手动指定分组：键 = 去掉扩展名的完整文件名 */
const OVERRIDE = {
    // '川崎礼盒-梧桐-凤栖礼盒01': 'other',
};

/* 以下参数一般不用动 */
const CACHE_TTL       = 5 * 60 * 1000;  // 图片列表缓存 5 分钟
const PRELOAD_MARGIN  = '400px 0px';    // 提前多少距离开始加载图片
const FRAME_BUDGET_MS = 8;              // 每帧最多插入 DOM 的毫秒数

/* ============================================================
   以下为逻辑，一般不需要修改
   ============================================================ */

const KNOWN_IDS = new Set(SERIES.map(s => s.id));

function guessSeries(name) {
    let id = OVERRIDE[name];
    if (!id) {
        for (const r of RULES) {
            if (r.re.test(name)) { id = r.id; break; }
        }
    }
    if (!id) id = 'other';
    if (!KNOWN_IDS.has(id)) {
        console.warn('[分类] 未知系列 id "' + id + '"，已归入 other：' + name);
        id = 'other';
    }
    return id;
}

/* ---------- 缓存：只存文件名列表 ---------- */
const CACHE_KEY = 'kawasaki-gallery-v3';

function readCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { t, data } = JSON.parse(raw);
        return Date.now() - t > CACHE_TTL ? null : data;
    } catch { return null; }
}
function writeCache(files) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: files }));
    } catch {}
}

/* ---------- 图片地址 ---------- */
function buildUrls(file) {
    const enc = encodeURIComponent(file);
    const raw = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${DIR}/${enc}`;
    if (!USE_CDN) return { url: raw, fallback: '' };
    const cdn = `https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@${BRANCH}/${DIR}/${enc}`;
    return { url: cdn, fallback: raw };
}

/* ---------- 拉取图片列表 ---------- */
async function fetchFiles() {
    const cached = readCache();
    if (cached) return cached;

    const api = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DIR}?ref=${BRANCH}&t=${Date.now()}`;
    const res = await fetch(api, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error(data.message || '返回格式异常');

    const files = data
        .filter(f => f.type === 'file' && /\.(png|jpe?g|webp|gif|avif)$/i.test(f.name))
        .map(f => f.name)
        .sort((a, b) => a.localeCompare(b, 'zh'));

    writeCache(files);
    return files;
}

/* ---------- 懒加载 ---------- */
let io = null;
function getObserver() {
    if (io) return io;
    io = new IntersectionObserver(entries => {
        for (const e of entries) {
            if (!e.isIntersecting) continue;
            io.unobserve(e.target);
            startLoad(e.target);
        }
    }, { root: null, rootMargin: PRELOAD_MARGIN, threshold: 0.01 });
    return io;
}

function startLoad(img) {
    const primary  = img.dataset.src;
    const fallback = img.dataset.fallback;
    if (!primary) return;
    delete img.dataset.src;

    img.onload = () => {
        img.classList.add('loaded');
        const wrap = img.parentElement;
        if (wrap) wrap.classList.remove('shimmer');
    };
    img.onerror = () => {
        if (fallback && img.dataset.tried !== '1') {
            img.dataset.tried = '1';
            img.src = fallback;
            return;
        }
        const wrap = img.parentElement;
        if (wrap) {
            wrap.classList.remove('shimmer');
            const ph = wrap.querySelector('.no-img');
            if (ph) ph.style.display = 'flex';
        }
        img.remove();
    };
    img.src = primary;
}

/* ---------- 构建 DOM ---------- */
function buildSkeleton() {
    const gallery = document.getElementById('gallery');
    const frag = document.createDocumentFragment();

    for (const s of SERIES) {
        const sec = document.createElement('section');
        sec.className = 'series';
        sec.dataset.series = s.id;

        const title = document.createElement('div');
        title.className = 'series-title';
        title.textContent = s.title;

        const grid = document.createElement('div');
        grid.className = 'grid';
        grid.id = 'grid-' + s.id;

        sec.append(title, grid);
        frag.appendChild(sec);
    }
    gallery.appendChild(frag);
}

function makeCard(file) {
    const name = file.replace(/\.[^.]+$/, '');
    const { url, fallback } = buildUrls(file);

    const card = document.createElement('article');
    card.className = 'card';

    const thumb = document.createElement('div');
    thumb.className = 'thumb shimmer';

    const img = document.createElement('img');
    img.alt = name;
    img.decoding = 'async';
    img.dataset.src = url;
    if (fallback) img.dataset.fallback = fallback;

    const ph = document.createElement('div');
    ph.className = 'no-img';
    ph.textContent = '🖼️ 图片缺失';

    thumb.append(img, ph);

    const nameEl = document.createElement('div');
    nameEl.className = 'name';
    nameEl.textContent = name;

    card.append(thumb, nameEl);
    return card;
}

function render(files) {
    const grouped = new Map(SERIES.map(s => [s.id, []]));

    for (const file of files) {
        const name = file.replace(/\.[^.]+$/, '');
        const id = guessSeries(name);
        grouped.get(id).push(file);
    }

    const jobs = [];
    let total = 0;

    for (const s of SERIES) {
        const grid = document.getElementById('grid-' + s.id);
        const section = grid.closest('.series');
        const items = grouped.get(s.id) || [];

        if (!items.length) { section.style.display = 'none'; continue; }

        total += items.length;
        for (const file of items) {
            jobs.push({ parent: grid, node: makeCard(file) });
        }
    }

    document.getElementById('sub').textContent = `全系列礼盒一览（共 ${total} 款）`;

    const observer = getObserver();
    let i = 0;
    function flush() {
        const t0 = performance.now();
        while (i < jobs.length && performance.now() - t0 < FRAME_BUDGET_MS) {
            const { parent, node } = jobs[i++];
            parent.appendChild(node);
            const img = node.querySelector('img[data-src]');
            if (img) observer.observe(img);
        }
        if (i < jobs.length) requestAnimationFrame(flush);
    }
    requestAnimationFrame(flush);
}

function showError(msg) {
    document.getElementById('sub').textContent = '加载失败';
    const box = document.createElement('div');
    box.className = 'tip';
    box.innerHTML = `😕 无法读取图片列表<br><small>${msg}</small><br><br>
        请检查：仓库是否为 Public、OWNER / REPO 是否填对、images 文件夹是否存在`;
    document.getElementById('gallery').appendChild(box);
}

/* ---------- 启动 ---------- */
buildSkeleton();
fetchFiles().then(render).catch(e => showError(e.message));