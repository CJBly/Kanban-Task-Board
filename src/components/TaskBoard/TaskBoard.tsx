import type { Task, TaskCurrentStatus } from "../../types/task";
import Column from '../TaskColumn/TaskColumn'
import styles from './TaskBoard.module.css'

const columns: {id: TaskCurrentStatus; title: string}[]=[
    {id:'todo', title: 'To Do'},
    {id:'in_progress', title: 'In Progress'},
    {id:'in_review', title: 'In Review'},
    {id:'done', title: 'Done'},
];

// This renders the TaskBoard with the columns and the tasks. Tasks are sorted into columns based on their current status.
export default function TaskBoard({tasks, onDeleteTask}: {tasks: Task[]; onDeleteTask: (taskId:string)=>void | Promise<void>;}){
    return(
        <div className={styles.task_board}>
            {columns.map((column)=>(
                <Column key={column.id} id={column.id} title={column.title} tasks={tasks.filter((task)=>task.status===column.id)} onDeleteTask={onDeleteTask}/>
            ))}
        </div>
    )
}