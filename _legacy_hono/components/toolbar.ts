import { escapeHtml } from "../middleware/security";
import type { TranslateFn } from "../i18n";
import type { ColorMode } from "../types";
import type { LocalePref } from "../utils/prefs";
import { COLOR_COOKIE, COLOR_STORAGE_KEY, LOCALE_COOKIE } from "../utils/prefs";

export type ToolbarState = {
  colorMode: ColorMode;
  localePref: LocalePref;
  t: TranslateFn;
};

/**
 * Fixed top-right color + language controls (public page only).
 * Color: menu → sets data-theme + cookie + localStorage (no reload).
 * Language: menu → sets cookie + reload (SSR i18n).
 */
export function renderToolbar(state: ToolbarState): string {
  const { colorMode, localePref, t } = state;
  const colorLabel =
    colorMode === "light"
      ? t("public.toolbar.color.light")
      : colorMode === "dark"
        ? t("public.toolbar.color.dark")
        : t("public.toolbar.color.system");
  const localeShort =
    localePref === "zh-CN" ? "中" : localePref === "en" ? "EN" : "Auto";
  const localeLabel =
    localePref === "zh-CN"
      ? t("public.toolbar.locale.zh")
      : localePref === "en"
        ? t("public.toolbar.locale.en")
        : t("public.toolbar.locale.auto");

  return `
<aside class="theme-toolbar" data-toolbar>
  <div class="theme-toolbar__group" data-menu-root="color">
    <button type="button" class="theme-toolbar__btn" data-menu-toggle="color"
      aria-haspopup="menu" aria-expanded="false"
      aria-label="${escapeHtml(t("public.toolbar.color"))}: ${escapeHtml(colorLabel)}"
      title="${escapeHtml(colorLabel)}">
      ${colorIcon(colorMode)}
      <span class="theme-toolbar__text">${escapeHtml(colorLabel)}</span>
    </button>
    <div class="theme-toolbar__menu" role="menu" hidden data-menu="color">
      ${menuItem("color", "system", t("public.toolbar.color.system"), colorMode === "system")}
      ${menuItem("color", "light", t("public.toolbar.color.light"), colorMode === "light")}
      ${menuItem("color", "dark", t("public.toolbar.color.dark"), colorMode === "dark")}
    </div>
  </div>
  <div class="theme-toolbar__group" data-menu-root="locale">
    <button type="button" class="theme-toolbar__btn" data-menu-toggle="locale"
      aria-haspopup="menu" aria-expanded="false"
      aria-label="${escapeHtml(t("public.toolbar.locale"))}: ${escapeHtml(localeLabel)}"
      title="${escapeHtml(localeLabel)}">
      <span class="theme-toolbar__badge">${escapeHtml(localeShort)}</span>
      <span class="theme-toolbar__text">${escapeHtml(localeLabel)}</span>
    </button>
    <div class="theme-toolbar__menu" role="menu" hidden data-menu="locale">
      ${menuItem("locale", "auto", t("public.toolbar.locale.auto"), localePref === "auto")}
      ${menuItem("locale", "zh-CN", t("public.toolbar.locale.zh"), localePref === "zh-CN")}
      ${menuItem("locale", "en", t("public.toolbar.locale.en"), localePref === "en")}
    </div>
  </div>
</aside>
${toolbarScript()}`;
}

function menuItem(kind: string, value: string, label: string, active: boolean): string {
  return `<button type="button" class="theme-toolbar__item${active ? " is-active" : ""}" role="menuitemradio" aria-checked="${active ? "true" : "false"}" data-set-${kind}="${escapeHtml(value)}">${escapeHtml(label)}</button>`;
}

function colorIcon(mode: ColorMode): string {
  if (mode === "light") {
    // sun
    return `<svg class="theme-toolbar__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`;
  }
  if (mode === "dark") {
    // moon
    return `<svg class="theme-toolbar__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z"/></svg>`;
  }
  // monitor / system
  return `<svg class="theme-toolbar__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>`;
}

/** Inline client script — no external assets */
function toolbarScript(): string {
  // Keep compact; cookie Max-Age = 1 year
  return `<script>
(function(){
  var COLOR_KEY=${JSON.stringify(COLOR_STORAGE_KEY)};
  var COLOR_COOKIE=${JSON.stringify(COLOR_COOKIE)};
  var LOCALE_COOKIE=${JSON.stringify(LOCALE_COOKIE)};
  var YEAR=31536000;
  function secure(){return location.protocol==='https:';}
  function setCookie(n,v){
    var s=n+'='+encodeURIComponent(v)+'; Path=/; Max-Age='+YEAR+'; SameSite=Lax';
    if(secure()) s+='; Secure';
    document.cookie=s;
  }
  function applyColor(mode){
    document.documentElement.setAttribute('data-theme', mode);
    var meta=document.querySelector('meta[name="color-scheme"]');
    if(meta) meta.setAttribute('content', mode==='system'?'light dark':mode);
    try{ localStorage.setItem(COLOR_KEY, mode); }catch(e){}
    setCookie(COLOR_COOKIE, mode);
  }
  function closeAll(except){
    document.querySelectorAll('[data-menu]').forEach(function(m){
      if(except && m===except) return;
      m.hidden=true;
    });
    document.querySelectorAll('[data-menu-toggle]').forEach(function(b){
      b.setAttribute('aria-expanded','false');
    });
  }
  document.addEventListener('click', function(ev){
    var t=ev.target;
    if(!t || !t.closest) return;
    var toggle=t.closest('[data-menu-toggle]');
    if(toggle){
      var name=toggle.getAttribute('data-menu-toggle');
      var menu=document.querySelector('[data-menu="'+name+'"]');
      var open=menu && menu.hidden;
      closeAll();
      if(menu && open){
        menu.hidden=false;
        toggle.setAttribute('aria-expanded','true');
      }
      ev.preventDefault();
      return;
    }
    var colorBtn=t.closest('[data-set-color]');
    if(colorBtn){
      var mode=colorBtn.getAttribute('data-set-color');
      if(mode) applyColor(mode);
      closeAll();
      // update active UI without full reload
      document.querySelectorAll('[data-set-color]').forEach(function(b){
        var on=b.getAttribute('data-set-color')===mode;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-checked', on?'true':'false');
      });
      var root=document.querySelector('[data-menu-root="color"] [data-menu-toggle]');
      if(root){
        var label=colorBtn.textContent||mode;
        root.setAttribute('aria-label', root.getAttribute('aria-label').split(':')[0]+': '+label);
        root.setAttribute('title', label);
        var text=root.querySelector('.theme-toolbar__text');
        if(text) text.textContent=label;
      }
      return;
    }
    var locBtn=t.closest('[data-set-locale]');
    if(locBtn){
      var loc=locBtn.getAttribute('data-set-locale');
      if(loc){
        setCookie(LOCALE_COOKIE, loc);
        location.reload();
      }
      return;
    }
    if(!t.closest('[data-toolbar]')) closeAll();
  });
  document.addEventListener('keydown', function(ev){
    if(ev.key==='Escape') closeAll();
  });
})();
</script>`;
}

/**
 * Early head script: apply localStorage color before paint (reduces FOUC).
 * Cookie still used on SSR; this covers pure-client visits after color-only switch.
 */
export function colorFoucScript(): string {
  return `<script>
(function(){
  try{
    var m=localStorage.getItem(${JSON.stringify(COLOR_STORAGE_KEY)});
    if(m==='light'||m==='dark'||m==='system'){
      document.documentElement.setAttribute('data-theme', m);
    }
  }catch(e){}
})();
</script>`;
}
