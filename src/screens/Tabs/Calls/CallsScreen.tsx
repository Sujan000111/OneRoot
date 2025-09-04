import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, SectionList, Text, View, RefreshControl } from 'react-native';
import { COLORS } from '../../../theme/colors';
import ProblemCallButton from './components/ProblemCallButton';
import CallListItem, { CallItem } from './components/CallListItem';
import { CallsApi } from '../../../services/api';

const CallsScreen = () => {
  const [loading, setLoading] = useState(false);
  const [calls, setCalls] = useState<any[]>([]);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const resp = await CallsApi.listMyCalls();
      const rows = (resp as any)?.data || [];
      setCalls(rows);
    } catch (e) {
      // noop for now
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const sections = useMemo(() => {
    if (!calls || calls.length === 0) {
      return [];
    }

    const formatTime = (iso: string | null | undefined) => {
      if (!iso) return '';
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const today = new Date();
    const todayKey = today.toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const yKey = yesterday.toDateString();

    const groups: Record<string, CallItem[]> = {};

    for (const c of calls) {
      const startedAt = c.started_at || c.created_at;
      const date = startedAt ? new Date(startedAt) : new Date();
      const key = date.toDateString() === todayKey ? 'Today' : (date.toDateString() === yKey ? 'Yesterday' : date.toLocaleDateString());
      const isMissed = c.status === 'missed' || c.status === 'failed' || c.status === 'rejected';
      const item: CallItem = {
        id: c.id,
        name: c.callee_phone || 'Unknown',
        details: '',
        type: isMissed ? 'missed' : 'outgoing',
        timestamp: formatTime(startedAt),
        avatar: 'https://i.pravatar.cc/100?img=1',
        duration: c.duration_seconds ? `${Math.floor(c.duration_seconds / 60)}m ${c.duration_seconds % 60}s` : undefined,
      };
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }

    const result = Object.keys(groups).map((k) => ({ title: k, data: groups[k] }));
    result.sort((a, b) => {
      const da = new Date(a.title).getTime() || (a.title === 'Today' ? 3 : a.title === 'Yesterday' ? 2 : 1);
      const db = new Date(b.title).getTime() || (b.title === 'Today' ? 3 : b.title === 'Yesterday' ? 2 : 1);
      return db - da;
    });
    return result;
  }, [calls]);

  return (
    <SafeAreaView style={styles.container}>
      <ProblemCallButton />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: CallItem }) => <CallListItem item={item} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.empty}>No calls yet</Text>}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchCalls} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary, // Changed to white background
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.darkGray, // Changed to dark gray
    backgroundColor: COLORS.background, // A slightly off-white for headers
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    textTransform: 'uppercase',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.lightGray, // Changed to light gray
    marginLeft: 85, // Aligns with the details container
  },
  empty: {
    textAlign: 'center',
    color: COLORS.mediumGray,
    padding: 20,
  },
});

export default CallsScreen;