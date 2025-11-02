import { View, Text, StyleSheet } from 'react-native';
import { Member } from '@/types';
import { getInitials } from '@/utils/member-avatar';
import { BORDER_RADIUS } from '@/constants/border-radius';

interface MemberAvatarProps {
  member: Member;
  size?: number;
  fontSize?: number;
}

export function MemberAvatar({ member, size = 32, fontSize }: MemberAvatarProps) {
  const initials = getInitials(member.name);
  const avatarColor = member.avatarColor || '#737373'; // Fallback color
  const calculatedFontSize = fontSize || Math.floor(size * 0.5);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: avatarColor,
        },
      ]}>
      <Text
        style={[
          styles.initials,
          {
            fontSize: calculatedFontSize,
          },
        ]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

