// =====================================================
// APCL 사이트 공통 스크립트
// 이 파일은 후배분들이 수정할 필요가 없습니다.
// =====================================================
document.addEventListener("DOMContentLoaded", function () {

  // ---------- 모바일 상단 메뉴 토글 ----------
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  // ---------- Members 페이지: 교수 / 재학생 / 졸업생 탭 ----------
  var memberTabs = document.getElementById("memberTabs");
  if (memberTabs) {
    var mTabs = memberTabs.querySelectorAll(".pub-tab");
    mTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        mTabs.forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        var targetId = tab.getAttribute("data-panel");
        document.querySelectorAll(".member-panel").forEach(function (panel) {
          panel.style.display = (panel.id === targetId) ? "" : "none";
        });
      });
    });
  }

  // ---------- 멤버 사진 이스터에그 (더블클릭하면 다른 사진으로) ----------
  document.querySelectorAll(".member-photo[data-alt]").forEach(function (img) {
    var altSrc = img.getAttribute("data-alt");
    var origSrc = img.getAttribute("src");
    img.addEventListener("dblclick", function () {
      img.classList.add("photo-flip");
      setTimeout(function () {
        img.src = (img.src.indexOf(altSrc) !== -1) ? origSrc : altSrc;
      }, 140);
      setTimeout(function () {
        img.classList.remove("photo-flip");
      }, 280);
    });
  });

  // =====================================================
  // 공용 게시판 빌더 (News & Gallery / Publications 공용 로직)
  // =====================================================
  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/"/g, "&quot;");
  }

  function normalizeUrl(url) {
    url = String(url == null ? "" : url).trim();
    if (!url) return "";
    if (/^(https?:)?\/\//i.test(url) || /^mailto:/i.test(url)) return url;
    return "https://" + url;
  }

  function buildPagination(container, totalItems, pageSize, currentPage, onChange) {
    container.innerHTML = "";
    var totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    if (totalPages <= 1) return;

    function makeBtn(label, page, opts) {
      opts = opts || {};
      var btn = document.createElement("button");
      btn.className = "board-page-btn" + (opts.active ? " active" : "");
      btn.textContent = label;
      btn.disabled = !!opts.disabled;
      btn.addEventListener("click", function () { onChange(page); });
      return btn;
    }

    container.appendChild(makeBtn("‹", Math.max(1, currentPage - 1), { disabled: currentPage === 1 }));
    for (var i = 1; i <= totalPages; i++) {
      container.appendChild(makeBtn(String(i), i, { active: i === currentPage }));
    }
    container.appendChild(makeBtn("›", Math.min(totalPages, currentPage + 1), { disabled: currentPage === totalPages }));
  }

  // ---------- News & Gallery 게시판 ----------
  var newsListEl = document.getElementById("newsList");
  if (newsListEl) {
    var newsDataEl = document.getElementById("newsData");
    var newsItems = [];
    try { newsItems = JSON.parse(newsDataEl.textContent || "[]") || []; } catch (e) { newsItems = []; }

    var newsSearch = document.getElementById("newsSearch");
    var newsEmpty = document.getElementById("newsEmpty");
    var newsPagination = document.getElementById("newsPagination");
    var newsPageSize = 6;
    var newsPage = 1;
    var newsQuery = "";

    function filteredNews() {
      if (!newsQuery) return newsItems;
      var q = newsQuery.toLowerCase();
      return newsItems.filter(function (item) {
        return (item.title || "").toLowerCase().indexOf(q) !== -1 ||
               getNewsText(item).toLowerCase().indexOf(q) !== -1;
      });
    }

    // blocks 배열에서 텍스트 블록만 모아 하나의 문자열로 (검색용)
    function getNewsText(item) {
      return (item.blocks || [])
        .filter(function (b) { return b.type === "text"; })
        .map(function (b) { return b.text || ""; })
        .join(" ");
    }

    // blocks 배열에서 이미지 총 개수
    function getNewsImageCount(item) {
      return (item.blocks || [])
        .filter(function (b) { return b.type === "images"; })
        .reduce(function (sum, b) { return sum + (b.images || []).length; }, 0);
    }

    function renderNews() {
      var items = filteredNews();
      newsEmpty.style.display = items.length === 0 ? "" : "none";
      var start = (newsPage - 1) * newsPageSize;
      var pageItems = items.slice(start, start + newsPageSize);

      newsListEl.innerHTML = "";
      pageItems.forEach(function (item) {
        var row = document.createElement("div");
        row.className = "board-row";
        var imgCount = getNewsImageCount(item);
        row.innerHTML =
          '<div class="date">' + escapeHtml(item.date) + '</div>' +
          '<div class="title">' + escapeHtml(item.title) + '</div>' +
          (imgCount > 0 ? '<div class="badge">사진 ' + imgCount + '장</div>' : '<div></div>');
        row.addEventListener("click", function () { openNewsModal(item); });
        newsListEl.appendChild(row);
      });

      buildPagination(newsPagination, items.length, newsPageSize, newsPage, function (p) {
        newsPage = p;
        renderNews();
        newsListEl.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    if (newsSearch) {
      newsSearch.addEventListener("input", function () {
        newsQuery = newsSearch.value.trim();
        newsPage = 1;
        renderNews();
      });
    }

    // ---- 상세보기 모달 ----
    var newsModal = document.getElementById("newsModal");
    var newsModalBody = document.getElementById("newsModalBody");
    var newsModalClose = document.getElementById("newsModalClose");
    var newsModalBackdrop = document.getElementById("newsModalBackdrop");

    function renderNewsBlock(block) {
      if (block.type === "text") {
        return '<p class="content-block">' + escapeHtml(block.text) + '</p>';
      }
      if (block.type === "images") {
        var imgs = (block.images || []).filter(Boolean);
        if (imgs.length === 0) return "";
        var cls = "board-modal-gallery" + (block.size === "large" ? " large" : "");
        var html = imgs.map(function (img) {
          var src = (typeof img === "string") ? img : img.src;
          var orientation = (typeof img === "object" && img.orientation === "portrait") ? "portrait" : "landscape";
          var full = (window.SITE_BASEURL || "") + src;
          var imgCls = orientation === "portrait" ? ' class="portrait"' : "";
          return '<img' + imgCls + ' src="' + escapeHtml(full) + '" alt="" onerror="this.style.display=\'none\'">';
        }).join("");
        return '<div class="' + cls + '">' + html + '</div>';
      }
      return "";
    }

    function openNewsModal(item) {
      var blocksHtml = (item.blocks || []).map(renderNewsBlock).join("");
      newsModalBody.innerHTML =
        '<div class="date">' + escapeHtml(item.date) + '</div>' +
        '<h3>' + escapeHtml(item.title) + '</h3>' +
        blocksHtml;
      newsModal.classList.add("open");
      newsModal.setAttribute("aria-hidden", "false");
    }
    function closeNewsModal() {
      newsModal.classList.remove("open");
      newsModal.setAttribute("aria-hidden", "true");
    }
    if (newsModalClose) newsModalClose.addEventListener("click", closeNewsModal);
    if (newsModalBackdrop) newsModalBackdrop.addEventListener("click", closeNewsModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && newsModal && newsModal.classList.contains("open")) closeNewsModal();
    });

    renderNews();
  }

  // ---------- Publications 게시판 (탭 + 검색 + 페이지네이션) ----------
  var pubListEl = document.getElementById("pubList");
  if (pubListEl) {
    var pubDataEl = document.getElementById("pubData");
    var pubDataRaw = {};
    try { pubDataRaw = JSON.parse(pubDataEl.textContent || "{}") || {}; } catch (e) { pubDataRaw = {}; }

    var CATEGORY_LABELS = {
      domestic: "국내논문",
      international: "국외논문",
      patents: "특허",
      conferences: "학술대회"
    };

    var allPubs = [];
    Object.keys(CATEGORY_LABELS).forEach(function (cat) {
      (pubDataRaw[cat] || []).forEach(function (pub) {
        allPubs.push(Object.assign({ category: cat }, pub));
      });
    });
    // 최신 연도가 위로 오도록 정렬 (같은 연도 내에서는 yml에 적은 순서 유지)
    allPubs.sort(function (a, b) { return (b.year || 0) - (a.year || 0); });

    var pubTabsEl = document.getElementById("pubTabs");
    var pubSearch = document.getElementById("pubSearch");
    var pubEmpty = document.getElementById("pubEmpty");
    var pubPagination = document.getElementById("pubPagination");
    var pubPageSize = 8;
    var pubPage = 1;
    var pubQuery = "";
    var pubCategory = "all";

    function metaLine(pub) {
      if (pub.category === "patents") {
        return [pub.inventors, pub.number].filter(Boolean).join(" · ");
      }
      if (pub.category === "conferences") {
        return pub.venue || "";
      }
      return [pub.authors, pub.venue].filter(Boolean).join(" · ");
    }

    function doiUrl(doi) {
      doi = String(doi == null ? "" : doi).trim();
      if (!doi) return "";
      if (/^https?:\/\//i.test(doi)) return doi;
      return "https://doi.org/" + doi.replace(/^doi:\s*/i, "");
    }

    function renderPubTitle(pub) {
      var label;
      if (pub.category === "domestic" && (pub.title_kr || pub.title_en)) {
        label = [
          pub.title_kr ? '<span class="pub-title-kr">' + escapeHtml(pub.title_kr) + '</span>' : "",
          pub.title_en ? '<span class="pub-title-en">' + escapeHtml(pub.title_en) + '</span>' : ""
        ].filter(Boolean).join("");
      } else {
        label = escapeHtml(pub.title);
      }
      var href = normalizeUrl(pub.url);
      var linkableCategory = pub.category === "domestic" ||
                             pub.category === "international" ||
                             pub.category === "conferences";
      if (!href || !linkableCategory) return label;
      return '<a href="' + escapeAttr(href) + '" target="_blank" rel="noopener">' + label + '</a>';
    }

    function renderPubTitleWithBadge(pub) {
      var badge = ' <span class="badge">' + CATEGORY_LABELS[pub.category] + '</span>';
      var href = normalizeUrl(pub.url);
      var linkableCategory = pub.category === "domestic" ||
                             pub.category === "international" ||
                             pub.category === "conferences";
      function maybeLink(html) {
        if (!href || !linkableCategory) return html;
        return '<a href="' + escapeAttr(href) + '" target="_blank" rel="noopener">' + html + '</a>';
      }

      if (pub.category === "domestic" && (pub.title_kr || pub.title_en)) {
        var lines = [];
        if (pub.title_kr) {
          lines.push('<span class="pub-title-kr">' + maybeLink(escapeHtml(pub.title_kr)) + badge + '</span>');
        } else {
          lines.push(badge);
        }
        if (pub.title_en) {
          lines.push('<span class="pub-title-en">' + maybeLink(escapeHtml(pub.title_en)) + '</span>');
        }
        return lines.join("");
      }

      return renderPubTitle(pub) + badge;
    }

    function renderPubMeta(pub) {
      if (pub.category === "patents") {
        return [pub.inventors, pub.number].filter(Boolean).map(function (line) {
          return '<div class="pub-meta-line">' + escapeHtml(line) + '</div>';
        }).join("");
      }
      var lines = [];
      var meta = metaLine(pub);
      if (meta) lines.push('<div class="pub-meta-line">' + escapeHtml(meta) + '</div>');
      var url = normalizeUrl(pub.url);
      if (url) {
        lines.push(
          '<div class="pub-meta-line"><a class="pub-url" href="' + escapeAttr(url) +
          '" target="_blank" rel="noopener">' + escapeHtml(url) + '</a></div>'
        );
      }
      var doi = String(pub.doi == null ? "" : pub.doi).trim();
      if (doi) {
        lines.push(
          '<div class="pub-meta-line"><a class="pub-doi" href="' + escapeAttr(doiUrl(doi)) +
          '" target="_blank" rel="noopener">DOI: ' +
          escapeHtml(doi.replace(/^doi:\s*/i, "")) + '</a></div>'
        );
      }
      return lines.join("");
    }

    function filteredPubs() {
      var list = pubCategory === "all" ? allPubs : allPubs.filter(function (p) { return p.category === pubCategory; });
      if (!pubQuery) return list;
      var q = pubQuery.toLowerCase();
      return list.filter(function (p) {
        return (p.title || "").toLowerCase().indexOf(q) !== -1 ||
               (p.title_kr || "").toLowerCase().indexOf(q) !== -1 ||
               (p.title_en || "").toLowerCase().indexOf(q) !== -1 ||
               (metaLine(p) || "").toLowerCase().indexOf(q) !== -1;
      });
    }

    function renderPubs() {
      var items = filteredPubs();
      pubEmpty.style.display = items.length === 0 ? "" : "none";
      var start = (pubPage - 1) * pubPageSize;
      var pageItems = items.slice(start, start + pubPageSize);

      pubListEl.innerHTML = "";
      pageItems.forEach(function (pub) {
        var li = document.createElement("li");
        li.innerHTML =
          '<div class="pub-year">' + escapeHtml(pub.year) + '</div>' +
          '<div>' +
            '<div class="pub-title">' + renderPubTitleWithBadge(pub) + '</div>' +
            '<div class="pub-meta">' + renderPubMeta(pub) + '</div>' +
          '</div>';
        pubListEl.appendChild(li);
      });

      buildPagination(pubPagination, items.length, pubPageSize, pubPage, function (p) {
        pubPage = p;
        renderPubs();
        pubListEl.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    if (pubTabsEl) {
      pubTabsEl.querySelectorAll(".pub-tab").forEach(function (tab) {
        tab.addEventListener("click", function () {
          pubTabsEl.querySelectorAll(".pub-tab").forEach(function (t) { t.classList.remove("active"); });
          tab.classList.add("active");
          pubCategory = tab.getAttribute("data-cat");
          pubPage = 1;
          renderPubs();
        });
      });
    }
    if (pubSearch) {
      pubSearch.addEventListener("input", function () {
        pubQuery = pubSearch.value.trim();
        pubPage = 1;
        renderPubs();
      });
    }

    renderPubs();
  }

  // ---------- Research Projects pagination ----------
  var projectListEl = document.getElementById("projectList");
  if (projectListEl) {
    var projectItems = Array.prototype.slice.call(projectListEl.querySelectorAll(".project-item"));
    var projectPagination = document.getElementById("projectPagination");
    var projectPageSize = 5;
    var projectPage = 1;

    function renderProjects() {
      var start = (projectPage - 1) * projectPageSize;
      var end = start + projectPageSize;
      projectItems.forEach(function (item, index) {
        item.style.display = (index >= start && index < end) ? "" : "none";
      });

      if (projectPagination) {
        buildPagination(projectPagination, projectItems.length, projectPageSize, projectPage, function (p) {
          projectPage = p;
          renderProjects();
          projectListEl.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }

    renderProjects();
  }
});
