const state = {
  rootData: null,
  currentTokens: [],
  targetTokens: [],
  pathMode: "wizard",
};

const jsonInput = document.getElementById("jsonInput");
const parseBtn = document.getElementById("parseBtn");
const clearBtn = document.getElementById("clearBtn");
const parseStatus = document.getElementById("parseStatus");
const pathModeRadios = document.querySelectorAll('input[name="pathMode"]');
const panelWizard = document.getElementById("panelWizard");
const panelTree = document.getElementById("panelTree");
const panelKey = document.getElementById("panelKey");
const wizardFilter = document.getElementById("wizardFilter");
const currentPathEl = document.getElementById("currentPath");
const currentTypeEl = document.getElementById("currentType");
const nextStepsEl = document.getElementById("nextSteps");
const backBtn = document.getElementById("backBtn");
const setTargetBtn = document.getElementById("setTargetBtn");
const treeFilter = document.getElementById("treeFilter");
const treeRoot = document.getElementById("treeRoot");
const treeEmpty = document.getElementById("treeEmpty");
const treeStatus = document.getElementById("treeStatus");
const wizardStatus = document.getElementById("wizardStatus");
const keySearchInput = document.getElementById("keySearchInput");
const keyFindBtn = document.getElementById("keyFindBtn");
const keyResults = document.getElementById("keyResults");
const keyStatus = document.getElementById("keyStatus");
const targetPathEl = document.getElementById("targetPath");
const languageEl = document.getElementById("language");
const safeAccessEl = document.getElementById("safeAccess");
const generateBtn = document.getElementById("generateBtn");
const resultCodeEl = document.getElementById("resultCode");
const copyBtn = document.getElementById("copyBtn");
const copyFeedback = document.getElementById("copyFeedback");
const runtimeExampleEl = document.getElementById("runtimeExample");

parseBtn.addEventListener("click", parseJson);
clearBtn.addEventListener("click", clearAll);
backBtn.addEventListener("click", goBack);
setTargetBtn.addEventListener("click", setCurrentAsTarget);
generateBtn.addEventListener("click", generateSyntax);
wizardFilter.addEventListener("input", () => renderWizard());
treeFilter.addEventListener("input", () => renderTree());
keyFindBtn.addEventListener("click", findByKey);
keySearchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") findByKey();
});
languageEl.addEventListener("change", updateRuntimeExample);
safeAccessEl.addEventListener("change", () => {
  if (resultCodeEl.textContent.trim()) generateSyntax();
});

copyBtn.addEventListener("click", copyResult);

pathModeRadios.forEach((r) =>
  r.addEventListener("change", () => {
    if (!r.checked) return;
    setPathMode(r.value);
  })
);

parseJson();

(function initFooterYear() {
  const startYear = 2026;
  const y = new Date().getFullYear();
  const el = document.getElementById("footer-year-range");
  if (el) {
    el.textContent =
      y <= startYear ? String(startYear) : `${startYear}–${y}`;
  }
})();

document.querySelectorAll(".inline-footnote-ref").forEach((a) => {
  a.addEventListener("click", (e) => e.stopPropagation());
});

function setParseStatus(message, type) {
  parseStatus.textContent = message;
  parseStatus.classList.remove("status--success", "status--error");
  if (type === "success") parseStatus.classList.add("status--success");
  else if (type === "error") parseStatus.classList.add("status--error");
}

function setSubStatus(el, message, type) {
  el.textContent = message;
  el.classList.remove("status--success", "status--error");
  if (type === "success") el.classList.add("status--success");
  else if (type === "error") el.classList.add("status--error");
}

