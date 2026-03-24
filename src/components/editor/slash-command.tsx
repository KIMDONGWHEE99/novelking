import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Text,
  TextQuote,
  Code,
  Minus,
  CheckSquare,
} from "lucide-react";
import { createSuggestionItems, Command, renderItems } from "novel";

export const suggestionItems = createSuggestionItems([
  {
    title: "본문",
    description: "일반 텍스트를 입력합니다.",
    searchTerms: ["p", "paragraph", "본문", "텍스트"],
    icon: <Text size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  {
    title: "제목 1",
    description: "큰 제목 (장 제목)",
    searchTerms: ["title", "h1", "제목"],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "제목 2",
    description: "중간 제목 (절 제목)",
    searchTerms: ["subtitle", "h2"],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "제목 3",
    description: "작은 제목",
    searchTerms: ["h3"],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "글머리 기호 목록",
    description: "글머리 기호가 있는 목록",
    searchTerms: ["bullet", "list", "목록"],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "번호 목록",
    description: "번호가 매겨진 목록",
    searchTerms: ["ordered", "번호"],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "체크리스트",
    description: "할 일 체크 목록",
    searchTerms: ["todo", "task", "체크"],
    icon: <CheckSquare size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "인용",
    description: "인용문 블록",
    searchTerms: ["quote", "인용"],
    icon: <TextQuote size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .toggleBlockquote()
        .run();
    },
  },
  {
    title: "코드 블록",
    description: "코드 스니펫",
    searchTerms: ["code", "코드"],
    icon: <Code size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "구분선",
    description: "가로 구분선",
    searchTerms: ["hr", "divider", "구분"],
    icon: <Minus size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
]);

export const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
});
