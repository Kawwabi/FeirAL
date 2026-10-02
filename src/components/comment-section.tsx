"use client";

import { useActionState, useState } from "react";
import { MessageSquare, Send, Trash2, Loader2, CornerDownRight } from "lucide-react";
import { addCommentAction, deleteCommentAction } from "@/app/actions/community";
import { initialActionState } from "@/lib/action-state";
import { fieldClass } from "@/components/ui";
import { initials } from "@/lib/utils";

export interface CommentAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface CommentItem {
  id: string;
  content: string;
  createdAtLabel: string;
  author: CommentAuthor;
  replies: CommentItem[];
}

function Avatar({ author }: { author: CommentAuthor }) {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink-900 text-xs font-bold text-white">
      {initials(author.name)}
    </span>
  );
}

function Composer({
  fairId,
  parentId,
  currentUserId,
  placeholder,
  compact,
}: {
  fairId: string;
  parentId?: string;
  currentUserId: string | null;
  placeholder: string;
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState(addCommentAction, initialActionState);

  if (!currentUserId) {
    return (
      <p className="rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-500">
        <a href="/entrar" className="font-medium text-brand-700 hover:underline">
          Entre
        </a>{" "}
        para comentar.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="fairId" value={fairId} />
      {parentId ? <input type="hidden" name="parentId" value={parentId} /> : null}
      <textarea
        name="content"
        required
        rows={compact ? 2 : 3}
        placeholder={placeholder}
        className={`${fieldClass} min-h-0`}
      />
      {state.message && !state.ok ? <p className="text-xs text-red-600">{state.message}</p> : null}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-800 disabled:opacity-60"
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {parentId ? "Responder" : "Comentar"}
        </button>
      </div>
    </form>
  );
}

function CommentRow({
  comment,
  fairId,
  currentUserId,
  canModerate,
  isReply,
}: {
  comment: CommentItem;
  fairId: string;
  currentUserId: string | null;
  canModerate: boolean;
  isReply?: boolean;
}) {
  const canDelete = currentUserId === comment.author.id || canModerate;

  return (
    <div className={isReply ? "ml-6 border-l-2 border-ink-100 pl-4" : ""}>
      <div className="flex gap-3">
        <Avatar author={comment.author} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink-800">{comment.author.name}</span>
            <span className="text-xs text-ink-400">{comment.createdAtLabel}</span>
          </div>
          <p className="mt-1 whitespace-pre-line text-sm text-ink-600">{comment.content}</p>
          {canDelete ? (
            <form action={deleteCommentAction} className="mt-1">
              <input type="hidden" name="commentId" value={comment.id} />
              <button type="submit" className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-red-600">
                <Trash2 size={12} /> Excluir
              </button>
            </form>
          ) : null}
        </div>
      </div>

      {comment.replies.length > 0 ? (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentRow
              key={reply.id}
              comment={reply}
              fairId={fairId}
              currentUserId={currentUserId}
              canModerate={canModerate}
              isReply
            />
          ))}
        </div>
      ) : null}

      {!isReply ? (
        <div className="ml-6 mt-3">
          <ReplyToggle fairId={fairId} parentId={comment.id} currentUserId={currentUserId} />
        </div>
      ) : null}
    </div>
  );
}

function ReplyToggle({
  fairId,
  parentId,
  currentUserId,
}: {
  fairId: string;
  parentId: string;
  currentUserId: string | null;
}) {
  const [open, setOpen] = useState(false);
  if (!currentUserId) return null;
  return open ? (
    <Composer
      fairId={fairId}
      parentId={parentId}
      currentUserId={currentUserId}
      placeholder="Escreva uma resposta..."
      compact
    />
  ) : (
    <button
      onClick={() => setOpen(true)}
      className="inline-flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-brand-700"
    >
      <CornerDownRight size={13} /> Responder
    </button>
  );
}

export function CommentSection({
  fairId,
  comments,
  currentUserId,
  canModerate,
}: {
  fairId: string;
  comments: CommentItem[];
  currentUserId: string | null;
  canModerate: boolean;
}) {
  return (
    <div className="space-y-5">
      <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-ink-900">
        <MessageSquare size={18} /> Comentarios ({comments.length})
      </h3>

      <Composer
        fairId={fairId}
        currentUserId={currentUserId}
        placeholder="Compartilhe uma duvida ou dica sobre esta feirinha..."
      />

      {comments.length === 0 ? (
        <p className="text-sm text-ink-500">Ainda nao ha comentarios. Seja o primeiro a comentar!</p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              fairId={fairId}
              currentUserId={currentUserId}
              canModerate={canModerate}
            />
          ))}
        </div>
      )}
    </div>
  );
}