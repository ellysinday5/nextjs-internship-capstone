import type { KeyboardCoordinateGetter } from "@dnd-kit/core";
import { KeyboardCode } from "@dnd-kit/core";

interface KanbanKeyboardTask {
    id: string;
    listId: string;
    position: number;
}

interface KanbanKeyboardList {
    id: string;
}

interface KanbanKeyboardCtx {
    tasks: KanbanKeyboardTask[];
    lists: KanbanKeyboardList[];
}

function getElementCenter(selector: string): { x: number; y: number } | undefined {
    const el = document.querySelector(selector);
    if (!el) return undefined;
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/**
 * Custom dnd-kit keyboard coordinate getter for a multi-column Kanban board.
 * Up/Down move within the current column. Left/Right jump to the adjacent
 * column, landing on its first task (or the column's empty-drop-zone center
 * if that column has no tasks yet).
 */
export function createKanbanCoordinateGetter(
    getCtx: () => KanbanKeyboardCtx,
): KeyboardCoordinateGetter {
    return (event, args) => {
        const { active } = args;
        const { tasks, lists } = getCtx();

        const activeTask = tasks.find((t) => t.id === String(active));
        if (!activeTask) return undefined;

        const listIds = lists.map((l) => l.id);
        const currentListIndex = listIds.indexOf(activeTask.listId);

        const sameListTasks = tasks
            .filter((t) => t.listId === activeTask.listId)
            .sort((a, b) => a.position - b.position);
        const currentIndex = sameListTasks.findIndex((t) => t.id === activeTask.id);

        switch (event.code) {
            case KeyboardCode.Down: {
                event.preventDefault();
                const next = sameListTasks[currentIndex + 1];
                return next ? getElementCenter(`[data-task-id="${next.id}"]`) : undefined;
            }
            case KeyboardCode.Up: {
                event.preventDefault();
                const prev = sameListTasks[currentIndex - 1];
                return prev ? getElementCenter(`[data-task-id="${prev.id}"]`) : undefined;
            }
            case KeyboardCode.Right: {
                event.preventDefault();
                const nextListId = listIds[currentListIndex + 1];
                if (!nextListId) return undefined;
                const firstTaskInNextList = tasks
                    .filter((t) => t.listId === nextListId)
                    .sort((a, b) => a.position - b.position)[0];
                return firstTaskInNextList
                    ? getElementCenter(`[data-task-id="${firstTaskInNextList.id}"]`)
                    : getElementCenter(`[data-list-dropzone="${nextListId}"]`);
            }
            case KeyboardCode.Left: {
                event.preventDefault();
                const prevListId = listIds[currentListIndex - 1];
                if (!prevListId) return undefined;
                const firstTaskInPrevList = tasks
                    .filter((t) => t.listId === prevListId)
                    .sort((a, b) => a.position - b.position)[0];
                return firstTaskInPrevList
                    ? getElementCenter(`[data-task-id="${firstTaskInPrevList.id}"]`)
                    : getElementCenter(`[data-list-dropzone="${prevListId}"]`);
            }
            default:
                return undefined;
        }
    };
}