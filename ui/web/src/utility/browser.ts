export const Cookie = (function () {
  function get(name: string) {
    return document.cookie.split(";").reduce((acc, item) => {
      const [key, value] = item.split("=");
      return key.trim() === name ? decodeURIComponent(value) : acc;
    }, "");
  }
  return { get };
})();
