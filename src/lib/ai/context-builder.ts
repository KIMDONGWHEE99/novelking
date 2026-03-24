import { db } from "@/lib/db/database";
import type { ContextSelection } from "@/types/ai";

/**
 * 사용자가 선택한 컨텍스트 항목을 Dexie DB에서 수집하여
 * LLM 프롬프트에 포함할 문자열로 조합합니다.
 */
export async function buildContext(
  projectId: string,
  chapterId: string,
  selection: ContextSelection
): Promise<string> {
  const parts: string[] = [];

  // 프로젝트 정보
  if (selection.projectInfo) {
    const project = await db.projects.get(projectId);
    if (project) {
      parts.push(
        `[프로젝트 정보]\n제목: ${project.title}\n장르: ${project.genre}\n개요: ${project.description || "없음"}`
      );
    }
  }

  // 캐릭터 정보
  if (selection.characters) {
    const characters = await db.characters
      .where("projectId")
      .equals(projectId)
      .toArray();
    if (characters.length > 0) {
      const charTexts = characters.map((c) => {
        let text = `- ${c.name} (${c.role}): ${c.description}`;
        if (c.traits.length > 0) {
          text +=
            "\n  특성: " + c.traits.map((t) => `${t.key}=${t.value}`).join(", ");
        }
        return text;
      });
      parts.push(`[등장인물]\n${charTexts.join("\n")}`);
    }
  }

  // 세계관 정보
  if (selection.worldSettings) {
    const elements = await db.worldElements
      .where("projectId")
      .equals(projectId)
      .toArray();
    if (elements.length > 0) {
      const worldTexts = elements.map(
        (e) => `- [${e.type}] ${e.title}: ${e.content.slice(0, 300)}`
      );
      parts.push(`[세계관]\n${worldTexts.join("\n")}`);
    }
  }

  // 이전 챕터 내용 (현재 챕터보다 order가 작은 것만)
  if (selection.previousChapters) {
    const currentChapter = await db.chapters.get(chapterId);
    if (currentChapter) {
      const prevChapters = await db.chapters
        .where("projectId")
        .equals(projectId)
        .filter((c) => c.order < currentChapter.order)
        .sortBy("order");
      if (prevChapters.length > 0) {
        const chapterTexts = prevChapters.map((c) => {
          const plain = stripHtml(c.content).slice(0, 500);
          return `--- ${c.title} ---\n${plain}${plain.length >= 500 ? "..." : ""}`;
        });
        parts.push(`[이전 챕터 요약]\n${chapterTexts.join("\n\n")}`);
      }
    }
  }

  // 사용자 커스텀 지시사항
  if (selection.customInstruction.trim()) {
    parts.push(`[추가 지시사항]\n${selection.customInstruction.trim()}`);
  }

  return parts.join("\n\n");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
