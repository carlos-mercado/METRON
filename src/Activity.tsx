import { useEffect, useState } from 'react';
import { ActivityCalendar, type ThemeInput } from 'react-activity-calendar';
import { useAuth } from './Auth';
import { useTheme } from './Context';
import './styles/Activity.css';

type ActivityData = {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
};

const API_BASE = 'https://metron-api.duckdns.org';

// Generate all dates for the last 365 days
function generateYearData(activityMap: Record<string, number>): ActivityData[] {
    const data: ActivityData[] = [];
    const today = new Date();

    for (let i = 365; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = activityMap[dateStr] || 0;

        // Map count to level: 0 = inactive, 4 = active
        const level: 0 | 1 | 2 | 3 | 4 = count > 0 ? 4 : 0;

        data.push({ date: dateStr, count, level });
    }

    return data;
}

function Activity() {
    const { userId } = useAuth();
    const { theme } = useTheme();
    const [data, setData] = useState<ActivityData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;

        const fetchActivity = async () => {
            try {
                const params = new URLSearchParams({ id: userId });
                const response = await fetch(`${API_BASE}/activity?${params.toString()}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch activity data');
                }

                const result = await response.json();
                const activityMap: Record<string, number> = result.activity || {};

            setData(generateYearData(activityMap));
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Unknown error');
                    setData(generateYearData({}));
                } finally {
                    setLoading(false);
            }
        };

        fetchActivity();
    }, [userId]);

    // Theme colors matching your app's color scheme
    const lightTheme: ThemeInput = {
        light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
        dark: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    };

    const darkTheme: ThemeInput = {
        light: ['#2d333b', '#0e4429', '#006d32', '#26a641', '#39d353'],
        dark: ['#2d333b', '#0e4429', '#006d32', '#26a641', '#39d353'],
    };

    if (!userId) { return <div className="activity-container">Please log in to view activity.</div>; }
    if (loading) { return <div className="activity-container">Loading activity...</div>; }

    return (
        <div className="activity-container">
            <h2 className="activity-title">Login Activity</h2>
            {error && <p className="activity-error">Could not load activity data</p>}
            <div className="activity-calendar">
                <ActivityCalendar
                    data={data}
                    theme={theme === 'dark' ? darkTheme : lightTheme}
                    colorScheme={theme}
                    blockSize={12}
                    blockMargin={4}
                    blockRadius={12}
                    fontSize={14}
                    showWeekdayLabels
                    showColorLegend={false}
                    labels={{
                        totalCount: '{{count}} logins in the last year',
                    }}
                />
            </div>
        </div>
    );
}

export default Activity;
