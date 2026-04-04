import { useEffect, useState, useMemo } from "react";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { Plus, Search } from "lucide-react";
import { supabase } from "./lib/supabase";
import { getGuestSession } from "./lib/auth";
import type { Task, TaskCurrentPriority, TaskCurrentStatus } from "./types/task";
import TaskBoard from "./components/TaskBoard/TaskBoard";
import CreateTask from "./components/CreateTask/CreateTask";
import SummaryBar from "./components/SummaryBar/SummaryBar";
import styles from './App.module.css'

const TASKSTATUSES: TaskCurrentStatus[] = ['todo', 'in_progress', 'in_review', 'done'];

export default function App(){
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [userId, setUserId] = useState<string|null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all'|TaskCurrentPriority>('all');

  const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 6}}))

  useEffect(() =>{
    init();
  }, []);

  async function init(){
    try{
      setLoading(true);
      setError(null);

      const session = await getGuestSession();
      const uid = session?.user?.id;

      if(!uid){
        throw new Error("No session found.");
      }

      setUserId(uid);
      await getUserTasks(uid);
    }
    catch(err){
      setError(err instanceof Error ? err.message : "Failed to initialize Kanban Board App");
    }
    finally{
      setLoading(false);
    }
  }
  async function getUserTasks(uid: string){
    const{data, error} = await supabase.from('tasks').select('*').eq('user_id', uid).order('created_at', {ascending: false});
    if(error){
      throw error;
    }
    setTasks((data as Task[]) ?? []);
  }
  async function createTask(input: {
    title: string;
    description?: string;
    priority?: TaskCurrentPriority;
    due_date?: string;
  }){
    if(!userId){
      return;
    }
    const tempTask: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description ?? null,
      status: 'todo',
      priority: input.priority ?? 'normal',
      due_date: input.due_date ?? null,
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    setTasks((prev) => [tempTask, ...prev]);
    const {data,error} = await supabase.from('tasks').insert({
      title: tempTask.title,
      description: tempTask.description,
      status: tempTask.status,
      priority: tempTask.priority,
      due_date: tempTask.due_date,
      user_id: userId,
    }).select().single();
    if(error){
      setTasks((prev) => prev.filter((t)=>t.id !== tempTask.id));
      throw error;
    }
    setTasks((prev)=> [data as Task, ...prev.filter((t)=> t.id !== tempTask.id)]);
  }

  async function deleteTask(taskId:string){
    const previousTaskList = tasks;
    setTasks((prev)=> prev.filter((task)=>task.id!==taskId));
    const {error} = await supabase.from("tasks").delete().eq("id",taskId);

    if(error){
      setTasks(previousTaskList);
      setError("Failed to delete this task.")
    }
  }
  async function updateTaskStatus(taskId: string, newStatus: TaskCurrentStatus){
    const previousTaskList = tasks;
    setTasks((prev)=> prev.map((task)=> (task.id==taskId ? {...task, status: newStatus}: task)));
    const {error} = await supabase.from('tasks').update({status: newStatus}).eq('id', taskId);

    if(error){
      setTasks(previousTaskList);
      setError("Failed to update this task's status.");
    }
  }
  function handleDragEnd(event: DragEndEvent){
    const {active, over} = event;
    if(!over){
      return;
    }
    const taskId = String(active.id);
    const newStatus = String(over.id) as TaskCurrentStatus;
    const task = tasks.find((t)=>t.id===taskId);

    if(!task || !TASKSTATUSES.includes(newStatus) || task.status === newStatus){
      return;
    }
    updateTaskStatus(taskId, newStatus);
  }
  const filteredTasks = useMemo(() => {
    return tasks.filter((task)=> {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = priorityFilter === 'all' ? true: task.priority===priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, search, priorityFilter]);
  if(loading){
    return(
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingHeader}/>
          <div className={styles.loadingGrid}>
            {Array.from({length: 4}).map((_, i)=> (
              <div key={i} className={styles.loadingColumn}/>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return(
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>
              Kanban Board
            </h1>
            <button onClick={() => setCreateOpen(true)} className={styles.primaryButton}>
              <Plus size={18} />
              Create New Task
            </button>
          </div>
          
          <div className={styles.searchControls}>
            <div className={styles.searchWrap}>
              <Search className={styles.searchIcon} size={18}/>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Tasks"
                className={styles.searchInput}
              />
            </div>
            <select
              value={priorityFilter}
              onChange={(e)=> setPriorityFilter(e.target.value as 'all' | TaskCurrentPriority)}
              className={styles.select}
            >
              <option value="all">All priorities</option>
              <option value="low">Low Priority</option>
              <option value="normal">Normal Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </header>
        <SummaryBar tasks={filteredTasks}/>
        {error && <div className={styles.error}>{error}</div>}

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <TaskBoard tasks={filteredTasks} onDeleteTask={deleteTask}/>
        </DndContext>
      </div>
      <CreateTask
        openMenu={createOpen}
        onClose={()=> setCreateOpen(false)}
        onCreate={async (values)=>{
          try{
            await createTask(values);
            setCreateOpen(false);
          }
          catch(err){
            setError(err instanceof Error ? err.message : "Failed to create new task.");
          }
        }}
      />
    </div>
  );
}

