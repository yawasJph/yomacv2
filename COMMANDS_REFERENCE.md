# 🛠️ COMANDOS ÚTILES - TriviaGamev3 Refactorizado

## 📋 Guía Rápida de Comandos

### 🚀 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Ver el build en producción
npm run preview

# Lint del código
npm run lint

# Formatear código (si Prettier está configurado)
npm run format
```

### 🧪 Testing (Cuando agregues tests)

```bash
# Ejecutar tests
npm test

# Tests en watch mode
npm test --watch

# Ver cobertura
npm test --coverage
```

### 📊 Performance y Debugging

```bash
# Abrir DevTools de React
# En el navegador: Extensión React DevTools

# Profiling
# En React DevTools: Tab "Profiler"

# Ver el bundle size
npm run build
# Revisar dist/

# Analizar dependencias
npm ls
```

### 🔍 Búsqueda y Navegación

```bash
# Buscar en archivos TypeScript/JavaScript
grep -r "useTriviaGame" src/

# Buscar archivos por patrón
find src -name "*Trivia*"

# Listar estructura de carpetas
tree src/

# Ver cambios en Git
git status
git diff
```

### 📝 Documentación

```bash
# Ver archivos de documentación
cat START_HERE.md
cat README_TRIVIA.md
cat REFACTORIZATION_TRIVIA.md

# Buscar en documentación
grep -r "useCallback" *.md
```

---

## 🎯 Flujos de Trabajo Comunes

### 🔧 Desarrollo de Feature Nueva

```bash
# 1. Crear rama
git checkout -b feature/nueva-feature

# 2. Iniciar dev server
npm run dev

# 3. Hacer cambios

# 4. Validar
npm run lint

# 5. Commit
git add .
git commit -m "feat(trivia): descripción del cambio"

# 6. Push
git push origin feature/nueva-feature

# 7. Crear PR
# En GitHub: Create Pull Request
```

### 🐛 Debuggear un Bug

```bash
# 1. Iniciar servidor
npm run dev

# 2. Abrir DevTools (F12)

# 3. Ir a Pestaña React DevTools

# 4. Inspeccionar componente

# 5. Ver props y estado

# 6. Buscar en código
grep -r "nombreDelBug" src/

# 7. Hacer cambios

# 8. Hot reload (automático)

# 9. Verificar fix
# (Ya está en el navegador)
```

### 📦 Agregar Dependencia Nueva

```bash
# Instalar paquete
npm install nombre-del-paquete

# O versión específica
npm install nombre@1.2.3

# Guardar en desarrollo
npm install --save-dev nombre

# Ver qué se instaló
npm ls | grep nombre
```

### 🧹 Limpiar y Resetear

```bash
# Limpiar node_modules
rm -rf node_modules
npm install

# Limpiar cache de npm
npm cache clean --force

# Resetear cambios locales
git checkout -- .

# Eliminar rama local
git branch -d nombre-rama
```

---

## 📍 Rutas Importantes

### Archivos del Proyecto

```bash
# Hook principal
src/hooks/triviav2/useTriviaGame.js

# Componentes UI
src/components/games/trivia/TriviaComponents.jsx
src/components/games/trivia/TriviaScreens.jsx

# Componente principal
src/pages/games/TriviaGamev3.jsx
```

### Documentación

```bash
# Punto de entrada
START_HERE.md

# Resumen rápido
README_TRIVIA.md

# Documentación técnica
REFACTORIZATION_TRIVIA.md

# Ejemplos
USAGE_EXAMPLES.md

# Validación
CHECKLIST.md
```

---

## 🔧 Editar y Reemplazar

### Buscar en Archivos

```bash
# Buscar "useTriviaGame" en JS
grep -r "useTriviaGame" --include="*.js" --include="*.jsx" src/

# Buscar patrón específico
grep -r "handleAnswer" src/

# Buscar ignorando ciertos archivos
grep -r "useState" src/ --exclude-dir=node_modules

# Contar ocurrencias
grep -r "useCallback" src/ | wc -l
```

### Reemplazar en Archivos

```bash
# Con sed (macOS/Linux)
sed -i 's/oldValue/newValue/g' filename.js

# Reemplazar en múltiples archivos
find src -name "*.jsx" -type f -exec sed -i 's/old/new/g' {} +

# Con VS Code buscar y reemplazar
# Ctrl+H → Buscar → Reemplazar → Replace All
```

---

## 🚀 Deploy y Producción

### Build para Producción

```bash
# Build optimizado
npm run build

# Verificar build
npm run preview

# Ver tamaño del build
du -sh dist/

# Analizar bundle
# npm install --save-dev webpack-bundle-analyzer
```

### Desplegar a Vercel

```bash
# Si está configurado con Vercel
npm install -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod

# Ver logs
vercel logs
```

### Desplegar a Otros Servicios

```bash
# Netlify
npm run build
# Drag & drop carpeta dist/ a Netlify

# GitHub Pages
npm run build
git add dist/
git commit -m "build: production build"
git push
```

---

## 🔐 Seguridad

### Auditar Dependencias

```bash
# Auditar seguridad
npm audit

# Corregir vulnerabilidades
npm audit fix

