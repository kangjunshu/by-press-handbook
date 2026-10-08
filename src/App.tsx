import { useEffect, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  chapters,
  shootChecks,
  deliveryChecks,
  practiceChecks,
  questions,
  cases,
  sources,
  workflow,
  fileTasks,
} from "./content";
import {
  Camera,
  Scene,
  Workflow,
  Shots,
  Rating,
  Timeline,
  Files,
  CheckList,
} from "./Interactions";
import type { Saved } from "./Interactions";
const storageKey = "by-press-handbook-v1";
const empty: Saved = {
  read: [],
  checks: {},
  ratings: {},
  answers: {},
  submitted: false,
  last: 0,
  files: {},
  plan: "",
};
function readSaved(): Saved {
  try {
    const x = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (!x || typeof x !== "object") return empty;
    return {
      ...empty,
      ...x,
      read: Array.isArray(x.read)
        ? x.read.filter(
            (v: unknown) => typeof v === "number" && v >= 0 && v < 8,
          )
        : [],
      checks: x.checks && typeof x.checks === "object" ? x.checks : {},
      ratings: x.ratings && typeof x.ratings === "object" ? x.ratings : {},
      answers: x.answers && typeof x.answers === "object" ? x.answers : {},
      files: x.files && typeof x.files === "object" ? x.files : {},
    };
  } catch {
    return empty;
  }
}
function getRoute() {
  const n = Number(location.hash.replace("#/chapter/", ""));
  return location.hash.startsWith("#/chapter/") &&
    Number.isInteger(n) &&
    n >= 1 &&
    n <= 8
    ? n - 1
    : -1;
}
export default function App() {
  const [saved, setSaved] = useState<Saved>(readSaved);
  const [route, setRoute] = useState(getRoute);
  const [query, Q] = useState("");
  const [searchOpen, SO] = useState(false);
  const [teaching, T] = useState(false);
  const [slide, SL] = useState(0);
  const [printMode, PM] = useState("handbook");
  const [storageError, SE] = useState(false);
  const [active, AS] = useState(0);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 32,
    restDelta: 0.001,
  });
  const heroOffset = useTransform(scrollYProgress, [0, 0.2], [0, -35]);
  function update(p: Partial<Saved>) {
    setSaved((s) => ({ ...s, ...p }));
  }
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(saved));
      SE(false);
    } catch {
      SE(true);
    }
  }, [saved]);
  useEffect(() => {
    const change = () => {
      setRoute(getRoute());
      AS(0);
      if (!location.hash || location.hash.startsWith("#/")) {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      SO(false);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    if (route >= 0) {
      setSaved((s) => ({ ...s, last: route }));
      document.title = `${chapters[route].title} · BY PRESS 培训手册`;
    } else document.title = "从记录现场，到完成表达 · BY PRESS 培训手册";
  }, [route]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting)
            AS(Number((e.target as HTMLElement).dataset.section));
        });
      },
      { rootMargin: "-15% 0px -65% 0px" },
    );
    document
      .querySelectorAll("[data-section]")
      .forEach((e) => observer.observe(e));
    return () => observer.disconnect();
  }, [route]);
  const slides = chapters.flatMap((c, i) => [
    { chapter: i, title: c.headline, items: c.key },
    ...c.sections.flatMap((s) =>
      Array.from({ length: Math.ceil(s.text.length / 2) }, (_, page) => ({
        chapter: i,
        title: s.title + (page ? " · 续" : ""),
        items: s.text.slice(page * 2, page * 2 + 2),
      })),
    ),
  ]);
  const exitTeaching = () => {
    T(false);
    if (document.fullscreenElement) void document.exitFullscreen();
  };
  useEffect(() => {
    if (!teaching) return;
    const key = (e: KeyboardEvent) => {
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName,
        )
      )
        return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        SL((s) => Math.min(slides.length - 1, s + 1));
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        SL((s) => Math.max(0, s - 1));
      }
      if (e.key === "Escape") T(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [teaching, slides.length]);
  const go = (i: number) => {
    location.hash = `/chapter/${i + 1}`;
  };
  const teach = (i = 0) => {
    SL(slides.findIndex((s) => s.chapter === i));
    T(true);
    if (document.documentElement.requestFullscreen)
      void document.documentElement.requestFullscreen().catch(() => {});
  };
  function print(mode: string) {
    PM(mode);
    window.setTimeout(() => window.print(), 120);
  }
  const score = questions.filter(
    (q, i) => saved.answers[i] === q.correct,
  ).length;
  const correctCases = cases.filter(
    (c, i) => saved.ratings[i] === c.grade,
  ).length;
  const comprehensive =
    saved.submitted && Object.keys(saved.ratings).length === cases.length
      ? Math.round(
          ((score / questions.length) * 0.6 +
            (correctCases / cases.length) * 0.4) *
            100,
        )
      : null;
  const searchIndex = chapters.flatMap((c, i) => [
    { chapter: i, title: c.title, text: c.intro, anchor: "" },
    ...c.sections.map((s, j) => ({
      chapter: i,
      title: s.title,
      text: [...s.text, ...(s.items || [])].join(" "),
      anchor: `section-${i}-${j}`,
    })),
    {
      chapter: i,
      title: [
        "流程与拍摄检查",
        "相机参数模拟器与速查表",
        "景别与拍摄实务",
        "素材筛选训练与领导画面",
        "剪映时间线与团队协作",
        "百度网盘与文件命名",
        "视频导出与交付检查",
        "综合测试与学习报告",
      ][i],
      text: [
        ...c.key,
        ...(i === 3 ? cases.map((x) => Object.values(x).join(" ")) : []),
        ...(i === 7 ? questions.map((x) => x.q + " " + x.why) : []),
      ].join(" "),
      anchor: `lab-${i}`,
    },
  ]);
  const term = query.trim().toLowerCase();
  const results = term
    ? searchIndex.filter((x) => (x.title + x.text).toLowerCase().includes(term))
    : [];
  function searchGo(ch: number, anchor: string) {
    if (route !== ch) go(ch);
    SO(false);
    if (anchor)
      window.setTimeout(
        () =>
          document
            .getElementById(anchor)
            ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" }),
        180,
      );
  }
  const report = (
    <div className="report">
      <div className="section-label">个人学习档案 / 当前浏览器</div>
      <h3>培训报告</h3>
      <div className="report-numbers">
        <div>
          <strong>
            {saved.read.length}
            <small>/ 8</small>
          </strong>
          <span>已读章节</span>
        </div>
        <div>
          <strong>{comprehensive ?? "—"}</strong>
          <span>综合成绩 / 100</span>
        </div>
        <div>
          <strong>
            {correctCases}
            <small>/ 12</small>
          </strong>
          <span>素材判断正确</span>
        </div>
      </div>
      <p>
        学习进度：{Math.round((saved.read.length / 8) * 100)}%。素材训练完成{" "}
        {Object.keys(saved.ratings).length}/12；文件练习完成{" "}
        {Object.keys(saved.files).length}/{fileTasks.length}；拍摄检查{" "}
        {shootChecks.filter((_, i) => saved.checks[`shoot-${i}`]).length}/
        {shootChecks.length}；交付检查{" "}
        {deliveryChecks.filter((_, i) => saved.checks[`delivery-${i}`]).length}/
        {deliveryChecks.length}；综合实战自查{" "}
        {practiceChecks.filter((_, i) => saved.checks[`practice-${i}`]).length}/
        {practiceChecks.length}。
      </p>
      <p>
        已读：
        {saved.read.length
          ? saved.read.map((i) => chapters[i].title).join("、")
          : "尚未标记章节完成。"}
      </p>
      <p>
        基础知识成绩：
        {saved.submitted
          ? Math.round((score / questions.length) * 100) + " 分"
          : "未提交"}
        。综合成绩由基础知识 60% 与十二个素材判断 40%
        组成，全部完成后计算；实战自查不自动评定操作能力。
      </p>
      <h4>错误与改进建议</h4>
      {!saved.submitted && (
        <p>完成基础测试并提交后，报告会列出错题及对应复习章节。</p>
      )}
      {saved.submitted &&
        (score === questions.length ? (
          <p>基础题全部正确。下一步练习现场曝光判断、收音及工程交接。</p>
        ) : (
          <ul>
            {questions.map(
              (q, i) =>
                saved.answers[i] !== q.correct && (
                  <li key={q.q}>
                    {q.q} — {q.why}{" "}
                    <a href={`#/chapter/${q.chapter + 1}`}>
                      复习第 {q.chapter + 1} 章
                    </a>
                  </li>
                ),
            )}
          </ul>
        ))}
      {cases.map(
        (c, i) =>
          saved.ratings[i] &&
          saved.ratings[i] !== c.grade && (
            <p key={c.title}>
              素材案例 {i + 1}「{c.title}」：{c.reason} 建议：{c.action}
            </p>
          ),
      )}
      <h4>实战计划</h4>
      <p className="plan-print">{saved.plan || "尚未填写实战计划。"}</p>
      <p className="caption">
        本报告是自学与练习记录，现场能力需由带教成员评估。数据存于本地浏览器，不上传服务器。
      </p>
      <div className="actions no-print">
        <button className="primary" onClick={() => print("report")}>
          打印报告 / 保存 PDF
        </button>
        <button
          onClick={() => {
            const blob = new Blob(
              [
                JSON.stringify(
                  {
                    version: 1,
                    exportedAt: new Date().toISOString(),
                    ...saved,
                  },
                  null,
                  2,
                ),
              ],
              { type: "application/json" },
            );
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "BY-PRESS-学习记录.json";
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          导出学习记录
        </button>
      </div>
    </div>
  );
  function lab(i: number) {
    return (
      <div id={`lab-${i}`} key={i}>
        {i === 0 && (
          <>
            <Workflow />
            <CheckList
              title="出发前，确认这八件事。"
              items={shootChecks}
              id="shoot"
              saved={saved}
              update={update}
            />
          </>
        )}
        {i === 1 && (
          <>
            <Camera />
            <section className="quick-sheet">
              <div className="section-label">可打印 · 现场速查</div>
              <h3>常规设备参数速查表</h3>
              <table>
                <thead>
                  <tr>
                    <th>项目</th>
                    <th>常规建议</th>
                    <th>需要核对</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["分辨率", "4K", "预留裁切与稳定余量"],
                    ["帧率", "30fps", "60fps 慢动作等需说明"],
                    ["快门", "通常 1/60 秒", "频闪时试录并调整"],
                    ["白平衡", "优先固定", "现场与多机位对照"],
                    [
                      "ISO / 对焦",
                      "按曝光调整 / 主体清晰",
                      "按型号检查噪点与焦点",
                    ],
                    ["色彩", "可靠工作流下优先 Log", "正确曝光与匹配转换"],
                    ["大疆锐化", "支持时 -1", "不支持则不强制"],
                  ].map((row) => (
                    <tr key={row[0]}>
                      {row.map((s, j) =>
                        j === 0 ? <th key={s}>{s}</th> : <td key={s}>{s}</td>,
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="no-print" onClick={() => print("quick")}>
                单独打印速查表
              </button>
            </section>
          </>
        )}
        {i === 2 && <Shots />}
        {i === 3 && <Rating saved={saved} update={update} />}{" "}
        {i === 4 && <Timeline />}
        {i === 5 && <Files saved={saved} update={update} />}{" "}
        {i === 6 && (
          <CheckList
            title="交付前，逐项核对。"
            items={deliveryChecks}
            id="delivery"
            saved={saved}
            update={update}
          />
        )}{" "}
        {i === 7 && (
          <>
            <section className="lab">
              <div className="section-label">综合实战 / 校园艺术展开幕</div>
              <h3>写下你的执行计划。</h3>
              <label>
                参数、镜头清单、人员分工、剪辑结构与交付规格
                <textarea
                  rows={8}
                  value={saved.plan}
                  onChange={(e) => update({ plan: e.target.value })}
                  placeholder="例如：A机位保揭牌完整全景；B机位拍观展交流……"
                />
              </label>
              <CheckList
                title="九项实战自查"
                items={practiceChecks}
                id="practice"
                saved={saved}
                update={update}
              />
              <p>
                素材训练请完成<a href="#/chapter/4">第四章十二个案例</a>
                ；文件整理请完成<a href="#/chapter/6">第六章练习</a>。
              </p>
            </section>
            <section className="quiz lab">
              <div className="section-label">基础知识 / 12 道单选题</div>
              <h3>判断之前，先理解原因。</h3>
              {questions.map((q, index) => (
                <fieldset key={q.q}>
                  <legend>
                    <small>{String(index + 1).padStart(2, "0")}</small> {q.q}
                  </legend>
                  {q.a.map((a, j) => (
                    <label key={a}>
                      <input
                        type="radio"
                        name={`q-${index}`}
                        checked={saved.answers[index] === j}
                        onChange={() =>
                          update({
                            answers: { ...saved.answers, [index]: j },
                            submitted: false,
                          })
                        }
                      />
                      {a}
                    </label>
                  ))}
                  {saved.submitted && (
                    <p className="feedback">
                      {saved.answers[index] === q.correct
                        ? "回答正确"
                        : "需要复习"}{" "}
                      · 正确答案：{q.a[q.correct]}。{q.why}
                    </p>
                  )}
                </fieldset>
              ))}
              <button
                className="primary"
                disabled={questions.some(
                  (_, i) => saved.answers[i] === undefined,
                )}
                onClick={() => update({ submitted: true })}
              >
                提交测试并生成报告
              </button>
              <p aria-live="polite">
                {saved.submitted
                  ? `基础知识得分 ${Math.round((score / questions.length) * 100)} 分。解析与培训报告已更新。`
                  : `已回答 ${Object.keys(saved.answers).length} / ${questions.length} 题；答完后可提交。`}
              </p>
            </section>
            {report}
          </>
        )}
      </div>
    );
  }
  function article(i: number, printing = false) {
    const c = chapters[i];
    return (
      <article key={i} className="article">
        <header className="chapter-header">
          <div className="eyebrow">
            第 {String(i + 1).padStart(2, "0")} 章{" "}
            <span>{c.duration} · 阅读与练习</span>
          </div>
          <h1>{c.headline}</h1>
          <p>{c.intro}</p>
          <div className="chapter-rule" />
        </header>
        <div className="key-lines">
          <span>本章要点</span>
          {c.key.map((t, j) => (
            <p key={t}>
              <small>0{j + 1}</small>
              {t}
            </p>
          ))}
        </div>
        {c.sections.map((s, j) => (
          <motion.section
            key={s.title}
            id={`section-${i}-${j}`}
            data-section={j}
            className="reading-section"
            initial={printing || reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -30px 0px" }}
            transition={{ duration: 0.4 }}
          >
            <div className="section-label">
              {String(i + 1).padStart(2, "0")} /{" "}
              {String(j + 1).padStart(2, "0")}
            </div>
            <h2>{s.title}</h2>
            {s.text.map((t) => (
              <p key={t}>{t}</p>
            ))}
            {s.items && (
              <ul>
                {s.items.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </motion.section>
        ))}
        {!printing && lab(i)}
        {printing && i === 0 && (
          <section>
            <h2>制作流程详解</h2>
            {workflow.map((w) => (
              <div key={w[0]}>
                <h3>{w[0]}</h3>
                <p>
                  负责人：{w[1]}。操作：{w[2]} 常见错误：{w[3]} 完成标准：{w[4]}
                </p>
              </div>
            ))}
          </section>
        )}
        {printing && i === 3 && (
          <section>
            <h2>十二个素材案例与解析</h2>
            {cases.map((c, j) => (
              <div key={c.title}>
                <h3>
                  {j + 1}. {c.title} · {c.grade}
                </h3>
                <p>
                  {c.scene} {c.quality} {c.person} {c.value} {c.issue}
                </p>
                <p>
                  依据：{c.reason} 风险：{c.risk} 建议：{c.action}
                </p>
              </div>
            ))}
          </section>
        )}
        {printing && i === 7 && (
          <section>
            <h2>基础知识测试与解析</h2>
            {questions.map((q, j) => (
              <div key={q.q}>
                <h3>
                  {j + 1}. {q.q}
                </h3>
                <p>{q.a.map((a, i) => `${i + 1}. ${a}`).join("；")}</p>
                <p>
                  正确答案：{q.a[q.correct]}。{q.why}
                </p>
              </div>
            ))}
          </section>
        )}
        {!printing && (
          <div className="chapter-end no-print">
            <button
              className="primary"
              onClick={() =>
                update({
                  read: saved.read.includes(i)
                    ? saved.read
                    : saved.read.concat(i),
                })
              }
            >
              {saved.read.includes(i) ? "✓ 已记录本章完成" : "标记本章已读"}
            </button>
            <button
              onClick={() =>
                i < 7
                  ? go(i + 1)
                  : window.scrollTo({ top: 0, behavior: "smooth" })
              }
            >
              {i < 7 ? "下一章 →" : "回到本章开头 ↑"}
            </button>
          </div>
        )}
      </article>
    );
  }
  return (
    <>
      <div className="screen-content" inert={teaching || searchOpen}>
        <a
          className="skip"
          href="#main"
          onClick={(e) => {
            e.preventDefault();
            const main = document.getElementById("main");
            main?.setAttribute("tabindex", "-1");
            main?.focus();
            main?.scrollIntoView();
          }}
        >
          跳转到正文
        </a>
        <motion.div
          className="reading-progress no-print"
          aria-hidden="true"
          style={{ scaleX: reduced ? scrollYProgress : smoothProgress }}
        />
        <header className="site-header">
          <a
            className="brand"
            href="#/"
            aria-label="北海艺术设计学院记者团 · 培训手册首页"
          >
            <span className="brand-symbol">
              <img
                src={`${import.meta.env.BASE_URL}assets/by-press-logo.jpeg`}
                alt=""
                width="1544"
                height="510"
              />
            </span>
            <span className="brand-wordmark">
              BY PRESS<small>北海艺术设计学院记者团</small>
            </span>
          </a>
          <nav aria-label="主导航">
            <a href="#/">课程目录</a>
            <button onClick={() => SO(true)}>
              搜索 <kbd>⌕</kbd>
            </button>
            <button onClick={() => teach(Math.max(route, 0))}>教学模式</button>
            <button onClick={() => print("handbook")}>打印手册</button>
          </nav>
        </header>
        {storageError && (
          <p role="alert" className="storage-warning">
            浏览器未能保存学习记录。请允许本地存储，或及时打印报告、导出记录。
          </p>
        )}
        {route === -1 ? (
          <main id="main" className="home">
            <section className="hero">
              <div className="hero-meta">
                <span>北海艺术设计学院记者团</span>
                <span>内部培训资料 / 2026</span>
              </div>
              <div className="hero-title-layout">
                <h1>
                  {["从记录现场，", "到完成表达。"].map((line, i) => (
                    <span className="title-line" key={line}>
                      <motion.span
                        initial={reduced ? false : { opacity: 0, y: "105%" }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.15,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        {line}
                      </motion.span>
                    </span>
                  ))}
                </h1>
                <motion.aside
                  className="hero-note"
                  aria-label="现场观察示意"
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.35 }}
                  style={{ y: reduced ? 0 : heroOffset }}
                >
                  <div className="section-label">第一课 / 学会观察</div>
                  <motion.div
                    className="focus-frame"
                    initial={
                      reduced ? false : { clipPath: "inset(0 100% 0 0)" }
                    }
                    animate={{ clipPath: "inset(0 0% 0 0)" }}
                    transition={{
                      duration: 0.9,
                      delay: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Scene kind="reveal" />
                  </motion.div>
                  <p>看清现场，才能组织画面。</p>
                </motion.aside>
              </div>
              <div className="hero-bottom">
                <p>
                  一次活动的影像记录，从来不只是按下录制键。如何观察现场、选择镜头、判断素材、完成剪辑，并最终准确传递信息，是记者团每一位视频成员需要掌握的基本能力。
                </p>
                <div>
                  <a className="primary" href="#/chapter/1">
                    开始学习 <span>↗</span>
                  </a>
                  <a href="#courses">查看课程 ↓</a>
                  <button onClick={() => teach()}>进入教学模式 →</button>
                  <button onClick={() => go(saved.last)}>
                    继续上次学习 · 第 {saved.last + 1} 章
                  </button>
                </div>
              </div>
              <div className="hero-mark" aria-hidden="true">
                <span>观察</span>
                <motion.i
                  initial={reduced ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
                <span>记录</span>
                <motion.i
                  initial={reduced ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
                <span>判断</span>
                <motion.i
                  initial={reduced ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
                <span>表达</span>
              </div>
            </section>
            <motion.section
              className="home-statement"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.65 }}
            >
              <p>
                先理解事实。
                <br />
                再组织画面。
              </p>
              <div>
                <span className="section-label">学习方法</span>
                <p>
                  带着一个真实任务进入课程。理解技术，练习判断，把每一次拍摄变成可交接、可审核、可持续的团队工作。
                </p>
                <span>八个章节 · 现场实务 · 交互训练</span>
              </div>
            </motion.section>
            <section id="courses" className="course-list">
              <div className="section-heading">
                <h2>课程目录</h2>
                <span>按顺序学习，也可以随时查阅。</span>
              </div>
              {chapters.map((c, i) => (
                <motion.a
                  href={`#/chapter/${i + 1}`}
                  key={c.title}
                  className="course-row"
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: (i % 3) * 0.06 }}
                >
                  <span className="course-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{c.title}</h3>
                    <p>{c.intro}</p>
                  </div>
                  <span className="course-meta">
                    {saved.read.includes(i) ? "已读 ✓" : c.duration}
                  </span>
                  <span className="course-arrow">↗</span>
                </motion.a>
              ))}
            </section>
            <section className="home-progress">
              <div>
                <span className="section-label">你的学习</span>
                <h2>每一步，都留下记录。</h2>
                <p>
                  已读 {saved.read.length} / 8 章。学习数据仅存于当前浏览器。
                </p>
                <div className="progress-bar">
                  <i style={{ width: `${(saved.read.length / 8) * 100}%` }} />
                </div>
              </div>
              <button onClick={() => go(saved.last)}>继续学习 →</button>
            </section>
            <section className="source-links">
              <h3>技术参考与使用说明</h3>
              <p>
                课程中的常规参数是本团队工作建议。设备功能以具体型号和固件为准，软件以当前客户端及账号权益为准。核对日期：2026
                年 10 月 8 日。
              </p>
              {sources.map(([name, url]) => (
                <a key={url} href={url} target="_blank" rel="noreferrer">
                  {name} ↗
                </a>
              ))}
            </section>
          </main>
        ) : (
          <div className="course-layout">
            <aside className="sidebar no-print">
              <a href="#/">← 返回课程目录</a>
              <div className="section-label">课程章节</div>
              <div className="mobile-course-nav">
                <label>
                  跳转章节
                  <select
                    aria-label="跳转章节"
                    value={route}
                    onChange={(e) => go(Number(e.target.value))}
                  >
                    {chapters.map((c, i) => (
                      <option key={c.title} value={i}>
                        {String(i + 1).padStart(2, "0")} · {c.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <nav aria-label="课程章节">
                {chapters.map((c, i) => (
                  <a
                    className={i === route ? "current" : ""}
                    aria-current={i === route ? "page" : undefined}
                    key={c.title}
                    href={`#/chapter/${i + 1}`}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {c.title}
                    {saved.read.includes(i) && <small>✓</small>}
                  </a>
                ))}
              </nav>
              <div className="sidebar-progress">
                学习进度 {saved.read.length} / 8
                <div className="progress-bar">
                  <i style={{ width: `${(saved.read.length / 8) * 100}%` }} />
                </div>
              </div>
              <details>
                <summary>本章阅读位置</summary>
                {chapters[route].sections.map((s, j) => (
                  <a
                    className={active === j ? "section-current" : ""}
                    href={`#section-${route}-${j}`}
                    key={s.title}
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById(`section-${route}-${j}`)
                        ?.scrollIntoView({
                          behavior: reduced ? "instant" : "smooth",
                        });
                    }}
                  >
                    {s.title}
                  </a>
                ))}
              </details>
            </aside>
            <motion.main
              id="main"
              key={route}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {article(route)}
            </motion.main>
          </div>
        )}
        <footer>
          <span>BY PRESS · 北海艺术设计学院记者团</span>
          <span>从记录现场，到完成表达。</span>
          <a href="#/chapter/8">学习报告 ↗</a>
        </footer>
      </div>
      {searchOpen && (
        <div className="modal-backdrop" onClick={() => SO(false)}>
          <div
            className="search-modal"
            role="dialog"
            aria-modal="true"
            aria-label="全文搜索"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") SO(false);
              if (e.key === "Tab") {
                const focusables = Array.from(
                  e.currentTarget.querySelectorAll<HTMLElement>("button,input"),
                );
                const first = focusables[0],
                  last = focusables.at(-1);
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last?.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first?.focus();
                }
              }
            }}
          >
            <div className="search-top">
              <label>
                搜索全文
                <input
                  autoFocus
                  type="search"
                  value={query}
                  onChange={(e) => Q(e.target.value)}
                  placeholder="搜索 Log、素材筛选、文件命名……"
                />
              </label>
              <button aria-label="关闭搜索" onClick={() => SO(false)}>
                关闭 ×
              </button>
            </div>
            <p role="status">
              {term
                ? `找到 ${results.length} 条结果`
                : "输入关键词，查找课程、知识点和训练案例。"}
            </p>
            <div className="search-results">
              {results.map((r, i) => (
                <button key={i} onClick={() => searchGo(r.chapter, r.anchor)}>
                  <small>第 {r.chapter + 1} 章</small>
                  <b>{r.title}</b>
                  <span>
                    {r.text.slice(
                      Math.max(0, r.text.toLowerCase().indexOf(term) - 25),
                      Math.max(0, r.text.toLowerCase().indexOf(term) - 25) +
                        120,
                    )}
                    …
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {teaching && (
        <div
          className="teaching"
          role="dialog"
          aria-modal="true"
          aria-label="全屏教学"
        >
          <header>
            <b>
              BY PRESS <span>现场教学</span>
            </b>
            <select
              autoFocus
              aria-label="切换教学章节"
              value={slides[slide].chapter}
              onChange={(e) =>
                SL(slides.findIndex((s) => s.chapter === +e.target.value))
              }
            >
              {chapters.map((c, i) => (
                <option key={c.title} value={i}>
                  第 {i + 1} 章 · {c.title}
                </option>
              ))}
            </select>
            <button onClick={exitTeaching}>退出教学 ×</button>
          </header>
          <div className="slide-body">
            <div className="section-label">
              第 {slides[slide].chapter + 1} 章 /{" "}
              {chapters[slides[slide].chapter].title}
            </div>
            <h1>{slides[slide].title}</h1>
            {slides[slide].items.map((t, i) => (
              <p key={t}>
                <small>0{i + 1}</small>
                {t}
              </p>
            ))}
          </div>
          <div className="slide-footer">
            <button disabled={slide === 0} onClick={() => SL(slide - 1)}>
              ← 上一页
            </button>
            <span>
              {slide + 1} / {slides.length} · 方向键翻页
            </span>
            <button
              disabled={slide === slides.length - 1}
              onClick={() => SL(slide + 1)}
            >
              下一页 →
            </button>
          </div>
          <div
            className="slide-progress"
            style={{ width: `${((slide + 1) / slides.length) * 100}%` }}
          />
        </div>
      )}
      <div className={`print-content print-${printMode}`}>
        <div className="print-cover">
          <b>BY PRESS · 北海艺术设计学院记者团</b>
          <h1>
            {printMode === "report"
              ? "个人培训报告"
              : printMode === "quick"
                ? "常规设备参数速查表"
                : "视频制作与团队协作培训手册"}
          </h1>
          <p>从记录现场，到完成表达 · 内部培训资料</p>
        </div>
        {printMode === "report" ? (
          report
        ) : printMode === "quick" ? (
          <>
            {[
              ["分辨率", "4K"],
              ["帧率", "30fps"],
              ["快门", "通常 1/60 秒；频闪与特殊灯光需试录测试"],
              ["白平衡", "优先固定并对照多机位"],
              ["ISO 与对焦", "按曝光调整，保证主体清晰"],
              ["色彩", "有可靠工作流的设备优先 Log，正确转换后交付"],
              ["大疆锐化", "支持时 -1，不支持不强制"],
            ].map(([a, b]) => (
              <p key={a}>
                <b>{a}：</b>
                {b}
              </p>
            ))}
            <p>
              慢动作、灯光与型号限制按现场测试处理。设备支持能力以具体型号和固件为准。
            </p>
          </>
        ) : (
          <>
            {chapters.map((_, i) => article(i, true))}
            <h2>现场与交付检查清单</h2>
            {[...shootChecks, ...deliveryChecks, ...practiceChecks].map((t) => (
              <p key={t}>□ {t}</p>
            ))}
            <h2>文件整理参考</h2>
            {fileTasks.map((t) => (
              <p key={t.name}>
                {t.source} → {t.name}
              </p>
            ))}
            <h2>官方参考</h2>
            {sources.map(([n, u]) => (
              <p key={u}>
                {n}：{u}
              </p>
            ))}
          </>
        )}
      </div>
    </>
  );
}
