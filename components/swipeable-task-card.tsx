import { Group, Member, Task } from '@/types';
import { SwipeableCard } from './swipeable-card';
import { TaskCard } from './task-card';

interface SwipeableTaskCardProps {
  task: Task;
  assignedMember: Member | null;
  groupColorStart: string;
  groupColorEnd: string;
  groupId: string;
  group: Group;
  onPress?: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  drag?: () => void;
  isActive?: boolean;
}

export function SwipeableTaskCard({
  task,
  assignedMember,
  groupColorStart,
  groupColorEnd,
  groupId,
  group,
  onPress,
  onEdit,
  onDelete,
  drag,
  isActive,
}: SwipeableTaskCardProps) {
  return (
    <SwipeableCard
      onEdit={() => onEdit(task)}
      onDelete={() => onDelete(task)}
      drag={drag}
      isActive={isActive}>
      <TaskCard
        task={task}
        assignedMember={assignedMember}
        onMarkDone={() => {}}
        onPress={onPress}
        groupColorStart={groupColorStart}
        groupColorEnd={groupColorEnd}
        groupId={groupId}
        group={group}
        containerStyle={{ marginBottom: 0 }}
      />
    </SwipeableCard>
  );
}

