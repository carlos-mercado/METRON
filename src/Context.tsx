import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Units = 'kg' | 'lbs';

interface AppContextType {
    theme: Theme;
    toggleTheme: () => void;
    units: Units;
    setUnits: (units: Units) => void;
    toggleUnits: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('metron-theme');
        return (saved as Theme) || 'light';
    });

    const [units, setUnits] = useState<Units>(() => {
        const saved = localStorage.getItem('metron-units');
        return (saved as Units) || 'lbs';
    });

    useEffect(() => {
        localStorage.setItem('metron-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('metron-units', units);
    }, [units]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const toggleUnits = () => {
        setUnits(prev => prev === 'kg' ? 'lbs' : 'kg');
    };

    return (
        <AppContext.Provider value={{ theme, toggleTheme, units, setUnits, toggleUnits }}>
            {children}
        </AppContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('useTheme must be used within an AppProvider');
    }

    return { theme: context.theme, toggleTheme: context.toggleTheme };
}

export function useUnits() {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('useUnits must be used within an AppProvider');
    }

    return { units: context.units, setUnits: context.setUnits, toggleUnits: context.toggleUnits };
}

export function useApp() {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }

    return context;
}
