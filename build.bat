@echo off
echo ============================================
echo   GradeQuest - Build Production
echo ============================================
echo.
cd /d "%~dp0"
echo Installing dependencies...
npm install
echo.
echo Generating Prisma Client...
npx prisma generate
echo.
echo Building Next.js app...
npm run build
echo.
echo Build complete!
echo Run run.bat to start the development server.
pause
