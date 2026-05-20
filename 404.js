(function () {
  const path = window.location.pathname.toLowerCase();
  const isHamuzonGithubIo = location.hostname === "hamuzon.github.io";
  if (path.includes("readme") || path.includes("license")) {
    window.location.replace("./");
    return;
  }
  if (path.includes("v5.0-beta")) {
    const newPath = window.location.pathname.replace(/v5.0-beta/i, "v5.0");
    window.location.replace(newPath + window.location.search + window.location.hash);
    return;
  }

  if (!isHamuzonGithubIo) return;

  const isVersion = (s) => /^v\d+(\.\d+)*(-[a-z]+)?$/i.test(s);
  const segments = window.location.pathname.split("/").filter(Boolean);
  const vIdx = segments.findIndex(isVersion);
  if (vIdx !== -1 && segments.length > vIdx + 1) {
    const versionRoot =
      ("/" + segments.slice(0, vIdx + 1).join("/") + "/").replace(/\/+/g, "/");
    window.location.replace(versionRoot + window.location.search + window.location.hash);
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const isVersion = (s) => /^v\d+(\.\d+)*(-[a-z]+)?$/i.test(s);
  const segments = location.pathname.split("/").filter(Boolean);
  const vIdx = segments.findIndex(isVersion);
  const backLink = document.getElementById("backLink");
  const isHamuzonGithubIo = location.hostname === "hamuzon.github.io";

  let projectRoot = isHamuzonGithubIo ? "/calendar/" : "/";
  if (vIdx !== -1 && !isHamuzonGithubIo) {
    projectRoot = "/" + segments.slice(0, vIdx).join("/") + "/";
  }
  projectRoot = projectRoot.replace(/\/+/g, "/");

  if (vIdx !== -1) {
    const versionRoot =
      ("/" + segments.slice(0, vIdx + 1).join("/") + "/").replace(/\/+/g, "/");
    const currentPath = location.pathname.endsWith("/")
      ? location.pathname
      : location.pathname + "/";

    if (currentPath.toLowerCase() === versionRoot.toLowerCase()) {
      backLink.href = projectRoot;
    } else {
      backLink.href = versionRoot;
    }
  } else {
    backLink.href = projectRoot;
  }
});
