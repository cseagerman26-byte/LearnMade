@echo off
echo ============================================
echo   GradeQuest - Deploy to Vercel
echo ============================================
echo.
cd /d "%~dp0"
echo Installing Vercel CLI...
npm i -g vercel
echo.
echo Deploying to Vercel...
npx vercel --prod
echo.
pause
