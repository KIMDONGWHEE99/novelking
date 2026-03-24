import { db } from "@/lib/db/database";
import type { Project, Chapter } from "@/types/project";

export type ExportFormat = "txt" | "html";

interface ExportResult {
  content: string;
  filename: string;
  mimeType: string;
}

/**
 * 프로젝트의 모든 챕터를 지정된 형식으로 내보냅니다.
 */
export async function exportProject(
  projectId: string,
  format: ExportFormat
): Promise<ExportResult> {
  const project = await db.projects.get(projectId);
  if (!project) throw new Error("프로젝트를 찾을 수 없습니다.");

  const chapters = await db.chapters
    .where("projectId")
    .equals(projectId)
    .sortBy("order");

  if (chapters.length === 0) throw new Error("내보낼 챕터가 없습니다.");

  const safeTitle = project.title.replace(/[<>:"/\\|?*]/g, "_");

  if (format === "txt") {
    return {
      content: buildTxt(project, chapters),
      filename: `${safeTitle}.txt`,
      mimeType: "text/plain;charset=utf-8",
    };
  }

  return {
    content: buildHtml(project, chapters),
    filename: `${safeTitle}.html`,
    mimeType: "text/html;charset=utf-8",
  };
}

/**
 * 단일 챕터를 내보냅니다.
 */
export async function exportChapter(
  chapterId: string,
  format: ExportFormat
): Promise<ExportResult> {
  const chapter = await db.chapters.get(chapterId);
  if (!chapter) throw new Error("챕터를 찾을 수 없습니다.");

  const project = await db.projects.get(chapter.projectId);
  const safeTitle = `${project?.title ?? "소설"}_${chapter.title}`.replace(
    /[<>:"/\\|?*]/g,
    "_"
  );
  const plainText = stripHtml(chapter.content);

  if (format === "txt") {
    return {
      content: `${chapter.title}\n${"=".repeat(40)}\n\n${plainText}`,
      filename: `${safeTitle}.txt`,
      mimeType: "text/plain;charset=utf-8",
    };
  }

  return {
    content: wrapHtml(
      chapter.title,
      `<h2>${chapter.title}</h2>\n${chapter.content || "<p></p>"}`
    ),
    filename: `${safeTitle}.html`,
    mimeType: "text/html;charset=utf-8",
  };
}

/**
 * 브라우저에서 파일 다운로드를 실행합니다.
 */
export function downloadFile(result: ExportResult) {
  const blob = new Blob([result.content], { type: result.mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = result.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- 내부 헬퍼 ---

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildTxt(project: Project, chapters: Chapter[]): string {
  const lines: string[] = [];
  lines.push(project.title);
  lines.push("=".repeat(40));
  if (project.genre) lines.push(`장르: ${project.genre}`);
  if (project.description) lines.push(`\n${project.description}`);
  lines.push("\n");

  for (const chapter of chapters) {
    lines.push(`\n${"─".repeat(40)}`);
    lines.push(chapter.title);
    lines.push("─".repeat(40));
    lines.push("");
    lines.push(stripHtml(chapter.content));
    lines.push("");
  }

  return lines.join("\n");
}

function buildHtml(project: Project, chapters: Chapter[]): string {
  const body = chapters
    .map(
      (ch) =>
        `<div class="chapter">\n<h2>${ch.title}</h2>\n${ch.content || "<p></p>"}\n</div>`
    )
    .join("\n<hr>\n");

  return wrapHtml(
    project.title,
    `<header>
  <h1>${project.title}</h1>
  ${project.genre ? `<p class="genre">${project.genre}</p>` : ""}
  ${project.description ? `<p class="desc">${project.description}</p>` : ""}
</header>
<hr>
${body}`
  );
}

function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { max-width: 700px; margin: 2rem auto; padding: 0 1rem; font-family: 'Noto Serif KR', serif; line-height: 1.8; color: #222; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.4rem; margin-top: 2rem; border-bottom: 1px solid #ddd; padding-bottom: 0.3rem; }
    .genre { color: #666; font-size: 0.9rem; }
    .desc { color: #444; font-style: italic; }
    hr { border: none; border-top: 1px solid #eee; margin: 2rem 0; }
    .chapter { margin-bottom: 2rem; }
    p { margin: 0.8rem 0; text-indent: 1rem; }
    @media (prefers-color-scheme: dark) {
      body { background: #1a1a1a; color: #e0e0e0; }
      h2 { border-color: #444; }
      hr { border-color: #333; }
    }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}
