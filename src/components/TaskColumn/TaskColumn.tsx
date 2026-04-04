import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, TaskCurrentStatus } from '../../types/task';
import TaskCard from '../TaskCard/TaskCard';
import styles from './TaskColumn.module.css';

/* This renders a column for the TaskBoard
*  Currently allows:
*        - Tasks to be dragged out of and into a column
*        - Tasks to be sorted
*/
export default function Column({
    id,title,tasks,onDeleteTask,
}:{
    id: TaskCurrentStatus;
    title: string;
    tasks: Task[];
    onDeleteTask: (taskId:string)=>void | Promise<void>;
}){
    //Makes this column a droppable area for drag-and-drop tasks
    const{setNodeRef,isOver} = useDroppable({id});
    return(
        <section ref={setNodeRef} className={`${styles.column} ${isOver ? styles.over: ''}`}>
            <div className={styles.columnHeader}>
                <h2 className={styles.columnTitle}>{title}</h2>
                <span className={styles.countTasks}>{tasks.length}</span>
            </div>
            {/*Allows for list of tasks in a column to be sorted*/}
            <SortableContext items={tasks.map((t)=>t.id)} strategy={verticalListSortingStrategy}>
                <div className={styles.taskList}>
                    {tasks.length == 0 ?(
                        <div className={styles.emptyList}>No tasks here yet.</div>
                    ): (tasks.map((task) => <TaskCard key={task.id} task={task} onDeleteTask={onDeleteTask}/>))}
                </div>
            </SortableContext>
        </section>
    );
}
