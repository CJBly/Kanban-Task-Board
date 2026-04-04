import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, Flag, Trash } from "lucide-react";
import {format} from "date-fns";
import type { Task } from "../../types/task";
import { getDueState } from "../../lib/utils";
import styles from "./TaskCard.module.css"

// This function renders the priority tag that appears on a Task Card. Including the flag and text.
function PriorityContainer({priority}: {priority: Task['priority']}){
    return(
        <span className={`${styles.priority_container} ${priorityClass(priority)}`}>
            <Flag size={12} /> {priority}
        </span>
    );
}

// This function gives the correct CSS class for each different priority
function priorityClass(priority: Task['priority']){
    if(priority === 'high'){
        return `${styles.priority_determination} ${styles.priorityHigh}`
    }
    if(priority == 'low'){
        return `${styles.priority_determination} ${styles.priorityLow}`
    }
    return `${styles.priority_determination} ${styles.priorityNormal}`
}

// This function returns the correct CSS class for each due date state
function dueClass(dueState: ReturnType<typeof getDueState>){
    if(dueState === 'overdue'){
        return styles.dueOverdue;
    }
    if(dueState === 'soon'){
        return styles.dueSoon;
    }
    return styles.due;
}

export default function TaskCard({task, onDeleteTask}: {task:Task; onDeleteTask: (taskId:string)=>void | Promise<void>;}){
    // Tasks can be dragged, dropped, sorted, etc.
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: task.id,});
    
    // Applies styling for dragging animations
    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    const dueState = getDueState(task.due_date);

    return(
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`${styles.card} ${isDragging ? styles.dragging: ''}`}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    {task.title}
                </h3>
                <button
                    type="button"
                    className={styles.delete_button}
                    onClick={(e)=>{
                        e.stopPropagation();
                        onDeleteTask(task.id);
                    }}
                >
                    <Trash size={14}/>
                </button>
            </div>
            <div className={styles.details}>
                <PriorityContainer priority={task.priority} />
                {task.due_date && (
                    <div className={dueClass(dueState)}>
                        <CalendarDays size={12}/>
                        {format(new Date(task.due_date), 'MMM d')}
                    </div>
                )}
            </div>
            {task.description && <p className={styles.description}>{task.description}</p>}
        </div>

    )

}