function setPathMode(mode) {
  state.pathMode = mode;
  clearTargetSelection();
  resultCodeEl.textContent = "";
  copyBtn.disabled = true;
  copyFeedback.textContent = "";

  panelWizard.classList.toggle("hidden", mode !== "wizard");
  panelWizard.hidden = mode !== "wizard";
  panelTree.classList.toggle("hidden", mode !== "tree");
  panelTree.hidden = mode !== "tree";
  panelKey.classList.toggle("hidden", mode !== "key");
  panelKey.hidden = mode !== "key";

  if (mode === "wizard" && state.rootData !== null) {
    setSubStatus(wizardStatus, "", null);
    renderWizard();
  }
  if (mode === "tree" && state.rootData !== null) renderTree();
  if (mode === "key") {
    keyResults.innerHTML = "";
    setSubStatus(
      keyStatus,
      state.rootData
        ? "Enter a property key and click Find paths."
        : "Parse JSON first, then search by key.",
      state.rootData ? undefined : "error"
    );
  }
}

function clearTargetSelection() {
  state.targetTokens = [];
  targetPathEl.value = "";
}

function parseJson() {
  setParseStatus("", null);
  resultCodeEl.textContent = "";
  copyBtn.disabled = true;
  copyFeedback.textContent = "";
  try {
    const raw = jsonInput.value.trim();
    if (!raw) {
      throw new Error("Please provide JSON first.");
    }
    state.rootData = JSON.parse(raw);
    state.currentTokens = [];
    clearTargetSelection();
    setParseStatus(
      "JSON parsed successfully. Use step 2 to choose a path.",
      "success"
    );
    if (state.pathMode === "wizard") {
      setSubStatus(wizardStatus, "", null);
      renderWizard();
    }
    else if (state.pathMode === "tree") renderTree();
    else {
      keyResults.innerHTML = "";
      setSubStatus(
        keyStatus,
        "Enter a property key and click Find paths.",
        undefined
      );
    }
    updateRuntimeExample();
  } catch (err) {
    state.rootData = null;
    setParseStatus(`Invalid JSON: ${err.message}`, "error");
    nextStepsEl.innerHTML = "";
    currentPathEl.textContent = "$";
    currentTypeEl.textContent = "Type: -";
    treeRoot.innerHTML = "";
    treeEmpty.classList.remove("hidden");
    treeEmpty.hidden = false;
    keyResults.innerHTML = "";
    setSubStatus(keyStatus, "", null);
  }
}

function clearAll() {
  jsonInput.value = "";
  state.rootData = null;
  state.currentTokens = [];
  clearTargetSelection();
  wizardFilter.value = "";
  treeFilter.value = "";
  keySearchInput.value = "";
  keyResults.innerHTML = "";
  resultCodeEl.textContent = "";
  copyBtn.disabled = true;
  copyFeedback.textContent = "";
  runtimeExampleEl.textContent = "";
  const wiz = document.querySelector('input[name="pathMode"][value="wizard"]');
  if (wiz) wiz.checked = true;
  setPathMode("wizard");
  setParseStatus("Cleared. Paste new JSON when ready.", "success");
  nextStepsEl.innerHTML = "";
  currentPathEl.textContent = "$";
  currentTypeEl.textContent = "Type: -";
  treeRoot.innerHTML = "";
  treeEmpty.classList.remove("hidden");
  treeEmpty.hidden = false;
  setSubStatus(treeStatus, "", null);
  setSubStatus(keyStatus, "", null);
  setSubStatus(wizardStatus, "", null);
}

function goBack() {
  if (state.currentTokens.length === 0) return;
  state.currentTokens.pop();
  renderWizard();
}

function setCurrentAsTarget() {
  if (state.rootData === null) {
    setSubStatus(wizardStatus, "Parse JSON first.", "error");
    return;
  }
  state.targetTokens = [...state.currentTokens];
  targetPathEl.value = toPathString(state.targetTokens);
  setSubStatus(
    wizardStatus,
    "Target path set from wizard. Go to step 3 to generate code.",
    "success"
  );
}

function applyTarget(tokens) {
  state.targetTokens = [...tokens];
  targetPathEl.value = toPathString(state.targetTokens);
}

