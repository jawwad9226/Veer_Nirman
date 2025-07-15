#!/bin/bash
echo "🇮🇳 Starting Veer Nirman Development Environment"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Start backend in background
cd /home/jawwad-linux/Documents/Veer_Nirman/backend
eval "$(conda shell.bash hook)"
conda activate ncc_abyas
python main.py &
BACKEND_PID=$!

# Start frontend in background
cd /home/jawwad-linux/Documents/Veer_Nirman/frontend
npm run dev &
FRONTEND_PID=$!

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
