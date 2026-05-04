const fs = require('fs');
const path = require('path');

function resolveDependencies(sourceCode) {
    const sources = {
        'contract.sol': { content: sourceCode }
    };
    
    const queue = [{ content: sourceCode, basePath: '' }];
    const importRegex = /import\s+(?:{[^}]+}\s+from\s+)?["']([^"']+)["']/g;
    
    while (queue.length > 0) {
        const item = queue.shift();
        let match;
        importRegex.lastIndex = 0;
        
        while ((match = importRegex.exec(item.content)) !== null) {
            const importPath = match[1];
            
            let normalizedPath;
            if (importPath.startsWith('@openzeppelin/')) {
                normalizedPath = importPath;
            } else if (item.basePath.startsWith('@openzeppelin/')) {
                const dir = path.dirname(item.basePath);
                normalizedPath = path.posix.normalize(dir + '/' + importPath);
            } else {
                continue;
            }
            
            if (!sources[normalizedPath]) {
                try {
                    const actualPath = require.resolve(normalizedPath, { paths: [__dirname] });
                    const fileContent = fs.readFileSync(actualPath, 'utf8');
                    sources[normalizedPath] = { content: fileContent };
                    queue.push({ content: fileContent, basePath: normalizedPath });
                } catch (e) {
                    console.error('Failed to resolve:', normalizedPath, e.message);
                }
            }
        }
    }
    return sources;
}

const testCode = `import "@openzeppelin/contracts/token/ERC20/ERC20.sol";\ncontract MyToken is ERC20 {}`;
const sources = resolveDependencies(testCode);
console.log(Object.keys(sources));