function renderWizard() {
  if (state.rootData === null) return;

  const node = getNodeByTokens(state.rootData, state.currentTokens);
  currentPathEl.textContent = toPathString(state.currentTokens);
  currentTypeEl.textContent = `Type: ${detectType(node)}`;
  nextStepsEl.innerHTML = "";

  let options = getNextOptions(node);
  const q = wizardFilter.value.trim().toLowerCase();
  if (q) {
    options = options.filter((o) => {
      const label = String(o.token).toLowerCase();
      return label.includes(q) || o.label.toLowerCase().includes(q);
    });
  }

  if (options.length === 0) {
    const li = document.createElement("li");
    li.textContent = q
      ? "No next steps match your filter. Clear the filter or go Back."
      : "No children at this node.";
    nextStepsEl.appendChild(li);
    return;
  }

  for (const option of options) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML = `${escapeHtml(option.label)}<br><small>${escapeHtml(
      option.preview
    )}</small>`;
    btn.addEventListener("click", () => {
      state.currentTokens.push(option.token);
      renderWizard();
    });
    li.appendChild(btn);
    nextStepsEl.appendChild(li);
  }
}

function findByKey() {
  keyResults.innerHTML = "";
  if (state.rootData === null) {
    setSubStatus(keyStatus, "Parse JSON first before searching for a key.", "error");
    return;
  }
  const raw = keySearchInput.value.trim();
  if (!raw) {
    setSubStatus(
      keyStatus,
      "Type the property name to search for (case-insensitive match).",
      "error"
    );
    return;
  }

  const matches = findAllPathsForKey(state.rootData, raw);
  if (matches.length === 0) {
    setSubStatus(
      keyStatus,
      `No property named "${raw}" found (case-insensitive). Check spelling or try the tree/wizard.`,
      "error"
    );
    return;
  }

  setSubStatus(
    keyStatus,
    `Found ${matches.length} path${matches.length === 1 ? "" : "s"}. Click one to set the target.`,
    "success"
  );

  for (const { tokens, actualKey, valuePreview } of matches) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML = `<span class="path-line">${escapeHtml(
      toPathString(tokens)
    )}</span><br><span class="preview-line">key: ${escapeHtml(
      actualKey
    )} → ${escapeHtml(valuePreview)}</span>`;
    btn.addEventListener("click", () => {
      applyTarget(tokens);
      setSubStatus(
        keyStatus,
        `Selected: ${toPathString(tokens)}. Generate code in step 3.`,
        "success"
      );
    });
    li.appendChild(btn);
    keyResults.appendChild(li);
  }
}

/**
 * Collect every path to an object property whose name equals `search` (case-insensitive).
 * Path includes the key as the final token; value is that property's value.
 */
function findAllPathsForKey(root, search) {
  const needle = search.toLowerCase();
  const out = [];

  function walk(value, pathTokens) {
    if (value === null || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach((item, i) => walk(item, pathTokens.concat(i)));
      return;
    }
    for (const k of Object.keys(value)) {
      const next = pathTokens.concat(k);
      if (k.toLowerCase() === needle) {
        const v = value[k];
        out.push({
          tokens: next,
          actualKey: k,
          valuePreview: shortPreview(v),
        });
      }
      walk(value[k], next);
    }
  }

  walk(root, []);
  return out;
}

function renderTree() {
  treeRoot.innerHTML = "";
  if (state.rootData === null) {
    treeEmpty.classList.remove("hidden");
    treeEmpty.hidden = false;
    setSubStatus(treeStatus, "", null);
    return;
  }
  treeEmpty.classList.add("hidden");
  treeEmpty.hidden = true;
  const filterRaw = treeFilter.value.trim().toLowerCase();
  const ul = document.createElement("ul");
  ul.className = "tree-root";
  const child = buildTreeNode(state.rootData, [], filterRaw, true);
  if (child) ul.appendChild(child);
  treeRoot.appendChild(ul);
  if (!ul.querySelector("li")) {
    setSubStatus(
      treeStatus,
      "No branches match your tree filter. Clear the filter to see everything.",
      "error"
    );
  } else {
    setSubStatus(
      treeStatus,
      "Expand nodes and click “Use as target” on the value you need.",
      undefined
    );
  }
}

