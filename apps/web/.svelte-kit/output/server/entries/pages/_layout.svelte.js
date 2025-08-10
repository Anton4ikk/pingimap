import { c as create_ssr_component, a as subscribe, b as add_attribute, e as escape, v as validate_component } from "../../chunks/ssr.js";
import { p as page } from "../../chunks/stores.js";
import { i as isLoading, a as isAuthenticated } from "../../chunks/auth.js";
const app = "";
const LoginModal_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: ".modal-backdrop.svelte-1fqzama.svelte-1fqzama{position:fixed;top:0;left:0;width:100vw;height:100vh;background-color:rgba(0, 0, 0, 0.5);display:flex;justify-content:center;align-items:center;z-index:1000}.modal-content.svelte-1fqzama.svelte-1fqzama{background:white;border-radius:8px;box-shadow:0 4px 20px rgba(0, 0, 0, 0.15);width:90%;max-width:400px;max-height:90vh;overflow:auto}.modal-header.svelte-1fqzama.svelte-1fqzama{display:flex;justify-content:space-between;align-items:center;padding:20px;border-bottom:1px solid #eee}.modal-header.svelte-1fqzama h2.svelte-1fqzama{margin:0;font-size:1.5rem;color:#333}.close-button.svelte-1fqzama.svelte-1fqzama{background:none;border:none;font-size:24px;cursor:pointer;color:#666;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:background-color 0.2s}.close-button.svelte-1fqzama.svelte-1fqzama:hover{background-color:#f0f0f0}.modal-body.svelte-1fqzama.svelte-1fqzama{padding:20px}.form-group.svelte-1fqzama.svelte-1fqzama{margin-bottom:20px}.form-group.svelte-1fqzama label.svelte-1fqzama{display:block;margin-bottom:8px;font-weight:500;color:#333}.password-input.svelte-1fqzama.svelte-1fqzama{width:100%;padding:12px;border:2px solid #ddd;border-radius:6px;font-size:16px;box-sizing:border-box;transition:border-color 0.2s}.password-input.svelte-1fqzama.svelte-1fqzama:focus{outline:none;border-color:#007bff}.password-input.svelte-1fqzama.svelte-1fqzama:disabled{background-color:#f8f9fa;cursor:not-allowed}.error-message.svelte-1fqzama.svelte-1fqzama{background-color:#f8d7da;color:#721c24;padding:10px;border-radius:4px;margin-bottom:15px;font-size:14px}.success-message.svelte-1fqzama.svelte-1fqzama{background-color:#d4edda;color:#155724;padding:10px;border-radius:4px;margin-bottom:15px;font-size:14px}.form-actions.svelte-1fqzama.svelte-1fqzama{display:flex;gap:10px;justify-content:flex-end}.cancel-button.svelte-1fqzama.svelte-1fqzama,.login-button.svelte-1fqzama.svelte-1fqzama{padding:10px 20px;border:none;border-radius:6px;font-size:14px;cursor:pointer;transition:background-color 0.2s;min-width:100px}.cancel-button.svelte-1fqzama.svelte-1fqzama{background-color:#6c757d;color:white}.cancel-button.svelte-1fqzama.svelte-1fqzama:hover:not(:disabled){background-color:#545b62}.login-button.svelte-1fqzama.svelte-1fqzama{background-color:#007bff;color:white}.login-button.svelte-1fqzama.svelte-1fqzama:hover:not(:disabled){background-color:#0056b3}.login-button.svelte-1fqzama.svelte-1fqzama:disabled,.cancel-button.svelte-1fqzama.svelte-1fqzama:disabled{opacity:0.6;cursor:not-allowed}",
  map: null
};
const LoginModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $isLoading, $$unsubscribe_isLoading;
  $$unsubscribe_isLoading = subscribe(isLoading, (value) => $isLoading = value);
  let { showModal = false } = $$props;
  let password = "";
  if ($$props.showModal === void 0 && $$bindings.showModal && showModal !== void 0)
    $$bindings.showModal(showModal);
  $$result.css.add(css$1);
  $$unsubscribe_isLoading();
  return `${showModal ? ` <div class="modal-backdrop svelte-1fqzama" role="button" tabindex="-1"> <div class="modal-content svelte-1fqzama" role="dialog" aria-labelledby="modal-title"><div class="modal-header svelte-1fqzama"><h2 id="modal-title" class="svelte-1fqzama" data-svelte-h="svelte-1b761im">Admin Login</h2> <button class="close-button svelte-1fqzama" aria-label="Close" data-svelte-h="svelte-nt7nig">×</button></div> <form class="modal-body svelte-1fqzama"><div class="form-group svelte-1fqzama"><label for="admin-password" class="svelte-1fqzama" data-svelte-h="svelte-1osa44b">Admin Password:</label> <input id="admin-password" type="password" placeholder="Enter admin password" class="password-input svelte-1fqzama" ${$isLoading ? "disabled" : ""} autocomplete="current-password"${add_attribute("value", password, 0)}></div> ${``} ${``} <div class="form-actions svelte-1fqzama"><button type="button" class="cancel-button svelte-1fqzama" ${$isLoading ? "disabled" : ""}>Cancel</button> <button type="submit" class="login-button svelte-1fqzama" ${$isLoading || !password.trim() ? "disabled" : ""}>${escape($isLoading ? "Logging in..." : "Login")}</button></div></form></div></div>` : ``}`;
});
const Navigation_svelte_svelte_type_style_lang = "";
const css = {
  code: ".nav-button.svelte-198b3ht{border:none;font-family:inherit;font-size:inherit;background:transparent !important}.nav-button.svelte-198b3ht:hover{color:white !important;background:rgba(255, 255, 255, 0.1) !important}",
  map: null
};
const Navigation = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  let $isAuthenticated, $$unsubscribe_isAuthenticated;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_isAuthenticated = subscribe(isAuthenticated, (value) => $isAuthenticated = value);
  let showLoginModal = false;
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<nav class="nav"><div class="nav-container"><div class="nav-brand" data-svelte-h="svelte-tklqds"><img src="/logo.png" alt="pingiMAP Logo" class="nav-logo"></div> <div class="nav-links"><a href="/" class="${["nav-link", $page.url.pathname === "/" ? "active" : ""].join(" ").trim()}"${add_attribute("aria-current", $page.url.pathname === "/" ? "page" : void 0, 0)}>Dashboard</a> ${$isAuthenticated ? `<a href="/services" class="${[
      "nav-link",
      $page.url.pathname.startsWith("/services") ? "active" : ""
    ].join(" ").trim()}"${add_attribute(
      "aria-current",
      $page.url.pathname.startsWith("/services") ? "page" : void 0,
      0
    )}>Services</a>` : ``} <a href="/info" class="${["nav-link", $page.url.pathname.startsWith("/info") ? "active" : ""].join(" ").trim()}"${add_attribute(
      "aria-current",
      $page.url.pathname.startsWith("/info") ? "page" : void 0,
      0
    )}>Info</a> ${$isAuthenticated ? `<button class="nav-link nav-button svelte-198b3ht" data-svelte-h="svelte-16jzbs1">Logout</button>` : `<button class="nav-link nav-button svelte-198b3ht" data-svelte-h="svelte-lz9saz">Login</button>`}</div></div></nav> ${validate_component(LoginModal, "LoginModal").$$render(
      $$result,
      { showModal: showLoginModal },
      {
        showModal: ($$value) => {
          showLoginModal = $$value;
          $$settled = false;
        }
      },
      {}
    )}`;
  } while (!$$settled);
  $$unsubscribe_page();
  $$unsubscribe_isAuthenticated();
  return $$rendered;
});
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Navigation, "Navigation").$$render($$result, {}, {}, {})} <main>${slots.default ? slots.default({}) : ``}</main>`;
});
export {
  Layout as default
};
