import type {Task} from '../../types/task'
import { getDueState } from '../../lib/utils'
import styles from './SummaryBar.module.css'

/* This renders the SummaryBar that provides general information such as:
*   - Total Tasks
*   - Total Tasks Completed
*   - Total Tasks Overdue
*/
export default function SummaryBar({tasks}: {tasks: Task[]}){
    const totalTasks = tasks.length;
    const amountCompleted = tasks.filter((t) => t.status ==='done').length;
    const amountOverdue = tasks.filter((t) => getDueState(t.due_date) === 'overdue').length;

    const summaryItems = [
        {label: 'Total Tasks', value: totalTasks},
        {label: 'Total Completed Tasks', value: amountCompleted},
        {label: 'Total Overdue Tasks', value: amountOverdue},
    ];

    return(
        <div className={styles.summaryGrid}>
            {summaryItems.map((item)=>(
                <div key = {item.label} className={styles.summaryRow}>
                    <p className={styles.label}>{item.label}</p>
                    <p className={styles.value}>{item.value}</p>
                </div>
            ))}
        </div>
    );
}