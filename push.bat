@echo off
cd /d "C:\Users\kalya\Desktop\PROJECTS\auto-label-dashboard"
set GIT_PAGER=
git add .
git commit -m "Fix: Update API URL to use local backend for development"
git push origin main
pause
