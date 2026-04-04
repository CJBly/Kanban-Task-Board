import React, { useState } from 'react';
import type { TaskCurrentPriority } from '../../types/task';
import styles from './CreateTask.module.css'

// This renders the Create Task Menu that allows a user to create a new task
export default function CreateTask({
        openMenu,
        onClose,
        onCreate,
    }:{
        openMenu: boolean;
        onClose: () => void;
        onCreate: (values: {
            title: string;
            description?: string;
            priority?: TaskCurrentPriority;
            due_date?: string;
        }) => Promise<void>;
    }){
        const [title,setTitle] = useState('');
        const [description,setDescription] = useState('');
        const [priority,setPriority] = useState<TaskCurrentPriority>('normal');
        const [dueDate,setDueDate] = useState('');
        const [submitting, setSubmitting] = useState(false);

        if(!openMenu){
            return null;
        }
        async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>){
            e.preventDefault();

            if(!title.trim()){
                return;
            }
            try{
                setSubmitting(true);
                await onCreate({
                    title: title.trim(),
                    description: description.trim() || undefined,
                    priority,
                    due_date: dueDate || undefined,
                });

                setTitle('');
                setDescription('');
                setPriority('normal');
                setDueDate('');
            }
            finally{
                setSubmitting(false);
            }
        }
        return(
            <div className={styles.overlay}>
                <div className={styles.menu}>
                    <h2 className={styles.heading}>Create New Task</h2>
                    <p className={styles.subheading}>Add a new task to your board.</p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>
                                Task Title
                            </label>
                            <input
                                value = {title}
                                onChange={(e)=> setTitle(e.target.value)}
                                required
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>
                                Task Description
                            </label>
                            <textarea
                                value = {description}
                                onChange={(e)=> setDescription(e.target.value)}
                                className={styles.text_area}
                            />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>
                                    Task Priority
                                </label>
                                <select
                                    value = {priority}
                                    onChange={(e)=> setPriority(e.target.value as TaskCurrentPriority)}
                                    className={styles.select}
                                >
                                    <option value="low">
                                        Low
                                    </option>
                                    <option value="normal">
                                        Normal
                                    </option>
                                    <option value="high">
                                        High
                                    </option>
                                </select>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>
                                    Task Due Date
                                </label>
                                <input
                                    type = "date"
                                    value = {dueDate}
                                    onChange={(e)=> setDueDate(e.target.value)}
                                    className={styles.input}
                                />
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <button type = "button" onClick={onClose} className={styles.secondaryButton}>
                                Cancel
                            </button>
                            <button type = "submit" disabled={submitting} className={styles.primaryButton}>
                                {submitting ? 'Creating New Task...': 'Create Task'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
