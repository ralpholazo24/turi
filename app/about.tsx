import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
  const { t } = useTranslation();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );
  const iconColor = useThemeColor({}, 'icon');

  const BackIcon = APP_ICONS.back;
  const HeartIcon = LucideIcons.Heart;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor + '30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BackIcon size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle} i18nKey="about.title" />
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* App Info Section */}
        <View style={styles.section}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: '#FF6B35' + '20' }]}>
              <ThemedText style={[styles.logoText, { color: '#FF6B35' }]}>T</ThemedText>
            </View>
          </View>
          
          <ThemedText type="title" style={styles.appName} i18nKey="about.appName" />
          
          <ThemedText style={styles.appVersion} i18nKey="about.versionNumber" />
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <ThemedText style={styles.description} i18nKey="about.description" />
          
          <ThemedText style={styles.description} i18nKey="about.description2" />
        </View>

        {/* Developer Section */}
        <View style={styles.section}>
          <View style={[styles.devCard, { backgroundColor: borderColor + '15', borderColor: borderColor + '30' }]}>
            <View style={[styles.avatarContainer, { borderColor: borderColor + '30' }]}>
              <Image
                source={require('@/assets/images/developer-avatar.png')}
                style={styles.avatar}
                contentFit="cover"
              />
            </View>
            <ThemedText style={styles.devTitle} i18nKey="about.developedWith" />
            <View style={styles.heartContainer}>
              <HeartIcon size={20} color="#FF6B35" fill="#FF6B35" />
            </View>
            <ThemedText style={styles.devName} i18nKey="about.by" i18nOptions={{ name: t('about.developerName') }} />
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle} i18nKey="about.features" />
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: '#10B981' }]} />
              <ThemedText style={styles.featureText} i18nKey="about.feature1" />
            </View>
            
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: '#10B981' }]} />
              <ThemedText style={styles.featureText} i18nKey="about.feature2" />
            </View>
            
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: '#10B981' }]} />
              <ThemedText style={styles.featureText} i18nKey="about.feature3" />
            </View>
            
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: '#10B981' }]} />
              <ThemedText style={styles.featureText} i18nKey="about.feature4" />
            </View>
            
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: '#10B981' }]} />
              <ThemedText style={styles.featureText} i18nKey="about.feature5" />
            </View>
            
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: '#10B981' }]} />
              <ThemedText style={styles.featureText} i18nKey="about.feature6" />
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText} i18nKey="about.footer" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.circular.xlarge,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  appVersion: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  devCard: {
    padding: 24,
    borderRadius: BORDER_RADIUS.large,
    borderWidth: 1,
    alignItems: 'center',
    width: '100%',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  devTitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  heartContainer: {
    marginVertical: 8,
  },
  devName: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
    opacity: 0.6,
    width: '100%',
    textAlign: 'left',
  },
  featureList: {
    width: '100%',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: 'center',
  },
});

