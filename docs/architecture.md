# Traversable — codebase architecture

Visual maps of the repository layout and how the browser app is structured. Diagrams use [Mermaid](https://mermaid.js.org/) (renders on GitHub, many Markdown previews, and [Mermaid Live Editor](https://mermaid.live/)).

---

## 1) Repository & file relationships

```mermaid
flowchart TB
  subgraph repo["traversable/"]
    README["README.md"]
    GITIGNORE[".gitignore"]
    subgraph brief["brief/"]
      TTXT["traversable.txt"]
      LCJ["large_complex_json.txt"]
    end
    subgraph brand["branding/"]
      LOGO["trvlogo.png"]
    end
    subgraph app["json-traversal-wizard/"]
      HTML["index.html"]
      CSS["styles.css"]
      JS["script.js"]
      subgraph assets["icons & tooling"]
        F16["favicon-16x16.png"]
        F32["favicon-32x32.png"]
        F48["favicon-48x48.png"]
        APPLE["apple-touch-icon.png"]
        GEN["generate-favicons.ps1"]
      end
    end
  end

  HTML -->|links| CSS
  HTML -->|loads| JS
  HTML -->|img src| LOGO
  HTML -->|rel=icon / apple-touch| F16
  HTML -->|rel=icon| F32
  HTML -->|rel=icon| F48
  HTML -->|apple-touch-icon| APPLE
  GEN -->|writes| F16
  GEN -->|writes| F32
  GEN -->|writes| F48
  GEN -->|writes| APPLE
  GEN -->|reads| LOGO
```

---

## 2) Runtime: page → script → user actions

```mermaid
flowchart LR
  subgraph page["index.html (DOM)"]
    IN["JSON textarea"]
    MODE["Path mode: wizard | tree | key"]
    OUT["Result & copy"]
    FT["Footnotes & footer"]
  end

  subgraph engine["script.js"]
    ST["state: rootData, tokens, pathMode, target"]
    PARSE["parseJson / clearAll"]
    WIZ["renderWizard + filters"]
    TREE["renderTree + buildTreeNode"]
    KEY["findByKey + findAllPathsForKey"]
    GEN["generateSyntax"]
    BUILD["buildAccessCode + per-language builders"]
    RUN["getRuntimeExample"]
  end

  IN --> PARSE
  PARSE --> ST
  ST --> WIZ
  ST --> TREE
  ST --> KEY
  MODE --> WIZ
  MODE --> TREE
  MODE --> KEY
  WIZ --> ST
  TREE --> ST
  KEY --> ST
  ST --> GEN
  GEN --> BUILD
  GEN --> OUT
  RUN --> OUT
```

---

## 3) `script.js` — main responsibility groups

```mermaid
flowchart TB
  subgraph ui["UI & state"]
    A["setPathMode, setParseStatus, applyTarget"]
  end
  subgraph paths["Path discovery"]
    B["Wizard: getNextOptions, renderWizard"]
    C["Tree: buildTreeNode, keyMatchesFilter"]
    D["Key search: findAllPathsForKey"]
  end
  subgraph codegen["Code generation"]
    E["buildAccessCode"]
    F["JS / Python / C# / Java / PHP builders"]
  end
  subgraph util["Utilities"]
    G["getNodeByTokens, toPathString, escapeHtml, escapeQuotes"]
  end

  ui --> paths
  paths --> codegen
  util --> paths
  util --> codegen
```

---

## Summary

| Aspect | Detail |
|--------|--------|
| **Stack** | Static site: HTML + CSS + JS (no build step) |
| **Runtime** | Entirely in the browser; JSON never sent to a server |
| **App entry** | `json-traversal-wizard/index.html` |
| **`brief/`** | Notes / sample JSON (not loaded by the app) |
| **`branding/`** | Logo; source for favicons via `generate-favicons.ps1` |
