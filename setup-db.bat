@echo off
echo ============================================
echo   GradeQuest - Database Setup
echo ============================================
echo.
cd /d "%~dp0"
echo Generating Prisma Client...
npx prisma generate
echo.
echo Creating/Updating Database...
npx prisma db push
echo.
echo Done!
pause
