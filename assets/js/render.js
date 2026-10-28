import { qs, qsa, el, svgUse, getByPath } from "./dom.js";

function fillTexts(content) {
  qsa("[data-text]").forEach((node) => {
    const value = getByPath(content, node.dataset.text);
    if (typeof value === "string") node.textContent = value;
  });
}

function renderNav(items) {
  const list = qs("#navList");
  items.forEach((item) => {
    const link = el("a", { text: item.label, attrs: { href: `#${item.id}`, "data-section": item.id } });
    const li = el("li", { className: item.mobileOnly ? "mobile-only" : "" }, [link]);
    list.append(li);
  });
}

function renderDefinitionList(container, rows, termKey, valueKey) {
  rows.forEach((row) => {
    container.append(el("div", {}, [el("dt", { text: row[termKey] }), el("dd", { text: row[valueKey] })]));
  });
}

function renderHero(hero) {
  renderDefinitionList(qs("#heroFacts"), hero.facts, "label", "value");
  qs("#heroPhoto").alt = hero.photoAlt;
}

function renderAbout(about) {
  const text = qs("#aboutText");
  text.append(el("p", { className: "big", text: about.lead }));
  about.paragraphs.forEach((paragraph) => text.append(el("p", { text: paragraph })));
  renderDefinitionList(qs("#aboutCard"), about.card, "term", "value");
}

function renderPaws(level) {
  const box = el("div", { className: "paws", attrs: { role: "img", "aria-label": `уровень ${level} из 5` } });
  for (let i = 0; i < 5; i++) {
    box.append(svgUse("paw", "0 0 100 100", i < level ? "on" : ""));
  }
  return box;
}

function renderSkills(skills) {
  const list = qs("#skillsList");
  skills.items.forEach((skill) => {
    list.append(
      el("li", { className: "card skill" }, [
        el("p", { className: "file", text: skill.file }),
        el("h3", { text: skill.name }),
        renderPaws(skill.level),
        el("p", { className: "skill-text", text: skill.text }),
      ])
    );
  });
}

function renderSeaPreview(seaMap) {
  const grid = el("div", { className: "sea" });
  const classes = { S: "ship", X: "hit", o: "miss" };
  seaMap.forEach((row) => {
    for (const cell of row) {
      grid.append(el("i", { className: classes[cell] || "" }));
    }
  });
  return el("div", { className: "thumb thumb-sea", attrs: { "aria-hidden": "true" } }, [grid]);
}

function renderSitePreview(domain) {
  const bar = el("div", { className: "mini-bar" }, [
    el("span"),
    el("span"),
    el("span"),
    el("p", { text: domain }),
  ]);
  const page = el("div", { className: "mini-page" }, [
    svgUse("cat-sit", "0 0 120 130", "grey"),
    svgUse("paw", "0 0 100 100", "mini-paw"),
  ]);
  const browser = el("div", { className: "mini-browser" }, [bar, page]);
  return el("div", { className: "thumb thumb-site", attrs: { "aria-hidden": "true" } }, [browser]);
}

function renderProjects(projects) {
  const list = qs("#projectList");
  projects.items.forEach((project) => {
    const preview = project.preview === "sea" ? renderSeaPreview(projects.seaMap) : renderSitePreview(projects.siteDomain);
    const tags = el("ul", { className: "tags", attrs: { "aria-label": "Технологии" } }, project.tags.map((tag) => el("li", { text: tag })));
    const link = el("a", {
      className: "link",
      text: project.link.label,
      attrs: { href: project.link.href, target: "_blank", rel: "noopener" },
    });
    const body = el("div", { className: "project-body" }, [
      el("h3", { text: project.title }),
      el("p", { text: project.text }),
      tags,
      link,
    ]);
    list.append(el("article", { className: "card project" }, [preview, body]));
  });
}

function renderHobbyDecor(kind) {
  if (kind === "dota") {
    return el("div", { className: "snow", attrs: { "aria-hidden": "true" } }, Array.from({ length: 6 }, () => el("i")));
  }
  if (kind === "voice") {
    return el("div", { className: "eq", attrs: { "aria-hidden": "true" } }, Array.from({ length: 7 }, () => el("i")));
  }
  return null;
}

function renderHobbies(hobbies) {
  const list = qs("#hobbyList");
  hobbies.items.forEach((hobby) => {
    const tile = el("article", { className: `tile tile-${hobby.kind}` }, [
      renderHobbyDecor(hobby.kind),
      el("p", { className: "tile-tag", text: hobby.tag }),
      el("h3", { text: hobby.title }),
      el("p", { text: hobby.text }),
      hobby.note ? el("p", { className: "hand", text: hobby.note }) : null,
    ]);
    list.append(tile);
  });
}

function renderContacts(contact) {
  const list = qs("#contactList");
  contact.links.forEach((item) => {
    const attrs = { href: item.href };
    if (item.href.startsWith("http")) {
      attrs.target = "_blank";
      attrs.rel = "noopener";
    }
    list.append(el("li", {}, [el("span", { className: "c-name", text: item.name }), el("a", { text: item.label, attrs })]));
  });
  qs("#pawLabel").textContent = contact.showLabel;
}

export function renderPage(content) {
  fillTexts(content);
  renderNav(content.nav);
  renderHero(content.hero);
  renderAbout(content.about);
  renderSkills(content.skills);
  renderProjects(content.projects);
  renderHobbies(content.hobbies);
  renderContacts(content.contact);
}
