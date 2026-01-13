import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { employees, tasks, type Task } from '@/lib/data';
import { PlusCircle, GripVertical } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

type TaskColumnProps = {
  title: Task['status'];
  tasks: Task[];
};

const statusConfig = {
    "To Do": {
        indicator: "bg-red-500",
        label: "To Do"
    },
    "In Progress": {
        indicator: "bg-yellow-500",
        label: "In Progress"
    },
    "Done": {
        indicator: "bg-green-500",
        label: "Done"
    }
}

function TaskCard({ task }: { task: Task }) {
  const assignee = employees.find((e) => e.id === task.assigneeId);
  return (
    <Card className="hover:bg-muted/50 transition-all duration-200 group">
      <CardContent className="p-4 flex items-center gap-4">
        <GripVertical className="h-5 w-5 text-muted-foreground/50 cursor-grab transition-colors group-hover:text-muted-foreground" />
        <div className="flex-1 space-y-2">
          <p className="font-medium leading-snug">{task.title}</p>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
             <Badge variant="outline" className="font-normal">{task.projectId}</Badge>
            {assignee && (
              <Avatar className="h-7 w-7">
                <AvatarImage src={assignee.avatarUrl} alt={assignee.name} />
                <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskColumn({ title, tasks }: TaskColumnProps) {
  const config = statusConfig[title];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${config.indicator}`} />
        <h2 className="font-headline font-semibold tracking-wide text-lg">{config.label}</h2>
        <span className="ml-auto text-muted-foreground text-sm font-medium bg-muted/50 h-6 w-6 flex items-center justify-center rounded-full">{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-3 h-full">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const todoTasks = tasks.filter((t) => t.status === 'To Do');
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');
  const doneTasks = tasks.filter((t) => t.status === 'Done');

  return (
    <>
      <PageHeader
        title="Task Board"
        description="Organize and track your team's work."
      >
        <Button>
          <PlusCircle />
          New Task
        </Button>
      </PageHeader>
      <div className="grid md:grid-cols-3 gap-6 items-start">
        <TaskColumn title="To Do" tasks={todoTasks} />
        <TaskColumn title="In Progress" tasks={inProgressTasks} />
        <TaskColumn title="Done" tasks={doneTasks} />
      </div>
    </>
  );
}