function keyMatchesFilter(segment, filterLower) {
  if (!filterLower) return true;
  return String(segment).toLowerCase().includes(filterLower);
}

/**
 * Returns li.tree-item or null if hidden by filter.
 */
function buildTreeNode(value, pathTokens, filterLower, isRoot) {
  const type = detectType(value);
  const li = document.createElement("li");
  li.className = "tree-item";

  if (type === "object" || type === "array") {
    const hasKids =
      type === "array"
        ? value.length > 0
        : Object.keys(value).length > 0;
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.flexWrap = "wrap";
    row.style.gap = "6px";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "tree-toggle";
    const label = isRoot
      ? "root"
      : type === "array"
        ? `[${pathTokens[pathTokens.length - 1]}]`
        : String(pathTokens[pathTokens.length - 1]);
    toggle.innerHTML = `<span class="caret">▼</span><span class="key-label">${escapeHtml(
      label
    )}</span> <span class="type-hint">${type}${
      type === "array" ? ` (${value.length})` : ""
    }</span>`;

    const useBtn = document.createElement("button");
    useBtn.type = "button";
    useBtn.className = "tree-select";
    useBtn.textContent = "Use as target";
    useBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      applyTarget(pathTokens);
      setSubStatus(
        treeStatus,
        `Target: ${toPathString(pathTokens)}. Go to step 3 to generate code.`,
        "success"
      );
    });

    const childrenUl = document.createElement("ul");
    childrenUl.className = "tree-children";
    let anyChild = false;

    if (type === "array") {
      for (let i = 0; i < value.length; i++) {
        const childLi = buildTreeNode(value[i], pathTokens.concat(i), filterLower, false);
        if (childLi) {
          childrenUl.appendChild(childLi);
          anyChild = true;
        }
      }
    } else {
      for (const k of Object.keys(value)) {
        const childLi = buildTreeNode(
          value[k],
          pathTokens.concat(k),
          filterLower,
          false
        );
        if (childLi) {
          childrenUl.appendChild(childLi);
          anyChild = true;
        }
      }
    }

    const descendantMatches = anyChild;
    const selfMatches =
      !isRoot &&
      keyMatchesFilter(pathTokens[pathTokens.length - 1], filterLower);
    const visible =
      !filterLower || selfMatches || descendantMatches || (isRoot && anyChild);

    if (!visible) {
      return null;
    }

    let expanded = true;
    const applyExpanded = () => {
      childrenUl.style.display = expanded ? "block" : "none";
      toggle.querySelector(".caret").textContent = expanded ? "▼" : "▶";
    };
    applyExpanded();

    toggle.addEventListener("click", () => {
      if (!hasKids) return;
      expanded = !expanded;
      applyExpanded();
    });

    row.appendChild(toggle);
    row.appendChild(useBtn);
    li.appendChild(row);

    if (hasKids) {
      li.appendChild(childrenUl);
    }
    return li;
  }

  /* primitive / null */
  const seg = pathTokens[pathTokens.length - 1];
  const selfMatches = keyMatchesFilter(seg, filterLower);
  if (filterLower && !selfMatches) return null;

  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.alignItems = "center";
  row.style.gap = "6px";
  const span = document.createElement("span");
  span.className = "type-hint";
  span.textContent = `${String(seg)}: ${shortPreview(value)} (${type})`;
  const useBtn = document.createElement("button");
  useBtn.type = "button";
  useBtn.className = "tree-select";
  useBtn.textContent = "Use as target";
  useBtn.addEventListener("click", () => {
    applyTarget(pathTokens);
    setSubStatus(
      treeStatus,
      `Target: ${toPathString(pathTokens)}. Go to step 3 to generate code.`,
      "success"
    );
  });
  row.appendChild(span);
  row.appendChild(useBtn);
  li.appendChild(row);
  return li;
}

