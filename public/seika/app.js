(() => {
  'use strict';

  const LS_MSGS = 'sr.msgs.v1';
  const LS_CFG = 'sr.cfg.v1';

  const $ = (id) => document.getElementById(id);
  const els = {
    messages: $('messages'), scroller: $('scroller'), hint: $('hint'),
    input: $('input'), send: $('btnSend'), reload: $('btnReload'),
    optionBar: $('optionBar'),
    settingsSheet: $('settingsSheet'), statusSheet: $('statusSheet'), statusBody: $('statusBody'),
    cfgBase: $('cfgBase'), cfgKey: $('cfgKey'), cfgModel: $('cfgModel'),
    cfgTemp: $('cfgTemp'), cfgTempVal: $('cfgTempVal'),
    cfgCtx: $('cfgCtx'), cfgCtxVal: $('cfgCtxVal'),
    cfgMode: $('cfgMode'), cfgKeep: $('cfgKeep'),
    subtitle: $('subtitle')
  };

  const cfg = Object.assign({
    base: 'https://api.deepseek.com/v1',
    key: '',
    model: 'deepseek-chat',
    temp: 0.92,
    ctx: 16,
    mode: 'direct',   // direct = 浏览器直连；proxy = 走同源 /api/chat
    keep: true        // 是否把 key 留在本机
  }, JSON.parse(localStorage.getItem(LS_CFG) || '{}'));

  let msgs = JSON.parse(localStorage.getItem(LS_MSGS) || '[]');
  let busy = false;

  /* ───────── 配置 ───────── */
  function saveCfg() {
    const store = { ...cfg };
    if (!cfg.keep) delete store.key;
    localStorage.setItem(LS_CFG, JSON.stringify(store));
  }
  function fillCfgUI() {
    els.cfgBase.value = cfg.base;
    els.cfgKey.value = cfg.key;
    els.cfgModel.value = cfg.model;
    els.cfgMode.value = cfg.mode;
    els.cfgKeep.checked = !!cfg.keep;
    els.cfgTemp.value = cfg.temp;
    els.cfgTempVal.textContent = Number(cfg.temp).toFixed(2);
    els.cfgCtx.value = cfg.ctx;
    els.cfgCtxVal.textContent = cfg.ctx;
  }
  function readCfgUI() {
    cfg.base = els.cfgBase.value.trim() || 'https://api.deepseek.com/v1';
    cfg.key = els.cfgKey.value.trim();
    cfg.model = els.cfgModel.value.trim() || 'deepseek-chat';
    cfg.mode = els.cfgMode.value;
    cfg.keep = els.cfgKeep.checked;
    cfg.temp = Number(els.cfgTemp.value);
    cfg.ctx = Number(els.cfgCtx.value);
    saveCfg();
  }

  function persist() {
    try { localStorage.setItem(LS_MSGS, JSON.stringify(msgs)); }
    catch (e) { msgs = msgs.slice(-12); localStorage.setItem(LS_MSGS, JSON.stringify(msgs)); }
  }

  /* ───────── 渲染 ───────── */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function renderAll() {
    els.messages.innerHTML = '';
    msgs.forEach(m => appendMsgEl(m.role, m.content));
    els.hint.style.display = msgs.length ? 'none' : '';
    const last = [...msgs].reverse().find(m => m.role === 'assistant');
    renderOptions(last ? last.content : '');
    renderStatus(last ? last.content : '');
    const n = msgs.filter(m => m.role === 'assistant').length;
    els.subtitle.textContent = n ? `圣樱女子学院 · 第 ${n} 轮` : '圣樱女子学院';
    scrollBottom(true);
  }

  function appendMsgEl(role, content) {
    const wrap = document.createElement('div');
    wrap.className = 'msg ' + (role === 'user' ? 'user' : 'ai');
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    if (role === 'user') bubble.textContent = content;
    else bubble.innerHTML = content;
    wrap.appendChild(bubble);
    els.messages.appendChild(wrap);
    return bubble;
  }

  function scrollBottom(force) {
    const el = els.scroller;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 260;
    if (force || near) el.scrollTop = el.scrollHeight;
  }

  /* ───────── 选项 ───────── */
  function plainText(html) {
    const d = document.createElement('div');
    d.innerHTML = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(div|p|summary|details)>/gi, '\n');
    return d.textContent || '';
  }

  function extractOptions(html) {
    const text = plainText(html);
    const out = [];
    const re = /^\s*([1-5])\uFE0F?\u20E3?\s*(.+?)\s*$/gm;
    let m;
    while ((m = re.exec(text))) {
      let label = m[2].replace(/\s*[📝😳👑🎀+]+$/g, '').trim();
      if (label.length > 46) label = label.slice(0, 46) + '…';
      out.push({ n: m[1], label });
      if (out.length >= 5) break;
    }
    return out;
  }

  function renderOptions(html) {
    els.optionBar.innerHTML = '';
    extractOptions(html).forEach(o => {
      const b = document.createElement('button');
      b.className = 'opt';
      b.textContent = ['①', '②', '③', '④', '⑤'][Number(o.n) - 1] + ' ' + o.label;
      b.onclick = () => send(o.n);
      els.optionBar.appendChild(b);
    });
  }

  function renderStatus(html) {
    if (!html) { els.statusBody.textContent = '还没有状态。'; return; }
    const d = document.createElement('div');
    d.innerHTML = html;
    const box = [...d.querySelectorAll('details')].find(x =>
      /📱\s*状态/.test(x.querySelector('summary')?.textContent || '')
    );
    els.statusBody.innerHTML = box ? box.outerHTML : '还没有状态。';
    els.statusBody.querySelectorAll('details').forEach(x => x.open = true);
  }

  /* ───────── 上游请求 ───────── */
  function buildMessages() {
    return msgs.slice(-cfg.ctx * 2).map(m => ({ role: m.role, content: m.content }));
  }

  async function consumeSSE(res, onDelta) {
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() || '';
      for (const line of lines) {
        const s = line.trim();
        if (!s.startsWith('data:')) continue;
        const data = s.slice(5).trim();
        if (!data || data === '[DONE]') continue;
        let j;
        try { j = JSON.parse(data); } catch { continue; }
        if (j.error) throw new Error(j.error.message || j.detail || JSON.stringify(j.error));
        const delta = j.choices?.[0]?.delta?.content;
        if (delta) onDelta(delta);
      }
    }
  }

  async function requestDirect(onDelta) {
    const base = (cfg.base || 'https://api.deepseek.com/v1').replace(/\/+$/, '');
    const res = await fetch(base + '/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + cfg.key
      },
      body: JSON.stringify({
        model: cfg.model,
        stream: true,
        temperature: cfg.temp,
        max_tokens: 2600,
        messages: [{ role: 'system', content: systemPrompt }, ...buildMessages()]
      })
    });
    if (!res.ok) {
      let t = '';
      try { t = await res.text(); } catch {}
      throw new Error(`上游 ${res.status}：${t.slice(0, 300) || res.statusText}`);
    }
    await consumeSSE(res, onDelta);
  }

  async function requestProxy(onDelta) {
    const headers = { 'content-type': 'application/json' };
    if (cfg.base) headers['x-llm-base-url'] = cfg.base;
    if (cfg.key) headers['x-llm-key'] = cfg.key;
    if (cfg.model) headers['x-llm-model'] = cfg.model;

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({ temperature: cfg.temp, messages: buildMessages() })
    });
    if (!res.ok) {
      let j = {};
      try { j = await res.json(); } catch {}
      throw new Error(j.hint || j.detail || j.error || ('HTTP ' + res.status));
    }
    await consumeSSE(res, onDelta);
  }

  /* ───────── 系统提示词（直连模式由前端自带） ───────── */
  let systemPrompt = '';

  async function loadSystemPrompt() {
    try {
      const r = await fetch('./system-prompt.txt', { cache: 'no-cache' });
      if (r.ok) systemPrompt = await r.text();
    } catch {}
    if (!systemPrompt) {
      systemPrompt = '你是中文多角色互动叙事引擎。以第三人称旁白推进剧情，角色保持清醒的抗拒，不替玩家决定行动。' +
        '每轮输出 600-900 字正文，正文后附数值变化块，再附状态面板（<details> 折叠，summary 含「📱 状态」），' +
        '最后给出 1️⃣-5️⃣ 五个选项，第 5 条固定为「自由行动（请输入内容）📝」。';
    }
  }

  /* ───────── 发送 ───────── */
  async function send(text) {
    if (busy) return;
    const val = (text !== undefined ? text : els.input.value).trim();
    if (!val) return;
    if (cfg.mode === 'direct' && !cfg.key) {
      fillCfgUI();
      els.settingsSheet.classList.add('open');
      return;
    }
    if (text === undefined) { els.input.value = ''; autosize(); }

    msgs.push({ role: 'user', content: val });
    persist();
    els.hint.style.display = 'none';
    appendMsgEl('user', val);
    els.optionBar.innerHTML = '';
    scrollBottom(true);

    const bubble = appendMsgEl('assistant', '');
    bubble.classList.add('caret');
    let acc = '';
    busy = true;
    els.send.disabled = true;

    try {
      const onDelta = (d) => { acc += d; bubble.innerHTML = acc; scrollBottom(); };
      if (cfg.mode === 'proxy') await requestProxy(onDelta);
      else await requestDirect(onDelta);
    } catch (e) {
      bubble.classList.remove('caret');
      bubble.innerHTML = acc + `<div style="color:#d08080;font-size:13px;padding:10px;border:1px solid #4a2c38;border-radius:10px;background:#150c12;">⚠︎ ${esc(e.message || e)}</div>`;
      busy = false;
      els.send.disabled = false;
      return;
    } finally {
      bubble.classList.remove('caret');
    }

    if (!acc) {
      bubble.innerHTML = '<div style="color:#8c82a0;font-size:13px;padding:10px;">（空回复，检查模型名或额度）</div>';
    }
    msgs.push({ role: 'assistant', content: acc });
    persist();
    busy = false;
    els.send.disabled = false;
    renderOptions(acc);
    renderStatus(acc);
    const n = msgs.filter(m => m.role === 'assistant').length;
    els.subtitle.textContent = `圣樱女子学院 · 第 ${n} 轮`;
    scrollBottom(true);
  }

  /* ───────── 交互 ───────── */
  function autosize() {
    els.input.style.height = 'auto';
    els.input.style.height = Math.min(els.input.scrollHeight, 132) + 'px';
  }

  els.input.addEventListener('input', autosize);
  els.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 720) { e.preventDefault(); send(); }
  });
  els.send.onclick = () => send();

  els.reload.onclick = () => {
    if (busy) return;
    const idx = [...msgs].reverse().findIndex(m => m.role === 'user');
    if (idx < 0) return;
    msgs = msgs.slice(0, msgs.length - idx);
    persist();
    renderAll();
    send();
  };

  $('btnStart').onclick = () => send('（开始。第一轮：我在学生会大楼顶层休息室，第一次打开校规修改器，输入第一条校规。）');

  $('btnSettings').onclick = () => { fillCfgUI(); els.settingsSheet.classList.add('open'); };
  $('btnCloseSettings').onclick = () => { readCfgUI(); els.settingsSheet.classList.remove('open'); };
  els.settingsSheet.addEventListener('click', (e) => {
    if (e.target === els.settingsSheet) { readCfgUI(); els.settingsSheet.classList.remove('open'); }
  });

  $('btnStatus').onclick = () => els.statusSheet.classList.add('open');
  $('btnCloseStatus').onclick = () => els.statusSheet.classList.remove('open');
  els.statusSheet.addEventListener('click', (e) => {
    if (e.target === els.statusSheet) els.statusSheet.classList.remove('open');
  });

  els.cfgTemp.addEventListener('input', () => { els.cfgTempVal.textContent = Number(els.cfgTemp.value).toFixed(2); });
  els.cfgCtx.addEventListener('input', () => { els.cfgCtxVal.textContent = els.cfgCtx.value; });
  els.cfgMode.addEventListener('change', () => { cfg.mode = els.cfgMode.value; saveCfg(); });

  $('btnClear').onclick = () => {
    if (!confirm('清空本机全部会话？')) return;
    msgs = []; persist(); renderAll(); els.statusBody.textContent = '还没有状态。';
  };

  $('btnExport').onclick = () => {
    const blob = new Blob([JSON.stringify({ savedAt: new Date().toISOString(), msgs }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sr-save-${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };

  /* ───────── 启动 ───────── */
  fillCfgUI();
  renderAll();
  loadSystemPrompt();
  if (!cfg.key) els.settingsSheet.classList.add('open');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
})();