# Auditar de forma estricta
npm audit --audit-level=moderate
```

### Limpiar Credenciales

```bash
# Ver credenciales en .env
cat .env

# NO commitear archivos sensibles
echo ".env" >> .gitignore

# Si ya está en Git
git rm --cached .env
git commit -m "chore: remove sensitive data"
```

---

## 📈 Monitoreo y Analytics

### Ver Cambios

```bash
# Ver commits recientes
git log --oneline -n 10

# Ver cambios en un archivo
git log -p filename.js

# Ver quién cambió qué
git blame filename.js

# Ver branches
git branch -a
```

### Estadísticas del Proyecto

```bash
# Contar líneas de código
cloc src/

# Ver estructura
tree -L 3 src/

# Listar archivos grandes
find dist -type f -size +100k
```

---

## 🎓 Útiles de VS Code

### Extensiones Recomendadas

```bash
# Instalar extensiones
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension dsznajder.es7-react-js-snippets

# Ver extensiones instaladas
code --list-extensions
```

### Atajos de Teclado Útiles

```
Ctrl+P         → Buscar archivo
Ctrl+F         → Buscar en archivo
Ctrl+H         → Buscar y reemplazar
Ctrl+/         → Comentar línea
Alt+Shift+↓    → Duplicar línea
F12            → Abrir DevTools
Shift+F5       → Refresh sin cache
```

---

## 🐛 Debugging Avanzado

### Node Debugger

```javascript
// Agregar en código
debugger;

// Luego ejecutar
node --inspect app.js

// Abrir en Chrome
chrome://inspect
```

### Console Tricks

```javascript
// Logging con estilo
console.log('%c TRIVIA', 'color: green; font-size: 20px');

// Logging condicional
console.assert(condition, 'assertion message');

// Tabla
console.table([{name: 'John'}, {name: 'Jane'}]);

// Grouping
console.group('Group name');
console.log('mensaje 1');
console.log('mensaje 2');
console.groupEnd();
```

---

## 🔄 Git Workflow

### Ramas y Commits

```bash
# Crear rama
git checkout -b feature/nombre

# Ver rama actual
git branch

# Cambiar rama
git checkout nombre-rama

# Eliminar rama
git branch -d nombre-rama

# Commit con mensaje
git commit -m "tipo(scope): descripción"

# Push a remote
git push origin feature/nombre

# Pull cambios
git pull origin main
```

### Formatos de Commit

```bash
# Feature
git commit -m "feat(trivia): agregar nueva funcionalidad"

# Fix
git commit -m "fix(trivia): corregir bug"

# Refactor
git commit -m "refactor(trivia): mejorar código"

# Docs
git commit -m "docs(trivia): actualizar documentación"

# Test
git commit -m "test(trivia): agregar tests"

# Chore
git commit -m "chore(trivia): actualizar dependencias"
```

---

## 📊 Aliases Útiles (Opcional)

### Agregar en ~/.bashrc o ~/.zshrc

```bash
# Aliases cortos
alias ll='ls -la'
alias gst='git status'
alias glog='git log --oneline'
alias gc='git commit'
alias gp='git push'
alias gpl='git pull'

# Alias para este proyecto
alias rundev='npm run dev'
alias runbuild='npm run build'
alias runlint='npm run lint'

# Después ejecutar
source ~/.bashrc  # o source ~/.zshrc
```

---

## 💾 Backup y Recovery

### Backup del Código

```bash
# Crear backup
zip -r trivia-backup.zip src/

# O con tar
tar -czf trivia-backup.tar.gz src/

# Restaurar
unzip trivia-backup.zip
# o
tar -xzf trivia-backup.tar.gz
```

### Recuperar Cambios Perdidos

```bash
# Ver cambios sin commitear
git status

# Ver cambios sin staging
git diff

# Recuperar archivo eliminado
git checkout -- archivo.js

# Ver commits perdidos
git reflog

# Recuperar commit perdido
git cherry-pick hash-del-commit
```

---

## 🌐 URLs Útiles

```
Desarrollo Local:  http://localhost:5173
GitHub:            https://github.com/usuario/repo
Vercel:            https://vercel.com/dashboard
NPM:               https://www.npmjs.com
React Docs:        https://react.dev
DevTools:          chrome://extensions (React DevTools)
```

---

## 📋 Checklist Diario

```bash
# Mañana al llegar
□ git pull                    # Actualizar código
□ npm install                 # Instalar nuevas deps
□ npm run lint                # Validar código
□ npm run dev                 # Iniciar servidor

# Al terminar
□ git add .                   # Staging
□ git commit -m "..."         # Commit
□ git push                    # Push a remoto
□ Crear PR si es necesario
```

---

## 🆘 Troubleshooting Rápido

### Error: Cannot find module

```bash
# Solución
npm install
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Error: Port already in use

```bash
# Matar proceso en puerto 5173
lsof -ti:5173 | xargs kill -9

# O usar otro puerto
npm run dev -- --port 3000
```

### Error: Git merge conflict

```bash
# Ver conflictos
git status

# Resolver manualmente y luego
git add .
git commit -m "chore: resolve merge conflicts"
```

---

**Guía de Referencia Rápida**
Imprímela o guárdala para rápido acceso! 🚀