function generateSyntax() {
  copyFeedback.textContent = "";
  if (state.rootData === null) {
    resultCodeEl.textContent = "Parse JSON first.";
    copyBtn.disabled = true;
    return;
  }
  if (state.targetTokens.length === 0) {
    resultCodeEl.textContent =
      "Set a target path in step 2 (wizard, tree, or find by key), then generate again.";
    copyBtn.disabled = true;
    return;
  }
  const lang = languageEl.value;
  const safe = safeAccessEl.checked;
  const code = buildAccessCode(lang, state.targetTokens, safe);
  resultCodeEl.textContent = code;
  copyBtn.disabled = !code.trim();
  updateRuntimeExample();
}

function copyResult() {
  const text = resultCodeEl.textContent;
  if (!text.trim()) return;
  navigator.clipboard.writeText(text).then(
    () => {
      setSubStatus(copyFeedback, "Copied to clipboard.", "success");
    },
    () => {
      setSubStatus(
        copyFeedback,
        "Could not copy automatically. Select the text and copy manually.",
        "error"
      );
    }
  );
}

function updateRuntimeExample() {
  const lang = languageEl.value;
  runtimeExampleEl.textContent = getRuntimeExample(lang);
}

function getRuntimeExample(language) {
  switch (language) {
    case "javascript":
      return `// Choose one source, then use the generated traversal on \`data\`.

// From string
const data = JSON.parse(jsonString);

// Node (ESM): from file — uncomment
// import fs from "fs";
// const data = JSON.parse(fs.readFileSync("data.json", "utf8"));

// Browser: from fetch — uncomment
// const res = await fetch("/api/data.json");
// const data = await res.json();`;
    case "python":
      return `# From string
import json
data = json.loads(json_string)

# From file
with open("data.json", encoding="utf-8") as f:
    data = json.load(f)`;
    case "csharp":
      return `// Newtonsoft.Json — choose one
using Newtonsoft.Json.Linq;

// From string
JToken data = JToken.Parse(jsonString);

// From file — uncomment
// string json = File.ReadAllText("data.json");
// JToken data = JToken.Parse(json);`;
    case "java":
      return `// Jackson — choose one
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

ObjectMapper mapper = new ObjectMapper();
JsonNode data = mapper.readTree(jsonString);

// From file — uncomment
// JsonNode data = mapper.readTree(new File("data.json"));`;
    case "php":
      return `<?php
// From string
$data = json_decode($jsonString, true); // associative arrays
// or: json_decode($jsonString, false); // objects

// From file
$data = json_decode(file_get_contents('data.json'), true);`;
    default:
      return "";
  }
}

function getNextOptions(node) {
  if (Array.isArray(node)) {
    return node.map((item, index) => ({
      token: index,
      label: `[${index}]`,
      preview: `${detectType(item)} ${shortPreview(item)}`,
    }));
  }
  if (node && typeof node === "object") {
    return Object.keys(node).map((key) => ({
      token: key,
      label: key,
      preview: `${detectType(node[key])} ${shortPreview(node[key])}`,
    }));
  }
  return [];
}

function getNodeByTokens(root, tokens) {
  return tokens.reduce((acc, token) => acc[token], root);
}

