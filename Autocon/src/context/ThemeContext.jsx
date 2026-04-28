/**
 * ThemeContext.jsx
 * AutoCon uses a single unified dark Web3 theme system.
 * The ThemeProvider is kept for backward compatibility (components
 * import useTheme), but toggleTheme is a no-op — there is one theme.
 */
import { createContext, useContext } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });

export function ThemeProvider({ children }) {
    return (
        <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: () => {} }}>
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
