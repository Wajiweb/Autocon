import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('autocon-theme') || 'dark';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'light') {
            root.classList.add('light-theme');
        } else {
            root.classList.remove('light-theme');
        }
        localStorage.setItem('autocon-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
