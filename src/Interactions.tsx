import { useState } from "react";
import { cases, workflow, folders, fileTasks } from "./content";
export type Saved = {
  read: number[];
  checks: Record<string, boolean>;
  ratings: Record<string, string>;
  answers: Record<string, number>;
  submitted: boolean;
  last: number;
  files: Record<string, boolean>;
  plan: string;
};
export function CheckList({
  title,
  items,
  id,
  saved,
  update,
}: {
  title: string;
  items: string[];
  id: string;
  saved: Saved;
  update: (s: Partial<Saved>) => void;
}) {
  const done = items.filter((_, i) => saved.checks[`${id}-${i}`]).length;
  return (
    <section className="checklist">
      <div className="section-label">
        工作检查表 · {done}/{items.length}
      </div>
      <h3>{title}</h3>
      {items.map((t, i) => (
        <label key={t}>
          <input
            type="checkbox"
            checked={!!saved.checks[`${id}-${i}`]}
            onChange={(e) =>
              update({
                checks: { ...saved.checks, [`${id}-${i}`]: e.target.checked },
              })
            }
          />
          <span>{t}</span>
        </label>
      ))}
      <p role="status">
        {done === items.length
          ? "已具备提交审核或交付条件。完成检查不等于自动获得学校审核批准。"
          : "逐项确认实际情况后勾选，记录自动保存在当前浏览器。"}
      </p>
    </section>
  );
}
export function Workflow() {
  const [active, setActive] = useState(0);
  const w = workflow[active];
  return (
    <section className="lab">
      <div className="section-label">交互练习 01 / 制作流程</div>
      <h3>每一步，都有完成标准。</h3>
      <div className="workflow">
        {workflow.map((x, i) => (
          <button
            key={x[0]}
            aria-pressed={active === i}
            onClick={() => setActive(i)}
          >
            <small>0{i + 1}</small>
            {x[0]}
          </button>
        ))}
      </div>
      <div className="flow-detail" aria-live="polite">
        <b>{w[0]}</b>
        <dl>
          {["负责人员", "具体操作", "常见错误", "完成标准"].map((l, i) => (
            <div key={l}>
              <dt>{l}</dt>
              <dd>{w[i + 1]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
export function Scene({
  kind = "hall",
  zoom = 1,
}: {
  kind?: string;
  zoom?: number;
}) {
  return (
    <svg
      viewBox="0 0 800 440"
      role="img"
      aria-label="虚构校园活动矢量教学场景"
      className={`scene scene-${kind}`}
    >
      <rect width="800" height="440" fill="#bed3ef" />
      <path d="M0 0H800V280H0Z" fill="#edf4fd" />
      <path d="M0 280H800V440H0Z" fill="#87a9d2" />
      <g
        style={{
          transform: `translate(${400 - 400 * zoom}px,${260 - 260 * zoom}px) scale(${zoom})`,
          transformOrigin: "0 0",
          transition: "transform .5s ease",
        }}
      >
        <path d="M80 70H720V265H80Z" fill="#ffffff" />
        <path d="M112 100H688V177H112Z" fill="#245dbe" />
        <text x="400" y="148" textAnchor="middle" fill="#fff9ee" fontSize="26">
          校园艺术展 · 开幕现场
        </text>
        <path d="M100 265H700V299H100Z" fill="#4d72a5" />
        {!["audience", "stage", "service", "hands"].includes(kind) &&
          [220, 400, 580].map((x, i) => (
            <g key={x}>
              <circle cx={x} cy={207} r="25" fill="#d0aa87" />
              <path
                d={`M${x - 32} 240Q${x} 220 ${x + 32} 240L${x + 43} 324H${x - 43}Z`}
                fill={i === 1 ? "#24496f" : "#5f88bc"}
              />
              <path
                d={`M${x - 22} 323V388M${x + 22} 323V388`}
                stroke="#24496f"
                strokeWidth="18"
              />
            </g>
          ))}
        {kind === "audience" && (
          <g>
            {[170, 320, 470, 620].map((x, i) => (
              <g key={x}>
                <circle cx={x} cy={235 + (i % 2) * 15} r="27" fill="#c69c7a" />
                <path
                  d={`M${x - 40} 360V290Q${x} 250 ${x + 40} 290V360`}
                  fill={i % 2 ? "#526f68" : "#777560"}
                />
                <path
                  d={`M${x - 45} 365H${x + 45}V410H${x - 45}Z`}
                  fill="#383f39"
                />
              </g>
            ))}
          </g>
        )}
        {kind === "stage" && (
          <g>
            <path d="M80 180H720V300H80Z" fill="#324c48" />
            {[180, 290, 400, 510, 620].map((x) => (
              <g key={x}>
                <circle cx={x} cy={220} r="18" fill="#cfab8e" />
                <path d={`M${x} 242L${x - 26} 320H${x + 26}Z`} fill="#bc5849" />
                <path
                  d={`M${x} 260L${x - 40} 235M${x} 260L${x + 40} 235`}
                  stroke="#cfab8e"
                  strokeWidth="10"
                />
              </g>
            ))}
          </g>
        )}
        {(kind === "hands" || kind === "service") && (
          <g>
            <circle cx="330" cy="210" r="28" fill="#c69c7a" />
            <circle cx="480" cy="210" r="28" fill="#c69c7a" />
            <path d="M300 240H360L375 360H285Z" fill="#40584f" />
            <path d="M450 240H510L525 360H435Z" fill="#7b8b6d" />
            <path
              d="M350 260L405 295L465 260"
              stroke="#c69c7a"
              strokeWidth="15"
              fill="none"
            />
            {kind === "service" && (
              <rect x="375" y="285" width="60" height="55" fill="#b79763" />
            )}
          </g>
        )}
        <rect x="315" y="273" width="170" height="15" fill="#c8b288" />
        {kind === "reveal" && (
          <path d="M120 165Q170 120 200 270L120 285Z" fill="#1559d6" />
        )}
        {kind === "screen" && (
          <rect x="105" y="180" width="120" height="70" fill="#eee" />
        )}
        {kind === "block" && (
          <>
            <circle cx="420" cy="260" r="75" fill="#303a35" />
            <path d="M300 440V340Q420 270 540 340V440" fill="#303a35" />
          </>
        )}
        {kind === "caption" && (
          <rect x="190" y="335" width="420" height="45" fill="#eee" />
        )}
      </g>
      <path
        d="M25 65V25H65M735 25H775V65M25 375V415H65M735 415H775V375"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
      />
      <circle cx="745" cy="55" r="6" fill="#1559d6" />
    </svg>
  );
}
export function Camera() {
  const [device, D] = useState("大疆 Pocket 系列");
  const [resolution, R] = useState("4K");
  const [fps, F] = useState("30");
  const [shutter, S] = useState("60");
  const [iso, I] = useState(400);
  const [wb, W] = useState("固定 5600K");
  const [color, C] = useState("Log");
  const [sharp, H] = useState("-1");
  const [compare, B] = useState(50);
  const dji = device.startsWith("大疆");
  const warnings = [
    resolution !== "4K" && "当前分辨率低于常规 4K 基准，裁切和稳定余量较少。",
    fps !== "30" &&
      "60fps 可用于慢动作，非默认设置；确认快门、灯光和后期解释。",
    Number(shutter) !== Number(fps) * 2 &&
      "快门偏离约帧率两倍倒数，检查运动模糊；频闪场景允许测试例外。",
    wb === "自动" && "自动白平衡可能漂移，多机位建议固定并对照。",
    iso >= 3200 && "ISO 较高，回看暗部噪点；可接受范围需按型号测试。",
    color === "HLG" && "HLG 需要明确 HDR 链路或正确的 SDR 转换。",
    color === "标准" && "标准色彩适用于没有可靠 Log 工作流时；确认多机位一致。",
    dji &&
      sharp !== "-1" &&
      sharp !== "不支持" &&
      "支持锐化调节的大疆设备建议设为 -1。",
  ].filter(Boolean);
  const fields: [string, string, (v: string) => void, string[]][] = [
    [
      "设备类别",
      device,
      D,
      [
        "大疆 Pocket 系列",
        "大疆 Action 系列",
        "大疆无人机",
        "松下相机",
        "索尼相机",
        "普通智能手机",
      ],
    ],
    ["分辨率", resolution, R, ["4K", "1080P"]],
    ["帧率", fps, F, ["30", "60"]],
    ["快门速度", shutter, S, ["30", "50", "60", "100", "120", "250"]],
    ["白平衡", wb, W, ["固定 5600K", "固定 3200K", "自动"]],
    ["色彩模式", color, C, ["Log", "标准", "HLG"]],
    ["锐化", sharp, H, ["-1", "0", "1", "不支持"]],
  ];
  return (
    <>
      <section className="lab camera">
        <div className="section-label">交互练习 02 / 参数实验室</div>
        <h3>改变一个参数，观察一个影响。</h3>
        <div className="camera-layout">
          <div className="viewfinder">
            <Scene />
            <div className="view-data">
              {resolution} · {fps}fps · 1/{shutter} 秒<br />
              ISO {iso} · {wb} · {color}
            </div>
            <p>构图示意。画面不模拟实际曝光或品牌画质。</p>
          </div>
          <div className="controls">
            {fields.map(([label, val, set, opts]) => (
              <label key={label}>
                {label}
                <select value={val} onChange={(e) => set(e.target.value)}>
                  {opts.map((o) => (
                    <option key={o} value={o}>
                      {label === "快门速度"
                        ? `1/${o} 秒`
                        : label === "帧率"
                          ? `${o}fps`
                          : o}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <label>
              ISO <output>{iso}</output>
              <input
                type="range"
                min="100"
                max="6400"
                step="100"
                value={iso}
                onChange={(e) => I(+e.target.value)}
              />
            </label>
          </div>
        </div>
        <p className="capability">
          {device}：
          {dji
            ? "分辨率、Log 类型及锐化选项依型号和固件而异。无人机还须核实许可与飞行限制。"
            : device === "普通智能手机"
              ? "原生应用可能无法锁定快门、白平衡或使用 Log；取决于型号与拍摄应用，优先保证稳定与清晰。"
              : "Log、基础 ISO、位深及追焦能力依型号与模式而异。"}{" "}
          此处为条件式方案模拟，操作前须在实际设备确认支持情况。
        </p>
        <div className="feedback" aria-live="polite">
          <b>
            {warnings.length
              ? "需要核对以下设置"
              : "符合常规拍摄建议（以设备支持及现场测试为前提）"}
          </b>
          <ul>
            {warnings.map((w) => (
              <li key={String(w)}>{w}</li>
            ))}
          </ul>
          {color === "Log" && (
            <p>确认曝光与官方匹配转换；不要直接交付 Log 灰片。</p>
          )}
        </div>
      </section>
      <section className="lab">
        <div className="section-label">色彩还原 / 拖动比较</div>
        <h3>灰，不是最终的颜色。</h3>
        <div className="compare">
          <Scene />
          <div
            className="log-layer"
            style={{ clipPath: `inset(0 ${100 - compare}% 0 0)` }}
          >
            <Scene />
          </div>
          <div className="compare-line" style={{ left: `${compare}%` }} />
          <span className="compare-left">未还原示意</span>
          <span className="compare-right">还原后示意</span>
        </div>
        <label className="range-label">
          对比位置 <output>{compare}%</output>
          <input
            aria-label="色彩还原对比位置"
            type="range"
            value={compare}
            onChange={(e) => B(+e.target.value)}
          />
        </label>
        <p className="caption">
          教学示意，不代表任何具体品牌实际画质测试；此处使用矢量场景模拟对比，不是实际
          Log 转换。
        </p>
      </section>
    </>
  );
}
export function Shots() {
  const [shot, set] = useState(0);
  const names = ["全景", "中景", "近景", "特写", "反应镜头"];
  const notes = [
    "交代环境与人物关系。先让观众知道事件发生在哪里。",
    "交代行为。保留人物与动作对象，适合签约、交接等过程。",
    "突出人物。观察表情与发言，注意头顶与视线空间。",
    "强调细节。作品、证书或动作细节不能替代完整事件。",
    "建立叙事关系。此处切换到观众示意，实际须来自同一真实情境。",
  ];
  return (
    <section className="lab">
      <div className="section-label">交互练习 03 / 镜头语言</div>
      <h3>同一个现场，不同的信息。</h3>
      <div className="tabs">
        {names.map((n, i) => (
          <button key={n} aria-pressed={i === shot} onClick={() => set(i)}>
            {n}
          </button>
        ))}
      </div>
      <div className="shot-frame">
        <Scene
          kind={shot === 4 ? "audience" : "hall"}
          zoom={[1, 1.6, 2.5, 4, 1.6][shot]}
        />
        {shot === 4 && (
          <div className="reaction-label">同场观众反应 · 示意</div>
        )}
      </div>
      <p aria-live="polite">
        <b>{names[shot]}：</b>
        {notes[shot]}
      </p>
    </section>
  );
}
export function Rating({
  saved,
  update,
}: {
  saved: Saved;
  update: (s: Partial<Saved>) => void;
}) {
  const [index, set] = useState(0);
  const c = cases[index];
  const answer = saved.ratings[index];
  return (
    <section className="lab rating">
      <div className="section-label">交互练习 04 / 素材筛选训练 · 12 例</div>
      <h3>先做判断，再看依据。</h3>
      <div className="case-nav">
        {cases.map((_, i) => (
          <button
            key={i}
            aria-label={`案例 ${i + 1}`}
            aria-current={index === i ? "step" : undefined}
            onClick={() => set(i)}
          >
            {String(i + 1).padStart(2, "0")}
            {saved.ratings[i] && " ·"}
          </button>
        ))}
      </div>
      <div className="case-layout">
        <div>
          <Scene kind={c.visual} />
          <p className="caption">
            虚构矢量场景；情境细节以右侧文字为准，不涉及真实人物。
          </p>
        </div>
        <div>
          <h4>{c.title}</h4>
          <dl>
            {[
              ["场景", c.scene],
              ["画质", c.quality],
              ["人物", c.person],
              ["价值", c.value],
              ["问题", c.issue],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className="grade-buttons">
        {["A", "B", "C", "X"].map((g, i) => (
          <button
            key={g}
            aria-pressed={answer === g}
            onClick={() =>
              update({ ratings: { ...saved.ratings, [index]: g } })
            }
          >
            <b>{g}</b>
            {["优先使用", "补充使用", "原则不用", "禁止公开"][i]}
          </button>
        ))}
      </div>
      {answer && (
        <div className="feedback" role="status">
          <b>
            {answer === c.grade ? "判断一致" : "请复盘判断"} · 推荐评级{" "}
            {c.grade}
          </b>
          <p>依据：{c.reason}</p>
          <p>风险：{c.risk}</p>
          <p>建议：{c.action}</p>
        </div>
      )}
      <div className="split-actions">
        <span>已完成 {Object.keys(saved.ratings).length} / 12</span>
        <button onClick={() => set((index + 1) % 12)}>下一个案例 →</button>
      </div>
    </section>
  );
}
export function Timeline() {
  const [mode, set] = useState(0);
  const [clip, select] = useState(0);
  const [play, P] = useState(0);
  const names = ["粗剪", "精剪", "J-cut", "L-cut", "音频淡入淡出", "字幕位置"];
  const notes = [
    "先确认背景、行动、结果的结构，保留完整关键动作。",
    "压缩无效停顿，保留语意和动作连续；示意片段缩短。",
    "下一镜头的声音先进入，画面随后切换。",
    "上一镜头声音延续到下一镜头画面。",
    "用短淡入淡出缓和声音衔接，避免突兀和爆音。",
    "字幕留在安全区域内，避开平台界面和边缘裁切。",
  ];
  return (
    <section className="lab timeline">
      <div className="section-label">交互练习 05 / 剪辑时间线</div>
      <h3>切点，也是一种表达。</h3>
      <div className="tabs">
        {names.map((n, i) => (
          <button aria-pressed={mode === i} onClick={() => set(i)} key={n}>
            {n}
          </button>
        ))}
      </div>
      <div className="timeline-preview">
        <Scene kind={["hall", "reveal", "service"][clip]} />
        <div className={mode === 5 ? "subtitle safe" : "subtitle"}>
          {["交代活动背景", "记录关键行动", "呈现交流与成果"][clip]}
        </div>
      </div>
      <div className="ruler">
        00:00 <span>00:10</span> <span>00:20</span> 00:30
      </div>
      <div className="track-wrap">
        <div className="playhead" style={{ left: `${12 + play * 0.87}%` }} />
        {["视频", "音频", "字幕"].map((n, row) => (
          <div className={`track track-${row}`} key={n}>
            <span>{n}</span>
            <div>
              {["背景", "揭牌", "交流"].map((t, i) => (
                <button
                  key={t}
                  aria-pressed={clip === i}
                  className={`${clip === i ? "selected" : ""} ${mode === 4 && row === 1 ? "fade" : ""}`}
                  style={{
                    flex: mode === 1 ? [1, 1.4, 1][i] : 1,
                    transform:
                      row === 1 && mode === 2
                        ? `translateX(-${i * 12}px)`
                        : row === 1 && mode === 3
                          ? `translateX(${i * 12}px)`
                          : "none",
                  }}
                  onClick={() => {
                    select(i);
                    P(i * 33);
                  }}
                >
                  {row === 0
                    ? t
                    : row === 1
                      ? ["环境声", "揭牌同期声", "交流同期声"][i]
                      : `${t}字幕`}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <label className="range-label">
        查看时间点 <output>{Math.round(play * 0.3)} 秒</output>
        <input
          type="range"
          value={play}
          onChange={(e) => {
            P(+e.target.value);
            select(Math.min(2, Math.floor(+e.target.value / 34)));
          }}
        />
      </label>
      <p aria-live="polite">
        <b>{names[mode]}：</b>
        {notes[mode]}
      </p>
      <p className="caption">
        教学模型，仅模拟轨道关系与切点，不包含音视频播放或实际文件剪辑。
      </p>
    </section>
  );
}
export function Files({
  saved,
  update,
}: {
  saved: Saved;
  update: (s: Partial<Saved>) => void;
}) {
  const [index, set] = useState(0);
  const [folder, F] = useState(0);
  const [name, N] = useState("");
  const [message, M] = useState("");
  const t = fileTasks[index];
  function submit() {
    const ok = folder === t.folder && name.trim() === t.name;
    M(
      ok
        ? "整理正确。" + t.tip
        : `请复查：应放入 ${folders[t.folder]}，规范命名为 ${t.name}。${t.tip}`,
    );
    if (ok) update({ files: { ...saved.files, [index]: true } });
  }
  return (
    <section className="lab">
      <div className="section-label">交互练习 06 / 文件整理</div>
      <h3>一次准确的交接，从命名开始。</h3>
      <div className="file-explorer">
        <aside>
          <b>20261008_校园活动</b>
          {folders.map((f, i) => (
            <button aria-pressed={folder === i} key={f} onClick={() => F(i)}>
              ▱ {f}
            </button>
          ))}
        </aside>
        <div>
          <label>
            选择待整理文件
            <select
              value={index}
              onChange={(e) => {
                set(+e.target.value);
                N("");
                M("");
              }}
            >
              {fileTasks.map((f, i) => (
                <option key={f.source} value={i}>
                  {f.source}
                  {saved.files[i] ? " · 已完成" : ""}
                </option>
              ))}
            </select>
          </label>
          <p>目标文件夹：{folders[folder]}</p>
          <label>
            规范文件名
            <input
              value={name}
              placeholder="输入完整文件名"
              onChange={(e) => N(e.target.value)}
            />
          </label>
          <p className="caption">
            练习采用固定活动“校园活动”。原始素材使用日期 20261008、A机位、序号
            001；审核第一次交审为 V01，工程为
            V02。非视频文件保留对应扩展名；工程本练习不加扩展名。
          </p>
          <button className="primary" onClick={submit}>
            检查并归档
          </button>
          <p role="status">{message}</p>
          <details>
            <summary>查看命名示例</summary>
            <code>{t.name}</code>
          </details>
        </div>
      </div>
      <p>
        已正确整理 {Object.keys(saved.files).length} / {fileTasks.length}{" "}
        项。识别错误：FINAL2 不表示通过审核，应恢复递增版本并重新确认。
      </p>
    </section>
  );
}
