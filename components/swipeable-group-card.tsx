import { Group } from '@/types';
import { router } from 'expo-router';
import { GroupCard } from './group-card';
import { SwipeableCard } from './swipeable-card';

interface SwipeableGroupCardProps {
  group: Group;
  onEdit: (group: Group) => void;
  onDelete: (group: Group) => void;
  drag?: () => void;
  isActive?: boolean;
}

export function SwipeableGroupCard({
  group,
  onEdit,
  onDelete,
  drag,
  isActive,
}: SwipeableGroupCardProps) {
  const handlePress = () => {
    router.push(`/group/${group.id}`);
  };

  return (
    <SwipeableCard
      onEdit={() => onEdit(group)}
      onDelete={() => onDelete(group)}
      drag={drag}
      isActive={isActive}>
      <GroupCard 
        group={group}
        onPress={handlePress}
        containerStyle={{ marginBottom: 0 }}
      />
    </SwipeableCard>
  );
}

