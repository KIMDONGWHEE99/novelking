import {
  TiptapUnderline,
  TaskItem,
  TaskList,
  Placeholder,
  StarterKit,
  HorizontalRule,
  TextStyle,
  Color,
} from "novel";

export const defaultExtensions = [
  StarterKit.configure({
    bulletList: { HTMLAttributes: { class: "list-disc ml-4" } },
    orderedList: { HTMLAttributes: { class: "list-decimal ml-4" } },
    heading: { HTMLAttributes: { class: "font-bold" }, levels: [1, 2, 3] },
    blockquote: {
      HTMLAttributes: {
        class: "border-l-4 border-primary/30 pl-4 italic",
      },
    },
    codeBlock: { HTMLAttributes: { class: "bg-muted rounded-md p-4" } },
    code: { HTMLAttributes: { class: "bg-muted px-1.5 py-0.5 rounded" } },
    horizontalRule: false,
    dropcursor: { color: "#DBEAFE", width: 4 },
  }),
  HorizontalRule,
  TiptapUnderline,
  TaskList,
  TaskItem.configure({ nested: true }),
  TextStyle,
  Color,
  Placeholder.configure({
    placeholder: "글을 작성하세요... '/'를 입력하면 명령어를 사용할 수 있어요",
    includeChildren: true,
  }),
];
