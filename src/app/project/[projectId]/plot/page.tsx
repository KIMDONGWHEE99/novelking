"use client";

import { use, useState, useEffect } from "react";
import { usePlotColumns } from "@/lib/db/hooks/use-plot";
import { usePlotCards } from "@/lib/db/hooks/use-plot";
import { useCharacters } from "@/lib/db/hooks/use-characters";
import {
  plotColumnRepo,
  plotCardRepo,
} from "@/lib/db/repositories/plot.repo";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, GripVertical, Trash2, Edit, X, Check, Users, Palette, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function PlotPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { columns, isLoading: colLoading } = usePlotColumns(projectId);
  const { cards, isLoading: cardLoading } = usePlotCards(projectId);
  const { characters } = useCharacters(projectId);
  const [initialized, setInitialized] = useState(false);

  // 기본 5막 구조 초기화
  useEffect(() => {
    if (!initialized && columns !== undefined && columns.length === 0) {
      plotColumnRepo.initializeDefault(projectId).then(() => setInitialized(true));
    }
  }, [columns, projectId, initialized]);

  // 카드 추가 다이얼로그
  const [addDialog, setAddDialog] = useState<{
    open: boolean;
    columnId: string;
    columnTitle: string;
  }>({ open: false, columnId: "", columnTitle: "" });
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDesc, setNewCardDesc] = useState("");
  const [newCardChars, setNewCardChars] = useState<string[]>([]);

  // 열 편집
  const [editColumnId, setEditColumnId] = useState<string | null>(null);
  const [editColumnTitle, setEditColumnTitle] = useState("");

  // 카드 편집
  const [editCard, setEditCard] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const COLUMN_COLORS = ["#3b82f6", "#8b5cf6", "#ef4444", "#f59e0b", "#22c55e", "#ec4899", "#06b6d4", "#84cc16"];

  async function handleAddColumn() {
    const maxOrder = columns?.reduce((max, c) => Math.max(max, c.order), -1) ?? -1;
    await plotColumnRepo.create({
      projectId,
      title: "새 열",
      color: COLUMN_COLORS[(maxOrder + 1) % COLUMN_COLORS.length],
      order: maxOrder + 1,
    });
  }

  async function handleSaveColumnTitle(colId: string) {
    if (editColumnTitle.trim()) {
      await plotColumnRepo.update(colId, { title: editColumnTitle.trim() });
    }
    setEditColumnId(null);
  }

  async function handleDeleteColumn(colId: string, title: string) {
    const colCardCount = cards?.filter((c) => c.columnId === colId).length ?? 0;
    const msg = colCardCount > 0
      ? `'${title}' 열과 안에 있는 ${colCardCount}개의 카드가 모두 삭제됩니다. 계속하시겠습니까?`
      : `'${title}' 열을 삭제하시겠습니까?`;
    if (confirm(msg)) {
      await plotColumnRepo.delete(colId);
    }
  }

  async function handleChangeColumnColor(colId: string, color: string) {
    await plotColumnRepo.update(colId, { color });
  }

  async function handleAddCard() {
    if (!newCardTitle.trim()) return;
    const colCards = cards?.filter((c) => c.columnId === addDialog.columnId) ?? [];
    await plotCardRepo.create({
      projectId,
      columnId: addDialog.columnId,
      title: newCardTitle.trim(),
      description: newCardDesc.trim(),
      characterLinks: newCardChars,
      order: colCards.length,
    });
    setAddDialog({ open: false, columnId: "", columnTitle: "" });
    setNewCardTitle("");
    setNewCardDesc("");
    setNewCardChars([]);
  }

  async function handleSaveEdit(cardId: string) {
    await plotCardRepo.update(cardId, {
      title: editTitle,
      description: editDesc,
    });
    setEditCard(null);
  }

  async function handleMoveCard(cardId: string, targetColumnId: string) {
    const targetCards = cards?.filter((c) => c.columnId === targetColumnId) ?? [];
    await plotCardRepo.moveToColumn(cardId, targetColumnId, targetCards.length);
  }

  if (colLoading || cardLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-6 py-3 shrink-0">
        <h1 className="text-lg font-bold">플롯 보드</h1>
        <p className="text-xs text-muted-foreground">
          소설의 줄거리를 정리하세요. 열을 자유롭게 추가/수정/삭제할 수 있습니다.
        </p>
      </div>

      {/* 칸반 보드 */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex gap-4 h-full min-w-max">
          {(columns ?? []).map((col) => {
            const colCards = cards?.filter((c) => c.columnId === col.id) ?? [];
            return (
              <div
                key={col.id}
                className="w-72 flex flex-col bg-muted/30 rounded-lg shrink-0"
              >
                {/* 열 헤더 */}
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: col.color }}
                    />
                    {editColumnId === col.id ? (
                      <Input
                        value={editColumnTitle}
                        onChange={(e) => setEditColumnTitle(e.target.value)}
                        onBlur={() => handleSaveColumnTitle(col.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveColumnTitle(col.id);
                          if (e.key === "Escape") setEditColumnId(null);
                        }}
                        className="h-6 text-sm font-medium px-1"
                        autoFocus
                      />
                    ) : (
                      <span
                        className="font-medium text-sm cursor-pointer hover:text-primary truncate"
                        onDoubleClick={() => {
                          setEditColumnId(col.id);
                          setEditColumnTitle(col.title);
                        }}
                      >
                        {col.title}
                      </span>
                    )}
                    <Badge variant="secondary" className="text-[10px] h-5 shrink-0">
                      {colCards.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        setAddDialog({
                          open: true,
                          columnId: col.id,
                          columnTitle: col.title,
                        })
                      }
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent cursor-pointer">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditColumnId(col.id);
                            setEditColumnTitle(col.title);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5 mr-2" />
                          이름 변경
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-1.5">
                          <p className="text-xs text-muted-foreground mb-1.5">색상</p>
                          <div className="flex gap-1 flex-wrap">
                            {COLUMN_COLORS.map((c) => (
                              <button
                                key={c}
                                className={`w-5 h-5 rounded-full border-2 transition-all cursor-pointer ${col.color === c ? "border-foreground scale-110" : "border-transparent hover:scale-110"}`}
                                style={{ backgroundColor: c }}
                                onClick={() => handleChangeColumnColor(col.id, c)}
                              />
                            ))}
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteColumn(col.id, col.title)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          열 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* 카드 목록 */}
                <ScrollArea className="flex-1 px-2 pb-2">
                  <div className="space-y-2">
                    {colCards.map((card) => {
                      const isEditing = editCard === card.id;
                      const linkedChars = characters?.filter((ch) =>
                        card.characterLinks.includes(ch.id)
                      );
                      return (
                        <Card key={card.id} className="group">
                          <CardHeader className="p-3">
                            {isEditing ? (
                              <div className="space-y-2">
                                <Input
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="text-sm h-8"
                                />
                                <Textarea
                                  value={editDesc}
                                  onChange={(e) => setEditDesc(e.target.value)}
                                  className="text-xs min-h-[60px]"
                                  rows={3}
                                />
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    className="h-6 text-[10px]"
                                    onClick={() => handleSaveEdit(card.id)}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    저장
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[10px]"
                                    onClick={() => setEditCard(null)}
                                  >
                                    취소
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between">
                                  <CardTitle className="text-sm leading-tight">
                                    {card.title}
                                  </CardTitle>
                                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5"
                                      onClick={() => {
                                        setEditCard(card.id);
                                        setEditTitle(card.title);
                                        setEditDesc(card.description);
                                      }}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5"
                                      onClick={() => plotCardRepo.delete(card.id)}
                                    >
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                                {card.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-3 mt-1">
                                    {card.description}
                                  </p>
                                )}
                                {linkedChars && linkedChars.length > 0 && (
                                  <div className="flex gap-1 mt-2 flex-wrap">
                                    {linkedChars.map((ch) => (
                                      <span
                                        key={ch.id}
                                        className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center gap-0.5"
                                      >
                                        <Users className="h-2.5 w-2.5" />
                                        {ch.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {/* 이동 버튼 */}
                                <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {columns
                                    ?.filter((c) => c.id !== col.id)
                                    .map((targetCol) => (
                                      <Button
                                        key={targetCol.id}
                                        variant="outline"
                                        size="sm"
                                        className="h-5 text-[9px] px-1.5"
                                        onClick={() =>
                                          handleMoveCard(card.id, targetCol.id)
                                        }
                                      >
                                        → {targetCol.title}
                                      </Button>
                                    ))}
                                </div>
                              </>
                            )}
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            );
          })}

          {/* 새 열 추가 버튼 */}
          <button
            onClick={handleAddColumn}
            className="w-72 shrink-0 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/20 transition-colors cursor-pointer min-h-[200px]"
          >
            <Plus className="h-6 w-6 text-muted-foreground/40" />
            <span className="text-sm text-muted-foreground/60">새 열 추가</span>
          </button>
        </div>
      </div>

      {/* 카드 추가 다이얼로그 */}
      <Dialog
        open={addDialog.open}
        onOpenChange={(open) =>
          setAddDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {addDialog.columnTitle}에 플롯 카드 추가
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Input
                placeholder="카드 제목 (예: 주인공의 첫 만남)"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCard()}
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="상세 설명 (선택)"
                value={newCardDesc}
                onChange={(e) => setNewCardDesc(e.target.value)}
                rows={3}
              />
            </div>
            {characters && characters.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium">관련 캐릭터</span>
                <div className="flex flex-wrap gap-2">
                  {characters.map((ch) => (
                    <Badge
                      key={ch.id}
                      variant={
                        newCardChars.includes(ch.id) ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() =>
                        setNewCardChars((prev) =>
                          prev.includes(ch.id)
                            ? prev.filter((id) => id !== ch.id)
                            : [...prev, ch.id]
                        )
                      }
                    >
                      {ch.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <Button
              onClick={handleAddCard}
              disabled={!newCardTitle.trim()}
              className="w-full"
            >
              카드 추가
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