function detectType(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function shortPreview(value) {
  const type = detectType(value);
  if (type === "object") return "{...}";
  if (type === "array") return `[length: ${value.length}]`;
  const text = String(value);
  return text.length > 40 ? `${text.slice(0, 37)}...` : text;
}

function toPathString(tokens) {
  if (tokens.length === 0) return "$";
  let out = "$";
  for (const token of tokens) {
    out += typeof token === "number" ? `[${token}]` : `.${token}`;
  }
  return out;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildAccessCode(language, tokens, safe) {
  switch (language) {
    case "javascript":
      return buildJsOutput(tokens, safe);
    case "python":
      return buildPythonOutput(tokens, safe);
    case "csharp":
      return buildCSharpOutput(tokens, safe);
    case "java":
      return buildJavaOutput(tokens, safe);
    case "php":
      return buildPhpOutput(tokens, safe);
    default:
      return "Unsupported language.";
  }
}

function buildJsOutput(tokens, safe) {
  const path = safe ? buildJsPathOptional(tokens) : buildJsPathDirect(tokens);
  if (safe) {
    return `// Parsed object as data — optional chaining (safe)\nconst value = data${path};\n// value may be undefined if any segment is missing`;
  }
  return `// Parsed object as data\nconst value = data${path};`;
}

function buildJsPathDirect(tokens) {
  return tokens
    .map((t) => (typeof t === "number" ? `[${t}]` : `["${escapeQuotes(t)}"]`))
    .join("");
}

function buildJsPathOptional(tokens) {
  if (tokens.length === 0) return "";
  let s = "";
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const part =
      typeof t === "number" ? `[${t}]` : `["${escapeQuotes(t)}"]`;
    s += "?." + part;
  }
  return s;
}

function buildPythonOutput(tokens, safe) {
  if (!safe) {
    return `# dict/list as data\nvalue = data${buildPyPath(tokens)}`;
  }
  const listLiteral = `[${tokens
    .map((t) => (typeof t === "number" ? String(t) : JSON.stringify(t)))
    .join(", ")}]`;
  return `# Safe traversal helper (handles missing keys / bad types)
def get_path(obj, path):
    cur = obj
    for p in path:
        if isinstance(p, int):
            if not isinstance(cur, list) or p < 0 or p >= len(cur):
                return None
            cur = cur[p]
        else:
            if not isinstance(cur, dict) or p not in cur:
                return None
            cur = cur[p]
    return cur

value = get_path(data, ${listLiteral})`;
}

function buildPyPath(tokens) {
  return tokens
    .map((t) => (typeof t === "number" ? `[${t}]` : `["${escapeQuotes(t)}"]`))
    .join("");
}

function buildCSharpOutput(tokens, safe) {
  const normalPath = tokens
    .map((t) => (typeof t === "number" ? `[${t}]` : `["${escapeQuotes(t)}"]`))
    .join("");
  if (tokens.length === 0) {
    return "// Empty path\nvar value = data;";
  }
  if (safe) {
    let s = "";
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      const part =
        typeof t === "number" ? `[${t}]` : `["${escapeQuotes(t)}"]`;
      s += "?" + part;
    }
    return `// Newtonsoft.Json.Linq — JToken, null-conditional indexing
var value = data${s};`;
  }
  return `// Newtonsoft.Json.Linq — JToken data
var value = data${normalPath};`;
}

function buildJavaOutput(tokens, safe) {
  if (tokens.length === 0) {
    return "// Empty path\nJsonNode value = data;";
  }
  if (safe) {
    const chain = tokens
      .map((t) =>
        typeof t === "number" ? `.path(${t})` : `.path("${escapeQuotes(t)}")`
      )
      .join("");
    return `// Jackson JsonNode — .path() returns MissingNode instead of null
JsonNode value = data${chain};
// Check with: value.isMissingNode()`;
  }
  const chain = tokens
    .map((t) =>
      typeof t === "number" ? `.get(${t})` : `.get("${escapeQuotes(t)}")`
    )
    .join("");
  return `// Jackson JsonNode — may return null if missing
JsonNode value = data${chain};`;
}

function buildPhpOutput(tokens, safe) {
  const path = tokens
    .map((t) => (typeof t === "number" ? `[${t}]` : `['${escapePhpKey(t)}']`))
    .join("");
  if (!safe) {
    return (
      "<?php\n" +
      "// $data from json_decode(..., true)\n" +
      `$value = $data${path};`
    );
  }
  return (
    "<?php\n" +
    "// Safe nested access without notices (PHP 7+)\n" +
    `$value = ${buildPhpIssetPath(tokens)};`
  );
}

function buildPhpIssetPath(tokens) {
  if (tokens.length === 0) return "";
  let cond = "isset($data";
  let access = "$data";
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const seg =
      typeof t === "number" ? `[${t}]` : `['${escapePhpKey(t)}']`;
    access += seg;
    cond += seg;
  }
  cond += ")";
  return `${cond} ? ${access} : null`;
}

function escapePhpKey(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function escapeQuotes(str) {
  return String(str).replace(/"/g, '\\"').replace(/'/g, "\\'");
}
